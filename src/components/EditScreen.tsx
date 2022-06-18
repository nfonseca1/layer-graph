import * as React from 'react';
import { IDiagramPreview, LockedStatus } from '../lib/types';

interface Props {
    clearEditScreen: () => void,
    addTagForDiagram: (name: string, id: string) => void,
    removeTagFromDiagram: (name: string, id: string) => void,
    deleteDiagram: (id: string) => void,
    setDiagramLockedStatus: (diagramId: string, status: LockedStatus) => void,
    details: IDiagramPreview,
    diagramTags: string[],
    tags: string[]
}

interface State {
    prompt: boolean
}

class EditScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            prompt: false
        }

        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.setStatus = this.setStatus.bind(this);
        this.promptDelete = this.promptDelete.bind(this);
        this.deleteDiagram = this.deleteDiagram.bind(this);
    }

    addTag(e: React.ChangeEvent) {
        let newTag = (e.target as HTMLSelectElement).value;
        this.props.addTagForDiagram(newTag, this.props.details.id);
    }

    removeTag(name: string) {
        this.props.removeTagFromDiagram(name, this.props.details.id);
    }

    setStatus(status: LockedStatus) {
        this.props.setDiagramLockedStatus(this.props.details.id, status);
    }

    promptDelete() {
        this.setState({
            prompt: true
        })
    }

    deleteDiagram() {
        this.props.deleteDiagram(this.props.details.id);
    }

    render() {
        let tagOptions: JSX.Element[] = [];
        tagOptions = this.props.tags.map(t => (
            <option key={t} value={t}>{t}</option>
        ))

        let tags = this.props.diagramTags.map(t => (
            <div key={t} className='assignedTag'>
                <div className='name'>{t}</div>
                <div className='remove' onClick={() => this.removeTag(t)}>X</div>
            </div>
        ))

        let selected: React.CSSProperties = {backgroundColor: '#1244a1'};
        let status = this.props.details.locked;

        let prompt: JSX.Element;
        if (this.state.prompt) {
            prompt = (
                <div className='prompt'>
                    <span>Are you sure?</span>
                    <button onClick={this.deleteDiagram} className='deleteBtn' style={{width: '50%'}}>Delete</button>
                </div>
            )
        }
        else {
            prompt = (
                <button onClick={this.promptDelete} className='deleteBtn'>Delete Tag</button>
            )
        }

        return (
            <div className='editScreenContainer'>
                <div className='editScreenBackground' onClick={this.props.clearEditScreen}></div>
                <div className='editScreen'>
                    <h2>Tags</h2>
                    <select className='tagsDropdown' onChange={this.addTag}>
                        <option></option>
                        {tagOptions}
                    </select>
                    <div className='tagList'>
                        {tags}
                    </div>
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
                    {prompt}
                </div>
            </div>
        )
    }
}

export default EditScreen;