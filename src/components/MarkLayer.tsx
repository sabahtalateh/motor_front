import * as React from 'react'
import { Mark } from '../app/BlockEditor'

interface Props {
    content: string
    mark: Mark
}

interface State {
    markedContent: string
}

export default class MarkLayer extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        let markedContent = this.markedContent(props)
        this.state = { markedContent }
    }

    private markedContent(props: Readonly<Props>) {
        let markedContent = ''
        for (let i = 0; i < props.content.length; i++) {
            if (i === this.props.mark.startPos) {
                markedContent += `<mark style="padding: 0; background-color: rgba(60, 60,60, .3)">`
            }
            if (i === this.props.mark.endPos) {
                markedContent += `</mark>`
            }
            markedContent += props.content[i]
        }
        return markedContent
    }

    render() {
        console.log('ML render')
        return (
            <div
                style={{
                    position: 'absolute',
                    color: 'transparent',
                    top: 0,
                }}
                dangerouslySetInnerHTML={{ __html: this.markedContent(this.props) }}
            />
        )
    }
}
