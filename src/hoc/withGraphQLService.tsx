import * as React from 'react'
import GraphQLService from '../services/GraphQLService'
import { Context } from 'react'
import { getGraphQLService } from '../dependencies'

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

interface ContextProps {
    graphQLService: GraphQLService;
}

const GraphQLServiceContext: Context<ContextProps> = React.createContext({ graphQLService: null })

export const withGraphQLService = <P extends object>(
    Component: React.ComponentType<P>,
): React.FC<Omit<P, keyof ContextProps>> => props => {
    return <Component { ...(props as P) } graphQLService={ getGraphQLService() }/>
}

export const GraphQLServiceProvider: React.FC<ContextProps> = ({ graphQLService, children }) => (
    <GraphQLServiceContext.Provider value={ { graphQLService: graphQLService } }>{ children }</GraphQLServiceContext.Provider>
)