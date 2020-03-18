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
const placeFocus = (block: Block, focus: Focus) => {
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

const jjj = (blockId: string, pos: number) => {
    const focusAbsolutePosition = pos
    const area = document.getElementById(blockId)
    area.focus()

    if (area.childNodes.length > 0) {
        let node
        let nodeRegionStart
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
