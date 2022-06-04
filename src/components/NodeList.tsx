import * as React from 'react';
import Node, {INode, INodeUpdate} from './Node';

interface Props {
    nodes: INode[],
    parent: INode,
    addNode: (content: string, comment: string) => string,
    removeNode: (id: string) => void,
    viewChildren: (id: string) => void,
    updateNode: (id: string, updates: INodeUpdate) => void,
    goToParentLayer: () => void
}

interface State {
    input: string,
    comment: string,
    parentSubComment: string,
    parentId: string,
    shiftKeyDown: boolean
}

class NodeList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            input: '',
            comment: '',
            parentSubComment: this.props.parent?.subComment || '',
            parentId: this.props.parent?.id,
            shiftKeyDown: false
        }

        this.addNode = this.addNode.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.removeNode = this.removeNode.bind(this);
        this.onCommentChange = this.onCommentChange.bind(this);
        this.viewChildren = this.viewChildren.bind(this);
        this.onSubCommentChange = this.onSubCommentChange.bind(this);
        this.onSubCommentBlur = this.onSubCommentBlur.bind(this);
        this.goToParentLayer = this.goToParentLayer.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    addNode(): string {
        return this.props.addNode(this.state.input, this.state.comment);
    }

    onInputChange(e: React.ChangeEvent) {
        this.setState({
            input: (e.target as HTMLInputElement).value
        })
    }

    onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !this.state.shiftKeyDown) {
            this.addNode();
            (document.querySelector("#nodeListInput") as HTMLElement).focus();
            this.setState({
                input: '',
                comment: ''
            })
        }
        else if (e.key === 'Enter' && this.state.shiftKeyDown) {
            let id = this.addNode();
            (document.querySelector("#nodeListInput") as HTMLElement).focus();
            this.setState({
                input: '',
                comment: '',
                shiftKeyDown: false
            }, () => {
                this.viewChildren(id);
            })
        }
        else if (e.key === 'Shift') {
            this.setState({
                shiftKeyDown: true
            })
        }
    }

    onKeyUp(e: React.KeyboardEvent) {
        if (e.key === 'Shift') {
            this.setState({
                shiftKeyDown: false
            })
        }
    }

    onCommentChange(e: React.ChangeEvent) {
        this.setState({
            comment: (e.target as HTMLInputElement).value
        })
    }

    removeNode(id: string) {
        this.props.removeNode(id);
    }

    viewChildren(id: string) {
        this.props.viewChildren(id);
    }

    onSubCommentChange(e: React.ChangeEvent) {
        this.setState({
            parentSubComment: (e.target as HTMLInputElement).value
        })
    }

    onSubCommentBlur() {
        this.props.updateNode(this.props.parent.id, {subComment: this.state.parentSubComment});
    }

    goToParentLayer() {
        this.props.goToParentLayer();
    }
    
    componentDidUpdate(): void {
        if (this.props.parent && this.state.parentId !== this.props.parent.id) {
            this.setState({
                parentId: this.props.parent.id,
                parentSubComment: this.props.parent.subComment
            })
        }
        document.querySelector(".NodeList .nodes").scrollTo(0, 10000000);
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
                key={n.id}
                viewChildren={this.viewChildren}
                updateNode={this.props.updateNode} />
            )
        })

        let parent: JSX.Element;
        if (this.props.parent) {
            parent = (
            <div className="parentNode">
                <div className="content" onClick={this.goToParentLayer}>
                    {this.props.parent.content}
                </div>
                <textarea className="subComment" 
                value={this.state.parentSubComment}
                onChange={this.onSubCommentChange}
                onBlur={this.onSubCommentBlur}>
                </textarea>
            </div>
            )
        }

        return (
            <div className="NodeList">
                {parent}
                <div className='nodes'>
                    {nodes}
                </div>
                <div className="inputs">
                    <div className='input'>
                        <input id="nodeListInput" type='text' value={this.state.input} 
                        onKeyDown={this.onKeyDown} 
                        onChange={this.onInputChange}
                        onKeyUp={this.onKeyUp}
                        placeholder="Node Text"
                        tabIndex={1} />
                        <button onClick={this.addNode} tabIndex={-1}>Add Node</button>
                    </div>
                    <div className='comment'>
                        <input id="nodeListComment" type='text' value={this.state.comment} 
                        onKeyDown={this.onKeyDown} 
                        onChange={this.onCommentChange} 
                        onKeyUp={this.onKeyUp}
                        placeholder="Comment" 
                        tabIndex={2}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default NodeList;