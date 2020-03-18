import { Mark } from './BlockEditor'
import { Focus, placeFocus, Selection } from './Focus'
import uuid = require('uuid')
import { deep } from '../util/Deep'

interface Paragraph {
    text: string
    start: number
    end: number
    caret?: number
}

export interface Block {
    id: string
    text: string
    marks: Mark[]
}

type Snapshot = {
    blocks: Block[]
    focusBlock: Block
    focus: Focus
}[]

export class Editor {
    id: string
    title: string
    blocks: Block[]
    setStateCallback: any
    undoStack: Snapshot = []
    redoStack: Snapshot = []
    focusBlock: Block
    focus: Focus

    constructor(title: string, blocks: Block[], setStateCallback: any) {
        this.title = title
        this.blocks = blocks
        this.setStateCallback = setStateCallback
    }

    stackUndo = (block: Block, focus: Focus, cleanRedo: boolean = true) => {
        if (cleanRedo) this.redoStack = []

        const histBlocks: Block[] = []
        let focusBlock: Block
        for (let i = 0; i < this.blocks.length; i++) {
            const histBlock = this.blocks[i]
            if (histBlock.id === block.id) {
                focusBlock = deep(block)
                focusBlock.id = uuid.v4()
                histBlocks.push(focusBlock)
            } else {
                histBlocks.push(deep(histBlock))
            }
        }

        this.undoStack.push({ blocks: histBlocks, focusBlock, focus })
    }

    unstackUndo = () => {
        const undo = this.undoStack.pop()
        if (undefined === undo) return

        this.stackRedo()
        this.blocks = undo.blocks
        this.setStateCallback({ text: this }, () => placeFocus(undo.focusBlock, undo.focus))
    }

    stackRedo = () => {
        const histBlocks: Block[] = []
        let focusBlock: Block
        for (let i = 0; i < this.blocks.length; i++) {
            const histBlock = this.blocks[i]
            if (histBlock.id === this.focusBlock.id) {
                focusBlock = deep(this.focusBlock)
                focusBlock.id = uuid.v4()
                histBlocks.push(focusBlock)
            } else {
                histBlocks.push(deep(histBlock))
            }
        }

        this.redoStack.push({ blocks: histBlocks, focusBlock, focus: this.focus })
    }

    unstackRedo = () => {
        const redo = this.redoStack.pop()
        if (undefined === redo) return
        this.stackUndo(this.focusBlock, this.focus, false)

        this.blocks = redo.blocks
        this.setStateCallback({ text: this }, () => placeFocus(redo.focusBlock, redo.focus))
    }

    setFocus = (block: Block, focus: Focus) => {
        this.focusBlock = block
        this.focus = focus
    }

    splitBlock = (block: Block, focusInsideInitiator: Focus) => {
        const rebuilt: Block[] = []
        let focusBlock: Block
        let focusPosition: number
        const cursorPositionBeforeRebuild = 'caret' === focusInsideInitiator.type ? focusInsideInitiator.caret : focusInsideInitiator.selection.end

        this.blocks.forEach(b => {
            if (b.id === block.id) {
                const paragraphs = splitTextToParagraphs(block.text, cursorPositionBeforeRebuild)

                const firstBlockMarks = b.marks.filter(m => m.startPos < paragraphs[0].end)
                firstBlockMarks.forEach(m => {
                    if (m.endPos >= cursorPositionBeforeRebuild) {
                        m.endPos = cursorPositionBeforeRebuild - 1
                    }
                })

                const lastBlockMarks = b.marks
                    .filter(m => m.startPos >= paragraphs[0].end)
                    .map(m => {
                        m.startPos -= paragraphs[paragraphs.length - 1].start
                        m.endPos -= paragraphs[paragraphs.length - 1].start
                        return m
                    })

                paragraphs.forEach((paragraph, index) => {
                    let marks: Mark[] = []
                    if (paragraphs.length - 1 === index) {
                        marks = lastBlockMarks
                        const block = {
                            id: uuid.v4(),
                            text: paragraph.text,
                            marks,
                        }
                        rebuilt.push(block)
                        focusBlock = block
                        focusPosition = paragraph.caret
                    } else if (0 === index) {
                        marks = firstBlockMarks
                        rebuilt.push({
                            id: uuid.v4(),
                            text: paragraph.text,
                            marks,
                        })
                    } else {
                        rebuilt.push({
                            id: uuid.v4(),
                            text: paragraph.text,
                            marks,
                        })
                    }
                })
            } else {
                rebuilt.push({ id: b.id, text: b.text, marks: b.marks })
            }
        })

        // Filter empty blocks
        this.blocks = rebuilt.filter(b => !(0 === b.text.trim().length && b.id !== focusBlock.id))
        this.setStateCallback({ text: this }, () => placeFocus(focusBlock, { type: 'caret', caret: focusPosition }))
    }

    backJoin = (block: Block) => {
        const rightSideBlockIdx = this.blocks.findIndex(b => b.id === block.id)
        if (0 === rightSideBlockIdx) {
            return
        }

        const lft = this.blocks[rightSideBlockIdx - 1]

        this.stackUndo(this.focusBlock, this.focus)

        const joined = joinBlocks(lft, this.blocks[rightSideBlockIdx])
        this.blocks.splice(rightSideBlockIdx - 1, 2, joined)
        this.setStateCallback({ text: this }, () => placeFocus(joined, { type: 'caret', caret: [...lft.text].length }))
    }

    moveFocusToPrevBlock = (block: Block) => {
        const blockIdx = this.blocks.findIndex(b => block.id === b.id)
        if (0 === blockIdx) return

        const focusBlock = this.blocks[blockIdx - 1]
        placeFocus(focusBlock, { type: 'caret', caret: [...focusBlock.text].length })
    }

    moveFocusToNextBlock = (block: Block) => {
        const blockIdx = this.blocks.findIndex(b => block.id === b.id)
        if (this.blocks.length - 1 === blockIdx) return

        const focusBlock = this.blocks[blockIdx + 1]
        placeFocus(focusBlock, { type: 'caret', caret: 0 })
    }

    mark = (block: Block, selection: Selection) => {
        block.marks.push({
            id: uuid.v4(),
            startPos: selection.start,
            endPos: selection.end
        })
        const blockIdx = this.blocks.findIndex(b => b.id === block.id)
        block.id = uuid.v4()
        this.blocks[blockIdx] = block
        this.setStateCallback({ text: this })
    }

    getFocus = (): Focus => {
        return this.focus
    }

    getFocusBlock = (): Block => {
        return this.focusBlock
    }
}

const splitTextToParagraphs = (text: string, caretAt: number): Paragraph[] => {
    let caretPositionInsideLastParagraph = caretAt
    const paragraphs: Paragraph[] = []
    let pos = 0
    let prevParagraphStart = pos
    while (pos < [...text].length) {
        if (text[pos] === '\n') {
            const paragraphText = text.slice(prevParagraphStart, pos)
            caretPositionInsideLastParagraph -= [...paragraphText].length
            paragraphs.push({
                text: paragraphText,
                start: prevParagraphStart,
                end: pos,
            })
            prevParagraphStart = pos + 1
        }
        pos++
    }

    paragraphs.push({
        text: text.slice(prevParagraphStart, pos),
        start: prevParagraphStart,
        end: pos,
    })

    const paragraphsTotal = paragraphs.length
    const emptyParagraphs = paragraphsTotal - paragraphs.length
    caretPositionInsideLastParagraph -= emptyParagraphs + paragraphs.length - 1
    paragraphs[paragraphs.length - 1].caret = caretPositionInsideLastParagraph

    return paragraphs
}

const joinBlocks = (lft: Block, rgt: Block): Block => {
    const lftLen = [...lft.text].length
    rgt.marks.forEach(m => {
        m.startPos += lftLen
        m.endPos += lftLen
    })

    return { id: uuid.v4(), text: `${ lft.text }${ rgt.text }`, marks: [...lft.marks, ...rgt.marks] }
}
