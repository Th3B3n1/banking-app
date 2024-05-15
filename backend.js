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
const tokenExpiryInDays = 5;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.get("/", (req, res) => 
{
    res.sendStatus(200);
})

app.post("/login", jsonParser, async (req, res) =>
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
                        let usersQuery = await db.query("SELECT email, fullname, balance FROM users WHERE id = ?", tokenQuery[0][0].userid)
                        res.status(200);
                        res.send(usersQuery[0][0]).end();
                    }
                    else
                    {
                        res.send({"message": "INFO: The token expired. Please log in again."});
                    }
                }
                else
                {
                    res.status(404);
                    res.send({"message": "ERROR: Token not found. Please log in again."}).end();
                }
            }
            catch (error)
            {
                res.status(503);
                res.send({"message": "ERROR: " + error}).end();
            }
        }
        else if (req.body.email != undefined && req.body.password != undefined)
        {
            if (req.body.email.length > 0 && req.body.password > 0)
            {
                try
                {
                    let usersQuery = await db.query("SELECT * FROM users WHERE email = ?", req.body.email);
                    if (usersQuery[0].length > 0)
                    {
                        if (await bcrypt.compare(req.body.password, usersQuery[0][0].password))
                        {
                            let tokenQuery = await db.query("SELECT date, token FROM tokens WHERE userid = ?", usersQuery[0][0].id);
                            if (isTokenValidBasedOnCurrentDateTime(tokenQuery[0][0].date, tokenExpiryInDays))
                            {
                                res.status(200);
                                res.send(usersQuery[0][0]).end();
                            }
                            else
                            {
                                let token = tokenGenerator(20);
                                await db.query("INSERT INTO tokens(userid, date, token) VALUES(?, ?, ?)", [usersQuery[0][0].id, new Date(), token]);
                                res.status(200);
                                res.send(usersQuery[0][0]).end();
                            }
                        }
                        else
                        {
                            res.status(404);
                            res.send({"message": "ERROR: The given email and password is not valid."}).end();
                        }
                    }
                    else
                    {
                        res.status(404);
                        res.send({"message": "ERROR: The given email and password is not valid."}).end();
                    }
                }
                catch (error)
                {
                    res.status(503);
                    res.send({"message": "ERROR: " + error}).end();
                }
            }
            else
            {
                res.status(400);
                res.send({"message": "ERROR: Invalid data was given."}).end();
            }
        }
        else
        {
            res.status(400);
            res.send({"message": "ERROR: Values are not defined."}).end();
        }
    }
    else
    {
        res.status(400);
        res.send({"message": "ERROR: The request's body is empty."}).end();
    }
})

app.post("/register", jsonParser, async (req, res) =>
{
    let hash = await bcrypt.hash(req.body.password, saltRounds)  
})

server.listen(5555, () => {
    console.log("Backend up! Avaiable at: localhost:5555")
});

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