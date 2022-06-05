import {INode} from '../components/Node';
import {IDiagram} from '../components/App';

export function getNodes(id: string): Promise<INode[]> {
    return fetch('/getNodes')
    .then(response => {
        return response.json();
    })
    .then(results => {
        return results;
    })
    .catch(e => console.error(e));
}

export function getDiagram(id: string): Promise<IDiagram> {
    return fetch('/getDiagram')
    .then(response => {
        return response.json();
    })
    .then(results => {
        return results;
    })
    .catch(e => console.error(e));
}

export function setNodes(nodes: INode[]): Promise<void | Response> {
    return fetch('/setNodes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nodes)
    })
    .catch(e => console.error(e));
}

export function setDiagram(diagram: IDiagram): Promise<void | Response> {
    return fetch('/setDiagram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(diagram)
    })
    .catch(e => console.error(e));
}

export default {getNodes, getDiagram, setNodes, setDiagram}