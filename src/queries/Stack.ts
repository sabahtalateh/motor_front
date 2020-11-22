import { StackItem } from '../components/Stack/MyStackList'

export const myStackQuery = (access: string) => `
query myStack {
  myStack(access: "${access}") {
    id
    title
    blocks {
      id
      text
      marks {
        id
        from
        to
      }
    }
  }
}
`

export const addToMyStackQuery = (stackItem: StackItem) => (access: string) => {
    const blocksString = stackItem.blocks
        .map(b => {
            let marksString = b.marks.map(
                m => `{
            from: ${m.from}
            to: ${m.to}
        }`,
            )

            return `{
            text: "${b.text}",
            marks: [${marksString}]
        }`
        })
        .join('\n')

    console.log(blocksString)

    return `mutation myStackAdd {
          myStackAdd(
            access: "${access}", 
            stackItem: {
              blocks: [${blocksString}]
            }
          ) {
            id
            title
            blocks {
              id
              text
              marks {
                id
                from
                to
              }
            }
          }
        }`
}
