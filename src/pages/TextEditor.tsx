import * as React from 'react'
import { Dispatch } from 'react'
import { match } from 'react-router-dom'
import GraphQLService from '../services/GraphQLService'
import { fetchText } from '../actions/creators'
import { withGraphQLService } from '../hoc/withGraphQLService'
import { connect } from 'react-redux'
import { AppState } from '../reducers'
import TextBlockView from '../components/TextBlockView'
import { Block, Editor } from '../app/Editor'
import { Mark } from '../app/BlockEditor'

interface Text {
    id: string
    title: string
    blocks: Block[]
}

interface Props extends StateProps, DispatchProps {
    textService: GraphQLService
    match: match<{ id: string }>
}

interface StateProps {
    text: Text
    loading: boolean
    error: boolean
}

interface DispatchProps {
    fetchText: (id: string) => void
}

interface OwnProps {
    graphQLService: GraphQLService
}

interface State {
    text: Text
    marksUnderCursor: Mark[]
    blockUnderCursor?: Block
}

const Control = 'Control'
const Meta = 'Meta'
const Shift = 'Shift'

class TextEditor extends React.Component<Props, State> {
    private readonly editor: Editor
    private specialKeysPressed: string[] = []

    constructor(props: Readonly<Props>) {
        super(props)

        let text: Text = {
            id: '123',
            title: 'Hello',
            blocks: [
                {
                    id: '111',
                    text: `1111 2222 3333 4444 5555`,
                    marks: [
                        {
                            id: 'm1',
                            startPos: 2,
                            endPos: 9,
                        },
                        {
                            id: 'm2',
                            startPos: 3,
                            endPos: 8,
                        },
                        // {
                        //     id: 'm2',
                        //     startPos: 8,
                        //     endPos: 12
                        // },
                        // {
                        //     id: 'm3',
                        //     startPos: 2,
                        //     endPos: 6
                        // },
                    ],
                },
                {
                    id: '222',
                    text: `1111`,
                    marks: [
                        // {
                        //     id: 'm10',
                        //     startPos: 1,
                        //     endPos: 3
                        // },
                        //     {
                        //         id: 'm2',
                        //         startPos: 5,
                        //         endPos: 15
                        //     },
                    ],
                },
            ],
        }

        this.editor = new Editor(text.title, text.blocks, this.setState.bind(this), this.setMarksAndBlockUnderCursor)
        this.state = { text: this.editor, marksUnderCursor: [] }
    }

    keyDownHandler = (e: any) => {
        if (Control === e.key || Meta === e.key || Shift === e.key) {
            this.specialKeysPressed.push(e.key)
        }
        if (e.key === 'z' && (this.specialKeysPressed.includes(Control) || this.specialKeysPressed.includes(Meta))) {
            if (this.specialKeysPressed.includes(Shift)) {
                this.editor.unstackRedo()
            } else {
                this.editor.unstackUndo()
            }
        }
    }

    keyUpHandler = (e: any) => {
        if (Control === e.key || Meta === e.key || Shift === e.key) {
            this.specialKeysPressed = this.specialKeysPressed.filter(k => k !== e.key)
        }
    }

    mark = () => {
        const focus = this.editor.getFocus()
        const focusBlock = this.editor.getFocusBlock()
        if (undefined !== focus && 'selection' === focus.type && undefined !== focusBlock) {
            if (focus.selection.start === focus.selection.end) {
                return
            }
            if (focus.selection.start > focus.selection.end) {
                const end = focus.selection.start
                focus.selection.start = focus.selection.end
                focus.selection.end = end
            }
            this.editor.mark(focusBlock, focus.selection)
        }
    }

    setMarksAndBlockUnderCursor = (block: Block, marks: Mark[]) => {
        this.setState({ blockUnderCursor: block, marksUnderCursor: marks })
    }

    dropMarks = (marks: Mark[]) => {
        this.editor.dropMarks(this.state.blockUnderCursor, marks)
    }

    render() {
        return (
            <div onKeyDown={this.keyDownHandler} onKeyUp={this.keyUpHandler}>
                <button onClick={this.mark}>mark</button>
                {this.state.marksUnderCursor.map(m => (
                    <button onClick={() => this.dropMarks([m])} key={m.id}>
                        Drop {m.id}
                    </button>
                ))}
                {this.state.marksUnderCursor.length > 1 && <button onClick={() => this.dropMarks(this.state.marksUnderCursor)}>Drop All Selected</button>}
                {this.state.text.blocks.map(b => (
                    <TextBlockView key={b.id} block={b} editor={this.editor} data-editor-element="editor" focused={false} />
                ))}
            </div>
        )
    }
}

const mapStateToProps = ({ text: { text, loading, error } }: AppState): StateProps => ({ text, loading, error })

const mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: OwnProps): DispatchProps => {
    const { graphQLService } = ownProps
    return {
        fetchText: fetchText(dispatch, graphQLService),
    }
}

export default withGraphQLService(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(TextEditor))
