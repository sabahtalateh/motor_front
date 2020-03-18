import { Block, Editor } from './Editor'
import { Focus } from './Focus'

export interface MarkupChar {
    char: string
    regionEnd?: number
    openText?: boolean
    closeText?: boolean
    openMarks?: string[]
    closeMarks?: number
}

export interface Mark {
    id: string
    startPos?: number
    endPos?: number
}

export type Markup = MarkupChar[]

export interface TextCommand {
    cmd: 'insert' | 'delete'
    position: number
    insertText?: string
    deleteCount?: number
}

export class BlockEditor {
    private readonly block: Block
    private readonly editor: Editor
    private focus: Focus

    constructor(block: Block, editor: Editor) {
        this.block = block
        this.editor = editor
    }

    getMarkup = (): string => {
        const markup = createMarkupChars(this.block)
        return createMarkupString(markup)
    }

    updateContent = (content: string, setStateCallback: any) => {
        if (content === this.block.text) {
            return
        }
        const newTextLen = [...content].length
        const textChars = [...this.block.text]
        const prevTextLen = textChars.length
        const textLenChangedBy = newTextLen - prevTextLen
        const focusBeforeChange = this.focus

        if ('caret' === focusBeforeChange.type) {
            // Text removed. No inserted text
            if (textLenChangedBy < 0) {
                const removedFrom: number = focusBeforeChange.caret + textLenChangedBy
                this.editor.stackUndo(this.block, { type: 'caret', caret: this.focus.caret })

                this.update([{ cmd: 'delete', position: removedFrom, deleteCount: -textLenChangedBy }])

                setStateCallback({ markup: this.getMarkup() })

                this.focus.caret += textLenChangedBy
            } else if (textLenChangedBy > 0) {
                const addedText = content.slice(this.focus.caret, focusBeforeChange.caret + textLenChangedBy)

                this.editor.stackUndo(this.block, { type: 'caret', caret: this.focus.caret })

                this.update([{ cmd: 'insert', position: focusBeforeChange.caret, insertText: addedText }])

                setStateCallback({ markup: this.getMarkup() })
                this.focus.caret += textLenChangedBy

                if (this.block.text.includes('\n')) {
                    this.editor.splitBlock(this.block, this.focus)
                }
            }
        } else if ('selection' === focusBeforeChange.type) {
            // Normalize selection
            if (focusBeforeChange.selection.start > focusBeforeChange.selection.end) {
                const end = focusBeforeChange.selection.start
                focusBeforeChange.selection.start = focusBeforeChange.selection.end
                focusBeforeChange.selection.end = end
            }

            // If prev focus was selection
            let selectionStart: number = focusBeforeChange.selection.start
            let selectionEnd: number = focusBeforeChange.selection.end
            const selected = selectionEnd - selectionStart
            const commands: TextCommand[] = [{ cmd: 'delete', position: selectionStart, deleteCount: selected }]
            let cursorMovedBy = 0

            if (newTextLen > prevTextLen - selected) {
                const addedText = content.slice(selectionStart, selectionStart + newTextLen - prevTextLen + selected)
                commands.push({ cmd: 'insert', position: selectionStart, insertText: addedText })
                cursorMovedBy += [...addedText].length
            }

            this.editor.stackUndo(this.block, { type: 'caret', caret: this.focus.selection.end })

            this.update(commands)

            setStateCallback({ markup: this.getMarkup() })
            this.focus = {
                type: 'caret',
                caret: selectionStart + cursorMovedBy,
            }
            if (this.block.text.includes('\n')) {
                this.editor.splitBlock(this.block, this.focus)
            }
        }
    }

    moveFocusToPrevBlock = () => {
        this.editor.moveFocusToPrevBlock(this.block)
    }

    moveFocusToNextBlock = () => {
        this.editor.moveFocusToNextBlock(this.block)
    }

    backJoin = () => {
        this.editor.backJoin(this.block)
    }

    update = (commands: TextCommand[]) => {
        commands.forEach(cmd => {
            this.processCommand(cmd)
        })
        console.log('snap')
    }

    setFocus = (focus: Focus) => {
        this.focus = focus
        this.editor.setFocus(this.block, focus)
    }

    getBlock = (): Block => {
        return this.block
    }

    getFocus = (): Focus => {
        return this.focus
    }

    getTextLen = (): number => {
        return [...this.block.text].length
    }

    private processCommand = (cmd: TextCommand) => {
        const content = this.block.text

        if ('delete' === cmd.cmd) {
            const removedFrom = cmd.position
            const removedTo = cmd.position + cmd.deleteCount
            const removedLen = removedTo - removedFrom

            // Remove marks that starts within removed range
            this.block.marks = this.block.marks.filter(m => !(m.startPos >= removedFrom && m.startPos < removedTo))

            // Shrink marks
            this.block.marks.forEach(mark => {
                if (removedFrom < mark.startPos) {
                    mark.startPos -= removedLen
                    mark.endPos -= removedLen
                }

                if (removedFrom > mark.startPos && removedFrom < mark.endPos) {
                    const removeCount = removedTo <= mark.endPos ? removedLen : mark.endPos - removedFrom

                    mark.endPos -= removeCount
                }
            })

            this.block.text = `${content.slice(0, removedFrom)}${content.slice(removedTo, content.length)}`
        } else if ('insert' === cmd.cmd) {
            const insertedText = cmd.insertText
            const insertedStart = cmd.position
            const insertedLen = [...insertedText].length

            this.block.marks.forEach(mark => {
                if (mark.endPos >= insertedStart) {
                    mark.endPos += insertedLen
                }
                if (mark.startPos >= insertedStart) {
                    mark.startPos += insertedLen
                }
            })

            this.block.text = `${content.slice(0, insertedStart)}${insertedText}${content.slice(insertedStart, content.length)}`
        }
    }
}

const createMarkupChars = (block: Block): Markup => {
    const content = block.text
    const marks = block.marks

    let markup: Markup = []

    let openedMarks: string[] = []

    let regionType: 'marks' | 'text' | 'no_region' = 'no_region'
    let regionOpenedAt: number = 0

    for (let i = 0; i < [...content].length; i++) {
        let markupChar: MarkupChar = { char: content[i] }

        const closingMarks = marks.filter(m => m.endPos === i)
        if (closingMarks.length > 0) {
            markup[regionOpenedAt].regionEnd = i
            markupChar.closeMarks = openedMarks.length
            openedMarks = openedMarks.filter(o => closingMarks.filter(c => o === c.id).length === 0)
            markupChar.openMarks = openedMarks.map(m => m)
            regionOpenedAt = i
            regionType = openedMarks.length === 0 ? 'no_region' : 'marks'
        }

        const openingMarks = marks.filter(m => m.startPos === i)
        if (openingMarks.length > 0) {
            if ('text' === regionType) {
                markupChar.closeText = true
            }
            regionType = 'marks'
            if (i != 0) {
                if (regionOpenedAt === i) {
                    markupChar.regionEnd = i
                } else {
                    markup[regionOpenedAt].regionEnd = i
                }
            }
            regionOpenedAt = i
            const marksOpenedCount = openedMarks.length
            if (
                marksOpenedCount > 0
                // || openingMarks.length > 0
            ) {
                markupChar.closeMarks = marksOpenedCount
            } else {
                if (i !== 0 && openingMarks.length === 0) {
                    markupChar.closeText = true
                }
            }

            const ids = openingMarks.map(m => m.id)
            openedMarks = [...openedMarks, ...ids]
            markupChar.openMarks = openedMarks
        }

        if (regionType === 'no_region') {
            regionType = 'text'
            regionOpenedAt = i
            markupChar.openText = true
        }

        if (i === [...content].length - 1) {
            if (regionType === 'text') {
                markupChar.closeText = true
            }

            if (regionType === 'marks') {
                markupChar.closeMarks = openedMarks.length
            }

            if (regionOpenedAt === i) {
                markupChar.regionEnd = i + 1
            } else {
                markup[regionOpenedAt].regionEnd = i + 1
            }
        }

        markup.push(markupChar)
    }

    if (0 === markup.length) {
        markup.push({
            char: '',
            openText: true,
            closeText: true,
            regionEnd: 0,
        })
    }

    return markup
}

const createMarkupString = (markup: Markup) => {
    let markupString: string = ''

    for (let i = 0; i < markup.length; i++) {
        const markupChar = markup[i]

        const marksOpens = undefined !== markupChar.openMarks && markupChar.openMarks.length > 0
        const textOpens = undefined !== markupChar.openText && markupChar.openText
        const marksClose = undefined !== markupChar.closeMarks && markupChar.closeMarks > 0
        const textClose = undefined !== markupChar.closeText && markupChar.closeText

        if (textClose && marksOpens) {
            markupString += `</span>`
            markupChar.openMarks.forEach(m => {
                markupString += `<mark data-mark-id="${m}" data-region-start="${i}" data-region-end="${markupChar.regionEnd}">`
            })
            markupString += markupChar.char
        } else if (marksClose && textOpens) {
            markupString += `</mark>`.repeat(markupChar.closeMarks)
            markupString += `<span data-region-start="${i}" data-region-end="${markupChar.regionEnd}">`
            markupString += markupChar.char
        } else if (marksOpens && marksClose) {
            markupString += `</mark>`.repeat(markupChar.closeMarks)
            markupChar.openMarks.forEach(m => {
                markupString += `<mark data-mark-id="${m}" data-region-start="${i}" data-region-end="${markupChar.regionEnd}">`
            })
            markupString += markupChar.char
        } else {
            if (marksOpens) {
                markupChar.openMarks.forEach(m => {
                    markupString += `<mark data-mark-id="${m}" data-region-start="${i}" data-region-end="${markupChar.regionEnd}">`
                })
            }

            if (textOpens) {
                markupString += `<span data-region-start="${i}" data-region-end="${markupChar.regionEnd}">`
            }

            markupString += markupChar.char

            if (marksClose) {
                markupString += `</mark>`.repeat(markupChar.closeMarks)
            }

            if (textClose) {
                markupString += `</span>`
            }
        }
    }

    return markupString
}

export { createMarkupChars, createMarkupString }
