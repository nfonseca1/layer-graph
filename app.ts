import express, {Application} from 'express';
import db from './lib/database';
import {IRequest} from './lib/types';
import fs from 'fs';
import session from 'express-session';
import memorystore from 'memorystore';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/assets/"));

// Session
let MemoryStore = memorystore(session);
app.use(session({
    secret: "Shhh, it's a secret..",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 86400000
    })
}))

// Routes

app.get("/getNodes", (req, res) => {
    db.getNodes(req.query.diagramId as string)
    .then(results => {
        res.send({success: results.success, data: results.data || null})
    })
})

app.get("/getDiagram", (req: IRequest, res) => {
    let userId = req.session.userId;
    if (!userId) res.send({success: false});

    db.getDiagram(userId, req.query.diagramId as string)
    .then(results => {
        res.send({success: results.success, data: results.data || null})
    })
})

app.post("/setNodes", (req, res) => {
    db.setNodes(req.body.diagramId, req.body.nodes)
    .then(results => {
        res.send({success: results.success})
    })
})

app.post("/setDiagram", (req: IRequest, res) => {
    let userId = req.session.userId;
    if (!userId) res.send({success: false});

    db.setDiagram(userId, req.body.diagram)
    .then(results => {
        res.send({success: results.success})
    })
})

let PORT: number = parseInt(process.env.PORT);
app.listen(PORT || 3000, process.env.IP, () => console.log("Server started"));