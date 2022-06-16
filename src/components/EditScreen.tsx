import * as React from 'react';
import {IDiagramPreview} from './Home';

interface Props {
    clearEditScreen: () => void,
    addTagForDiagram: (name: string, id: string) => void,
    removeTagFromDiagram: (name: string, id: string) => void,
    details: IDiagramPreview,
    diagramTags: string[],
    tags: string[]
}

interface State {

}

class EditScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);
    }

    addTag(e: React.ChangeEvent) {
        let newTag = (e.target as HTMLSelectElement).value;
        this.props.addTagForDiagram(newTag, this.props.details.id);
    }

    removeTag(name: string) {
        this.props.removeTagFromDiagram(name, this.props.details.id);
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
                </div>
            </div>
        )
    }
}

export default EditScreen;