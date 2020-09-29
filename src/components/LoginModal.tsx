import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Button, Form, Modal, Spinner, Alert } from 'react-bootstrap'
import { AppState } from '../reducers'
import { connect } from 'react-redux'

interface Props extends StateProps {
    show: boolean
    onClose: () => void
    onSubmit: (username: string, password: string) => void
}

interface State {
    username: string
    password: string
}

class LoginModal extends React.Component<Props, State> {
    portalNode: any
    usernameInput: any
    passwordInput: any

    constructor(props: Readonly<Props>) {
        super(props)
        this.portalNode = document.createElement('div')
        document.body.appendChild(this.portalNode)
        this.state = {
            username: '',
            password: '',
        }
        this.usernameInput = React.createRef()
        this.passwordInput = React.createRef()
    }

    componentDidMount() {
        this.usernameInput.current.focus()
    }

    componentWillUnmount() {
        document.body.removeChild(this.portalNode)
    }

    render() {
        return ReactDOM.createPortal(
            <Modal
                show={this.props.show}
                onHide={this.props.onClose}
                // backdrop='static'
                centered
                keyboard={false}
                animation={false}
            >
                <Modal.Body>
                    {!this.props.loginRequested && this.props.loginFailed && (
                        <Alert variant='danger'>
                            <Alert.Heading>Login failed</Alert.Heading>
                            <p>Please recheck login and password</p>
                        </Alert>
                    )}

                    <Form>
                        <Form.Group>
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                autoFocus={true}
                                disabled={this.props.loginRequested}
                                type='email'
                                placeholder='Enter email'
                                ref={this.usernameInput}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Password</Form.Label>
                            <Form.Control disabled={this.props.loginRequested} type='password' placeholder='Password' ref={this.passwordInput} />
                        </Form.Group>
                        <Button
                            disabled={this.props.loginRequested}
                            variant='primary'
                            type='submit'
                            onClick={(e: any) => {
                                e.preventDefault()
                                this.props.onSubmit(this.usernameInput.current.value, this.passwordInput.current.value)
                            }}
                        >
                            Submit
                        </Button>
                        {this.props.loginRequested && <Spinner animation='border' size='lg' style={{ float: 'right' }} />}
                    </Form>
                </Modal.Body>
            </Modal>,
            this.portalNode,
        )
    }
}

interface StateProps {
    loginRequested: boolean
    loginSuccess: boolean
    loginFailed: boolean
}

const mapStateToProps = ({ auth: { loginRequested, loginSuccess, loginFailed } }: AppState): StateProps => ({
    loginRequested,
    loginSuccess,
    loginFailed,
})

export default connect<any, any, any>(mapStateToProps)(LoginModal)
