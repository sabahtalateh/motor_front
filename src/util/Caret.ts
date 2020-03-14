function setCaretPosition(ctrl: any, pos: number) {
    // Modern browsers
    if (ctrl.setSelectionRange) {
        ctrl.focus()
        ctrl.setSelectionRange(pos, pos)

        // IE8 and below
    } else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange()
        range.collapse(true)
        range.moveEnd('character', pos)
        range.moveStart('character', pos)
        range.select()
    }
}

export default setCaretPosition
