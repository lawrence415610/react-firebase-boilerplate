import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
}

class Firebase {
    constructor() {
        app.initializeApp(config)
        // use firebase's authentication feature
        this.auth = app.auth()
        this.db = app.database()

        this.googleProvider = new app.auth.GoogleAuthProvider()
        this.facebookProvider = new app.auth.FacebookAuthProvider()
        // helper
        this.serverValue = app.database.ServerValue
    }

    // *** Auth API start***
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password)

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password)

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email)

    doPasswordUpdate = password => this.auth.currentUser.updatePassword(password)

    doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider)

    // doSignInWithFacebook = () => this.auth.signInWithPopup(this.facebookProvider())

    doSignOut = () => this.auth.signOut()

    // *** Auth API end***

    // *** Merge Auth and DB User API *** //
    onAuthUserListener = (next, fallback) =>
        this.auth.onAuthStateChanged(authUser => {
            if (authUser) {
                this.user(authUser.uid)
                    .once('value')
                    .then(snapshot => {
                        const dbUser = snapshot.val()


                        if (!dbUser.roles) {
                            dbUser.roles = {}
                        }

                        authUser = {
                            uid: authUser.uid,
                            email: authUser.email,
                            ...dbUser
                        }
                        // callback function to use the authUser merged by dbUser
                        next(authUser)
                    })
            } else {
                // use a fallback when the authenticated user is null
                fallback()
            }
        })
    
    // *** Message API start***
    message = uid => this.db.ref(`messages/${uid}`)

    messages = () => this.db.ref('messages')
    // *** Message API end***

    // *** User API start***
    user = uid => this.db.ref(`users/${uid}`)

    users = () => this.db.ref('users')
    // *** User API end***

    
}

export default Firebase