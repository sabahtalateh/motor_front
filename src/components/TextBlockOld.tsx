import * as React from 'react'
import ContentEditable from 'react-contenteditable'
import MarkLayer from './MarkLayer'
import HtmlEntities from '../util/HtmlEntities'

export interface Mark {
    id: string
    startPos?: number
    endPos?: number
}

interface Props {
    id: string
    content: string
    blockUpdated: (blockId: string, event: EditEvent) => void
    rebuildEditor: (blockId: string, blockContent: string, newBlocksContent: string[]) => void
    focus: boolean
    marks: Mark[]
}

export enum EventType {
    ContentAdded,
    ContentRemoved,
}

export interface EditEvent {
    type: EventType
    position: number
    addedContent?: string
    removedChars?: number
}

// Service keys
const META = 'Meta'
const CONTROL = 'Control'
const ALT = 'Alt'
const SHIFT = 'Shift'

const NO_ACTION_KEYS = [
    META, CONTROL, ALT, SHIFT
]

const BACKSPACE = 'Backspace'
const DELETE = 'Delete'
const ENTER = 'Enter'

interface State {
    content: string
}

export default class TextBlockOld extends React.Component<Props, State> {
    private prevContentLen: number
    private prevCaretPosition: number

    constructor(props: Props, context: any) {
        super(props, context)
        console.log(props)
        // this.contentLenWithoutHtmlTags = this.countLenWithoutHtmlTags(props.addedContent)
        this.state = { content: props.content }
    }

    componentDidMount(): void {
        this.prevContentLen = [...HtmlEntities.decode(this.props.content)].length
        // document.execCommand('defaultParagraphSeparator', false, 'div')
        document.getElementById(this.props.id).focus()
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State): State {
        if (nextProps.content !== prevState.content) {
            return { content: nextProps.content }
        }
        return null
    }

    // Component can not be create without this handler
    onEditableChange = (e: any) => {
        const innerText = e.currentTarget.innerText
        const lines = innerText.split(/\r?\n/)

        if (lines.length >= 3) {
            // Strip last redundant newline
            if (lines[lines.length - 1] === '' && lines[lines.length - 2] === '') {
                lines.splice(lines.length - 2, 1)
            }
        }

        if (lines.length >= 2) {
            this.props.rebuildEditor(this.props.id, lines[0], lines.splice(1, lines.length - 1))
            return
        }

        const caretPosition = window.getSelection().getRangeAt(0).endOffset
        // Position can not be range because after text changing all the selectable zones collapsed
        const newContent = HtmlEntities.decode(e.target.value)
        const newContentLen = [...newContent].length

        const textAdded: boolean = newContentLen > this.prevContentLen
        const textRemoved: boolean = !textAdded

        if (textAdded) {
            const charsAdded = newContentLen - this.prevContentLen
            const addedContent = newContent.slice(caretPosition - charsAdded, caretPosition)

            const event: EditEvent = {
                type: EventType.ContentAdded,
                position: caretPosition - [...addedContent].length,
                addedContent
            }

            this.props.blockUpdated(this.props.id, event)
        }

        if (textRemoved) {
            const removedChars = this.prevContentLen - newContentLen

            const event: EditEvent = {
                type: EventType.ContentRemoved,
                position: caretPosition,
                removedChars
            }

            this.props.blockUpdated(this.props.id, event)
        }

        this.prevContentLen = [...newContent].length
        this.prevCaretPosition = caretPosition
    }

    onClick = () => {
        this.prevCaretPosition = window.getSelection().getRangeAt(0).endOffset
    }

    render() {
        return <>
            <ContentEditable
                id={ this.props.id }
                html={ this.state.content }
                disabled={ false }
                onChange={ this.onEditableChange }
                tagName='p'
                onClick={ this.onClick }
                style={ {
                    position: 'absolute',
                    top: 0,
                    minWidth: '100%',
                    color: 'black'
                } }
            />
        </>
    }

    private countLenWithoutHtmlTags = (input: string): number => {
        let len = 0

        let insideHtmlTag = false
        for (let i = 0; i < [...input].length; i++) {


            if ('<' === input[i]) {
                insideHtmlTag = true
                if ('<div><br></div>' === input.substr(i, 15)) {
                    len += 1
                    i += 14
                    insideHtmlTag = false
                    continue
                }

                if ('<div>' === input.substr(i, 5)) {
                    len += 1
                    i += 4
                    insideHtmlTag = false
                    continue
                }
            }
            if (!insideHtmlTag) {
                len += 1
            }
            if ('>' === input[i]) {
                insideHtmlTag = false
            }
        }

        return len
    }
}
