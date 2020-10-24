import * as React from 'react'
import { Token } from '../../reducers/auth'
import GraphQLService from '../../services/GraphQLService'
import { AppState } from '../../reducers'
import { Dispatch, useRef } from 'react'
import { fetchMyStack } from '../../actions/creators/myStack'
import { withGraphQLService } from '../../hoc/withGraphQLService'
import { connect } from 'react-redux'
import { Button, ListGroup, Spinner, Toast } from 'react-bootstrap'
import EditorComponent from '../Editor/EditorComponent'
import uuid = require('uuid')
import { Text } from '../Editor/EditorComponent'
import { saveToMyStack } from '../../actions/creators/newStackItem'

interface State {
    myStack: {
        item: StackItem
        editing: boolean
        adding: boolean
    }[]
    notification: {
        show: boolean
        header: string
        body: string
    }
}

export interface StackItem {
    id: string
    title: string
    blocks: Block[]
}

export interface Block {
    id: string
    text: string
    marks: Mark[]
}

export interface Mark {
    id: string
    from: number
    to: number
}

interface Props extends StateProps, DispatchProps {
    token: Token
}

class MyStackList extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.props.fetchMyStack(this.props.token)
        this.state = {
            myStack: [],
            notification: {
                show: false,
                header: null,
                body: null,
            },
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevProps.myStackLoading && !this.props.myStackLoading && this.props.myStack) {
            this.setState({
                myStack: [
                    ...this.props.myStack.map(x => ({
                        item: x,
                        editing: false,
                        adding: false,
                        getText: undefined,
                    })),
                ],
            })
        }

        // Итем сохранился
        if (!prevProps.updateSuccess && this.props.updateSuccess && prevProps.updatedItem === null && this.props.updatedItem !== null) {
            const updatedItem = this.props.updatedItem

            const updatedItems = this.state.myStack.map(i => {
                if (i.adding) {
                    return { editing: false, adding: false, item: updatedItem }
                } else {
                    return i
                }
            })

            this.setState({
                myStack: updatedItems,
            })
        }
    }

    startEdit = (idToEdit: string) => {
        const editingInProgress = this.state.myStack.filter(i => i.editing === true).length > 0
        if (editingInProgress) {
            this.showNotification('Edition in progress', 'Please save or discard changes on currently editing item')
            return
        }

        const updatedItems = this.state.myStack.map(i => {
            if (i.item.id === idToEdit) {
                return { ...i, editing: true }
            } else {
                return i
            }
        })

        this.setState({
            myStack: updatedItems,
        })
    }

    showNotification = (header: string, body: string) => {
        this.setState({
            notification: {
                show: true,
                header,
                body,
            },
        })
    }

    editStackItem = (text: Text) => {
        // добавлен originalId в блоки
        console.log(text)
    }

    addStackItem = (text: Text) => {
        this.props.saveToMyStack(this.props.token, {
            id: text.id,
            title: text.title,
            blocks: text.blocks.map(b => ({
                id: b.id,
                text: b.text,
                marks: b.marks.map(m => ({
                    id: m.id,
                    from: m.startPos,
                    to: m.endPos,
                })),
            })),
        })
    }

    render() {
        const editingInProgress = this.state.myStack.filter(x => x.editing === true).length !== 0

        return (
            <>
                <Toast
                    show={this.state.notification.show}
                    style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 900 }}
                    onClose={() => {
                        this.setState({
                            notification: {
                                ...this.state.notification,
                                show: false,
                            },
                        })
                    }}
                >
                    <Toast.Header>
                        <strong className='mr-auto'>{this.state.notification.header}</strong>
                    </Toast.Header>
                    <Toast.Body>{this.state.notification.body}</Toast.Body>
                </Toast>
                <ListGroup>
                    {this.state.myStack.length === 0 && !editingInProgress && <ListGroup.Item key='empty'>Nothing in stack</ListGroup.Item>}
                    {this.state.myStack.map(i => {
                        if (i.editing || i.adding) {
                            let text: Text
                            if (i.editing) {
                                text = {
                                    id: i.item.id,
                                    title: i.item.title,
                                    blocks: i.item.blocks.map(b => ({
                                        id: b.id,
                                        originalId: b.id,
                                        text: b.text,
                                        marks: b.marks.map(m => ({
                                            id: m.id,
                                            startPos: m.from,
                                            endPos: m.to,
                                        })),
                                    })),
                                }
                            } else if (i.adding) {
                                text = null
                            }

                            return (
                                <ListGroup.Item key='editing'>
                                    <EditorComponent ref={`editor_${i.item.id}`} editable={true} text={text} />
                                    {i.adding && (
                                        <Button
                                            onClick={() => {
                                                // @ts-ignore
                                                const text = this.refs[`editor_${i.item.id}`].getText()
                                                this.addStackItem(text)
                                            }}
                                            disabled={this.props.updateRequested}
                                        >
                                            Add &nbsp;
                                            {this.props.updateRequested && <Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true' />}
                                        </Button>
                                    )}

                                    {i.editing && (
                                        <Button
                                            onClick={() => {
                                                // @ts-ignore
                                                const text = this.refs[`editor_${i.item.id}`].getText()
                                                text.id = i.item.id
                                                this.editStackItem(text)
                                            }}
                                            disabled={this.props.updateRequested}
                                        >
                                            Save &nbsp;
                                            {this.props.updateRequested && <Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true' />}
                                        </Button>
                                    )}
                                </ListGroup.Item>
                            )
                        } else {
                            return (
                                <ListGroup.Item key={i.item.id}>
                                    <EditorComponent
                                        editable={false}
                                        text={{
                                            id: i.item.id,
                                            title: i.item.title,
                                            blocks: i.item.blocks.map(b => ({
                                                id: b.id,
                                                originalId: b.id,
                                                text: b.text,
                                                marks: b.marks.map(m => ({
                                                    id: m.id,
                                                    startPos: m.from,
                                                    endPos: m.to,
                                                })),
                                            })),
                                        }}
                                    />
                                    <div style={{ float: 'right' }}>
                                        <Button variant='light' size='sm' onClick={() => this.startEdit(i.item.id)}>
                                            edit
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            )
                        }
                    })}
                    <ListGroup.Item key='status'>
                        <Button
                            disabled={editingInProgress}
                            onClick={() => {
                                this.setState({
                                    myStack: [
                                        ...this.state.myStack,
                                        {
                                            adding: true,
                                            editing: false,
                                            item: {
                                                id: uuid.v4(),
                                                title: null,
                                                blocks: [
                                                    {
                                                        id: uuid.v4(),
                                                        text: '',
                                                        marks: [],
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                })
                            }}
                        >
                            Add +
                        </Button>
                        <div style={{ float: 'right', padding: '7px' }}>
                            <small>Status: </small>
                            {this.props.myStackLoading && (
                                <small>
                                    Loading &nbsp;
                                    <Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true' />
                                </small>
                            )}
                            {!this.props.myStackLoading && <small>Loaded</small>}
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </>
        )
    }
}

interface StateProps {
    myStackLoading: boolean
    myStackError: boolean
    myStack: StackItem[]

    updateRequested: boolean
    updateSuccess: boolean
    updatedItem: StackItem
    updateFailed: boolean
}

interface OwnProps {
    graphQLService: GraphQLService
}

interface DispatchProps {
    fetchMyStack: (token: Token) => void
    saveToMyStack: (token: Token, stackItem: StackItem) => void
}

const mapStateToProps = ({
    myStack: { loading, error, myStack },
    newStackItem: { updateRequested, updateSuccess, updatedItem, updateFailed },
}: AppState): StateProps => ({
    myStackLoading: loading,
    myStackError: error,
    myStack,
    updateRequested,
    updateSuccess,
    updatedItem,
    updateFailed,
})

const mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: OwnProps): DispatchProps => {
    const { graphQLService } = ownProps
    return {
        fetchMyStack: fetchMyStack(dispatch, graphQLService),
        saveToMyStack: saveToMyStack(dispatch, graphQLService),
    }
}

export default withGraphQLService(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(MyStackList))
