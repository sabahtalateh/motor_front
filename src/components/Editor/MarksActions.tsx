import * as React from 'react'
import { Mark } from '../../app/BlockEditor'
import { Block, Editor } from '../../app/Editor'

interface Props {
    createMark: () => void
    editor: Editor
}

interface State {
    marks: Mark[]
    block?: Block
}

export default class MarksActions extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context)
        this.props.editor.setMarksUnderCursorCallback = this.updateMarksActions
        this.state = {
            marks: [],
        }
    }

    public updateMarksActions = (block: Block, marks: Mark[]) => {
        this.setState({
            marks: marks,
            block: block,
        })
    }

    dropMarks = (marks: Mark[]) => {
        this.props.editor.dropMarks(this.state.block, marks)
    }

    render() {
        return (
            <>
                <button onClick={this.props.createMark}>mark</button>
                {this.state.marks.map(m => (
                    <button onClick={() => this.dropMarks([m])} key={m.id}>
                        Drop {m.id}
                    </button>
                ))}
                {this.state.marks.length > 1 && <button onClick={() => this.dropMarks(this.state.marks)}>Drop All Selected</button>}
            </>
        )
    }
}
