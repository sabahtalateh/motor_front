import GraphQLService from './services/GraphQLService'

const backend = 'http://127.0.0.1:8080'
const graphQL = `${ backend }/graphql`

export const getGraphQLService: () => GraphQLService = () => {
    return new GraphQLService(graphQL)
}
