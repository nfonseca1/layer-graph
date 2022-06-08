import express, {Application, Request, Response, NextFunction} from 'express';
import db from './lib/database';
import {AddUserStatus, GetUserStatus, IRequest, LoginStatus, Status} from './lib/types';
import fs from 'fs';
import session from 'express-session';
import memorystore from 'memorystore';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/dist/"));

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

function validateUser(req: IRequest, res: Response, next: NextFunction) {
    let user = req.session.user;
    if (user && user.username && user.id) next();
    else res.send({
        success: false,
        message: 'Not logged in'
    })
}

// Routes
app.get("/", (req, res) => {
    res.sendFile(__dirname + '\\dist\\index.html');
})

app.get("/getNodes", (req, res) => {
    db.getNodes(req.query.diagramId as string)
    .then(results => {
        res.send({
            status: results.status, 
            data: results.data || null
        })
    })
})

app.get("/getDiagram", (req: IRequest, res) => {
    let userId = req.session.userId;
    if (!userId) {
        res.send({status: Status.Failed});
        return;
    }

    db.getDiagram(userId, req.query.diagramId as string)
    .then(results => {
        res.send({
            status: results.status, 
            data: results.data || null
        })
    })
})

app.get("/getDiagramsForUser", (req: IRequest, res) => {
    let userId = req.session.user?.id;
    if (!userId) res.send({status: Status.Failed});

    db.getDiagramsForUser(userId)
    .then(results => {
        res.send({
            status: results.status, 
            data: results.data || null
        })
    })
})

app.post("/setNodes", (req, res) => {
    db.setNodes(req.body.diagramId, req.body.nodes)
    .then(results => {
        res.send({
            status: results.status
        })
    })
})

app.post("/setDiagram", (req: IRequest, res, ) => {
    let userId = req.session.userId;
    if (!userId) res.send({success: false});

    db.setDiagram(userId, req.body.diagram)
    .then(results => {
        res.send({
            status: results.status
        })
    })
})

app.post("/login", async (req: IRequest, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password) {
        res.send({success: false})
    }

    // Get user
    let results = await db.getUser(username);
    
    // Check statuses
    if (results.status === GetUserStatus.UsernameNotFound) {
        res.send({status: LoginStatus.UsernameOrPasswordIncorrect});
        return;
    }
    else if (results.status === GetUserStatus.Failed) {
        res.send({status: LoginStatus.Failed});
        return;
    }
    // Compare retrieved password hash for a match
    let match = await bcrypt.compare(password, results.data.passwordHash);

    if (match) {
        req.session.user = {
            username: results.data.username,
            id: results.data.id
        }
        res.send({
            status: LoginStatus.Success
        });
    }
    else {
        res.send({
            status: LoginStatus.UsernameOrPasswordIncorrect
        });
    }
})

app.post("/signup", (req: IRequest, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password) {
        res.send({
            status: Status.Failed
        });
        return;
    }

    db.addUser(username, password)
    .then(results => {
        if (results.status === AddUserStatus.Success) {
            req.session.user = {
                username: results.data.username,
                id: results.data.id
            }
        }
        res.send({
            status: results.status
        })
    })
})

let PORT: number = parseInt(process.env.PORT);
app.listen(PORT || 3000, process.env.IP, () => console.log("Server started"));