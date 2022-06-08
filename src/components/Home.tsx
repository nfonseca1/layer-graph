import * as React from 'react';
import db from '../lib/database';
import {v4 as uuidv4} from 'uuid';
import {Locked} from './Diagram';
import { Status } from '../lib/types';

interface Props {

}

export interface IDiagramPreview {
    id: string,
    title: string,
    description: string,
    tags: string[],
    locked: Locked
}

interface State {
    diagrams: IDiagramPreview[]
}

class Home extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            diagrams: []
        }

        this.onCreateNew = this.onCreateNew.bind(this);
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
        let diagramCreated = db.setDiagram({
            id: uuidv4(),
            title: 'New Diagram',
            description: '',
            tags: [],
            locked: Locked.Unlocked,
            channels: [],
            rootNodes: []
        })
        let nodesCreated = db.setNodes([]);

        Promise.all([diagramCreated, nodesCreated])
        .then()
    }

    render() {
        return (
            <div className='Home'>
                <div className='header'>
                    <button onClick={this.onCreateNew}>Create New</button>
                </div>
                <div className='diagrams'>

                </div>
            </div>
        )
    }
}

export default Home;