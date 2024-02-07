import * as React from 'react';

export interface INode {
    id: string,
	parent: string,
	children: string[]
	content: string,
	comment: string,
    subComment: string,
	channel: number,
	styling?: {},
    position?: number
}

export interface INodeUpdate {
	parent?: string,
	children?: string[]
	content?: string,
	comment?: string,
    subComment?: string,
	channel?: number,
	styling?: {},
    position?: number
}

interface Props extends INode {
    removeNode: (id: string) => void,
    viewChildren: (id: string) => void,
    updateNode: (id: string, updates: INodeUpdate) => void,
    channelOptions: {
        name: string,
        numberId: number,
        color: string
    }[],
    index: number
}

interface State {
    editMode: boolean,
    content: string,
    comment: string,
    lastDeleteClick: number,
    position: number
}

class Node extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            editMode: false,
            content: this.props.content,
            comment: this.props.comment,
            lastDeleteClick: 0,
            position: this.props.index
        }

        this.removeNode = this.removeNode.bind(this);
        this.editNode = this.editNode.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangePosition = this.handleChangePosition.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.viewChildren = this.viewChildren.bind(this);
        this.onCommentChange = this.onCommentChange.bind(this);
        this.onCommentBlur = this.onCommentBlur.bind(this);
    }

    removeNode() {
        let date = Date.now();
        if (date - this.state.lastDeleteClick < 250) {
            this.props.removeNode(this.props.id);
        }
        this.setState((state) => ({
            lastDeleteClick: date
        }))
    }

    editNode() {
        let editMode = this.state.editMode;
        this.setState((state) => ({
                editMode: !state.editMode
            }), () => {
            if (editMode === true) {
                let updates: any = {content: this.state.content}
                if (this.state.position != this.props.index) {
                    updates.position = this.state.position;
                }
                this.props.updateNode(this.props.id, updates)
            }
        })
    }

    handleChange(e: React.ChangeEvent) {
        let value = (e.target as HTMLInputElement).value;
        //value = value.replace(/[\r\n\v]+/g, '');
        this.setState({
            content: value
        })
    }

    handleChangePosition(e: React.ChangeEvent) {
        let value = (e.target as HTMLInputElement).value;

        let newPos = parseInt(value);
        if (isNaN(newPos)) newPos = this.state.position;
        //value = value.replace(/[\r\n\v]+/g, '');
        this.setState({
            position: newPos
        })
    }

    handleBlur(e: React.FocusEvent) {
        let editMode = this.state.editMode;
        this.setState({
            editMode: false
        }, () => {
            if (editMode === true) {
                this.props.updateNode(this.props.id, {content: this.state.content})
            }
        })
    }

    viewChildren() {
        this.props.viewChildren(this.props.id);
    }

    onCommentChange(e: React.ChangeEvent) {
        let value = (e.target as HTMLInputElement).value;
        //value = value.replace(/[\r\n\v]+/g, '');
        this.setState({
            comment: value
        })
    }

    onCommentBlur() {
        this.props.updateNode(this.props.id, {comment: this.state.comment})
    }

    render() {
        let content: JSX.Element;
        if (this.state.editMode) {
            content = (
                <div className="editProperties">
                    <textarea value={this.state.content} onChange={this.handleChange} onBlur={this.handleBlur}>[Photo of snowboarding]</textarea>
                    <div>
                        <input className="position" type="text" onChange={this.handleChangePosition} placeholder="#"/>
                    </div>
                </div>
            )
        }
        else {
            content = <p onClick={this.viewChildren}>{this.state.content}</p>
        }

        let channelColor = this.props.channelOptions.find(opt => {
            return opt.numberId === this.props.channel;
        })?.color;

        return (
            <div className={"Node color" + channelColor?.slice(1)}>
                {content}
                <textarea className='commentBubble' value={this.state.comment} 
                onChange={this.onCommentChange}
                onBlur={this.onCommentBlur}></textarea>
                <div className='deleteBtn' onClick={this.removeNode}><span>X</span></div>
                <div className='editBtn' onMouseDown={this.editNode}><span>E</span></div>
            </div>
        )
    }
}

export default Node;