export const loginQuery = (username: string, password: string) => `
mutation {
  login(username: "${username}", password: "${password}") {
    access,
    refresh,
  }
}
`

export const refreshTokenQuery = (refresh: string) => `
mutation {
  refreshToken(refresh: "${refresh}") {
    access
    refresh
  }
}
`
