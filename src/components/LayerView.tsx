import * as React from 'react';
import {INode} from './Node';

interface Props {
    nodes: INode[]
}

interface State {

}

class LayerView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    } 

    componentDidUpdate(): void {
        document.querySelector(".LayerView").scrollTo(0, 10000000);
    }

    render() {
        let nodes = this.props.nodes?.map(n => {
            return (
            <div className='node' key={n.id}>
                {n.content}
                <div className='comment'>{n.comment}</div>
                <div className='subComment'>{n.subComment}</div>
            </div>)
        })

        return (
            <div className='LayerView'>
                {nodes}
            </div>
        )
    }
}

export default LayerView;