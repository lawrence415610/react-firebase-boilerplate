import React from 'react'

import { PasswordForgetForm } from '../PasswordForget'
import { AuthUserContext, withAuthorization } from '../Session'
import PasswordChangeForm from '../PasswordChange'

const AccountPage = () => (
    <AuthUserContext.Consumer>
        {authUser => (
            <div>
                <h1>Account： {authUser.email}</h1>
                <PasswordForgetForm />
                <PasswordChangeForm />
            </div>
        )}
    </AuthUserContext.Consumer>
)

const condition = authUser => authUser != null;

export default withAuthorization(condition)(AccountPage)