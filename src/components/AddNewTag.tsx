import * as React from 'react';
import { LockedStatus } from '../lib/types';

interface Props {
    addTag: (name: string, status: LockedStatus) => void,
    clearAddNewTag: () => void
}

interface State {
    lockedStatus: LockedStatus
    name: string
}

class AddNewTag extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            lockedStatus: LockedStatus.Unlocked,
            name: ''
        }

        this.setStatus = this.setStatus.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
        this.addTag = this.addTag.bind(this);
    }

    setStatus(status: LockedStatus) {
        this.setState({
            lockedStatus: status
        })
    }

    onChangeName(e: React.ChangeEvent) {
        this.setState({
            name: (e.target as HTMLInputElement).value
        })
    }

    addTag() {
        if (this.state.name === '') {
            alert("Tag name cannot be blank");
            return;
        } 
        this.props.addTag(this.state.name, this.state.lockedStatus);
    }

    render() {
        let selected: React.CSSProperties = {backgroundColor: '#1244a1'};
        let status = this.state.lockedStatus;

        return (
            <div className='AddNewTagContainer'>
                <div className='AddNewTagBackground' onClick={this.props.clearAddNewTag}></div>
                <div className='AddNewTag'>
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
                    <input onChange={this.onChangeName} 
                    value={this.state.name} 
                    type='text' placeholder='Tag Name' />
                    <button onClick={this.addTag}>Add New Tag</button>
                </div>
            </div>
        )
    }
}

export default AddNewTag;