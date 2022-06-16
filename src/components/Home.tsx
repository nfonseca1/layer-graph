import * as React from 'react';
import db from '../lib/database';
import {v4 as uuidv4} from 'uuid';
import {Locked} from './Diagram';
import { Status } from '../lib/types';
import EditScreen from './EditScreen';
import AddNewTag, {LockedStatus} from './AddNewTag';
import {TagList} from './App';

interface Props {
    openDiagram: (id: string) => void,
    addTag: (name: string, status: LockedStatus) => void,
    getDiagramsForTag: (tags: string[]) => ({[id: string]: boolean}),
    addTagForDiagram: (name: string, id: string) => void,
    removeTagFromDiagram: (name: string, id: string) => void,
    tags: TagList
}

export interface IDiagramPreview {
    id: string,
    title: string,
    description: string,
    tags: string[],
    locked: Locked
}

interface State {
    diagrams: IDiagramPreview[],
    selectedDiagrams: {[id: string]: boolean},
    diagramBeingEdited: string,
    editScreen: boolean,
    addNewTagScreen: boolean
}

class Home extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            diagrams: [],
            selectedDiagrams: null,
            diagramBeingEdited: null,
            editScreen: false,
            addNewTagScreen: false
        }

        this.onCreateNew = this.onCreateNew.bind(this);
        this.editDiagram = this.editDiagram.bind(this);
        this.clearEditScreen = this.clearEditScreen.bind(this);
        this.showAddNewTag = this.showAddNewTag.bind(this);
        this.addTag = this.addTag.bind(this);
        this.clearAddNewTag = this.clearAddNewTag.bind(this);
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
            locked: Locked.Unlocked,
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
        this.props.addTag(name, status);
        this.clearAddNewTag();
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
                            removeTagFromDiagram={this.props.removeTagFromDiagram}/>
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
            return <div key={t} className='tag' onClick={() => this.setTag(t)}>{t}</div>
        })

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
            </div>
        )
    }
}

export default Home;