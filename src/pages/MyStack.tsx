import * as React from 'react'
import MyStackList from '../components/Stack/MyStackList'
import { withGraphQLService } from '../hoc/withGraphQLService'
import { connect } from 'react-redux'
import { AppState } from '../reducers'
import { Dispatch } from 'react'
import GraphQLService from '../services/GraphQLService'
import { fetchMyStack } from '../actions/creators/creators'
import EditorPage from './EditorPage'
import { Token } from '../reducers/authReducer'
import { Redirect } from 'react-router-dom'

interface Props extends StateProps, DispatchProps {}

class MyStackPage extends React.Component<Props, {}> {
    componentDidMount() {
        // console.log(this.props.accessToken)
        // console.log(this.props.refreshToken)
        // if (null === this.props.accessToken) {
        //     this.props.login()
        //     return
        // }
        // console.log('fff')
        // this.props.fetchMyStack(this.props.accessToken)
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        // if (prevProps.token !== null && this.props.token === null) {
        //
        // }
        // console.log('UU')
        //
        // console.log(this.props.accessToken)
        // console.log(this.props.refreshToken)
        //
        // if (null === this.props.accessToken) {
        //     this.props.login()
        //     return
        // }
        // this.props.fetchMyStack(this.props.accessToken)
    }

    render() {
        if (!this.props.token) {
            return <Redirect to='/' />
        }

        // if (!this.props.accessToken) {
        //     return <div>Login required</div>
        // }

        return (
            <>
                <MyStackList stack={this.props.stack}></MyStackList>
                <EditorPage />
            </>
        )
    }
}

interface StateProps {
    // access: string
    // refresh: string
    token: Token

    stack: string[]
    loading: boolean
    error: boolean
}

interface OwnProps {
    graphQLService: GraphQLService
}

interface DispatchProps {
    fetchMyStack: (access: string) => void
}

const mapStateToProps = ({ auth: { token }, myStack: { stack, loading, error } }: AppState): StateProps => ({
    token,

    stack,
    loading: true,
    error,
})

const mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: OwnProps): DispatchProps => {
    const { graphQLService } = ownProps
    return {
        fetchMyStack: fetchMyStack(dispatch, graphQLService),
    }
}

export default withGraphQLService(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(MyStackPage))
