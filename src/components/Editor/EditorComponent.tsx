import * as React from 'react'
import TextBlockView from './TextBlockView'
import { Block, Editor } from '../../app/Editor'
import { Mark } from '../../app/BlockEditor'
import MarksActions from './MarksActions'
import { placeFocus } from '../../app/Focus'
import uuid = require('uuid')

export interface Text {
    id: string
    title: string
    blocks: Block[]
}

interface Props {
    editable: boolean
    text: Text
}

interface State {
    text: Text
    marksUnderCursor: Mark[]
    blockUnderCursor?: Block
}

const Control = 'Control'
const Meta = 'Meta'
const Shift = 'Shift'

class EditorComponent extends React.Component<Props, State> {
    private readonly editor: Editor
    private specialKeysPressed: string[] = []

    constructor(props: Readonly<Props>) {
        super(props)
        let text: Text
        // If new text
        if (props.text == null) {
            text = {
                id: null,
                title: null,
                blocks: [
                    {
                        id: uuid.v4(),
                        originalId: null,
                        text: '',
                        marks: [],
                    },
                ],
            }
        } else {
            text = this.props.text
        }

        // let text: Text = {
        //     id: '123',
        //     title: 'Hello',
        //     blocks: [
        //         {
        //             id: '111',
        //             text: `1111 2222 3333 4444 5555`,
        //             marks: [
        //                 {
        //                     id: 'm1',
        //                     startPos: 2,
        //                     endPos: 9,
        //                 },
        //                 {
        //                     id: 'm2',
        //                     startPos: 3,
        //                     endPos: 8,
        //                 },
        //                 {
        //                     id: 'm3',
        //                     startPos: 17,
        //                     endPos: 23,
        //                 },
        //                 // {
        //                 //     id: 'm2',
        //                 //     startPos: 8,
        //                 //     endPos: 12
        //                 // },
        //                 // {
        //                 //     id: 'm3',
        //                 //     startPos: 2,
        //                 //     endPos: 6
        //                 // },
        //             ],
        //         },
        //         {
        //             id: '222',
        //             text: `1111`,
        //             marks: [
        //                 // {
        //                 //     id: 'm10',
        //                 //     startPos: 1,
        //                 //     endPos: 3
        //                 // },
        //                 //     {
        //                 //         id: 'm2',
        //                 //         startPos: 5,
        //                 //         endPos: 15
        //                 //     },
        //             ],
        //         },
        //     ],
        // }

        this.editor = new Editor(text.title, text.blocks, this.setState.bind(this))
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
            placeFocus(
                focusBlock,
                {
                    type: 'caret',
                    caret: Math.max(focus.selection.start, focus.selection.end),
                },
                true,
            )
        }
    }

    getText = () => {
        return {
            id: this.state.text.id,
            title: this.state.text.title,
            blocks: this.state.text.blocks,
        }
    }

    render() {
        return (
            <div>
                {this.props.editable && <MarksActions createMark={this.mark} editor={this.editor} />}
                <div onKeyDown={this.keyDownHandler} onKeyUp={this.keyUpHandler}>
                    {this.props.text && this.props.text.title && <h3>{this.props.text.title}</h3>}
                    {this.state.text.blocks.map(b => (
                        <TextBlockView
                            editable={this.props.editable}
                            key={b.id}
                            block={b}
                            editor={this.editor}
                            data-editor-element='editor'
                            focused={false}
                            width='100%'
                        />
                    ))}
                </div>
            </div>
        )
    }
}

export default EditorComponent
