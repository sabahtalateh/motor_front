import { textAndMarksQuery } from '../queries/Text'
import { myStackQuery } from '../queries/Stack'
import { loginQuery } from '../queries/auth'

export default class GraphQLService {
    graphQl: string

    constructor(backend: string) {
        this.graphQl = backend
    }

    fetchGraphQL = async (query: string) => {
        return fetch(this.graphQl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        })
    }

    login = async (username: string, password: string) => {
        return this.fetchGraphQL(loginQuery(username, password))
    }

    text: (id: string) => Promise<any> = (id: string) => {
        return fetch(this.graphQl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: textAndMarksQuery(id) }),
        })
    }

    myStack: (access: string) => Promise<any> = access => {
        return fetch(this.graphQl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: myStackQuery(access) }),
        })
    }
}
