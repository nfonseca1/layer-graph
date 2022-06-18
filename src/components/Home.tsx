import * as React from 'react';
import db from '../lib/database';
import {v4 as uuidv4} from 'uuid';
import { IDiagramPreview, LockedStatus, Status, TagList } from '../lib/types';
import EditScreen from './EditScreen';
import EditTagScreen from './EditTagScreen';
import AddNewTag from './AddNewTag';

interface Props {
    openDiagram: (id: string) => void,
    addTag: (name: string, status: LockedStatus) => boolean,
    getDiagramsForTag: (tags: string[]) => ({[id: string]: boolean}),
    addTagForDiagram: (name: string, id: string) => void,
    removeTagFromDiagram: (name: string, id: string) => void,
    updateTag: (originalName: string, newName: string, lockedStatus: LockedStatus) => boolean,
    deleteTag: (name: string) => void,
    tags: TagList
}

interface State {
    diagrams: IDiagramPreview[],
    selectedDiagrams: {[id: string]: boolean},
    diagramBeingEdited: string,
    editScreen: boolean,
    addNewTagScreen: boolean,
    editTagScreen: boolean,
    tagToEdit: string
}

class Home extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            diagrams: [],
            selectedDiagrams: null,
            diagramBeingEdited: null,
            editScreen: false,
            addNewTagScreen: false,
            editTagScreen: false,
            tagToEdit: null
        }

        this.onCreateNew = this.onCreateNew.bind(this);
        this.editDiagram = this.editDiagram.bind(this);
        this.clearEditScreen = this.clearEditScreen.bind(this);
        this.showAddNewTag = this.showAddNewTag.bind(this);
        this.addTag = this.addTag.bind(this);
        this.clearAddNewTag = this.clearAddNewTag.bind(this);
        this.editTag = this.editTag.bind(this);
        this.clearEditTagScreen = this.clearEditTagScreen.bind(this);
        this.updateTag = this.updateTag.bind(this);
        this.deleteTag = this.deleteTag.bind(this);
        this.deleteDiagram = this.deleteDiagram.bind(this);
        this.setDiagramLockedStatus = this.setDiagramLockedStatus.bind(this);
    }

    componentDidMount(): void {
        db.getDiagramsForUser()
        .then(results => {
            if (results.status === Status.Failed) {
                alert('An error occurred while trying to retrieve Diagrams');
                return;
            }

            this.setState({
                diagrams: results.data
            })
        })
    }

    onCreateNew() {
        let newDiagram = {
            id: uuidv4(),
            title: 'New Diagram',
            description: '',
            tags: [],
            locked: LockedStatus.Unlocked,
            channels: [],
            rootNodes: []
        }
        db.setDiagram(newDiagram)
        .then(diagram => {
            newDiagram.id = diagram.data;
            this.setState((state) => ({
                diagrams: [...state.diagrams, newDiagram]
            }))
        })
    }

    editDiagram(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        this.setState({
            editScreen: true,
            diagramBeingEdited: id
        })
    }

    clearEditScreen() {
        this.setState({
            editScreen: false
        })
    }

    showAddNewTag() {
        this.setState({
            addNewTagScreen: true
        })
    }

    addTag(name: string, status: LockedStatus) {
        let success = this.props.addTag(name, status);
        if (success) {
            this.clearAddNewTag();
        }
        else {
            alert("Tag name already exists");
        }
    }

    clearAddNewTag() {
        this.setState({
            addNewTagScreen: false
        })
    }

    setTag(name: string) {
        let diagrams = this.props.getDiagramsForTag([name]);
        this.setState({
            selectedDiagrams: diagrams
        })
    }

    editTag(e: React.MouseEvent, tag: string) {
        e.stopPropagation();
        this.setState({
            editTagScreen: true,
            tagToEdit: tag
        })
    }

    clearEditTagScreen() {
        this.setState({
            editTagScreen: false,
            tagToEdit: null
        })
    }

    updateTag(originalName: string, newName: string, lockedStatus: LockedStatus) {
        let success = this.props.updateTag(originalName, newName, lockedStatus);
        if (success) {
            this.setState({
                editTagScreen: false,
                tagToEdit: null
            })
        }
        else {
            alert("Tag name already exists");
        }
    }

    deleteTag(name: string) {
        this.props.deleteTag(name);
        this.setState({
            editTagScreen: false,
            tagToEdit: null
        })
    } 

    deleteDiagram(id: string) {
        this.setState((state) => {
            let newDiagrams = state.diagrams;
            let newSelectedDiagrams = state.selectedDiagrams;

            newDiagrams = newDiagrams.filter(d => d.id !== id);
            if (newSelectedDiagrams && newSelectedDiagrams[id]) {
                delete newSelectedDiagrams[id];
            }

            return {
                diagrams: newDiagrams,
                selectedDiagrams: newSelectedDiagrams || null,
                diagramBeingEdited: null,
                editScreen: false
            }
        }, () => {
            db.deleteDiagram(id);
        })
    }

    setDiagramLockedStatus(diagramId: string, status: LockedStatus) {
        this.setState((state) => {
            let newDiagrams = state.diagrams;
            newDiagrams = newDiagrams.map(d => {
                if (d.id === diagramId) {
                    d.locked = status
                }
                return d;
            })

            return {
                diagrams: newDiagrams
            }
        }, () => {
            db.updateDiagram(this.state.diagrams.find(d => d.id === diagramId));
        })
    }

    render() {
        let editScreen: JSX.Element;
        if (this.state.editScreen) {
            let diagram = this.state.diagrams.find(d => d.id === this.state.diagramBeingEdited);
            let tags = [];
            for (const [key, value] of Object.entries(this.props.tags)) {
                if (value.diagrams[this.state.diagramBeingEdited]) {
                    tags.push(key);
                }
            }
            editScreen = <EditScreen tags={Object.keys(this.props.tags)} 
                            diagramTags={tags} 
                            details={diagram} 
                            clearEditScreen={this.clearEditScreen} 
                            addTagForDiagram={this.props.addTagForDiagram}
                            removeTagFromDiagram={this.props.removeTagFromDiagram}
                            deleteDiagram={this.deleteDiagram}
                            setDiagramLockedStatus={this.setDiagramLockedStatus}/>
        }

        let addNewTagScreen: JSX.Element;
        if (this.state.addNewTagScreen) {
            addNewTagScreen = <AddNewTag addTag={this.addTag} clearAddNewTag={this.clearAddNewTag} />
        }

        let previews = this.state.diagrams.map(d => {
            let selected = this.state.selectedDiagrams;
            if (selected === null || selected[d.id]) {
                return (
                    <div className='preview' key={d.id} onClick={() => this.props.openDiagram(d.id)}>
                        <h2>{d.title}</h2>
                        <p>{d.description}</p>
                        <div className='edit' onClick={(e) => this.editDiagram(e, d.id)}>E</div>
                    </div>
                )
            }
            else return null;
        })

        let tagNames: string[] = Object.keys(this.props.tags);
        let tags = tagNames.map(t => {
            return (
            <div key={t} className='tag' onClick={() => this.setTag(t)}>
                {t}
                <div className='edit' onClick={(e) => this.editTag(e, t)}>E</div>
            </div>
            )
        })

        let editTagScreen: JSX.Element;
        if (this.state.editTagScreen) {
            editTagScreen = <EditTagScreen clearScreen={this.clearEditTagScreen} 
                                updateTag={this.updateTag}
                                deleteTag={this.deleteTag}
                                name={this.state.tagToEdit}
                                lockedStatus={this.props.tags[this.state.tagToEdit]?.locked}/>
        }

        return (
            <div className='Home'>
                <div className='sidePanel'>
                    <div className='tagsList'>
                        <div className='tag all' onClick={() => this.setState({selectedDiagrams: null})}>All</div>
                        <div className='divider'></div>
                        {tags}
                    </div>
                    <div className='addTag'>
                        <div className='divider reverse'></div>
                        <button className='tag' onClick={this.showAddNewTag}>Create New Tag</button>
                    </div>
                </div>
                <div className='container'>
                    <div className='header'>
                        <button onClick={this.onCreateNew}>Create New</button>
                    </div>
                    <div className='diagrams'>
                        {previews}
                    </div>
                </div>
                {editScreen}
                {addNewTagScreen}
                {editTagScreen}
            </div>
        )
    }
}

export default Home;