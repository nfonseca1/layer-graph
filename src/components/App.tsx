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
    page: Pages,
    selectedDiagram: string
}

class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            page: Pages.Login,
            selectedDiagram: null
        }

        this.goToHomePage = this.goToHomePage.bind(this);
        this.openDiagram = this.openDiagram.bind(this);
    }

    goToHomePage() {
        this.setState({
            page: Pages.Home
        })
    }

    openDiagram(id: string) {
        this.setState({
            page: Pages.Diagram,
            selectedDiagram: id
        })
    }

    render() {
        let page: JSX.Element;
        if (this.state.page === Pages.Login) {
            page = <Login goToHomePage={this.goToHomePage} />
        }
        else if (this.state.page === Pages.Home) {
            page = <Home openDiagram={this.openDiagram} />
        }
        else if (this.state.page === Pages.Diagram) {
            page = <Diagram id={this.state.selectedDiagram} />
        }

        return (
            <div className='App'>
                {page}
            </div>
        )
    }
}

export default App;