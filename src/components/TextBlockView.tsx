import * as React from 'react'
import ContentEditable from 'react-contenteditable'
import { BlockEditor, Mark } from '../app/BlockEditor'
import { Block, Editor } from '../app/Editor'

interface Props {
    block: Block
    editor: Editor
    focused: boolean
}

interface State {
    markup: string
    focused: boolean
}

export default class TextBlockView extends React.Component<Props, State> {
    private blockEditor: BlockEditor

    constructor(props: Readonly<Props>) {
        super(props)
        this.blockEditor = new BlockEditor(this.props.block, this.props.editor)
        this.state = { markup: this.blockEditor.getMarkup(), focused: this.props.focused }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        // Place focus only if markup changed to prevent focusing when editor rebuilds
        //  because of new lines were added
        console.log("upd")
        if (this.state.markup !== prevState.markup) {
            this.blockEditor.placeFocus()
        }
    }

    changeHandler = (e: any) => {
        const innerText = e.currentTarget.innerText
        this.blockEditor.editorReceivesNewContent(innerText, this.setState.bind(this))
    }

    selectHandler = (e: any) => {
        this.blockEditor.updateFocus()
    }

    render() {
        return <ContentEditable
            id={ this.props.block.id }
            html={ this.state.markup }
            onChange={ this.changeHandler }
            onSelect={ this.selectHandler }
            data-region-start="0"
            data-editor-element="block"
            style={ {
                whiteSpace: 'pre-wrap',
                border: '1px solid black',
                borderBottom: 'none'
            } }
        />
    }
}
