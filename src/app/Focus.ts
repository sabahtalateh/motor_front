import { Block } from './Editor'

export interface Focus {
    type: 'caret' | 'selection'
    caret?: number
    selection?: Selection
}

export interface Selection {
    start: number
    end: number
}

const calcFocus = (): Focus => {
    let selection = window.getSelection()

    let startNode: any = selection.anchorNode.parentNode
    let endNode: any = selection.focusNode.parentNode

    let selectionStart = Number.parseInt(startNode.dataset.regionStart) + selection.anchorOffset
    let selectionEnd = Number.parseInt(endNode.dataset.regionStart) + selection.focusOffset

    if (isNaN(selectionStart) || isNaN(selectionEnd)) {
        selectionStart = selectionEnd = 0
    }

    let focus: Focus

    if (selectionStart === selectionEnd) {
        focus = {
            type: 'caret',
            caret: selectionStart,
        }
    } else {
        focus = {
            type: 'selection',
            selection: { start: selectionStart, end: selectionEnd },
        }
    }

    return focus
}

// TODO Передавать колбеком в редактор и вызывать из него
const placeFocus = (block: Block, focus: Focus, editorStateCallbackCalled: boolean = false) => {
    // Я не знаю почему но если раньше в коде блы вызван колбек который меняет стэйт то этот метод отрабатывает неправильно
    //  если вызывать не из колбека.. наверно потому что стэйт меняется асинхронно а эта штука работает синхронно,
    //  а в евент лупе он отработает после смены стэйта таким образом.. каким то вот таким образом
    // Проблема в том что ничего не находит document.getElementById(block.id) потому что айдишки меняются при установке
    //  марок.. из метода установки марок вызывается колбек для смены стейта.. ох ёпта.. я уже не помню как там чего работает Ж)
    if (editorStateCallbackCalled) {
        setTimeout(() => {
            placeFocus(block, focus)
        }, 0)
        return
    }

    const focusAbsolutePosition = 'caret' === focus.type ? focus.caret : focus.selection.start

    const area = document.getElementById(block.id)
    area.focus()

    if (area.childNodes.length > 0) {
        let node: any
        let nodeRegionStart: number
        for (let i = 0; i < area.childNodes.length; i++) {
            const checkingNode: any = area.childNodes[i]
            // 1 - Node
            const regionStart = Number.parseInt(checkingNode.dataset.regionStart)
            const regionEnd = Number.parseInt(checkingNode.dataset.regionEnd)
            if (1 === checkingNode.nodeType && regionStart <= focusAbsolutePosition && regionEnd >= focusAbsolutePosition) {
                nodeRegionStart = regionStart
                node = area.childNodes[i]
                break
            }
        }

        if (node === undefined) {
            return
        }

        let text = node.firstChild
        if (null === text) {
            return
        }
        while (true) {
            // 3 - Text
            if (3 === text.nodeType) {
                break
            }
            text = text.firstChild
        }
        window.getSelection().collapse(text, focusAbsolutePosition - nodeRegionStart)
    } else {
        window.getSelection().collapse(area, 0)
    }
}

export { placeFocus, calcFocus }
