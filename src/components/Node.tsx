import * as React from 'react';

export interface INode {
    id: string,
	parent: string,
	children: string[]
	content: string,
	comment: string,
    subComment: string,
	channel: number,
	styling?: {}
}

interface Props extends INode {
    removeNode: (id: string) => void 
}

interface State {
    editMode: boolean,
    content: string
}

class Node extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            editMode: false,
            content: this.props.content
        }

        this.removeNode = this.removeNode.bind(this);
        this.editNode = this.editNode.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    removeNode() {
        this.props.removeNode(this.props.id);
    }

    editNode() {
        this.setState((state) => ({
            editMode: !state.editMode
        }))
    }

    handleChange(e: React.ChangeEvent) {
        let value = (e.target as HTMLInputElement).value;
        value = value.replace(/[\r\n\v]+/g, '');
        this.setState({
            content: value
        })
    }

    handleBlur(e: React.FocusEvent) {
        this.setState({
            editMode: false
        })
    }

    render() {
        let content: JSX.Element;
        if (this.state.editMode) {
            content = <textarea value={this.state.content} onChange={this.handleChange} onBlur={this.handleBlur}></textarea>
        }
        else {
            content = <p>{this.state.content}</p>
        }

        return (
            <div className="Node">
                {content}
                <div className='deleteBtn' onClick={this.removeNode}><span>X</span></div>
                <div className='editBtn' onMouseDown={this.editNode}><span>E</span></div>
            </div>
        )
    }
}

export default Node;