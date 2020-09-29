import * as React from 'react'
import ContentEditable from 'react-contenteditable'
import { BlockEditor } from '../app/BlockEditor'
import { Block, Editor } from '../app/Editor'
import { calcFocus, placeFocus } from '../app/Focus'

interface Props {
    block: Block
    editor: Editor
    focused: boolean
    width: string
}

interface State {
    markup: string
    focused: boolean
}

function trimTrailingBreaks(innerText: string) {
    let trailingBreaks = 0
    for (let i = innerText.length - 1; i != -1; i--) {
        if ('\n' === innerText[i]) {
            trailingBreaks++
        } else {
            break
        }
    }
    return innerText.substr(0, innerText.length - trailingBreaks)
}

export default class TextBlockView extends React.Component<Props, State> {
    private editor: BlockEditor
    private prevInnerText: string
    private selectFired: boolean
    private prevFocusAtStart: boolean
    private prevFocusAtEnd: boolean
    private changeFired: boolean = false

    constructor(props: Readonly<Props>) {
        super(props)
        this.prevInnerText = this.props.block.text
        this.editor = new BlockEditor(this.props.block, this.props.editor)
        this.state = { markup: this.editor.getMarkup(), focused: this.props.focused }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        // Place focus only if markup changed to prevent focusing when editor rebuilds
        //  because of new lines were added
        const lenDiffers = this.state.markup.length !== prevState.markup.length
        if (lenDiffers || this.state.markup !== prevState.markup) {
            placeFocus(this.editor.getBlock(), this.editor.getFocus())
        }
    }

    changeHandler = (e: any) => {
        this.changeFired = true
        let innerText = e.currentTarget.innerText
        // \n вставляется в конец строки если вставить текст через ctrl+v так что вот так ёбана
        const trimmed = trimTrailingBreaks(innerText)
        if (trimmed !== this.prevInnerText) {
            innerText = trimmed
        }
        if ('\n' === innerText) {
            innerText = ''
        }
        this.editor.updateContent(innerText, this.setState.bind(this))
        this.prevInnerText = innerText
    }

    keyUpHandler = (e: any) => {
        if ('Backspace' === e.key) {
            const focus = this.editor.getFocus()
            const focusAtStart = 'caret' === focus.type && 0 === focus.caret
            if (focusAtStart) {
                if ((this.changeFired && !this.selectFired) || (!this.changeFired && this.selectFired) || (!this.changeFired && !this.selectFired)) {
                    this.editor.backJoin()
                }
            }
        } else if ('ArrowUp' === e.key) {
            if (!this.selectFired) {
                this.editor.moveFocusToPrevBlock()
            } else if (this.selectFired && this.prevFocusAtStart) {
                this.editor.moveFocusToPrevBlock()
            }
        } else if ('ArrowDown' === e.key) {
            if (!this.selectFired) {
                this.editor.moveFocusToNextBlock()
            } else if (this.selectFired && this.prevFocusAtEnd) {
                this.editor.moveFocusToNextBlock()
            }
        }
        this.selectFired = false
        this.changeFired = false
    }

    selectHandler = (e: any) => {
        this.selectFired = true
        let focus = this.editor.getFocus()
        const focusDefined = focus !== undefined
        if (focusDefined) {
            this.prevFocusAtStart = 'caret' === focus.type && focus.caret === 0
            this.prevFocusAtEnd = 'caret' === focus.type && focus.caret === this.editor.getTextLen()
        }

        this.editor.setFocus(calcFocus())

        if (!focusDefined) {
            focus = this.editor.getFocus()
            this.prevFocusAtStart = 'caret' === focus.type && focus.caret === 0
            this.prevFocusAtEnd = 'caret' === focus.type && focus.caret === this.editor.getTextLen()
        }
    }

    render() {
        return (
            <ContentEditable
                id={this.props.block.id}
                html={this.state.markup}
                onChange={this.changeHandler}
                onSelect={this.selectHandler}
                onKeyUp={this.keyUpHandler}
                data-region-start='0'
                data-editor-element='block'
                style={{
                    whiteSpace: 'pre-wrap',
                    border: '1px solid white',
                    borderBottom: 'none',
                    backgroundColor: '#FFEFD5',
                    width: this.props.width,
                }}
            />
        )
    }
}
