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
/* TOKEN */
const tokenExpiryInDays = 30;
/* PASSWORD */
const saltRounds = 10;
/* ERRORMESSAGE */
const errorMessages = Object.freeze(
{
    ERR_INTERNAL_SERVER: "ERROR: Internal server error: ",
    ERR_REQ_UNDEFINED_BODY: "ERROR: The request's body is empty.",
    ERR_REQ_UNDEFINED_BODY_VALUES: "ERROR: Some or all required values are not defined in the request's body.",
    ERR_REQ_UNDEFINED_QUERY: "ERROR: The request's query is empty.",
    ERR_REQ_UNDEFINED_QUERY_VALUES: "ERROR: Some or all required Values are not defined in the request's query.",
    ERR_REQ_INVALID_BODY_VALUES: "ERROR: Invalid data was given to the request's body.",
    ERR_REQ_INVALID_QUERY_VALUES: "ERROR: Invalid data was given to the request's query.",
    ERR_DATA_INVALID_CREDENTIALS: "ERROR: The given email and password are not in our database.",
    ERR_DATA_INVALID_PASSWORD: "ERROR: The given password is incorrect based on our database records.",
    ERR_DATA_NONCOMPLIANT_EMAIL: "ERROR: The given email is not a valid email.",
    ERR_DATA_NONCOMPLIANT_PASSWORD: "ERROR: The given password is not complying to our required standards.",
    ERR_DATA_NONCOMPLIANT_NEWPASSWORD: "ERROR: The given new password is not complying to our required standards.",
    ERR_DATA_USER_ALREADY_EXISTS_EMAIL: "ERROR: A user already exists with the given email address.",
    ERR_DATA_USER_ALREADY_EXISTS_FULLNAME: "ERROR: A user already exists with the given name.",
    ERR_DATA_SAME_OLD_AND_NEW_PASSWORD: "ERROR: The old and new password has the same value.",
    ERR_DATA_NO_USER_TO_GIVEN_TOKEN: "ERROR: No user is assigned to the given token.",
    ERR_DATA_TOKEN_NOT_FOUND: "ERROR: Token not found. Please log in again.",
    ERR_DATA_TOKEN_EXPIRED: "ERROR: Token expired. Please log in again."
});
const infoMessages = Object.freeze(
{

});

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
app.post("/login", jsonParser, async (req, res, next) =>
{
    if (req.body != undefined)
    {
        if (req.body.token != undefined)
        {
            next();
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
                                res.send({token: tokenQuery[0][0], userData: usersQuery[0][0]});
                                res.end();
                            }
                            else
                            {
                                let token = tokenGenerator(20);
                                await db.query("INSERT INTO tokens(userid, date, token) VALUES(?, ?, ?)", [usersQuery[0][0].id, new Date(), token]);
                                res.status(200);
                                res.send({token: token, userData: usersQuery[0][0]});
                                res.end();
                            }
                        }
                        else
                        {
                            res.status(404);
                            res.send({message: errorMessages.ERR_DATA_INVALID_CREDENTIALS + " (debug: password)"});
                            res.end();
                        }
                    }
                    else
                    {
                        res.status(404);
                        res.send({message: errorMessages.ERR_DATA_INVALID_CREDENTIALS + " (debug: email)"});
                        res.end();
                    }
                }
                catch (error)
                {
                    res.status(503);
                    res.send({message: errorMessages.ERR_INTERNAL_SERVER + error});
                    res.end();
                }
            }
            else
            {
                res.status(400);
                res.send({message: errorMessages.ERR_REQ_INVALID_BODY_VALUES});
                res.end();
            }
        }
        else
        {
            res.status(400);
            res.send({message: errorMessages.ERR_REQ_UNDEFINED_BODY_VALUES});
            res.end();
        }
    }
    else
    {
        res.status(400);
        res.send({message: errorMessages.ERR_REQ_UNDEFINED_BODY});
        res.end();
    }
}, seamlessAuth, async (req, res) =>
{
    try
    {
        let userId = res.locals.userId;
        let usersQuery = await db.query("SELECT fullname, balance FROM users WHERE id = ?", userId);
        if (usersQuery[0].length > 0)
        {
            res.status(200);
            res.send({token: undefined, userData: usersQuery[0][0]});
            res.end();
        }
        else
        {
            res.status(404);
            res.send({message: errorMessages.ERR_DATA_NO_USER_TO_GIVEN_TOKEN});
            res.end();
        }
    }
    catch (error)
    {
        res.status(503);
        res.send({message: errorMessages.ERR_INTERNAL_SERVER + error});
        res.end();
    }
})

app.post("/register", jsonParser, async (req, res) =>
{
    if (req.body != undefined)
    {
        if ((req.body.email != undefined && req.body.password != undefined) && req.body.fullname != undefined)
        {
            try
            {
                if ((emailValidator(req.body.email)))
                {
                    if (passwordComplianceChecker(req.body.password))
                    {
                        if (req.body.fullname.length > 0)
                        {
                            let usersQuery = await db.query("SELECT email FROM users WHERE email = ?", req.body.email);
                            if (usersQuery[0].length == 0)
                            {
                                usersQuery = await db.query("SELECT fullname FROM users WHERE fullname = ?", req.body.fullname);
                                if (usersQuery[0].length == 0)
                                {
                                    let hash = await bcrypt.hash(req.body.password.trim(), saltRounds);
                                    await db.query("INSERT INTO users(email, password, fullname) VALUES(?, ?, ?)", [req.body.email, hash, req.body.fullname]);
                                }
                                else
                                {
                                    res.status(400);
                                    res.send({message: errorMessages.ERR_DATA_USER_ALREADY_EXISTS_FULLNAME});
                                    res.end();
                                }
                            }
                            else
                            {
                                res.status(400);
                                res.send({message: errorMessages.ERR_DATA_USER_ALREADY_EXISTS_EMAIL});
                                res.end();
                            }
                        }
                        else
                        {
                            res.status(400);
                            res.send({message: errorMessages.ERR_REQ_INVALID_BODY_VALUES});
                            res.end();
                        }
                    }
                    else
                    {
                        res.status(400);
                        res.send({message: errorMessages.ERR_DATA_NONCOMPLIANT_PASSWORD});
                        res.end();
                    }
                }
                else
                {
                    res.status(400);
                    res.send({message: errorMessages.ERR_DATA_NONCOMPLIANT_EMAIL});
                    res.end();
                }
            }
            catch (error)
            {
                res.status(503);
                res.send({message: errorMessages.ERR_INTERNAL_SERVER + error});
                res.end();
            }
        }
        else
        {
            res.status(400);
            res.send({message: errorMessages.ERR_REQ_UNDEFINED_BODY_VALUES});
            res.end();
        }
    }
    else
    {
        res.status(400);
        res.send({"message": errorMessages.ERR_REQ_UNDEFINED_BODY});
        res.end();
    }
})

app.post("/changePassword", jsonParser, seamlessAuth, async (req, res) =>
{
    let userId = res.locals.userId;
    if (req.body.oldPassword != undefined && req.body.newPassword != undefined)
    {
        if (req.body.oldPassword.length > 0 && req.body.newPassword.length > 0)
        {
            if (req.body.oldPassword != req.body.newPassword)
            {
                try
                {
                    let usersQuery = await db.query("SELECT password FROM users WHERE id = ?", userId);
                    if (usersQuery[0].length > 0)
                    {
                        if (await bcrypt.compare(req.body.oldPassword, usersQuery[0][0].password))
                        {
                            if (passwordComplianceChecker(req.body.newPassword))
                            {
                                let hash = await bcrypt.hash(req.body.newPassword.trim(), saltRounds);
                                await db.query("UPDATE users SET password = ? WHERE id = ?", [hash, userId]);
                            }
                            else
                            {
                                res.status(400);
                                res.send({message: errorMessages.ERR_DATA_NONCOMPLIANT_NEWPASSWORD});
                                res.end();
                            }
                        }
                        else
                        {
                            res.status(400);
                            res.send({message: errorMessages.ERR_DATA_INVALID_PASSWORD});
                            res.end();
                        }
                    }
                    else
                    {
                        res.status(404);
                        res.send({message: errorMessages.ERR_DATA_NO_USER_TO_GIVEN_TOKEN});
                        res.end();
                    }
                }
                catch (error)
                {
                    res.status(503);
                    res.send({message: errorMessages.ERR_INTERNAL_SERVER + error});
                    res.end();
                }
            }
            else
            {
                res.status(400);
                res.send({message: errorMessages.ERR_DATA_SAME_OLD_AND_NEW_PASSWORD});
                res.end();
            }
        }
        else
        {
            res.status(400);
            res.send({message: errorMessages.ERR_REQ_INVALID_BODY_VALUES});
            res.end();
        }
    }
    else
    {
        res.status(400);
        res.send({message: errorMessages.ERR_REQ_UNDEFINED_BODY_VALUES});
        res.end();
    }
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
                        res.send({message: errorMessages.ERR_DATA_TOKEN_EXPIRED});
                        res.end();
                    }
                }
                else
                {
                    res.status(404);
                    res.send({message: errorMessages.ERR_DATA_TOKEN_NOT_FOUND});
                    res.end();
                }
            }
            catch (error)
            {
                res.status(503);
                res.send({message: errorMessages.ERR_INTERNAL_SERVER + error});
                res.end();
            }
        }
        else
        {
            res.status(400);
            res.send({message: errorMessages.ERR_REQ_UNDEFINED_BODY_VALUES});
            res.end();
        }
    }
    else
    {
        res.status(400);
        res.send({message: errorMessages.ERR_REQ_UNDEFINED_BODY});
        res.end();
    }
}

function emailValidator(emailAddress)
{
    if (emailAddress.length > 0)
    {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(emailAddress);
    }
    else
    {
        return false;
    }
}

function passwordComplianceChecker(password)
{
    const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(password);
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