import {INode} from '../components/Node';
import {IDiagram} from '../components/App';

export function getNodes(id: string): Promise<INode[]> {
    return fetch('/getNodes')
    .then(response => response.json())
    .catch(e => console.error(e));
}

export function getDiagram(id: string): Promise<IDiagram> {
    return fetch('/getDiagram')
    .then(response => response.json())
    .catch(e => console.error(e));
}

export default {getNodes, getDiagram}