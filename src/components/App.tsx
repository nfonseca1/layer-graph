import * as React from 'react';
import Home from './Home';
import Diagram from './Diagram';
import Login from './Login';

interface Props {

}

enum Pages {
    Login,
    Home,
    Diagram
}

interface State {
    page: Pages
}

class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            page: Pages.Login
        }

        this.goToHomePage = this.goToHomePage.bind(this);
    }

    goToHomePage() {
        this.setState({
            page: Pages.Home
        })
    }

    render() {
        let page: JSX.Element;
        if (this.state.page === Pages.Login) {
            page = <Login goToHomePage={this.goToHomePage} />
        }
        else if (this.state.page === Pages.Home) {
            page = <Home />
        }
        else if (this.state.page === Pages.Diagram) {
            page = <Diagram />
        }

        return (
            <div className='App'>
                {page}
            </div>
        )
    }
}

export default App;