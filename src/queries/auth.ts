export const loginQuery = (username: string, password: string) => `
mutation {
  login(username: "${ username }", password: "${ password }") {
    access,
    refresh,
  }
}
`
