import { textAndMarksQuery } from '../queries/Text'

export default class GraphQLService {
    graphQl: string

    constructor(backend: string) {
        this.graphQl = backend
    }

    text: (id: string) => Promise<any> = (id: string) => {
        return fetch(`${ this.graphQl }`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: textAndMarksQuery(id) }),
        })
    }
}
