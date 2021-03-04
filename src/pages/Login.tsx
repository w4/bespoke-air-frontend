import logo from '../logo.png';
import './Login.css';
import { useAuth } from '../useAuth';
import { Link } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import firebase from 'firebase/app';
import { ImGoogle } from "react-icons/im";

function Login() {
    const auth = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const login = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        auth.signin(email).then((e: firebase.User) => {
            setError('Please check your emails.'); // TODO
            console.log(e);
        }).catch((e: any) => setError(e.message));
    };

    const loginWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider).catch((e: any) => setError(e.message));
    };

    return (<>
        { error || auth.error ? (<div className="card bg-danger"><div className="card-body">{error || auth.error}</div></div>) : <></>}

        <div id="login-page">
            <div id="login-container" className="d-flex vh-100 justify-content-center align-items-center">
                <img alt="Logo" src={logo} height="200rem" />

                <div className="card shadow border-0">
                    <div className="card-body">
                        <form action="#" onSubmit={login}>
                            <div className="form-floating">
                                <input type="email" name="email" id="email" className="form-control form-control-lg" placeholder="john.smith@gmail.com" required
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <label htmlFor="email" className="form-label">Email Address</label>
                            </div>

                            <button type="submit" className="btn btn-danger btn-lg btn-primary mt-3 mb-2 w-100">Login</button>
                        </form>

                        <div className="side-lines">or</div>

                        <button onClick={loginWithGoogle} className="btn btn-primary btn-lg mb-3 mt-2 w-100"><ImGoogle /> Login with Google</button>

                        <div><small><Link to="/register" className="text-decoration-none">Not registered?</Link></small></div>
                        <div><small><button className="text-decoration-none">Lost access to your email address?</button></small></div>
                    </div>
                </div>
            </div>
        </div>
    </>);
}

export default Login;
