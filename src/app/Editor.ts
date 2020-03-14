import { Mark } from './BlockEditor'
import uuid = require('uuid')
import { Focus, placeFocus } from './Focus'

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

export class Editor {
    id: string
    title: string
    blocks: Block[]
    setStateCallback: any

    constructor(title: string, blocks: Block[], setStateCallback: any) {
        this.title = title
        this.blocks = blocks
        this.setStateCallback = setStateCallback
    }

    rebuildBlocks = (initiator: Block, focusInsideInitiator: Focus) => {
        const rebuilt: Block[] = []
        let focusBlock: Block
        let focusPosition: number
        const cursorPositionBeforeRebuild = 'caret' === focusInsideInitiator.type
            ? focusInsideInitiator.caret
            : focusInsideInitiator.selection.end

        console.log(cursorPositionBeforeRebuild)

        this.blocks.forEach(b => {
            if (b.id === initiator.id) {
                const paragraphs = splitTextToParagraphs(b.text, cursorPositionBeforeRebuild)

                console.log(paragraphs)

                const firstBlockMarks = b.marks.filter(m => m.startPos < paragraphs[0].end)
                const lastBlockMarks = b.marks
                    .filter(m => m.startPos >= paragraphs[0].end)
                    .map(m => {
                        m.startPos -= paragraphs[paragraphs.length - 1].start
                        m.endPos -= paragraphs[paragraphs.length - 1].start
                        return m
                    })

                console.log(paragraphs)

                paragraphs.forEach((paragraph, index) => {
                    let marks: Mark[] = []

                    if (paragraphs.length - 1 === index) {
                        marks = lastBlockMarks
                        const block = {
                            id: uuid.v4(),
                            text: paragraph.text,
                            marks
                        }
                        rebuilt.push(block)
                        focusBlock = block
                        focusPosition = paragraph.caret


                    } else if (0 === index) {
                        marks = firstBlockMarks
                        rebuilt.push({
                            id: uuid.v4(),
                            text: paragraph.text,
                            marks
                        })
                    } else {
                        rebuilt.push({
                            id: uuid.v4(),
                            text: paragraph.text,
                            marks
                        })
                    }
                })
            } else {
                rebuilt.push({ id: b.id, text: b.text, marks: b.marks })
            }
        })

        this.blocks = rebuilt
        this.setStateCallback({ text: this }, () => placeFocus(focusBlock, { type: 'caret', caret: focusPosition }))
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
                end: pos
            })
            prevParagraphStart = pos + 1
        }
        pos++
    }

    paragraphs.push({
        text: text.slice(prevParagraphStart, pos),
        start: prevParagraphStart,
        end: pos
    })

    const paragraphsTotal = paragraphs.length
    let prevParagraphIsEmpty = false
    const notEmptyParagraphs = paragraphs.filter((p) => {
        const trimmed = p.text.trim()
        if ('' === trimmed) {
            if (prevParagraphIsEmpty) {
                return false
            }
            prevParagraphIsEmpty = true
        } else {
            prevParagraphIsEmpty = false
        }
        return true
    })
    const emptyParagraphs = paragraphsTotal - notEmptyParagraphs.length
    caretPositionInsideLastParagraph -= emptyParagraphs + notEmptyParagraphs.length - 1
    notEmptyParagraphs[notEmptyParagraphs.length - 1].caret = caretPositionInsideLastParagraph

    return notEmptyParagraphs
}
