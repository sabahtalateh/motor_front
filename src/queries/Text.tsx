export const textAndMarksQuery = (id: string) => `
  query {
    text(id: "${id}") {
      id
      title
      blocks {
        id
        content
        order
        style
      }
    }
    marks(textId: "${id}") {
      textId
      blockMarks {
        blockId
        marks {
          id
          startPos
          endPos
          kind
          referenceId
          referenceType
        }
      }
    }
  }
`
