import * as React from 'react';

interface Props {
    verifyPassword: (password: string) => void,
    clearScreen: () => void
}

interface State {
    password: string
}

class VerifyPasswordScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            password: ''
        }

        this.passwordChange = this.passwordChange.bind(this);
        this.submitPassword = this.submitPassword.bind(this);
    }

    passwordChange(e: React.ChangeEvent) {
        this.setState({
            password: (e.target as HTMLInputElement).value
        })
    }

    submitPassword() {
        this.props.verifyPassword(this.state.password);
    }

    render() {
        return (
            <div className='VerifyPasswordScreenContainer'>
                <div className='VerifyPasswordScreenBackground' onClick={this.props.clearScreen}></div>
                <div className='VerifyPasswordScreen'>
                    <h2>Verify Password</h2>
                    <input type='password' placeholder='Password' 
                    value={this.state.password}
                    onChange={this.passwordChange}/>
                    <button onClick={this.submitPassword}>Confirm</button>
                </div>
            </div>
        )
    }
}

export default VerifyPasswordScreen;