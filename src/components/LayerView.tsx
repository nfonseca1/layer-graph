import * as React from 'react';
import {INode} from './Node';

interface Props {
    nodes: INode[],
    channelOptions: {
        name: string,
        numberId: number,
        color: string
    }[]
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

            return (
            <div className={"node color" + channelColor?.slice(1)} key={n.id}>
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