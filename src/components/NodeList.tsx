import * as React from 'react';
import Node, {INode} from './Node';

interface Props {
    nodes: INode[],
    addNode: (content: string, comment: string) => void,
    removeNode: (id: string) => void
}

interface State {
    input: string,
    comment: string
}

class NodeList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            input: '',
            comment: ''
        }

        this.addNode = this.addNode.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onInputKeyDown = this.onInputKeyDown.bind(this);
        this.removeNode = this.removeNode.bind(this);
        this.onCommentChange = this.onCommentChange.bind(this);
        this.onCommentKeyDown = this.onCommentKeyDown.bind(this);
    }

    addNode() {
        this.props.addNode(this.state.input, this.state.comment);
    }

    onInputChange(e: React.ChangeEvent) {
        this.setState({
            input: (e.target as HTMLInputElement).value
        })
    }

    onInputKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            this.addNode();
            this.setState({
                input: '',
                comment: ''
            })
        }
    }

    onCommentChange(e: React.ChangeEvent) {
        this.setState({
            comment: (e.target as HTMLInputElement).value
        })
    }

    onCommentKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            this.addNode();
            (document.querySelector("#nodeListInput") as HTMLElement).focus();
            this.setState({
                input: '',
                comment: ''
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
                <div className="inputs">
                    <div className='input'>
                        <input id="nodeListInput" type='text' value={this.state.input} 
                        onKeyDown={this.onInputKeyDown} 
                        onChange={this.onInputChange}
                        placeholder="Node Text"
                        tabIndex={1} />
                        <button onClick={this.addNode} tabIndex={-1}>Add Node</button>
                    </div>
                    <div className='comment'>
                        <input id="nodeListComment" type='text' value={this.state.comment} 
                        onKeyDown={this.onCommentKeyDown} 
                        onChange={this.onCommentChange} 
                        placeholder="Comment" 
                        tabIndex={2}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default NodeList;