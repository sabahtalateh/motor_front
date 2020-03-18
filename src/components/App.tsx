import * as React from 'react'
import { createGlobalStyle } from 'styled-components'
import styled from 'styled-components'
import { Link, Route, Switch } from 'react-router-dom'
import NewDiagram from '../pages/NewDiagram'
import Home from '../pages/Home'
import TextEditor from '../pages/TextEditor'
import './App.css'

const GlobalStyle = createGlobalStyle`
  mark {
    background-color: rgba(50, 50, 50, .3);
    padding: 0;
  }
`

const Wrapper = styled.div`
    min-width: 100px;
`

export class App extends React.Component<{}, {}> {
    render(): JSX.Element {
        return (
            <Wrapper>
                <GlobalStyle />
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/diagrams/new">New Diagram</Link>
                </nav>
                <Switch>
                    <Route path="/" component={Home} exact />
                    <Route path="/diagrams/new" component={NewDiagram} exact />
                    <Route path="/text/:id" component={TextEditor} exact />
                    <Route render={() => <h1>404</h1>} />
                </Switch>
            </Wrapper>
        )
    }
}
