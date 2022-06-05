import express, {Application} from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();


const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(__dirname + "/assets/"));

app.get("/getNodes", (req, res) => {
    let nodes = fs.readFileSync('./lib/nodes.json', {encoding: 'utf-8'});
    res.send(nodes);
})

app.get("/getDiagram", (req, res) => {
    let nodes = fs.readFileSync('./lib/diagram.json', {encoding: 'utf-8'});
    res.send(nodes);
})

app.post("/setNodes", (req, res) => {
    fs.writeFileSync('./lib/nodes.json', JSON.stringify(req.body));
    res.sendStatus(200);
})

app.post("/setDiagram", (req, res) => {
    fs.writeFileSync('./lib/diagram.json', JSON.stringify(req.body));
    res.sendStatus(200);
})

let PORT: number = parseInt(process.env.PORT);
app.listen(PORT || 3000, process.env.IP, () => console.log("Server started"));