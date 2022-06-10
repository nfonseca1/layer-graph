import {DynamoDB, S3, Credentials} from 'aws-sdk';
import {IDiagram, INode, User, Status, DbResults, GetUserStatus, AddUserStatus, IDiagramPreview} from './types';
import bcrypt from 'bcrypt';
import {v4 as uuidv4} from 'uuid';
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

// DynamoDB Functions

function getDiagram(userId: string, diagramId: string): Promise<DbResults<Status, IDiagram>> {
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
            status: Status.Success,
            data: data.Item as IDiagram
        }
    })
    .catch(e => {
        console.error(`Failed to retrieve diagram with id: ${diagramId} \n`, e);
        return {
            status: Status.Failed,
            error: e
        }
    })
}

function getDiagramsForUser(userId: string): Promise<DbResults<Status, IDiagramPreview[]>> {
    let params: DynamoDB.DocumentClient.QueryInput = {
        TableName: 'LayerGraph_Trees',
        KeyConditionExpression: 'userId = :userid',
        ExpressionAttributeValues: {
            ':userid': userId
        },
        ProjectionExpression: 'id, title, description, tags, locked'
    }

    return dbClient.query(params).promise()
    .then(data => {
        console.log(`Successfully queried diagram for user: ${userId}`);
        return {
            status: Status.Success,
            data: data.Items as IDiagramPreview[]
        }
    })
    .catch(e => {
        console.error(`Failed to query diagram for user: ${userId} \n`, e);
        return {
            status: Status.Failed,
            error: e
        }
    })
}

function setDiagram(userId: string, diagram: IDiagram): Promise<DbResults<Status, string>> {
    let uuid = uuidv4(); 
    let params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: 'LayerGraph_Trees',
        Item: {
            ...diagram,
            userId: userId,
            id: uuid
        }
    }

    return dbClient.put(params).promise()
    .then(data => {
        return setNodes(uuid, []);
    })
    .then(data => {
        console.log(`Successfully added diagram with id: ${uuid}`);
        return {
            status: Status.Success,
            data: uuid
        }
    })
    .catch(e => {
        console.error(`Failed to add diagram with id: ${uuid} \n`, e);
        return {
            status: Status.Failed,
            error: e
        }
    })
}

function updateDiagram(userId: string, diagram: IDiagram): Promise<DbResults<Status, string>> {
    let params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: 'LayerGraph_Trees',
        Item: {
            ...diagram,
            userId: userId,
            id: diagram.id
        }
    }

    return dbClient.put(params).promise()
    .then(data => {
        console.log(`Successfully updated diagram with id: ${diagram.id}`);
        return {
            status: Status.Success,
            data: diagram.id
        }
    })
    .catch(e => {
        console.error(`Failed to add/update diagram with id: ${diagram.id} \n`, e);
        return {
            status: Status.Failed,
            error: e
        }
    })
}

function getUser(username: string): Promise<DbResults<GetUserStatus, User>> {
    let params: DynamoDB.DocumentClient.GetItemInput = {
        TableName: 'LayerGraph_Users',
        Key: {
            username: username
        }
    }

    return dbClient.get(params).promise()
    .then(data => {
        if (data.Item) {
            console.log(`Successfully retrieved user: ${username}`);
            return {
                status: GetUserStatus.Success,
                data: data.Item as User
            }
        }
        else {
            console.log(`No user found for username: ${username}`);
            return {
                status: GetUserStatus.UsernameNotFound,
                data: null
            }
        }
    })
    .catch(e => {
        console.error(`Failed to retrieve user: ${username} \n`, e);
        return {
            status: GetUserStatus.Failed,
            error: e
        }
    })
}

/**
 * Checks for an existing username and, if non-existent, creates a new user. Password will be hashed before added.
 * @param username Username to be created
 * @param password Plaintext password
 * @returns Promise of Database Results object
 */
async function addUser(username: string, password: string): Promise<DbResults<AddUserStatus, User>> {
    // Check if user already exists
    let getUserResults = await getUser(username);
    
    if (getUserResults.status === GetUserStatus.Success) {
        return {
            status: AddUserStatus.UsernameExists, 
            data: null
        }
    }
    else if (getUserResults.status === GetUserStatus.Failed) {
        return {
            status: AddUserStatus.Failed,
            error: getUserResults.error
        }
    }

    // Hash password
    let hash = await bcrypt.hash(password, 10);

    // Populate db params
    let uuid = uuidv4();
    let params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: 'LayerGraph_Users',
        Item: {
            username: username,
            passwordHash: hash,
            id: uuid
        }
    }

    // Add new user
    return dbClient.put(params).promise()
    .then(data => {
        console.log(`Successfully retrieved user: ${username}`);
        return {
            status: AddUserStatus.Success,
            data: {username: username, id: uuid} as User
        }
    })
    .catch(e => {
        console.error(`Failed to add new user: ${username} \n`, e);
        return {
            status: AddUserStatus.Failed,
            error: e
        }
    })
}

// S3 Functions

function getNodes(diagramId: string): Promise<DbResults<Status, string>> {
    let params: S3.GetObjectRequest = {
        Bucket: process.env.BUCKET,
        Key: `nodes_${diagramId}.json`
    }

    return s3.getObject(params).promise()
    .then(data => {
        console.log(`Successfully retrieved nodes for diagram: ${diagramId}`);
        return {
            status: Status.Success,
            data: data.Body.toString()
        }
    })
    .catch(e => {
        console.error(`Failed to retrieve nodes for diagram: ${diagramId} \n`, e);
        return {
            status: Status.Failed,
            error: e
        }
    })
}

function setNodes(diagramId: string, nodes: INode[]): Promise<DbResults<Status, string>> {
    let params: S3.PutObjectRequest = {
        Bucket: process.env.BUCKET,
        Key: `nodes_${diagramId}.json`,
        Body: JSON.stringify(nodes)
    }

    return s3.putObject(params).promise()
    .then(data => {
        console.log(`Successfully added/updated nodes for diagram: ${diagramId}`);
        return {
            status: Status.Success,
            data: diagramId
        }
    })
    .catch(e => {
        console.error(`Failed to add/update nodes for diagram: ${diagramId} \n`, e);
        return {
            status: Status.Failed,
            error: e
        }
    })
}

// Exports
export default {
    getDiagram, 
    getDiagramsForUser, 
    setDiagram, 
    updateDiagram,
    getNodes, 
    setNodes,
    getUser,
    addUser
}