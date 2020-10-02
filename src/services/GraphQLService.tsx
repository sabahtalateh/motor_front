import { textAndMarksQuery } from '../queries/Text'
import { myStackQuery } from '../queries/Stack'
import { loginQuery, refreshTokenQuery } from '../queries/auth'
import { Token } from '../reducers/auth'
import { Dispatch } from 'react'
import { autoRefreshFailed, loggedOut, loginSuccess, logout } from '../actions/creators/auth'
import * as cookie from '../util/cookie'

const hasError = (errors: any, extension: string) => {
    for (const e of errors) {
        if (e.hasOwnProperty('extensions') && e.extensions.hasOwnProperty('type') && e.extensions.type === extension) {
            return true
        }
    }

    return false
}

const accessExpired = (errors: any) => {
    return hasError(errors, 'access_expired')
}

const unauthorized = (errors: any) => {
    return hasError(errors, 'unauthorized')
}

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

    gqlFetchRetryExpired = async (queryFn: (access: string) => string, token: Token, dispatch: Dispatch<any>) => {
        const query = queryFn(token.access)

        const response = await (
            await fetch(this.graphQl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            })
        ).json()

        if (!response.hasOwnProperty('errors')) {
            return response.data
        }

        if (response.hasOwnProperty('errors') && response['errors'].length > 0 && unauthorized(response['errors'])) {
            cookie.deleteCookie('c_auth')
            dispatch(autoRefreshFailed())
            return
        }

        // Handle access expired
        if (response.hasOwnProperty('errors') && response['errors'].length > 0 && accessExpired(response['errors'])) {
            // Refresh token
            console.error('EXP')
            const refreshResult = await (await this.refreshToken(token.refresh)).json()

            // If no errors while refresh set new token and retry request
            if (!refreshResult.hasOwnProperty('errors')) {
                console.error('EXP RFR SUC')
                const token: Token = {
                    access: refreshResult['data']['refreshToken']['access'],
                    refresh: refreshResult['data']['refreshToken']['refresh'],
                }

                cookie.setCookie('c_auth', JSON.stringify(token))
                dispatch(loginSuccess(token))

                // Retry original request
                const query = queryFn(token.access)

                const response = await (
                    await fetch(this.graphQl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query }),
                    })
                ).json()

                // If token expired again.. for some reason.. then logout
                if (
                    response.hasOwnProperty('errors') &&
                    response['errors'].length > 0 &&
                    (unauthorized(response['errors']) || accessExpired(response['errors']))
                ) {
                    cookie.deleteCookie('c_auth')
                    dispatch(autoRefreshFailed())
                    return
                } else {
                    return response
                }
            }
            // If error while refresh then logout
            else {
                cookie.deleteCookie('c_auth')
                dispatch(autoRefreshFailed())
                return
            }
        }

        return response
    }

    login = async (username: string, password: string) => {
        return this.fetchGraphQL(loginQuery(username, password))
    }

    refreshToken = async (refresh: string) => {
        return this.fetchGraphQL(refreshTokenQuery(refresh))
    }

    myStack = async (token: Token, dispatch: Dispatch<any>) => {
        return this.gqlFetchRetryExpired(myStackQuery, token, dispatch)
    }

    text: (id: string) => Promise<any> = (id: string) => {
        return fetch(this.graphQl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: textAndMarksQuery(id) }),
        })
    }
}
