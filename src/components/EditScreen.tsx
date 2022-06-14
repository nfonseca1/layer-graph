import * as React from 'react';

interface Props {
    clearEditScreen: () => void
}

interface State {

}

class EditScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div className='editScreenContainer'>
                <div className='editScreenBackground' onClick={this.props.clearEditScreen}></div>
                <div className='editScreen'></div>
            </div>
        )
    }
}

export default EditScreen;