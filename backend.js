//IMPORTS
import express from "express";
import https from "https";
import { readFileSync } from "fs";
import mysql from 'mysql2';
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path, { dirname } from "path"
import cors from 'cors';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

//VALUES
const app = express();
const server = https.createServer({
    key: readFileSync("certFiles/keyfile.key"),
    cert: readFileSync("certFiles/certFile.crt")
}, app);
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'examplebank',
}).promise();
const jsonParser = bodyParser.json();
const __dirname = dirname(fileURLToPath(import.meta.url))
const saltRounds = 10;
const tokenExpiryInDays = 30;
const errorMessages = Object.freeze(
{
    ERR_INTERNAL_SERVER: "ERROR: Internal server error: ",
    ERR_REQ_UNDEFINED_BODY: "ERROR: The request's body is empty.",
    ERR_REQ_UNDEFINED_BODY_VALUES: "ERROR: Values are not defined.",
    ERR_REQ_INVALID_BODY_VALUES: "ERROR: Invalid data was given.",
    ERR_INVALID_CREDENTIALS: "ERROR: The given email and password is not valid."
})
const infoMessages = Object.freeze(
{

})

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

//Fallback root
app.get("/", (req, res) => 
{
    res.sendStatus(200);
})

/*

app.get("/login")

app.get("/register")

*/

//LOGIN endpoint - either give a valid token or the email and password
//Response: {token: (undefined or a valid token to save), userData: (personal info of the user)}
app.post("/login", jsonParser, async (req, res) =>
{
    if (req.body != undefined)
    {
        if (req.body.token != undefined)
        {
            /*
            fetch("/seamlessAuth", 
            {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(req.body.token)
            })
            */
        }
        else if (req.body.email != undefined && req.body.password != undefined)
        {
            if (req.body.email.length > 0 && req.body.password.length > 0)
            {
                try
                {
                    let usersQuery = await db.query("SELECT id, password FROM users WHERE email = ?", req.body.email);
                    if (usersQuery[0].length > 0)
                    {
                        if (await bcrypt.compare(req.body.password, usersQuery[0][0].password))
                        {
                            let tokenQuery = await db.query("SELECT date, token FROM tokens WHERE userid = ?", usersQuery[0][0].id);
                            if (isTokenValidBasedOnCurrentDateTime(tokenQuery[0][0].date, tokenExpiryInDays))
                            {
                                usersQuery = await db.query("SELECT fullname, balance FROM users WHERE email = ?", req.body.email);
                                res.status(200);
                                res.send({token: tokenQuery[0][0], userData: usersQuery[0][0]})
                                res.end();
                            }
                            else
                            {
                                let token = tokenGenerator(20);
                                await db.query("INSERT INTO tokens(userid, date, token) VALUES(?, ?, ?)", [usersQuery[0][0].id, new Date(), token]);
                                res.status(200);
                                res.send({token: token, userData: usersQuery[0][0]})
                                res.end();
                            }
                        }
                        else
                        {
                            res.status(404);
                            res.send({message: errorMessages.ERR_INVALID_CREDENTIALS + " (debug: password)"})
                            res.end();
                        }
                    }
                    else
                    {
                        res.status(404);
                        res.send({message: errorMessages.ERR_INVALID_CREDENTIALS + " (debug: email)"})
                        res.end();
                    }
                }
                catch (error)
                {
                    res.status(503);
                    res.send({message: errorMessages.ERR_INTERNAL_SERVER + error})
                    res.end();
                }
            }
            else
            {
                res.status(400);
                res.send({message: errorMessages.ERR_REQ_INVALID_BODY_VALUES})
                res.end();
            }
        }
        else
        {
            res.status(400);
            res.send({message: errorMessages.ERR_REQ_UNDEFINED_BODY_VALUES})
            res.end();
        }
    }
    else
    {
        res.status(400);
        res.send({message: errorMessages.ERR_REQ_UNDEFINED_BODY})
        res.end();
    }
})

app.post("/seamlessAuth", jsonParser, seamlessAuth, async (req, res) =>
{
    try
    {
        let userId = res.locals.userId;
        let usersQuery = await db.query("SELECT fullname, balance FROM users WHERE id = ?", userId);
        if (usersQuery[0].length > 0)
        {
            res.status(200);
            res.send({token: undefined, userData: usersQuery[0][0]})
            res.end();
        }
        else
        {
            res.status(404);
            res.send({"message": "ERROR: No user is assigned to the given token."})
            res.end();
        }
    }
    catch (error)
    {
        res.status(503);
        res.send({"message": "ERROR: " + error})
        res.end();
    }
})

app.post("/register", jsonParser, async (req, res) =>
{
    if (req.body != undefined)
    {
        if (req.body.email != undefined && req.body.password != undefined)
        {
            let hash = await bcrypt.hash(req.body.password, saltRounds)

        }
    }
    else
    {
        res.status(400);
        res.send({"message": errorMessages.ERR_REQ_UNDEFINED_BODY})
        res.end();
    }
})

app.post("/updateProfile", jsonParser, seamlessAuth, async (req, res) =>
{
    let userId = res.locals.userId;
    console.log(userId);
    //await db.query("UPDATE users SET")
})

app.post("/transfer", jsonParser, seamlessAuth, async (req, res) =>
{
    let userId = res.locals.userId;
    console.log(userId);
    
})

server.listen(5555, () => {
    console.log("Backend up! Avaiable at: localhost:5555")
});

//FUNCTIONS
async function seamlessAuth(req, res, next)
{
    if (req.body != undefined)
    {
        if (req.body.token != undefined)
        {
            try
            {
                let tokenQuery = await db.query("SELECT userid, date, token FROM tokens WHERE token = ?", req.body.token);
                if (tokenQuery[0].length > 0)
                {
                    if (isTokenValidBasedOnCurrentDateTime(tokenQuery[0][0].date, tokenExpiryInDays))
                    {
                        res.locals.userId = tokenQuery[0][0].userid;
                        next();
                    }
                    else
                    {
                        res.send({"message": "INFO: The token expired. Please log in again."})
                        res.end();
                    }
                }
                else
                {
                    res.status(404);
                    res.send({"message": "ERROR: Token not found. Please log in again."})
                    res.end();
                }
            }
            catch (error)
            {
                res.status(503);
                res.send({"message": "ERROR: " + error})
                res.end();
            }
        }
        else
        {
            res.status(400);
            res.send({"message": "ERROR: Values are not defined."})
            res.end();
        }
    }
    else
    {
        res.status(400);
        res.send({"message": "ERROR: The request's body is empty."})
        res.end();
    }
}

function emailValidator(emailAddress)
{
    if (emailAddress)
    {

    }
}

function isTokenValidBasedOnCurrentDateTime(date, offset)
{
    if (date.setDate(date.getDate() + offset) > new Date())
    {
        return true;
    }
    else
    {
        return false;
    }
}

function tokenGenerator(length)
{
    return crypto.randomBytes(length).toString('hex');
}