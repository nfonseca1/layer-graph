import {INodes} from '../components/Diagram';

export function deleteNodes(nodes: INodes, nodeIds: string[]) {
    for (let id of nodeIds) {
        if (nodes[id].children.length > 0) {
            deleteNodes(nodes, nodes[id].children);
            delete nodes[id];
        }
        else {
            delete nodes[id];
        }
    }
}

export default {deleteNodes}