import {INode} from '../components/Node';
import {IDiagram} from '../components/Diagram';
import {DbResults, Status, GetUserStatus, AddUserStatus, LoginStatus, TagList, IDiagramPreview, LockedStatus} from './types';

// Read Functions

export function getNodes(id: string): Promise<DbResults<Status, INode[]>> {
    return fetch('/getNodes?diagramId=' + id)
    .then(response => response.json())
    .then(results => {
        results.data = JSON.parse(results.data);
        return results;
    })
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

export function setNodes(diagramId: string, nodes: INode[]): Promise<DbResults<Status, {}>> {
    return fetch('/setNodes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nodes: nodes,
            diagramId: diagramId
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

export function updateDiagram(diagram: IDiagram | IDiagramPreview): Promise<DbResults<Status, string>> {
    return fetch('/updateDiagram', {
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

export function deleteDiagram(id: string): Promise<DbResults<Status, null>> {
    return fetch('/deleteDiagram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            diagramId: id
        })
    })
    .then(response => response.json())
    .catch(e => console.error(e));
}

export function updateTags(tags: TagList): Promise<DbResults<Status, string>> {
    return fetch('/updateTags', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tags: tags
        })
    })
    .then(response => response.json())
    .catch(e => console.error(e));
}

export function login(username: string, password: string): Promise<DbResults<LoginStatus, TagList>> {
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
    .then((results: DbResults<LoginStatus, TagList>) => {
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
    updateDiagram,
    deleteDiagram,
    updateTags,
    login,
    signup
}