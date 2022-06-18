import * as React from 'react';
import Home from './Home';
import Diagram from './Diagram';
import Login from './Login';
import { LockedStatus, Pages, TagList } from '../lib/types';
import db from '../lib/database';

interface Props {

}

interface State {
    page: Pages,
    selectedDiagram: string,
    tags: TagList
}

class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            page: Pages.Login,
            selectedDiagram: null,
            tags: {}
        }

        this.goToHomePage = this.goToHomePage.bind(this);
        this.openDiagram = this.openDiagram.bind(this);
        this.addTag = this.addTag.bind(this);
        this.getDiagramsForTag = this.getDiagramsForTag.bind(this);
        this.addTagForDiagram = this.addTagForDiagram.bind(this);
        this.removeTagFromDiagram = this.removeTagFromDiagram.bind(this);
        this.updateTag = this.updateTag.bind(this);
        this.deleteTag = this.deleteTag.bind(this);
    }

    goToHomePage(tags: TagList) {
        this.setState({
            page: Pages.Home,
            tags: tags
        })
    }

    openDiagram(id: string) {
        this.setState({
            page: Pages.Diagram,
            selectedDiagram: id
        })
    }

    addTag(name: string, status: LockedStatus) {
        let tagFound = Object.keys(this.state.tags).find(t => {
            return t.toLowerCase() === name.toLowerCase()
        });
        if (tagFound) return false;

        this.setState((state) => ({
            tags: {
                ...state.tags,
                [name]: {
                    locked: status,
                    diagrams: {}
                }
            }
        }), () => {
            db.updateTags(this.state.tags);
        })
        return true;
    }

    getDiagramsForTag(tags: string[]): {[id: string]: boolean} {
        let diagrams = {}
        for (let tag of tags) {
            if (this.state.tags[tag]) {
                diagrams = {...diagrams, ...this.state.tags[tag].diagrams};
            }
        }
        return diagrams;
    }

    addTagForDiagram(name: string, id: string) {
        this.setState((state) => {
            let newTags = {...state.tags};
            if (newTags[name]) {
                newTags[name].diagrams[id] = true;
            }
            return {
                tags: newTags
            }
        }, () => {
            db.updateTags(this.state.tags);
        })
    }

    removeTagFromDiagram(name: string, id: string) {
        this.setState((state) => {
            let newTags = {...state.tags};
            if (newTags[name]) {
                delete newTags[name].diagrams[id];
            }
            return {
                tags: newTags
            }
        }, () => {
            db.updateTags(this.state.tags);
        })
    }

    updateTag(originalName: string, newName: string, lockedStatus: LockedStatus): boolean {
        let tagFound = Object.keys(this.state.tags).find(t => {
            return t.toLowerCase() === newName.toLowerCase() && t !== originalName
        });
        if (tagFound) return false;

        this.setState((state) => {
            let newTags = this.state.tags;
            if (originalName !== newName) {
                let value = newTags[originalName];
                newTags[newName] = value;
                delete newTags[originalName];
            }
            newTags[newName].locked = lockedStatus;

            return {
                tags: newTags
            }
        }, () => {
            db.updateTags(this.state.tags);
        })
        return true;
    }

    deleteTag(name: string) {
        this.setState((state) => {
            let newTags = state.tags;
            delete newTags[name];
            return {
                tags: newTags
            }
        }, () => {
            db.updateTags(this.state.tags);
        })
    }

    render() {
        let page: JSX.Element;
        if (this.state.page === Pages.Login) {
            page = <Login goToHomePage={this.goToHomePage} />
        }
        else if (this.state.page === Pages.Home) {
            page = <Home openDiagram={this.openDiagram} 
            addTag={this.addTag} 
            tags={this.state.tags} 
            getDiagramsForTag={this.getDiagramsForTag}
            addTagForDiagram={this.addTagForDiagram}
            removeTagFromDiagram={this.removeTagFromDiagram}
            updateTag={this.updateTag}
            deleteTag={this.deleteTag}/>
        }
        else if (this.state.page === Pages.Diagram) {
            page = <Diagram id={this.state.selectedDiagram} />
        }

        return (
            <div className='App'>
                {page}
            </div>
        )
    }
}

export default App;