import { Selection } from 'd3-selection'

const RADIUS = 17
type Side = 'n' | 'e' | 's' | 'w'

export interface Coord {
    x: number
    y: number
}

export interface NodeProps {
    coord: Coord
    angle: number
}

export interface SectorLine {
    start: Coord
    end: Coord
}


export interface TNode {
    d: string,
    p: number,
    c?: {
        n?: TNode[],
        // ne?: TNode[],
        e?: TNode[],
        // se?: TNode[],
        s?: TNode[],
        // sw?: TNode[],
        w?: TNode[],
        // nw?: TNode[]
    }
}

interface RenderedTNode {
    node: TNode,
    coord: NodeProps
}

const drawGraph = (svg: any, tree: TNode) => {
    drawTree(svg, tree)
}

const drawTree = (svg: any, tree: TNode, nodeSide?: Side, parent?: RenderedTNode) => {
    let coord: NodeProps
    if (undefined === parent) {
        coord = {
            coord: {
                x: 100,
                y: 200,
            },
            angle: 0
        }
    } else {
        coord = {
            coord: {
                x: 151,
                y: 200,
            },
            angle: 0
        }
    }

    const hasDeps = tree.c && (tree.c.n || tree.c.e || tree.c.s || tree.c.w)
    if (hasDeps) {
        drawNodeWithDeps(svg, coord)
    } else {
        drawNode(svg, coord)
    }

    const renderedParent: RenderedTNode = { node: tree, coord }

    // tree.c.n.forEach(t => drawTree(svg, t, renderedParent, 'n'))
    tree.c && tree.c.e && tree.c.e.forEach(t => drawTree(svg, t, 'e', renderedParent))
    // tree.c.s.forEach(t => drawTree(svg, t, renderedParent, 's'))
    // tree.c.w.forEach(t => drawTree(svg, t, renderedParent, 'w'))
}

const drawNode = (svg: any, nodeProps: NodeProps, nodeSide?: Side, renderedParent?: RenderedTNode) => {
    const cx = nodeProps.coord.x
    const cy = nodeProps.coord.y
    const r = RADIUS

    const g = svg.append('g')

    g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', 'grey')
}

const drawNodeWithDeps = (svg: any, nodeProps: NodeProps, nodeSide?: Side, renderedParent?: RenderedTNode) => {
    const cx = nodeProps.coord.x
    const cy = nodeProps.coord.y
    const radius = RADIUS
    const smallOuterCircleRadius = radius * 2
    const largeOuterCircleRadius = smallOuterCircleRadius + radius * 2

    const g = svg.append('g')

    // Draw large outer circle
    g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', largeOuterCircleRadius)
        .attr('fill', 'rgba(40, 100, 90, 0.4)')

    // Draw small outer circle
    g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', smallOuterCircleRadius)
        .attr('fill', 'white')

    // Draw node circle
    g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', radius)
        .attr('fill', 'grey')

    const deg = -nodeProps.angle - 180
    const rad = deg * Math.PI / 180
    g.append('circle')
        .attr('cx', cx + radius * Math.sin(rad))
        .attr('cy', cy + radius * Math.cos(rad))
        .attr('r', 2)
        .attr('fill', 'black')

    const nSectors = 4

    const degInSector = 360 / nSectors
    for (let i = nSectors; i > 0; i--) {
        const deg = i * degInSector + (degInSector / 2 - nodeProps.angle)
        const rad = deg * Math.PI / 180

        const sectorLine: SectorLine = {
            start: {
                x: cx + smallOuterCircleRadius * Math.sin(rad),
                y: cy + smallOuterCircleRadius * Math.cos(rad)
            },
            end: {
                x: cx + largeOuterCircleRadius * Math.sin(rad),
                y: cy + largeOuterCircleRadius * Math.cos(rad)
            }
        }

        // Draw sector line
        g.append('line')
            .attr('x1', sectorLine.start.x)
            .attr('y1', sectorLine.start.y)
            .attr('x2', sectorLine.end.x)
            .attr('y2', sectorLine.end.y)
            .attr('stroke-width', 1)
            .attr('stroke', 'yellow')

        // Draw point on inner circle
        g.append('circle')
            .attr('cx', sectorLine.start.x)
            .attr('cy', sectorLine.start.y)
            .attr('r', 1)
            .attr('fill', 'black')

        // Draw point on outer circle
        g.append('circle')
            .attr('cx', sectorLine.end.x)
            .attr('cy', sectorLine.end.y)
            .attr('r', 1)
            .attr('fill', 'black')
    }
}

export { drawGraph }
