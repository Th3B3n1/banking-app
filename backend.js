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
const tokenExpiry = 5;

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
                let query = await db.query("SELECT * FROM tokens WHERE token = ?", req.body.token);
                console.log(query[0].length)
                if (query[0].length > 0)
                {
                    if (isExpiredBasedOnCurrentDateTime(query[0][0].date, tokenExpiry))
                    {
                        console.log("yr")
                    }
                    else
                    {
                        console.log("yf")
                    }
                }
                else
                {
                    res.status(404);
                    res.send({"message": "ERROR: Token not found"}).end();
                }
            }
            catch (error)
            {
                res.status(503);
                res.send({"message": "ERROR: Internal server error (Error message: " + error + ")"}).end();
            }
        }
        else if (req.body.username != undefined && req.body.password != undefined)
        {
            if (req.body.username.length > 0 && req.body.password > 0)
            {
                try
                {
                    let query = await db.query("SELECT * FROM users WHERE username = ?", req.body.username);
                    if (await bcrypt.compare(req.body.password, query[0][0].password))
                    {
                        await db.query("INSERT INTO tokens(userid, date, token) VALUES(?, ?, ?)", [query[0][0].id, new Date(), tokenGenerator(20)]);
                    }
                    res.sendStatus(200).end();
                }
                catch (error)
                {
                    res.status(503);
                    res.send({"error": "Internal server error (Error message: " + error + ")"}).end();
                }
            }
            else
            {
                res.status(400);
                res.send({"error": "Invalid data was given."}).end();
            }
        }
        else
        {
            res.status(400);
            res.send({"error": "Values are not defined."}).end();
        }
    }
    else
    {
        res.status(400);
        res.send({"error": "The request's body is empty."}).end();
    }
})

app.post("/register", jsonParser, async (req, res) =>
{
    let hash = await bcrypt.hash(req.body.password, saltRounds)  
})

server.listen(5555, () => {
    console.log("Backend up! Avaiable at: localhost:5555")
});

function isNewTokenRequired(token, date)
{

}

function isExpiredBasedOnCurrentDateTime(date, offset)
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