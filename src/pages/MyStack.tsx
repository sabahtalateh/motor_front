import * as React from 'react'
import MyStackList from '../components/Stack/MyStackList'
import { withGraphQLService } from '../hoc/withGraphQLService'
import { connect } from 'react-redux'
import { AppState } from '../reducers'
import { Token } from '../reducers/auth'
import { Redirect } from 'react-router-dom'

class MyStackPage extends React.Component<StateProps & DispatchProps, {}> {
    render() {
        if (!this.props.token) {
            return <Redirect to='/' />
        }

        return (
            <>
                <MyStackList token={this.props.token} />
                {/*<EditorPage/>*/}
            </>
        )
    }
}

interface StateProps {
    token: Token
}

interface DispatchProps {
    fetchMyStack: (access: string) => void
}

const mapStateToProps = ({ auth: { token } }: AppState): StateProps => ({ token })

export default withGraphQLService(connect<any, any, any>(mapStateToProps)(MyStackPage))
