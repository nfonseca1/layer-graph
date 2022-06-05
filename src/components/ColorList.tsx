import * as React from 'react';

interface Props {
    selectColor: (color: string) => void
}

interface State {
    colors: string[]
}

class ColorList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            colors: [
                '#3a3a3a', 
                '#7a0a02', 
                '#6e2e2a',
                '#7d460b',
                '#22421f',
                '#163640',
                '#102547',
                '#2c1c54',
                '#3e1547'
            ]
        }
    }

    render() {
        let colors = this.state.colors.map(color => {
            return <div onClick={() => this.props.selectColor(color)} 
            style={{backgroundColor: color}}
            key={color}></div>
        })

        return (
            <div id='colorListDropdown' style={{display: 'none'}}>
                {colors}
            </div>
        )
    }
}

export default ColorList;