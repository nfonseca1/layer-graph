import * as React from 'react';
import NodeList from './NodeList';
import LayerView from './LayerView';
import {INode, INodeUpdate} from './Node';
import db from '../lib/database';
import utils from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

export type INodes = {[key: string]: INode}

interface State {
    rootNodeIds: string[]
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
            rootNodeIds: [],
            nodes: {},
            layerNodeIds: [],
            layerParent: null
        }

        this.addNode = this.addNode.bind(this);
        this.showChildren = this.showChildren.bind(this);
        this.removeNode = this.removeNode.bind(this);
        this.viewChildren = this.viewChildren.bind(this);
        this.updateNode = this.updateNode.bind(this);
        this.goToParentLayer = this.goToParentLayer.bind(this);
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

    addNode(content: string, comment: string): string {
        let node: INode = {
            id: uuidv4(),
            parent: this.state.layerParent,
            children: [],
            content: content,
            comment: comment,
            subComment: '',
            channel: 1
        }

        this.setState((state) => {
            let newLayerNodeIds = [...state.layerNodeIds];
            newLayerNodeIds.push(node.id);

            let newNodes = {...state.nodes}
            newNodes[node.id] = node;
            let newParent = newNodes[state.layerParent]
            if (newParent) newParent.children.push(node.id);

            let rootIds = state.layerParent ? [...state.rootNodeIds] : [...state.rootNodeIds, node.id];

            return {
                rootNodeIds: rootIds,
                nodes: newNodes,
                layerNodeIds: newLayerNodeIds
            }
        })

        return node.id;
    }

    showChildren(ids: string[]) {
        this.setState({
            layerNodeIds: ids
        })
    }

    removeNode(id: string) {
        this.setState((state) => {
            let newNodes = {...state.nodes};
            let newLayerNodes = [...state.layerNodeIds];
            utils.deleteNodes(newNodes, newNodes[id].children);
            delete newNodes[id];
            newLayerNodes = newLayerNodes.filter(nodeId => nodeId !== id);

            let newRootIds = state.layerParent 
                ? state.rootNodeIds 
                : state.rootNodeIds.filter(rootId => rootId !== id);

            return {
                nodes: newNodes,
                layerNodeIds: newLayerNodes,
                rootNodeIds: newRootIds
            }
        })
    }

    viewChildren(id: string) {
        this.setState({
            layerNodeIds: this.state.nodes[id].children,
            layerParent: id
        })
    }

    updateNode(id: string, updates: INodeUpdate) {
        let newNode: INode = {...this.state.nodes[id]}
        for (const [key, value] of Object.entries(updates)) {
            newNode[key] = value;
        }

        this.setState((state) => ({
            nodes: {...state.nodes, ...{[id]: newNode}}
        }))
    }

    goToParentLayer() {
        this.setState((state) => {
            let parent = state.nodes[state.nodes[state.layerParent].parent];
            let rootNodes = []
            if (parent) rootNodes = parent.children;
            else rootNodes = this.state.rootNodeIds;
            return {
                layerParent: state.nodes[state.layerParent].parent,
                layerNodeIds: rootNodes
            }
        })
    }

    render() {
        let layerNodes: INode[] = this.state.layerNodeIds.map(id => {
            return this.state.nodes[id];
        })

        let nodeHierarchy: INode[] = [];
        let currentParent = this.state.layerParent;
        while (currentParent) {
            nodeHierarchy.push(this.state.nodes[currentParent]);
            currentParent = this.state.nodes[currentParent].parent;
        }

        return (
            <div className="App">
                <input type="text" placeholder='Title' contentEditable/>
                <p className="description" contentEditable></p>
                <div className="diagram">
                    <LayerView nodes={nodeHierarchy.reverse()} />
                    <NodeList nodes={layerNodes} 
                    parent={this.state.nodes[this.state.layerParent]} 
                    addNode={this.addNode} 
                    removeNode={this.removeNode} 
                    viewChildren={this.viewChildren}
                    updateNode={this.updateNode}
                    goToParentLayer={this.goToParentLayer} />
                </div>
            </div>
        )
    }
}

export default App;