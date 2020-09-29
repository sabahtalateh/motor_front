import { AuthActions } from '../actions/actions'

interface AuthReducerState {
    noAuthCookie: boolean
    readingAuthCookie: boolean

    loginRequested: boolean
    loginSuccess: boolean
    loginFailed: boolean
    token: Token
}

const authInitialState: AuthReducerState = {
    noAuthCookie: false,
    readingAuthCookie: true,

    loginRequested: false,
    loginSuccess: false,
    loginFailed: false,

    token: null
}

export interface Token {
    access: string,
    refresh: string
}

export const authReducer = (state: AuthReducerState = authInitialState, action: any) => {
    switch (action.type) {
        case AuthActions.AUTH_COOKIE_START_READING:
            return {
                ...state,
                readingAuthCookie: true,
                noAuthCookie: false,
                token: null
            }

        case AuthActions.TOKEN_FROM_COOKIE_READ:
            return {
                ...state,
                readingAuthCookie: false,
                noAuthCookie: false,
                token: action.payload
            }

        case AuthActions.AUTH_COOKIE_NOT_FOUND:
            return {
                ...state,
                readingAuthCookie: false,
                noAuthCookie: true,
                token: null
            }

        case AuthActions.LOGIN_REQUESTED:
            return {
                ...state,
                token: null,
                loginRequested: true,
                loginSuccess: false,
                loginFailed: false,
            }

        case AuthActions.LOGIN_SUCCESS:
            return {
                ...state,
                token: action.payload,
                loginRequested: false,
                loginSuccess: true,
                loginFailed: false
            }

        case AuthActions.LOGIN_FAILED:
            return {
                ...state,
                token: null,
                loginRequested: false,
                loginSuccess: false,
                loginFailed: true
            }
    }

    return state
}
