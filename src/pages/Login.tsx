import logo from '../logo.png';
import './Login.css';
import { useAuth } from '../useAuth';
import { useLocation, useHistory, Link } from 'react-router-dom';
import { FormEvent } from 'react';
import firebase from 'firebase/app';
import { ImGoogle } from "react-icons/im";

function Login() {
    const auth = useAuth();
    const location = useLocation();
    const history = useHistory();

    let from: any = location.state || { from: { pathname: "/" } };
    const login = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        auth.signin("yolo@as.com", "asasas").then((e: firebase.User) => {
            history.replace(from.from);
            console.log(e);
        });
    };

    const loginWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
    };

    return (
        <div id="login-page">
            <div id="login-container" className="d-flex vh-100 justify-content-center align-items-center">
                <img src={logo} height="200rem" />

                <div className="card shadow border-0">
                    <div className="card-body">
                        <form action="#" onSubmit={login}>
                            <div className="form-floating">
                                <input type="email" name="email" id="email" className="form-control form-control-lg" placeholder="john.smith@gmail.com" required />
                                <label htmlFor="email" className="form-label">Email Address</label>
                            </div>

                            <button type="submit" className="btn btn-danger btn-lg btn-primary mt-3 mb-2 w-100">Login</button>
                        </form>

                        <div className="side-lines">or</div>

                        <button onClick={loginWithGoogle} className="btn btn-primary btn-lg mb-3 mt-2 w-100"><ImGoogle /> Login with Google</button>

                        <div><small><Link to="/register" className="text-decoration-none">Not registered?</Link></small></div>
                        <div><small><a href="#" className="text-decoration-none">Lost access to your email address?</a></small></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
