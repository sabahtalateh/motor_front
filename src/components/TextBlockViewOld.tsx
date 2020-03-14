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
    content: string
    marks: Mark[]
    editionStarted: (id: string, markup: string, focus: Focus) => void
}

interface State {
    markup: string
}

interface MarkupPart {
    opened: boolean
    type: 'text' | 'marks'
    content: string
    marks: string[]
    start: number
    end: number
}

export default class TextBlockView extends React.Component<Props, State> {
    // Создаём размеченный текст
    constructor(props: Readonly<Props>) {
        super(props)

        const content = this.props.content
        const marks = this.props.marks

        // Открыт ли спан который обозначает что тут у нас просто текст
        let textOpened: boolean = false
        // Стэк открытых марок
        let openedMarks: Mark[] = []

        // Размеченный контент
        let markup: string = ''

        interface MarkupChar {
            char: string
            openText?: boolean
            textClosedAt?: number
            closeText?: boolean
            openMarks?: string[]
            closeMarksCount?: number
        }

        let markupChars: MarkupChar[] = []
        let marksClosings: { [key: string]: number } = {}
        let textOpenedAt = 0

        for (let i = 0; i < [...content].length; i++) {
            let markupChar: MarkupChar = {
                char: content[i],
                openText: false,
                textClosedAt: 0,
                closeText: false,
                openMarks: [],
                closeMarksCount: 0
            }

            // Находим все марки которые надо закрыть
            const marksToClose = openedMarks.filter(m => i === m.endPos)
            // Сюда сложим те которые надо переотрыть из за пересечения
            let marksToReopen: Mark[] = []
            // Сюда те которые надо закрыть потому что endPos на текущей позиции
            const closedMarks: Mark[] = []

            // Закрываем марки и если в стэке открытых встретилась другая марка
            //  то кладём её в стэк на переоткрытие
            marksToClose.forEach(markToClose => {
                while (openedMarks.length > 0) {
                    const closing = openedMarks.pop()
                    markup += `</mark>`
                    markupChar.closeMarksCount += 1
                    marksClosings[closing.id] = i
                    if (closing.id !== markToClose.id) {
                        marksToReopen.push(closing)
                    }
                }
                closedMarks.push(markToClose)
            })

            // Убираем из марок на переоткртие, те которые закртыт потому что
            //  endPos совпал с текузей позицией
            marksToReopen = marksToReopen.filter(reopen => {
                return 0 === closedMarks.filter(closed => reopen.id === closed.id).length
            })

            // Переоткрываем марки которые пересеклись с закрытой
            //  и добавляем их в стэк открытых марок
            while (marksToReopen.length > 0) {
                const reopening = marksToReopen.pop()
                markup += `<mark data-mark-id="${ reopening.id }" data-region-start="${ i }">`

                marksClosings[reopening.id] = 0
                markupChar.openMarks.push(reopening.id)
                openedMarks.push(reopening)
            }

            // Открываем марки которые открываются на этой позиции
            const marksToOpen = marks.filter(m => i === m.startPos)
            marksToOpen.forEach(m => {
                if (textOpened) {
                    markup += `</span>`
                    textOpened = false
                    markupChar.closeText = true
                    markupChars[textOpenedAt].textClosedAt = i
                }
                markup += `<mark data-mark-id="${ m.id }" data-region-start="${ i }">`

                marksClosings[m.id] = 0
                markupChar.openMarks.push(m.id)
                openedMarks.push(m)
            })

            // Если ничего не открыто и это не последний символ то открываем
            //  спан для простого текста
            if (0 === openedMarks.length && false === textOpened) {
                markup += `<span data-region-start="${ i }">`
                textOpenedAt = i

                markupChar.openText = true

                textOpened = true
            }

            // Добавляем текущий символ
            markup += content[i]
            markupChar.char = content[i]

            // Если это последний символ и нет открытых марок и открыт простой текст то закрываем его
            // if (0 === openedMarks.length && i === content.length - 1 && true === textOpened) {
            //     markup += `</span>`
            //     textOpened = false
            // }

            if (i === content.length - 1) {
                if (0 === openedMarks.length) {
                    markup += `</span>`
                    markupChar.closeText = true
                    textOpened = false
                    if (textOpenedAt === i) {
                        markupChar.textClosedAt = i
                    } else {
                        markupChars[textOpenedAt].textClosedAt = i
                    }
                } else {
                    openedMarks.forEach(m => {
                        markupChar.closeMarksCount += 1
                        marksClosings[m.id] = i
                        markup += `</mark>`
                    })
                }
            }

            markupChars.push(markupChar)
        }

        console.log(marksClosings)
        console.log(markupChars)

        this.state = { markup }
    }

    private appendPart(part: MarkupPart, markup: string) {
        if ('text' === part.type) {
            markup += `<span data-region-start="${ part.start }" data-region-end="${ part.end }">${ part.content }</span>`
        }

        if ('marks' === part.type) {
            part.marks.forEach(m => {
                markup += `<mark data-region-start="${ part.start }" data-region-end="${ part.end }" >`
            })
            markup += part.content
            part.marks.forEach(m => {
                markup += `</mark>`
            })
        }
    }

    selectHandler = (e: any) => {
        const selection = window.getSelection()
        const range = selection.getRangeAt(0)
        const startPos = Number.parseInt(selection.anchorNode.parentElement.dataset.regionStart) + range.startOffset
        const endPos = Number.parseInt(selection.focusNode.parentElement.dataset.regionStart) + range.endOffset

        const focus: Focus = startPos === endPos
            ? { type: 'caret', caret: startPos }
            : { type: 'selection', selection: { start: startPos, end: endPos } }

        this.props.editionStarted(this.props.id, this.state.markup, focus)
    }

    render() {
        return <>
            <div dangerouslySetInnerHTML={ { __html: this.state.markup } }
                 id={ this.props.id }
                 onMouseUp={ this.selectHandler }
            />
            <code style={ { color: 'black' } }>view</code>
        </>
    }
}
