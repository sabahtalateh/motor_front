import * as React from 'react'
import { connect } from 'react-redux'
import { createGlobalStyle } from 'styled-components'
import styled from 'styled-components'
import { Link, Route, Switch } from 'react-router-dom'
import { Container, Row, Col, Button, Nav, NavDropdown, Form, FormControl, Modal } from 'react-bootstrap'

import Home from '../pages/Home'
import './App.css'
import MyStack from '../pages/MyStack'
import { Navbar } from 'react-bootstrap'
import LoginModal from './LoginModal'
import { AppState } from '../reducers'
import { Dispatch } from 'react'
import { login, logout, readAuthCookie } from '../actions/creators/auth'
import GraphQLService from '../services/GraphQLService'
import { withGraphQLService } from '../hoc/withGraphQLService'
import * as cookie from '../util/cookie'
import { Spinner } from 'react-bootstrap'
import { Token } from '../reducers/authReducer'

const SPINNER_VAR = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    // 'light',
    'dark',
]

const SPINNER_ANIMATION = ['border', 'grow']

const GlobalStyle = createGlobalStyle`
  mark {
    background-color: rgba(50, 50, 50, .3);
    padding: 0;
  }
`

const Right = styled.div`
    float: right;
`

const Wrapper = styled.div`
    //min-width: 800px;
`

interface State {
    authCookie: string
    loginOpen: boolean
}

interface Props extends StateProps, DispatchProps {}

class App extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.state = {
            authCookie: '123',
            loginOpen: false,
        }
    }

    componentDidMount() {
        this.props.readAuthCookie()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevProps.token === null && this.props.token !== null) {
            this.setState({
                loginOpen: false,
            })
        }
    }

    render(): JSX.Element {
        const spinners = []
        for (let i = 0; i < 40; i++) {
            spinners.push({
                var: SPINNER_VAR[Math.floor(Math.random() * SPINNER_VAR.length)],
                animation: SPINNER_ANIMATION[Math.floor(Math.random() * SPINNER_ANIMATION.length)],
            })
        }

        return (
            <Wrapper>
                {this.props.token && (
                    <>
                        <h1>{this.props.token.access}</h1>
                        <h1>{this.props.token.refresh}</h1>
                    </>
                )}

                {this.props.readingAuthCookie && (
                    <>
                        {spinners.map((x, i) => (
                            <Spinner key={i} style={{ margin: '76px' }} variant={x.var} animation={x.animation} />
                        ))}
                    </>
                )}
                {!this.props.readingAuthCookie && (
                    <>
                        <Container>
                            <GlobalStyle />
                            <Row>
                                <Col>
                                    <Navbar bg="light">
                                        <Navbar.Collapse>
                                            <Nav className="mr-auto">
                                                {/*    <Nav.Link href='#home'>Home</Nav.Link>*/}
                                                {/*<Nav.Link href='#link'>Link</Nav.Link>*/}
                                                {/*<NavDropdown title='Dropdown' id='basic-nav-dropdown'>*/}
                                                {/*    <NavDropdown.Item href='#action/3.1'>Action</NavDropdown.Item>*/}
                                                {/*    <NavDropdown.Item href='#action/3.2'>Another action</NavDropdown.Item>*/}
                                                {/*    <NavDropdown.Item href='#action/3.3'>Something</NavDropdown.Item>*/}
                                                {/*    <NavDropdown.Divider />*/}
                                                {/*    <NavDropdown.Item href='#action/3.4'>Separated link</NavDropdown.Item>*/}
                                                {/*</NavDropdown>*/}
                                            </Nav>
                                            {!this.props.token && (
                                                <Button
                                                    variant="dark"
                                                    onClick={() => {
                                                        this.setState({ loginOpen: true })
                                                    }}
                                                >
                                                    Login
                                                </Button>
                                            )}
                                            {this.props.token && <Button>Profile</Button>}
                                            &nbsp;
                                            {this.props.token && (
                                                <Button variant="dark" onClick={this.props.logout}>
                                                    Logout
                                                </Button>
                                            )}
                                        </Navbar.Collapse>
                                    </Navbar>
                                </Col>
                            </Row>
                            {/*<nav>*/}
                            {/*    <Button>123</Button>*/}
                            {/*    <Link to='/'>Home</Link>*/}
                            {/*    <Link to='/stack/my'>My Stack</Link>*/}
                            {/*    <Link to='/diagrams/new'>New Diagram</Link>*/}
                            {/*</nav>*/}
                            <Switch>
                                <Route path="/" component={Home} exact />
                                <Route path="/stack/my" component={MyStack} exact />
                                {/*<Route path='/diagrams/new' component={ NewDiagram } exact/>*/}
                                {/*<Route path='/text/:id' component={ EditorPage } exact/>*/}
                                <Route render={() => <h1>404</h1>} />
                            </Switch>
                        </Container>
                        {this.state.loginOpen && (
                            <LoginModal
                                show={this.state.loginOpen}
                                onClose={() => {
                                    this.setState({ loginOpen: false })
                                }}
                                onSubmit={(username: string, password: string) => this.props.login(username, password)}
                            />
                        )}
                    </>
                )}
            </Wrapper>
        )
    }
}

interface StateProps {
    readingAuthCookie: boolean
    token: Token
}

interface OwnProps {
    graphQLService: GraphQLService
}

interface DispatchProps {
    login: (username: string, password: string) => void
    logout: () => void
    readAuthCookie: () => void
}

const mapStateToProps = ({ auth: { readingAuthCookie, token } }: AppState): StateProps => ({
    readingAuthCookie,
    token,
})

const mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: OwnProps): DispatchProps => {
    const { graphQLService } = ownProps
    return {
        login: login(dispatch, graphQLService),
        logout: logout(dispatch),
        readAuthCookie: readAuthCookie(dispatch),
    }
}

export default withGraphQLService(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(App))
