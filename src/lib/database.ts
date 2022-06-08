import {INode} from '../components/Node';
import {IDiagram} from '../components/Diagram';
import {IDiagramPreview} from '../components/Home';
import {DbResults, Status, GetUserStatus, AddUserStatus, LoginStatus} from './types';
import { response } from 'express';

// Read Functions

export function getNodes(id: string): Promise<DbResults<Status, INode[]>> {
    return fetch('/getNodes?diagramId=' + id)
    .then(response => response.json())
}

export function getDiagram(id: string): Promise<DbResults<Status, IDiagram>> {
    return fetch('/getDiagram?diagramId=' + id)
    .then(response => response.json())
}

export function getDiagramsForUser(): Promise<DbResults<Status, IDiagramPreview[]>> {
    return fetch('/getDiagramsForUser')
    .then(response => response.json())
} 

// Write Functions

export function setNodes(nodes: INode[]): Promise<DbResults<Status, {}>> {
    return fetch('/setNodes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nodes: nodes,
            diagramId: '12345'
        })
    })
    .then(response => response.json())
    .catch(e => console.error(e));
}

export function setDiagram(diagram: IDiagram): Promise<DbResults<Status, string>> {
    return fetch('/setDiagram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            diagram: diagram
        })
    })
    .then(response => response.json())
    .catch(e => console.error(e));
}

export function login(username: string, password: string): Promise<DbResults<LoginStatus, {}>> {
    return fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })
    .then(response => response.json())
    .then((results: DbResults<LoginStatus, {}>) => {
        return results;
    })
}

export function signup(username: string, password: string): Promise<DbResults<AddUserStatus, {}>> {
    return fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })
    .then(response => response.json())
    .catch(e => console.error(e));
}

export default {
    getNodes, 
    getDiagram, 
    getDiagramsForUser, 
    setNodes, 
    setDiagram,
    login,
    signup
}