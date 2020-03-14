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

interface Text {
    id: string
    title: string
    blocks: Block[]
}


interface Mark {
    id: string
    startPos: number
    endPos: number
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
}


class TextEditor extends React.Component<Props, State> {
    private editor: Editor

    constructor(props: Readonly<Props>) {
        super(props)

        let text: Text = {
            id: '123',
            title: 'Hello',
            blocks: [
                {
                    id: '111',
                    text: `112233445566778899`,
                    marks: [
                        {
                            id: 'm1',
                            startPos: 4,
                            endPos: 7
                        },
                        {
                            id: 'm2',
                            startPos: 8,
                            endPos: 12
                        },
                        {
                            id: 'm3',
                            startPos: 2,
                            endPos: 6
                        },
                    ]
                },
                {
                    id: '222',
                    text: `1234`,
                    marks: [
                        {
                            id: 'm1',
                            startPos: 1,
                            endPos: 2
                        },
                        //     {
                        //         id: 'm2',
                        //         startPos: 5,
                        //         endPos: 15
                        //     },
                    ]
                },
            ],
        }

        this.editor = new Editor(text.title, text.blocks, this.setState.bind(this))
        this.state = { text: this.editor }
    }

    render() {
        // console.log(this.state)

        return <>
            { this.state.text.blocks.map(b => {
                return <TextBlockView
                    key={ b.id }
                    block={ b }
                    editor={ this.editor }
                    data-editor-element="editor"
                    focused={ false }
                />
            }) }
        </>
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
