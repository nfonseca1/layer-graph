import * as React from 'react';
import db from '../lib/database';
import { AddUserStatus, LoginStatus } from '../lib/types';

interface Props {
    goToHomePage: () => void
}

interface State {
    loginUsername: string,
    loginPassword: string,
    signupUsername: string,
    signupPassword: string,
    signupPasswordConfirm: string
}

enum Form {
    Login,
    Signup
}

class Login extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            loginUsername: '',
            loginPassword: '',
            signupUsername: '',
            signupPassword: '',
            signupPasswordConfirm: ''
        }

        this.onLoginUsernameChange = this.onLoginUsernameChange.bind(this);
        this.onLoginPasswordChange = this.onLoginPasswordChange.bind(this);
        this.onSignupUsernameChange = this.onSignupUsernameChange.bind(this);
        this.onSignupPasswordChange = this.onSignupPasswordChange.bind(this);
        this.onSignupPasswordConfirmChange = this.onSignupPasswordConfirmChange.bind(this);
        this.submitLogin = this.submitLogin.bind(this);
        this.submitSignup = this.submitSignup.bind(this);
    }

    componentDidMount(): void {
        (document.querySelector(".loginForm .username") as HTMLInputElement).focus();
    }

    onLoginUsernameChange(e: React.ChangeEvent) {
        this.setState({
            loginUsername: (e.target as HTMLInputElement).value
        })
    }

    onLoginPasswordChange(e: React.ChangeEvent) {
        this.setState({
            loginPassword: (e.target as HTMLInputElement).value
        })
    }

    onSignupUsernameChange(e: React.ChangeEvent) {
        this.setState({
            signupUsername: (e.target as HTMLInputElement).value
        })
    }

    onSignupPasswordChange(e: React.ChangeEvent) {
        this.setState({
            signupPassword: (e.target as HTMLInputElement).value
        })
    }

    onSignupPasswordConfirmChange(e: React.ChangeEvent) {
        this.setState({
            signupPasswordConfirm: (e.target as HTMLInputElement).value
        })
    }

    submitLogin() {
        if (!this.state.loginUsername || !this.state.loginPassword) {
            alert('Username and Password are both required');
            return;
        }

        db.login(this.state.loginUsername, this.state.loginPassword)
        .then(results => {
            if (results.status === LoginStatus.UsernameOrPasswordIncorrect) {
                alert("Username or password is incorrect");
            }
            else if (results.status === LoginStatus.Failed) {
                alert("An error occurred while trying to log in");
            }
            else this.props.goToHomePage();
        })
    }   

    submitSignup() {
        if (!this.state.signupUsername || !this.state.signupPassword) {
            alert('Username and Password are both required');
            return;
        }
        if (this.state.signupPassword !== this.state.signupPasswordConfirm) {
            alert('Passwords do not match');
            return;
        }

        db.signup(this.state.signupUsername, this.state.signupPassword)
        .then(results => {
            if (results.status === AddUserStatus.UsernameExists) {
                alert('Username is already taken');
            }
            else if (results.status === AddUserStatus.Failed) {
                alert('An error occurred while trying to register');
            }
            else this.props.goToHomePage();
        })
    }

    onKeyDown(e: React.KeyboardEvent, form: Form) {
        if (e.key === 'Enter' && form === Form.Login) {
            this.submitLogin();
        }
        else if (e.key === 'Enter' && form === Form.Signup) {
            this.submitSignup();
        }
    }

    render() {
        return (
            <div className='Login'>
                <div className='loginForm'>
                    <h2>Login</h2>
                    <input className='username' type='text' 
                    placeholder='Username'
                    onChange={this.onLoginUsernameChange} 
                    onKeyDown={(e) => this.onKeyDown(e, Form.Login)}/>
                    <input className='password' type='password' 
                    placeholder='Password'
                    onChange={this.onLoginPasswordChange} 
                    onKeyDown={(e) => this.onKeyDown(e, Form.Login)}/>
                    <button className='confirmBtn' onClick={this.submitLogin}>Login</button>
                </div>
                <div className='signupForm'>
                    <h2>Sign Up</h2>
                    <input className='username' type='text' 
                    placeholder='Username'
                    onChange={this.onSignupUsernameChange} 
                    onKeyDown={(e) => this.onKeyDown(e, Form.Signup)}/>
                    <input className='password' type='password' 
                    placeholder='Password'
                    onChange={this.onSignupPasswordChange} 
                    onKeyDown={(e) => this.onKeyDown(e, Form.Signup)}/>
                    <input className='passwordConfirm' type='password' 
                    placeholder='Confirm Password'
                    onChange={this.onSignupPasswordConfirmChange} 
                    onKeyDown={(e) => this.onKeyDown(e, Form.Signup)}/>
                    <button className='confirmBtn' onClick={this.submitSignup}>Sign Up</button>
                </div>
            </div>
        )
    }
}

export default Login;