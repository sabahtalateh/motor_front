import * as React from 'react'
import { Token } from '../../reducers/auth'
import GraphQLService from '../../services/GraphQLService'
import { AppState } from '../../reducers'
import { Dispatch } from 'react'
import { fetchMyStack } from '../../actions/creators/myStack'
import { withGraphQLService } from '../../hoc/withGraphQLService'
import { connect } from 'react-redux'
import { Button, ListGroup, Spinner } from 'react-bootstrap'

interface Props extends StateProps, DispatchProps {
    token: Token
}

class MyStackList extends React.Component<Props, {}> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.props.fetchMyStack(this.props.token)
    }

    render() {
        return (
            <>
                <ListGroup>
                    <ListGroup.Item>
                        <div className='d-flex w-100 justify-content-between'>
                            {this.props.loading && (
                                <Button variant='light' size='sm' disabled>
                                    <Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true' />
                                    <Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true' />
                                    <Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true' />
                                </Button>
                            )}
                        </div>
                        {/*<h5 style={{ display: 'inline-block' }}>Stack</h5>*/}
                        {/*<Button style={{ float: float }}>Refresh</Button>*/}
                    </ListGroup.Item>
                    <ListGroup.Item>Cras justo odio</ListGroup.Item>
                    <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
                    <ListGroup.Item>Morbi leo risus</ListGroup.Item>
                    <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
                    <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
                </ListGroup>
                {this.props.loading && <p>Loading</p>}
                {/*{ this.props.myStack.map(x => <div key={ x }>{ x }</div>) }*/}
            </>
        )
    }
}

interface StateProps {
    loading: boolean
}

interface OwnProps {
    graphQLService: GraphQLService
}

interface DispatchProps {
    fetchMyStack: (token: Token) => void
}

const mapStateToProps = ({ myStack: { loading } }: AppState): StateProps => ({
    loading,
})

const mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: OwnProps): DispatchProps => {
    const { graphQLService } = ownProps
    return {
        fetchMyStack: fetchMyStack(dispatch, graphQLService),
    }
}

export default withGraphQLService(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(MyStackList))
