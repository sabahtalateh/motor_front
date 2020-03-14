import * as React from 'react'
import ContentEditable from 'react-contenteditable'
import MarkLayer from './MarkLayer'
import HtmlEntities from '../util/HtmlEntities'
import { Focus } from '../app/Focus'

export interface Mark {
    id: string
    startPos?: number
    endPos?: number
}

interface Props {
    id: string
    markup: string
    content: string
    marks: Mark[]
    focus: Focus
}

interface State {
    markup: string
}

interface EditorNode {
    position: number
    text: string
    marks?: string[]
}

type EditorNodes = { [key: number]: EditorNode }
type EditorNodesAtPosition = { [key: number]: EditorNode[] }

interface Editor {
    plainText: string
    marks: Mark[]
    // nodes - [ { start: node },.. ]
    nodes: EditorNodes
    focus: Focus
}

interface ChangeSetElement {
    type: 'updated' | 'inserted' | 'removed'
    position: number
    text?: string
}

type ChangeSet = ChangeSetElement[]

///
/// Editor renders from editor.nodes
/// Cursor/Selection renders from editor.focus
///
export default class TextBlockEdit extends React.Component<Props, State> {
    private focus: Focus

    constructor(props: Readonly<Props>) {
        super(props)

        this.focus = props.focus

        this.state = { markup: props.markup }
    }

    componentDidMount(): void {
        this.placeCaretFromFocus(this.focus)
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        // console.log('upd')
        // console.log(this.editor.focus)
        // this.placeCaretFromFocus(this.editor.focus)
    }

    changeHandler = (e: any) => {
    }

    //  или выделить кусок текста если не совпадают
    private placeCaretFromFocus(focus: Focus) {
        if ('caret' === focus.type) {
            let caretPos = focus.caret - 1

            const caretPosGtZero: boolean = caretPos > 0
            const nodeNumber: number = caretPosGtZero ? caretPos : 0
            const offset: number = caretPosGtZero ? 1 : 0

            const area = document.getElementById(this.props.id)

            const selection = window.getSelection()
            area.focus()
            if (area.childNodes.length > 0) {
                selection.collapse(area.childNodes[nodeNumber], offset)
            } else {
                selection.collapse(area, offset)
            }
        } else if ('selection' === focus.type) {
            let selectionStart = focus.selection.start - 1
            let selectionEnd = focus.selection.end - 1

            const selectionStartGtZero: boolean = selectionStart > 0
            const startNodeNumber: number = selectionStartGtZero ? selectionStart : 0
            const startOffset: number = selectionStartGtZero ? 1 : 0

            const area = document.getElementById(this.props.id)

            const endNodeNumber = selectionEnd
            const endOffset = 1

            const startNode = area.childNodes[startNodeNumber]
            const endNode = area.childNodes[endNodeNumber]

            const range = document.createRange()

            range.setStart(startNode, startOffset)
            range.setEnd(endNode, endOffset)

            const selection = window.getSelection()

            selection.removeAllRanges()
            selection.addRange(range)
        }
    }

    private getFocus = (): Focus => {
        let selection = window.getSelection()

        let startNode: any = selection.anchorNode

        if (null === startNode) {
            return { type: 'caret', caret: 0 }
        }

        if (undefined === startNode.dataset)
            startNode = startNode.parentNode

        let endNode: any = selection.focusNode
        if (undefined === endNode.dataset)
            endNode = endNode.parentNode

        let selectionStart = Number.parseInt(startNode.dataset.position) + selection.anchorOffset
        let selectionEnd = Number.parseInt(endNode.dataset.position) + selection.focusOffset

        if (isNaN(selectionStart)) {
            selectionStart = 0
        }

        if (isNaN(selectionEnd)) {
            selectionEnd = 0
        }

        let focus: Focus

        if (selectionStart === selectionEnd) {
            focus = {
                type: 'caret',
                caret: selectionStart
            }
        } else {
            focus = {
                type: 'selection',
                selection: { start: selectionStart, end: selectionEnd }
            }
        }

        return focus
    }

    selectHandler = () => {
        console.log(this.getFocus())
    }

    render() {
        return <>
            <ContentEditable
                id={ this.props.id }
                html={ this.state.markup }
                style={ { background: '#fff8dc', minHeight: '1em' } }
                onChange={ this.changeHandler }
                onSelect={ this.selectHandler }
                data-position="0"
            />
            <code>edit</code>
        </>
    }
}
