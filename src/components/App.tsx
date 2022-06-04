import * as React from 'react';
import NodeList from './NodeList';
import Node, {INode} from './Node';
import db from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

type INodes = {[key: string]: INode}

interface State {
    nodes: INodes,
    layerNodeIds: string[],
    layerParent: string
}

enum Locked {
    Unlocked = 1,
    Locked = 2
}

export interface IDiagram {
    Id: string,
	Title: string,
	Description: string
	Tags: string[]
	Locked: Locked,
	rootNodes: string[],
	channels: [
		{
			name: string,
			numberId: number,
			color: string
		}
	]
}

class App extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);

        this.state = {
            nodes: {},
            layerNodeIds: [],
            layerParent: null
        }

        this.addNode = this.addNode.bind(this);
        this.showChildren = this.showChildren.bind(this);
        this.removeNode = this.removeNode.bind(this);
    }

    async componentDidMount(): Promise<void> {
        let diagram = await db.getDiagram('');
        let nodes = await db.getNodes('');

        let nodesObj: INodes = {};
        for (let node of nodes) {
            nodesObj[node.id] = node;
        }

        this.setState({
            nodes: nodesObj,
            layerNodeIds: diagram.rootNodes || []
        })
    }

    addNode(content: string, comment: string) {
        let node: INode = {
            id: uuidv4(),
            parent: this.state.layerParent,
            children: [],
            content: content,
            comment: comment,
            subComment: '',
            channel: 1
        }
        let parent = this.state.nodes[this.state.layerParent];
        if (parent) parent.children.push(node.id);

        this.setState((state) => ({
            nodes: {...state.nodes, [node.id]: node},
            layerNodeIds: [...state.layerNodeIds, node.id]
        }))
    }

    showChildren(ids: string[]) {
        this.setState({
            layerNodeIds: ids
        })
    }

    removeNode(id: string) {
        this.setState((state) => {
            let newNodes = state.nodes;
            let newLayerNodes = state.layerNodeIds;
            delete newNodes[id];
            newLayerNodes = newLayerNodes.filter(nodeId => nodeId !== id);
            return {
                nodes: newNodes,
                layerNodeIds: newLayerNodes
            }
        })
    }

    render() {
        let layerNodes: INode[] = this.state.layerNodeIds.map(id => {
            return this.state.nodes[id];
        })

        return (
            <div className="App">
                <input type="text" placeholder='Title' contentEditable/>
                <p className="description" contentEditable></p>
                <div className="diagram">
                    <NodeList nodes={layerNodes} addNode={this.addNode} removeNode={this.removeNode} />
                </div>
            </div>
        )
    }
}

export default App;