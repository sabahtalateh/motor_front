import { Block } from './Editor'

export interface Focus {
    type: 'caret' | 'selection'
    caret?: number
    selection?: { start: number, end: number }
}

const placeFocus = (block: Block, focus: Focus) => {
    const focusAbsolutePosition = 'caret' === focus.type
        ? focus.caret
        : focus.selection.start

    const area = document.getElementById(block.id)

    const selection = window.getSelection()
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
        while (true) {
            // 3 - Text
            if (3 === text.nodeType) {
                break
            }
            text = text.firstChild
        }
        selection.collapse(text, focusAbsolutePosition - nodeRegionStart)
    } else {
        selection.collapse(area, 0)
    }
}

export { placeFocus }
