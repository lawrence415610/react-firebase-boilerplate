import React, { Component } from 'react'
import { withAuthorization, AuthUserContext } from '../Session'
import { withFirebase } from '../Firebase'

const HomePage = () => (
    <div>
        <h1>Home Page</h1>
        <p>The Home Page is accessible by every signed in user.</p>
        <Messages />
    </div>
)

class MessageBase extends Component {
    constructor(props) {
        super(props)
        this.state = {
            text: '',
            loading: false,
            messages: [],
            limit: 5
        }
    }

    onChangeText = event => {
        this.setState({ text: event.target.value })
    }

    onCreateMessage = (event, authUser) => {
        this.props.firebase.messages().push({
            text: this.state.text,
            userId: authUser.uid,
            createAt: this.props.firebase.serverValue.TIMESTAMP
        })

        this.setState({ text: '' })
        event.preventDefault()
    }

    onRemoveMessage = uid => {
        this.props.firebase.message(uid).remove()
    }

    onEditMessage = (message, text) => {
        const { uid, ...messageSnapshot } = message

        this.props.firebase.message(message.uid).set({
            ...messageSnapshot,
            text,
            eidtedAt: this.props.firebase.serverValue.TIMESTAMP
        })
    }

    onNextPage = () => {
        this.setState(
            state => ({ limit: state.limit + 5 }),
            this.onListenForMessages
        )
    }

    onListenForMessages() {

        this.setState({ loading: true })

        this.props.firebase
            .messages()
            .orderByChild('createdAt')
            .limitToLast(this.state.limit)
            .on('value', snapshot => {
                const messageObject = snapshot.val()
                if (messageObject) {
                    const messageList = Object.keys(messageObject).map(key => ({
                        ...messageObject[key],
                        uid: key,
                    }))
                    this.setState({ messages: messageList, loading: false })
                } else {
                    this.setState({ messages: null, loading: false })
                }
            })
    }

    componentDidMount() {
        this.onListenForMessages()
    }

    componentWillUnmount() {
        this.props.firebase.messages().off()
    }

    render() {
        const { messages, loading, text } = this.state
        return (
            <AuthUserContext.Consumer>
                {authUser => (
                    <div>
                        {!loading && messages && (
                            <button type="button" onClick={this.onNextPage}>
                                More
                            </button>
                        )}

                        {messages ? (
                            <MessageList
                                authUser={authUser}
                                messages={messages}
                                onRemoveMessage={this.onRemoveMessage}
                                onEditMessage={this.onEditMessage} />
                        ) : (
                                <div>There are no messages...</div>
                            )}

                        <form onSubmit={event => this.onCreateMessage(event, authUser)}>
                            <input
                                type="text"
                                value={text}
                                onChange={this.onChangeText} />
                            <button type="submit">
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </AuthUserContext.Consumer>
        )
    }
}

const MessageList = ({ messages, onRemoveMessage, onEditMessage, authUser }) => (
    <ul>
        {messages.map(message => (
            <MessageItem
                authUser={authUser}
                key={message.uid}
                message={message}
                onRemoveMessage={onRemoveMessage}
                onEditMessage={onEditMessage} />
        ))}
    </ul>
)

class MessageItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            editMode: false,
            editText: this.props.message.text
        }
    }

    onToggleEditMode = () => {
        this.setState(state => ({
            editMode: !state.editMode,
            editText: this.props.message.text
        }))
    }

    onChangeEditText = event => {
        this.setState({
            editText: event.target.value
        })
    }

    onSaveEditText = () => {
        this.props.onEditMessage(this.props.message, this.state.editText)
        this.setState({ editMode: false })
    }

    render() {
        const { authUser, message, onRemoveMessage } = this.props
        const { editMode, editText } = this.state
        return (
            <li>
                {!editMode && (
                    <button
                        type="button"
                        onClick={() => onRemoveMessage(message.uid)}>
                        Delete
                    </button>
                )}

                {authUser.uid === message.userId && (
                    <span>
                        {editMode ? (
                            <span>
                                <button onClick={this.onSaveEditText}>Save</button>
                                <button onClick={this.onToggleEditMode}>Reset</button>
                            </span>
                        ) : (
                                <button onClick={this.onToggleEditMode}>Edit</button>
                            )}

                        {editMode ? (
                            <input
                                type="text"
                                value={editText}
                                onChange={this.onChangeEditText} />
                        ) : (
                                <span>
                                    <strong>{message.userId}</strong> {message.text}
                                    {message.eidtedAt && <span>(Edited)</span>}
                                </span>
                            )}
                    </span>
                )}
            </li>
        )
    }
}

const Messages = withFirebase(MessageBase)

const condition = authUser => authUser !== null;
export default withAuthorization(condition)(HomePage)