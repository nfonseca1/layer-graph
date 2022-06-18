import * as React from 'react';
import NodeList from './NodeList';
import LayerView from './LayerView';
import ColorList from './ColorList';
import {INode, INodeUpdate} from './Node';
import db from '../lib/database';
import utils from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { LockedStatus, Status } from '../lib/types';
import { stringify } from 'querystring';

interface Props {
    id: string
}

export type INodes = {[key: string]: INode}

interface State {
    title: string,
    description: string,
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

export interface IDiagram {
    id: string,
	title: string,
	description: string
	tags?: string[]
	locked?: LockedStatus,
	rootNodes: string[],
	channels: {
        name: string,
        numberId: number,
        color: string
    }[]
}

class Diagram extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            title: '',
            description: '',
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
        this.updateDiagram = this.updateDiagram.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
        this.onDescriptionChange = this.onDescriptionChange.bind(this);
        this.onChannelNameChange = this.onChannelNameChange.bind(this);
    }

    async componentDidMount(): Promise<void> {
        let diagram = await db.getDiagram(this.props.id);
        let nodes = await db.getNodes(this.props.id);

        let nodesObj: INodes = {};
        for (let node of nodes.data) {
            nodesObj[node.id] = node;
        }

        if (diagram.status === Status.Failed || nodes.status === Status.Failed) return;
        this.setState({
            title: diagram.data.title,
            description: diagram.data.description,
            rootNodeIds: diagram.data.rootNodes || [],
            nodes: nodesObj,
            layerNodeIds: diagram.data.rootNodes || [],
            channels: diagram.data.channels?.length || 1,
            channelOptions: diagram.data.channels || []
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
        }, () => {
            db.setNodes(this.props.id, Object.values(this.state.nodes));
            db.updateDiagram({
                id: this.props.id,
                title: this.state.title,
                description: this.state.description,
                rootNodes: this.state.rootNodeIds,
                channels: this.state.channelOptions
            })
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

            let newRootIds;
            if (state.layerParent) {
                newRootIds = state.rootNodeIds;
                newNodes[state.layerParent].children = newLayerNodes;
            }
            else {
                newRootIds = state.rootNodeIds.filter(rootId => rootId !== id);
            }

            return {
                nodes: newNodes,
                layerNodeIds: newLayerNodes,
                rootNodeIds: newRootIds
            }
        }, () => {
            db.setNodes(this.props.id, Object.values(this.state.nodes));
            db.updateDiagram({
                id: this.props.id,
                title: this.state.title,
                description: this.state.description,
                rootNodes: this.state.rootNodeIds,
                channels: this.state.channelOptions
            })
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
        }), () => {
            db.setNodes(this.props.id, Object.values(this.state.nodes));
            db.updateDiagram({
                id: this.props.id,
                title: this.state.title,
                description: this.state.description,
                rootNodes: this.state.rootNodeIds,
                channels: this.state.channelOptions
            })
        })
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

    onChannelNameChange(e: React.ChangeEvent, id: number) {
        this.setState((state) => {
            let newChannels = this.state.channelOptions;
            newChannels = newChannels.map(c => {
                if (c.numberId === id) return {
                    ...c,
                    name: (e.target as HTMLInputElement).value
                }
                else return c;
            })
            
            return {
                channelOptions: newChannels
            }
        })
    }

    applyChannels() {
        let channelOptions = [];
        if (this.state.channelOptions.length === this.state.channels) return;
        
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
        }, () => {
            this.updateDiagram();
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
            this.updateDiagram();
        })
    }

    updateDiagram() {
        db.updateDiagram({
            id: this.props.id,
            title: this.state.title,
            description: this.state.description,
            rootNodes: this.state.rootNodeIds,
            channels: this.state.channelOptions
        })
    }

    onTitleChange(e: React.ChangeEvent) {
        this.setState({
            title: (e.target as HTMLInputElement).value
        })
    }

    onDescriptionChange(e: React.ChangeEvent) {
        this.setState({
            description: (e.target as HTMLInputElement).value
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
                <input type="text" value={o.name} 
                onChange={(e) => this.onChannelNameChange(e, o.numberId)}
                onBlur={this.updateDiagram}/>
            </div>)
        })

        return (
            <div className="Diagram">
                <div className="header">
                    <div className="left">
                        <input className="title" type="text" placeholder='Title' value={this.state.title} onChange={this.onTitleChange} onBlur={this.updateDiagram} />
                        <input className="description" value={this.state.description} onChange={this.onDescriptionChange} onBlur={this.updateDiagram}/>
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
                <div className="view">
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

export default Diagram;