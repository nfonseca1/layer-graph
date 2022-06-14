import * as React from 'react';
import Home from './Home';
import Diagram from './Diagram';
import Login from './Login';
import {LockedStatus} from './AddNewTag';

interface Props {

}

enum Pages {
    Login,
    Home,
    Diagram
}

export interface TagList {
    [tagName: string]: {
        locked: LockedStatus,
        diagrams: {
            [id: string]: boolean
        }
    }
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
    }

    goToHomePage() {
        this.setState({
            page: Pages.Home
        })
    }

    openDiagram(id: string) {
        this.setState({
            page: Pages.Diagram,
            selectedDiagram: id
        })
    }

    addTag(name: string, status: LockedStatus) {
        this.setState((state) => ({
            tags: {
                ...state.tags,
                [name]: {
                    locked: status,
                    diagrams: {}
                }
            }
        }))
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

    render() {
        let page: JSX.Element;
        if (this.state.page === Pages.Login) {
            page = <Login goToHomePage={this.goToHomePage} />
        }
        else if (this.state.page === Pages.Home) {
            page = <Home openDiagram={this.openDiagram} 
            addTag={this.addTag} 
            tags={this.state.tags} 
            getDiagramsForTag={this.getDiagramsForTag}/>
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