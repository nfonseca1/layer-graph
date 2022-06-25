import * as React from 'react';
import {INode} from './Node';

interface Props {
    nodes: INode[],
    channelOptions: {
        name: string,
        numberId: number,
        color: string
    }[],
    goToLayer: (id: string) => void,
    commentsExpanded: boolean,
    nodesExpanded: boolean,
    subcommentsExpanded: boolean
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

            let channelColor = this.props.channelOptions.find(opt => {
                return opt.numberId === n.channel;
            })?.color;

            let comExpanded = this.props.commentsExpanded ? 'expanded ' : '';
            let nodeExpanded = this.props.nodesExpanded ? 'expanded ' : '';
            let subExpanded = this.props.subcommentsExpanded ? 'expanded ' : '';

            return (
            <div className='container' key={n.id}>
                <div className={comExpanded + 'comment color' + channelColor?.slice(1)}>{n.comment}</div>
                <div className={nodeExpanded + "node color" + channelColor?.slice(1)} onClick={() => this.props.goToLayer(n.id)}>
                    {n.content}
                </div>
                <div className={subExpanded + 'subComment color' + channelColor?.slice(1)}>{n.subComment}</div>
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