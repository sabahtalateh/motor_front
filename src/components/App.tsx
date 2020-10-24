import * as React from 'react'
import { connect } from 'react-redux'
import { createGlobalStyle } from 'styled-components'
import styled from 'styled-components'
import { Link, Route, Switch } from 'react-router-dom'
import { Row, Col, Button, Nav, Alert } from 'react-bootstrap'

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
import { Spinner } from 'react-bootstrap'
import { Token } from '../reducers/auth'

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

const Container = styled.div`
    min-width: 600px;
    max-width: 1600px;
    margin: 0 32px;
`

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
            authCookie: null,
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
                            {this.props.autoRefreshFailed && (
                                <Row>
                                    <Col>
                                        <Alert variant='danger'>
                                            <Alert.Heading>Token Expired! Please Login again</Alert.Heading>
                                            <p>
                                                Your access token expired so you need to login again.. As written in the title.. so i don't know what is this
                                                text for
                                            </p>
                                        </Alert>
                                    </Col>
                                </Row>
                            )}
                            <Row>
                                <Col>
                                    <Navbar bg='light'>
                                        <Navbar.Collapse>
                                            <Nav className='mr-auto'>
                                                <Link className='nav-link' to='/'>
                                                    Home
                                                </Link>
                                                {this.props.token && (
                                                    <Link className='nav-link' to='/stack/my'>
                                                        My Stack
                                                    </Link>
                                                )}
                                            </Nav>
                                            {!this.props.token && (
                                                <Button
                                                    variant='dark'
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
                                                <Button variant='dark' onClick={this.props.logout}>
                                                    Logout
                                                </Button>
                                            )}
                                        </Navbar.Collapse>
                                    </Navbar>
                                </Col>
                            </Row>
                            <Switch>
                                <Route path='/' component={Home} exact />
                                <Route path='/stack/my' component={MyStack} exact />
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
                                onSubmit={(username: string, password: string) => {
                                    this.props.login(username, password)
                                }}
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
    autoRefreshFailed: boolean
}

interface OwnProps {
    graphQLService: GraphQLService
}

interface DispatchProps {
    login: (username: string, password: string) => void
    logout: () => void
    readAuthCookie: () => void
}

const mapStateToProps = ({ auth: { readingAuthCookie, token, autoRefreshFailed } }: AppState): StateProps => ({
    readingAuthCookie,
    token,
    autoRefreshFailed,
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
