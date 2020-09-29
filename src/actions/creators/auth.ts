import { Dispatch } from 'react'
import { action } from 'typesafe-actions'

import { AuthActions } from '../actions'
import GraphQLService from '../../services/GraphQLService'
import * as cookie from '../../util/cookie'
import { Token } from '../../reducers/authReducer'

const loginRequested = () => action(AuthActions.LOGIN_REQUESTED)
const loginSuccess = (token: Token) => action(AuthActions.LOGIN_SUCCESS, token)
const loginFailed = () => action(AuthActions.LOGIN_FAILED)

export const login = (dispatch: Dispatch<any>, graphQLService: GraphQLService) => (username: string, password: string) => {
    dispatch(loginRequested())
    graphQLService.login(username, password)
        .then(r => {
            r.json().then((json: any) => {
                if (!r.ok) {
                    dispatch(loginFailed())
                } else {
                    if (json['errors']) {
                        dispatch(loginFailed())
                    } else {
                        const token: Token = {
                            access: json['data']['login']['access'],
                            refresh: json['data']['login']['refresh']
                        }

                        cookie.setCookie('c_auth', JSON.stringify(token))
                        dispatch(loginSuccess(token))
                    }
                }
            })
        })
}

const loggedOut = () => action(AuthActions.LOGGED_OUT)

export const logout = (dispatch: Dispatch<any>) => () => {
    cookie.deleteCookie('c_auth')
    dispatch(loggedOut())
}

const readingAuthCookie = () => action(AuthActions.AUTH_COOKIE_START_READING)
const tokenFromCookieRead = (token: Token) => action(AuthActions.TOKEN_FROM_COOKIE_READ, token)
const authCookieNotFound = () => action(AuthActions.AUTH_COOKIE_NOT_FOUND)

export const readAuthCookie = (dispatch: Dispatch<any>) => () => {
    dispatch(readingAuthCookie())
    const authCookie = cookie.getCookie('c_auth')
    if (!authCookie) {
        dispatch(authCookieNotFound())
    } else {
        const token = JSON.parse(authCookie)
        if (token.hasOwnProperty('access') && token.hasOwnProperty('refresh')) {
            dispatch(tokenFromCookieRead({
                access: token['access'],
                refresh: token['refresh']
            }))
        } else {
            dispatch(authCookieNotFound())
        }
    }
}
