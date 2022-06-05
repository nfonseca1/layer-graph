import * as React from 'react';
import NodeList from './NodeList';
import LayerView from './LayerView';
import ColorList from './ColorList';
import {INode, INodeUpdate} from './Node';
import db from '../lib/database';
import utils from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { NONAME } from 'dns';

export type INodes = {[key: string]: INode}

interface State {
    rootNodeIds: string[]
    nodes: INodes,
    layerNodeIds: string[],
    layerParent: string,
    channels: number,
    channelOptions: {
        name: string,
        numberId: number,
        color: string
    }[],
    colorDropdown: boolean,
    selectedChannel: number
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
	channels: {
        name: string,
        numberId: number,
        color: string
    }[]
}

class App extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);

        this.state = {
            rootNodeIds: [],
            nodes: {},
            layerNodeIds: [],
            layerParent: null,
            channels: 1,
            channelOptions: [{
                numberId: 1,
                color: '#3a3a3a',
                name: 'channel 1'
            }],
            colorDropdown: false,
            selectedChannel: 1
        }

        this.addNode = this.addNode.bind(this);
        this.showChildren = this.showChildren.bind(this);
        this.removeNode = this.removeNode.bind(this);
        this.viewChildren = this.viewChildren.bind(this);
        this.updateNode = this.updateNode.bind(this);
        this.goToParentLayer = this.goToParentLayer.bind(this);
        this.onChannelChange = this.onChannelChange.bind(this);
        this.applyChannels = this.applyChannels.bind(this);
        this.onChannelClick = this.onChannelClick.bind(this);
        this.onColorClick = this.onColorClick.bind(this);
        this.selectColor = this.selectColor.bind(this);
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

    addNode(content: string, comment: string, channel: number): string {
        let node: INode = {
            id: uuidv4(),
            parent: this.state.layerParent,
            children: [],
            content: content,
            comment: comment,
            subComment: '',
            channel: channel
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
        let currentLayerParent = this.state.layerParent;
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
        return this.state.nodes[currentLayerParent];
    }

    onChannelClick(e: React.MouseEvent) {
        (e.target as HTMLInputElement).select();
    }

    onChannelChange(e: React.ChangeEvent) {
        let value = (e.target as HTMLInputElement).value;
        if (value === '' || value === '0') {
            this.setState({
                channels: 1
            })
        }
        else if (isNaN(parseInt(value)) === false && value.length <= 1) {
            this.setState({
                channels: parseInt(value)
            })
        }
    }

    applyChannels() {
        let channelOptions = [];
        for (let i = 0; i < this.state.channels; i++) {
            let options = {
                numberId: i + 1,
                color: '#3a3a3a',
                name: 'channel ' + (i + 1)
            }
            channelOptions.push(options);
        }

        this.setState({
            channelOptions: channelOptions
        })
    }

    onColorClick(e: React.MouseEvent, id: number) {
        if (this.state.colorDropdown) {
            this.closeColorDropdown();
        }
        else {
            let colorList = document.querySelector("#colorListDropdown") as HTMLElement;
            colorList.style.display = 'inline-block';
            let x = (e.target as HTMLElement).getBoundingClientRect().x;
            let y = (e.target as HTMLElement).getBoundingClientRect().y;
            colorList.style.top = y.toString() + "px";
            colorList.style.left = x.toString() + "px";
        }

        this.setState((state) => ({
            colorDropdown: !state.colorDropdown,
            selectedChannel: id
        }))
    }

    closeColorDropdown() {
        let colorList = document.querySelector("#colorListDropdown") as HTMLElement;
        colorList.style.display = 'none';
    }

    selectColor(color: string) {
        this.setState((state) => {
            let channelOptions = [...state.channelOptions];
            channelOptions = channelOptions.map(o => {
                if (o.numberId === this.state.selectedChannel) {
                    o.color = color;
                    return o;
                }
                else return o;
            })
            return {
                channelOptions: channelOptions,
                colorDropdown: false
            }
        }, () => {
            this.closeColorDropdown();
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

        let channels = this.state.channelOptions.map(o => {
            return (<div className="row" key={o.numberId}>
                <label>{o.numberId}</label>
                <div className="color" style={{backgroundColor: o.color}}
                onClick={(e) => this.onColorClick(e, o.numberId)}></div>
                <input type="text" />
            </div>)
        })

        return (
            <div className="App">
                <div className="header">
                    <div className="left">
                        <input type="text" placeholder='Title' contentEditable/>
                        <p className="description" contentEditable></p>
                    </div>
                    <div className="right">
                        <div className="channelOptions">
                            <div>
                                <label>Channels: </label>
                                <input type="text" 
                                onChange={this.onChannelChange}
                                onBlur={this.applyChannels}
                                value={this.state.channels}
                                onClick={this.onChannelClick}/>
                            </div>
                            <div className="list">
                                {channels}
                            </div>
                            <ColorList selectColor={this.selectColor}/>
                        </div>
                    </div>
                </div>
                <div className="diagram">
                    <LayerView nodes={nodeHierarchy.reverse()}
                    channelOptions={this.state.channelOptions} />
                    <NodeList nodes={layerNodes} 
                    parent={this.state.nodes[this.state.layerParent]} 
                    addNode={this.addNode} 
                    removeNode={this.removeNode} 
                    viewChildren={this.viewChildren}
                    updateNode={this.updateNode}
                    goToParentLayer={this.goToParentLayer}
                    channelOptions={this.state.channelOptions} />
                </div>
            </div>
        )
    }
}

export default App;