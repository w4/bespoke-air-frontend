import logo from "../logo.png";
import "./Login.css";
import { useAuth } from "../useAuth";
import { Link } from "react-router-dom";
import React, { FormEvent, useRef, useState } from "react";
import { ImGoogle } from "react-icons/im";
import Modal from 'react-bootstrap/Modal';
import {BeatLoader} from "react-spinners";


function Login() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({
    message: "",
    header: "",
  });
  const [showingModal, setShowingModal] = useState(!!auth?.error);
  const modalRef = useRef(null);

  console.log(auth);

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    auth?.signin(email)
      .then(() => {
        setMessage({
          header: "Successfully sent login request",
          message: "Please check your emails.",
        });
        setShowingModal(true);
        setEmail('');
      })
      .catch((e: any) => setMessage({
        header: 'Error',
        message: e.message,
      }))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Modal centered show={showingModal} onHide={() => {
        setShowingModal(false);
        setMessage({
          message: "",
          header: "",
        })
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{message.header || 'Error'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message.message || auth?.error}</Modal.Body>
      </Modal>

      <div id="login-page">
        <div className="login-container">
          <div
            className="p-4 d-flex flex-column flex-md-row min-vh-100 justify-content-center align-items-center"
          >
            <img alt="Logo" src={logo} height="200rem" />

            <div className="card shadow border-0">
              <div className="card-body">
                <form action="#" onSubmit={login}>
                  <div className="form-floating">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control form-control-lg"
                      placeholder="john.smith@gmail.com"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="email" className="form-label">
                      Enter your email address
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger btn-lg btn-primary mt-3 mb-2 w-100"
                    disabled={loading}
                  >
                    {loading ? <BeatLoader color="#36D7B7" size={5} /> : <>Continue</> }
                </button>
                </form>

                <div className="side-lines">or</div>

                <button
                  onClick={() => auth?.signinWithGoogle()}
                  className="btn btn-primary btn-lg mb-3 mt-2 w-100"
                >
                  <ImGoogle /> Login with Google
              </button>

                <div>
                  <small>
                    <Link to="/register" className="text-decoration-none">
                      Not registered?
                  </Link>
                  </small>
                </div>
                <div>
                  <small>
                    <Link to="/register" className="text-decoration-none">
                      Lost access to your email address?
                  </Link>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
