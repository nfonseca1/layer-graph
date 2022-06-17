import * as React from 'react';

interface Props {
    clearScreen: () => void,
    updateTag: (originalName: string, newName: string, lockedStatus: LockedStatus) => void,
    deleteTag: (name: string) => void,
    name: string,
    lockedStatus: LockedStatus
}

export enum LockedStatus {
    Unlocked,
    Partial,
    Full
}

interface State {
    lockedStatus: LockedStatus,
    name: string,
    prompt: boolean
}

class EditTagScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            lockedStatus: this.props.lockedStatus,
            name: this.props.name,
            prompt: false
        }

        this.setStatus = this.setStatus.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.updateTag = this.updateTag.bind(this);
        this.promptDelete = this.promptDelete.bind(this);
        this.deleteTag = this.deleteTag.bind(this);
    }

    setStatus(status: LockedStatus) {
        this.setState({
            lockedStatus: status
        })
    }

    handleNameChange(e: React.ChangeEvent) {
        this.setState({
            name: (e.target as HTMLInputElement).value
        })
    }

    updateTag() {
        if (this.state.name === '') {
            alert("Tag name cannot be blank");
            return;
        }
        this.props.updateTag(this.props.name, this.state.name, this.state.lockedStatus);
    }

    promptDelete() {
        this.setState({
            prompt: true
        })
    }

    deleteTag() {
        this.props.deleteTag(this.props.name);
    }

    render() {
        let selected: React.CSSProperties = {backgroundColor: '#1244a1'};
        let status = this.state.lockedStatus;

        let prompt: JSX.Element;
        if (this.state.prompt) {
            prompt = (
                <div className='prompt'>
                    <span>Are you sure?</span>
                    <button onClick={this.deleteTag} className='deleteBtn'>Delete</button>
                </div>
            )
        }
        else {
            prompt = (
                <button onClick={this.promptDelete} className='deleteBtn'>Delete Tag</button>
            )
        }

        return (
            <div className='EditTagScreenContainer'>
                <div className='EditTagScreenBackground' onClick={this.props.clearScreen}></div>
                <div className='EditTagScreen'>
                    <div>
                        <h2>Locked Status:</h2>
                        <div className='statuses'>
                            <div onClick={() => this.setStatus(LockedStatus.Unlocked)}
                            style={status === LockedStatus.Unlocked ? selected : {}}>
                                Unlocked
                            </div>
                            <div onClick={() => this.setStatus(LockedStatus.Partial)} 
                            className='center'
                            style={status === LockedStatus.Partial ? selected : {}}>
                                Locked Partial
                            </div>
                            <div onClick={() => this.setStatus(LockedStatus.Full)} 
                            style={status === LockedStatus.Full ? selected : {}}>
                                Locked Full
                            </div>
                        </div>
                    </div>
                    <input onChange={this.handleNameChange} 
                    value={this.state.name} 
                    type='text' placeholder='Tag Name' />
                    <div className='buttons'>
                        <button onClick={this.updateTag}>Update Tag</button>
                        {prompt}
                    </div>
                </div>
            </div>
        )
    }
}

export default EditTagScreen;