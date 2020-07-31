import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { withFirebase } from '../Firebase'
import { SignUpLink } from '../SignUp'
import { PasswordForgetLink } from '../PasswordForget'
import * as ROUTES from '../../constants/routes'

const SignInPage = () => (
    <div>
        <h1>SignIn</h1>
        SignInWithEmail:
        <SignInForm />
        SignInWithGoogle:
        <SignInGoogle />
        {/* SignInWithFacebook:
        <SignInFacebook /> */}
        <PasswordForgetLink />
        <SignUpLink />
    </div>
)

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null
}

class SignInFormBase extends Component {
    constructor(props) {
        super(props)
        this.state = { ...INITIAL_STATE }
    }

    onSubmit = event => {
        const { email, password } = this.state

        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ ...INITIAL_STATE })
                this.props.history.push(ROUTES.HOME)
            })
            .catch(error => {
                this.setState({ error })
            })

        event.preventDefault();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    render() {
        const { email, password, error } = this.state
        const isInvalid = password === '' || email === ''
        return (
            <form onSubmit={this.onSubmit}>
                <input
                    type="text"
                    name="email"
                    value={email}
                    placeholder="Email Address"
                    onChange={this.onChange}
                />
                <input
                    type="text"
                    name="password"
                    value={password}
                    placeholder="Email Password"
                    onChange={this.onChange}
                />

                <button disabled={isInvalid} type="submit">
                    Sign in
                </button>

                {error && <p>{error.message}</p>}
            </form>
        )
    }
}

class SignInGoogleBase extends Component {
    constructor(props) {
        super(props)
        this.state = { error: null }
    }

    onSubmit = event => {
        this.props.firebase
            .doSignInWithGoogle()
            .then(socialAuthUser => {
                return this.props.firebase
                    .user(socialAuthUser.user.uid)
                    .set({
                        username: socialAuthUser.user.displayName,
                        email: socialAuthUser.user.email,
                        roles: {}
                    })
                    .then(() => {
                        this.setState({ error: null })

                        this.props.history.push(ROUTES.HOME)
                    })
            })
            .catch(error => {
                this.setState({ error })
            })

        event.preventDefault()
    }

    render() {
        const { error } = this.state
        return (
            <form onSubmit={this.onSubmit}>
                <button type="submit">
                    Sign In With Google
                </button>
                {error && <p>{error.message}</p>}
            </form>
        )
    }
}

// class SignInFacebookBase extends Component {
//     constructor(props) {
//         super(props)
//         this.state = { error: null }
//     }

//     onSubmit = event => {
//         this.props.firebase
//             .doSignInWithFacebook()
//             .then(socialAuthUser => {
//                 return this.props.firebase
//                     .user(socialAuthUser.user.uid)
//                     .set({
//                         username: socialAuthUser.additionalUserInfo.profile.name,
//                         email: socialAuthUser.additionalUserInfo.profile.email,
//                         roles: {}
//                     })
//             })
//             .then(() => {
//                 this.setState({ error: null });
//                 this.props.history.push(ROUTES.HOME)
//             })
//             .catch(error => {
//                 this.setState({ error })
//             })

//         event.preventDefault()
//     }

//     render() {
//         const { error } = this.state
//         return (
//             <form onSubmit={this.onSubmit}>
//                 <button type="submit">
//                     Sign In with Facebook
//                 </button>
//                 {error && <p>{error.message}</p>}
//             </form>
//         )
//     }
// }

const SignInForm = withRouter(withFirebase(SignInFormBase))

const SignInGoogle = withRouter(withFirebase(SignInGoogleBase))

// const SignInFacebook = withRouter(withFirebase(SignInFacebookBase))

export default SignInPage

export { SignInForm, SignInGoogle }