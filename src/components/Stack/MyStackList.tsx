import * as React from 'react'

interface Props {
    stack: string[]
}

export default class MyStackList extends React.Component<Props, {}> {
    render() {
        return <>
            { this.props.stack.map(x => <div key={ x }>{ x }</div>) }
        </>
    }
}
