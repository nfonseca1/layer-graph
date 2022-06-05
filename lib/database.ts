import {DynamoDB, S3, Credentials} from 'aws-sdk';
import {IDiagram, INode} from './types';
import dotenv from 'dotenv';
dotenv.config();

// Setup
let credentials = new Credentials({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
})

let dynamoDb = new DynamoDB({
    region: 'us-east-1',
    credentials: credentials
})

let dbClient = new DynamoDB.DocumentClient({service: dynamoDb});

let s3 = new S3({
    region: 'us-east-1',
    credentials: credentials
})

// Result type
interface DbResults {
    success: boolean,
    data?: any,
    error?: any
}

// DynamoDB Functions

function getDiagram(userId: string, diagramId: string): Promise<DbResults> {
    let params: DynamoDB.DocumentClient.GetItemInput = {
        TableName: 'LayerGraph_Trees',
        Key: {
            userId: userId,
            id: diagramId
        }
    }

    return dbClient.get(params).promise()
    .then(data => {
        console.log(`Successfully retrieved diagram with id: ${diagramId}`);
        return {
            success: true,
            data: data.Item
        }
    })
    .catch(e => {
        console.error(`Failed to retrieve diagram with id: ${diagramId} \n`, e);
        return {
            success: false,
            error: e
        }
    })
}

function getDiagramsForUser(userId: string): Promise<DbResults> {
    let params: DynamoDB.DocumentClient.QueryInput = {
        TableName: 'LayerGraph_Trees',
        KeyConditionExpression: 'userId = ' + userId,
        ProjectionExpression: 'id, title, description, tags, locked'
    }

    return dbClient.query(params).promise()
    .then(data => {
        console.log(`Successfully queried diagram for user: ${userId}`);
        return {
            success: true,
            data: data.Items
        }
    })
    .catch(e => {
        console.error(`Failed to query diagram for user: ${userId} \n`, e);
        return {
            success: false,
            error: e
        }
    })
}

function setDiagram(userId: string, diagram: IDiagram): Promise<DbResults> {
    let params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: 'LayerGraph_Trees',
        Item: {
            ...diagram 
        }
    }

    return dbClient.put(params).promise()
    .then(data => {
        console.log(`Successfully added/updated diagram with id: ${diagram.id}`);
        return {
            success: true,
            data: null
        }
    })
    .catch(e => {
        console.error(`Failed to add/update diagram with id: ${diagram.id} \n`, e);
        return {
            success: false,
            error: e
        }
    })
}

// S3 Functions

function getNodes(diagramId: string): Promise<DbResults> {
    let params: S3.GetObjectRequest = {
        Bucket: process.env.BUCKET,
        Key: `nodes_${diagramId}.json`
    }

    return s3.getObject(params).promise()
    .then(data => {
        console.log(`Successfully retrieved nodes for diagram: ${diagramId}`);
        return {
            success: true,
            data: data.Body.toString()
        }
    })
    .catch(e => {
        console.error(`Failed to retrieve nodes for diagram: ${diagramId} \n`, e);
        return {
            success: false,
            error: e
        }
    })
}

function setNodes(diagramId: string, nodes: INode[]): Promise<DbResults> {
    let params: S3.PutObjectRequest = {
        Bucket: process.env.BUCKET,
        Key: `nodes_${diagramId}.json`,
        Body: JSON.stringify(nodes)
    }

    return s3.putObject(params).promise()
    .then(data => {
        console.log(`Successfully added/updated nodes for diagram: ${diagramId}`);
        return {
            success: true,
            data: null
        }
    })
    .catch(e => {
        console.error(`Failed to add/update nodes for diagram: ${diagramId} \n`, e);
        return {
            success: false,
            error: e
        }
    })
}

// Exports
export default {getDiagram, getDiagramsForUser, setDiagram, getNodes, setNodes}