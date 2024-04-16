import express from "express";
import mysql from 'mysql2';
import bodyParser from "body-parser";
import cors from 'cors';

const app = express();
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'exampleBank-database',
}).promise();
const jsonParser = bodyParser.json();

app.use(cors());

app.get("/", (req, res) => 
{
    res.sendStatus(200);
})

app.get("/commissions", async (req, res) => 
{
    try
    {
        let query = await db.query("SELECT * FROM commissions");
        res.status(200);
        res.send(query[0]);
    }
    catch (error)
    {
        res.status(503);
        res.send({"error": "Service unavaiable"}).end();
    }
})

app.get("/commission", async (req, res) =>
{
    if (req.query.id != undefined && parseInt(req.query.id) > 0)
    {
        try
        {
            let query = await db.query("SELECT * FROM commissions WHERE id = ?", req.query.id);
            res.status(200);
            res.send(query[0]);
        }
        catch (error)
        {
            res.status(503);
            res.send({"error": "Service unavaiable"}).end();
        }
    }
    else
    {
        res.status(404);
        res.send({"error": "An invalid query parameter was given."}).end();
    }
})

app.post("/commission", jsonParser, async (req, res) => 
{
    if (req.body != undefined)
    {
        if ((req.body.description != undefined && req.body.price != undefined))
        {
            if ((req.body.description.length > 0 && parseInt(req.body.price) > 0))
            {
                try
                {
                    await db.query('INSERT INTO commissions(description, price) VALUES (?, ?)', [req.body.description, req.body.price]);
                    res.sendStatus(200).end();
                }
                catch (error)
                {
                    res.status(503);
                    res.send({"error": "Service unavaiable"}).end();
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

app.delete("/commission", async (req, res) => 
{
    if (req.query.id != undefined && parseInt(req.query.id) > 0)
    {
        try
        {
            await db.query('DELETE FROM commissions WHERE id = ?', req.query.id);
            res.sendStatus(200).end();
        }
        catch (error)
        {
            res.status(503);
            res.send({"error": "Service unavaiable"}).end();
        }
    }
    else
    {
        res.status(404);
        res.send({"error": "An invalid query parameter was given."}).end();
    }
})

app.put("/commission", jsonParser, async (req, res) => 
{
    if ((req.query.id != undefined && parseInt(req.query.id) > 0))
    {
        if (req.body != undefined)
        {
            if ((req.body.description != undefined && req.body.price != undefined))
            {
                if ((req.body.description.length > 0 && parseInt(req.body.price) > 0))
                {
                    try
                    {
                        await db.query('UPDATE commissions SET description = ?, price = ? WHERE id = ?', [req.body.description, req.body.price, req.query.id]);
                        res.sendStatus(200).end();
                    }
                    catch (error)
                    {
                        res.status(503);
                        res.send({"error": "Service unavaiable"}).end();
                    }
                }
                else
                {
                    res.status(400);
                    res.send({"error": "New values are not valid."}).end();
                }
            }
            else
            {
                res.status(400);
                res.send({"error": "New values are not defined."}).end();
            }
        }
        else
        {
            res.status(400);
            res.send({"error": "The request's body is empty."}).end();
        }
    }
    else
    {
        res.status(404);
        res.send({"error": "An invalid query parameter was given."}).end();
    }
})

app.listen(5555, () => {
    console.log("Backend up! Avaiable at: localhost:5555")
});