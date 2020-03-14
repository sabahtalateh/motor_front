import * as React from 'react'
import { Dispatch } from 'react'
import { match } from 'react-router-dom'
import GraphQLService from '../services/GraphQLService'
import { fetchText } from '../actions/creators'
import { withGraphQLService } from '../hoc/withGraphQLService'
import { connect } from 'react-redux'
import { AppState, Block, Text } from '../reducers'
import MarkLayer from '../components/MarkLayer'
import { v4 } from 'uuid'

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
    focusedBlock?: string
}

// Выделение
// - window.getSelection().getRangeAt(0)
// - click on mark https://stackoverflow.com/questions/8105824/determine-the-position-index-of-a-character-within-an-html-element-when-clicked?answertab=votes#tab-top

class TextEditorOld extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)

        let text: Text = {
            id: '123',
            title: 'Hello',
            blocks: [
                {
                    id: '111',
                    content: `1a2b3c4d5e`,
                    marks: [
                        {
                            id: 'm1',
                            startPos: 2,
                            endPos: 7
                        },
                        // {
                        //     id: 'm2',
                        //     startPos: 1,
                        //     endPos: 4
                        // },
                        // {
                        //     id: 'm3',
                        //     startPos: 10,
                        //     endPos: 14
                        // },
                        // {
                        //     id: 'm2',
                        //     startPos: 3,
                        //     endPos: 8
                        // },
                        // {
                        //     id: 'm3',
                        //     startPos: 7,
                        //     endPos: 8
                        // },
                    ]
                },
                {
                    id: '222',
                    content: `2222`,
                    marks: [
                        {
                            id: 'm1',
                            startPos: 1,
                            endPos: 3
                        },
                        // {
                        //     id: 'm2',
                        //     startPos: 3,
                        //     endPos: 8
                        // },
                        // {
                        //     id: 'm3',
                        //     startPos: 10,
                        //     endPos: 14
                        // },
                        // {
                        //     id: 'm2',
                        //     startPos: 3,
                        //     endPos: 8
                        // },
                        // {
                        //     id: 'm3',
                        //     startPos: 7,
                        //     endPos: 8
                        // },
                    ]
                },
            ],
        }

        this.state = {
            text: text,
        }
    }

    // blockUpdated = (blockId: string, event: EditEvent): void => {
    //     const blockFromState = this.state.text.blocks.find(b => b.id === blockId)

        // if (EventType.ContentAdded === event.type) {
        //     this.addContentToPosition(blockFromState, event.start, event.addedContent)
        // }
        //
        // if (EventType.ContentRemoved === event.type) {
        //     this.removeContentFromPosition(blockFromState, event.start, event.removedChars)
        // }
    // }

    rebuildEditor = (blockId: string, blockContent: string, newBlocksContent: string[]): void => {
        for (let i = 1; i < newBlocksContent.length - 1; i++) {
            if ('' === newBlocksContent[i]) {
                newBlocksContent.splice(i, 1)
            }
        }

        const text = this.state.text
        const textBlocks = text.blocks
        const editedBlockIdx = textBlocks.findIndex(b => b.id === blockId)
        const editedBlock = textBlocks[editedBlockIdx]
        let editedBlockMarks = editedBlock.marks
        const blockRebuildFromPosition = [...blockContent].length
        const marksToTransfer = editedBlockMarks.filter(m => m.startPos >= blockRebuildFromPosition)
        const marksToShrink = editedBlockMarks.filter(m => m.startPos <= blockRebuildFromPosition && m.endPos >= blockRebuildFromPosition)

        editedBlock.marks = editedBlock.marks.filter(m => {
            if (0 === marksToTransfer.length) return true
            return marksToTransfer.filter(t => t !== m).length > 0
        })

        marksToShrink.forEach(m => m.endPos = blockRebuildFromPosition)

        marksToTransfer.map(m => {
            m.startPos -= blockRebuildFromPosition
            m.endPos -= blockRebuildFromPosition
        })

        textBlocks[editedBlockIdx].content = blockContent

        const newBlocksStartIdx = editedBlockIdx + 1

        const newBlocks: Block[] = newBlocksContent.map(b => ({ id: v4(), content: b, marks: [] }))
        const focusedBlock = newBlocks[newBlocks.length - 1].id

        newBlocks[newBlocks.length - 1].marks = marksToTransfer

        textBlocks.splice(newBlocksStartIdx, 0, ...newBlocks)

        this.setState({ text, focusedBlock })
    }

    private addContentToPosition(block: Block, position: number, content: string) {
        const contentLen = [...content].length
        const marks = block.marks
        block.marks = []

        block.content = `${ block.content.slice(0, position) }${ content }${ block.content.slice(position) }`

        for (const idx in marks) {
            const mark = marks[idx]
            if (position <= mark.startPos) {
                mark.startPos += contentLen
                mark.endPos += contentLen
                block.marks.push(mark)
                continue
            }
            if (position < mark.endPos) {
                mark.endPos += contentLen
                block.marks.push(mark)
                continue
            }
            block.marks.push(mark)
        }

        this.setState({ text: this.state.text })
    }

    private removeContentFromPosition(block: Block, position: number, charsRemoved: number) {
        const startPosition = position
        const endPosition = position + charsRemoved

        block.content = `${ block.content.substr(0, startPosition) }${ block.content.substr(endPosition, [...block.content].length - 1) }`

        block.marks.filter(m => m.startPos < startPosition && m.endPos > endPosition).forEach(m => m.endPos -= charsRemoved)



        // console.log(this.state)

        this.setState({ text: this.state.text })

        // const marks = block.marks
    }

    render() {
        return <>
            { this.state.text.blocks.map(b => {
                return <div
                    key={ b.id }
                    style={ {
                        position: 'relative',
                        color: 'transparent',
                        minHeight: '1em',
                        minWidth: '100%',
                        whiteSpace: 'pre'
                    } }
                >
                    { b.content }
                    { b.marks.map(m => <MarkLayer
                        key={ m.id }
                        content={ b.content }
                        mark={ m }
                    />) }
                    {/*<TextBlockView key={ b.id }*/}
                    {/*               id={ b.id }*/}
                    {/*               content={ b.content }*/}
                    {/*               blockUpdated={ this.blockUpdated }*/}
                    {/*               rebuildEditor={ this.rebuildEditor }*/}
                    {/*               marks={ b.marks }*/}
                    {/*               focus={ b.id === this.state.focusedBlock }*/}
                    {/*/>*/}
                </div>
            }) }
        </>
    }

    private rand255 = () => {
        return Math.round(Math.random() * 200) + 55
    }
}

const mapStateToProps = ({ text: { text, loading, error } }: AppState): StateProps => ({ text, loading, error })

const mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: OwnProps): DispatchProps => {
    const { graphQLService } = ownProps
    return {
        fetchText: fetchText(dispatch, graphQLService),
    }
}

export default withGraphQLService(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(TextEditorOld))
