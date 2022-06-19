import * as React from 'react';

interface Props {
    clearScreen: () => void,
    convert: (text: string) => void
}

interface State {
    text: string
}

class ConvertToNodesScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            text: ''
        }

        this.onTextChange = this.onTextChange.bind(this);
        this.removeTimestamps = this.removeTimestamps.bind(this);
        this.fixCap = this.fixCap.bind(this);
        this.removeEmpties = this.removeEmpties.bind(this);
        this.convert = this.convert.bind(this);
        this.addPeriods = this.addPeriods.bind(this);
    }

    onTextChange(e: React.ChangeEvent) {
        this.setState({
            text: (e.target as HTMLTextAreaElement).value
        })
    }

    removeTimestamps() {
        this.setState((state) => {
            let newText = state.text;
            newText = newText.split('\n').map(line => {
                if (line.includes(':')) {
                    let parts = line.split(':');
                    let timestamp = true;
                    for (let part of parts) {
                        if (isNaN(parseFloat(part))) timestamp = false;
                    }

                    if (timestamp) return '';
                }
                return line;
            })
            .join('\n');

            return {
                text: newText
            }
        })
    }

    fixCap() {
        this.setState((state) => {
            let newText = state.text;
            newText = newText.replace(/ i /g, " I ");
            newText = newText.replace(/ i'/g, " I'");
            newText = newText.split('\n').map(line => {
                return line.slice(0, 1).toUpperCase() + line.slice(1);
            })
            .join('\n')
            .split('. ').map(line => {
                return line.slice(0, 1).toUpperCase() + line.slice(1);
            })
            .join('. ');

            return {
                text: newText
            }
        })
    }

    addPeriods() {
        this.setState((state) => {
            let newText = state.text;
            newText = newText.split('\n').map(line => {
                if (line.trim() === '') return line;
                
                let last = line.trim().slice(-1);
                if (last === '.' 
                    || last === '?'
                    || last === '!'
                    || last === '-') {
                    return line
                }
                else {
                    return line.trimEnd() + '.';
                }
            })
            .join('\n');

            return {
                text: newText
            }
        })
    }

    removeEmpties(text: string) {
        let newText = text;
        return newText = newText.split('\n').map(line => line.trim())
        .filter(line => {
            if (line.trim() !== '') return true;
            else return false;
        })
        .join('\n');
    }

    convert() {
        let text = this.removeEmpties(this.state.text);
        this.props.convert(text);
    }

    render() {
        return (
            <div className='ConvertToNodesScreenContainer'>
                <div className='ConvertToNodesScreenBackground' onClick={this.props.clearScreen}></div>
                <div className='ConvertToNodesScreen'>
                    <textarea onChange={this.onTextChange} value={this.state.text}></textarea>
                    <div className='options'>
                        <button onClick={this.removeTimestamps}>Remove Timestamps</button>
                        <button onClick={this.addPeriods}>Add Periods</button>
                        <button onClick={this.fixCap}>Fix Cap</button>
                    </div>
                    <div className='channels'>

                    </div>
                    <button onClick={this.convert}>Convert To Nodes</button>
                </div>
            </div>
        )
    }
}

export default ConvertToNodesScreen;