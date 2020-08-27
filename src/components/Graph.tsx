import * as React from 'react'
import * as d3 from 'd3'
import { v4 } from 'uuid'
import { drawGraph, TNode } from '../util/Gaph'

interface Props {}

interface State {
    id: string
    width: number
    height: number
}

const input: TNode = {
    d: '1',
    p: 0,
    c: {
        s: [{ p: 0, d: '2' }],
        e: [
            { p: 0, d: '3' },
            // { p: 1, d: '4' }
        ],
        w: [
            { p: 0, d: '5' },
            { p: 1, d: '6' },
        ],
    },
}

export default class Graph extends React.Component<Props, State> {
    constructor(props: State, context: any) {
        super(props, context)
        this.state = {
            // add a letter because v4() can starts with number and html identifiers can not
            id: `g${v4()}`,
            width: 300,
            height: 400,
        }
    }

    componentDidMount(): void {
        this.renderGraph()
        this.drawTree()
    }

    renderGraph = () => {
        // const cnv = d3.select(`#${ this.state.id }`)
        //
        // const svg = cnv
        //     .append('svg')
        //     .attr('width', this.state.width)
        //     .attr('height', this.state.height)
        // drawNode(svg, { x: 100, y: 130 }, 4, '1')
        // drawNode(svg, { x: 150, y: 200 }, 4, '2')
        // drawNode(svg, { x: 50, y: 200 }, 4, '3')
    }

    drawTree = () => {
        const cnv = d3.select(`#${this.state.id}`)

        const svg = cnv
            .append('svg')
            .attr('width', this.state.width)
            .attr('height', this.state.height)

        drawGraph(svg, input)
    }

    render() {
        return <div id={this.state.id} />
    }
}
