import * as React from 'react';
import Node, {INode} from './Node';

interface Props {
    nodes: INode[],
    addNode: any,
    removeNode: (id: string) => void
}

interface State {
    input: string
}

class NodeList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            input: ''
        }

        this.addNode = this.addNode.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.removeNode = this.removeNode.bind(this);
    }

    addNode() {
        this.props.addNode(this.state.input);
    }

    handleInput(e: React.ChangeEvent) {
        this.setState({
            input: (e.target as HTMLInputElement).value
        })
    }

    handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            this.addNode();
            (e.target as HTMLInputElement).value = '';
            this.setState({
                input: (e.target as HTMLInputElement).value
            })
        }
    }

    removeNode(id: string) {
        this.props.removeNode(id);
    }

    render() {
        let nodes: JSX.Element[] = this.props.nodes.map(n => {
            return (
            <Node id={n.id} 
                parent={n.parent} 
                children={n.children} 
                content={n.content} 
                comment={n.comment} 
                subComment={n.subComment}
                channel={n.channel} 
                styling={n.styling}
                removeNode={this.removeNode}
                key={n.id} />
            )
        })

        return (
            <div className="NodeList">
                <div className='nodes'>
                    {nodes}
                </div>
                <div className='input'>
                    <input id="nodeListInput" type='text' value={this.state.input} onKeyDown={this.handleKeyDown} onChange={this.handleInput} />
                    <button onClick={this.addNode}>Add Node</button>
                </div>
            </div>
        )
    }
}

export default NodeList;