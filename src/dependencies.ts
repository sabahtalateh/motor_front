import GraphQLService from './services/GraphQLService'

const backend = 'http://localhost:9099'
const graphQL = `${ backend }/graphql`

export const getGraphQLService: () => GraphQLService = () => {
    return new GraphQLService(graphQL)
}
