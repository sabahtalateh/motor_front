export const myStackQuery = (access: string) => `
  query {
    myStack(access: "${access}")
  }
`
