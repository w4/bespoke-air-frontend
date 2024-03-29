import logo from "../logo.png";
import "./Login.css";
import { useAuth } from "../useAuth";
import { Link } from "react-router-dom";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { ImGoogle } from "react-icons/im";
import Modal from 'react-bootstrap/Modal';
import { BeatLoader } from "react-spinners";


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

  useEffect(() => {
    if (auth?.error) {
      setShowingModal(true);
    }
  });

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
        auth?.setError("");
        setShowingModal(false);
        setMessage({
          message: "",
          header: "",
        });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{message.header || 'Error'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message.message || auth?.error}</Modal.Body>
      </Modal>

      <div className="bg-dark p-4 d-flex flex-column flex-md-row min-vh-100 justify-content-center align-items-center">
        <div className="text-center">
          <img alt="Logo" className="d-block" src={logo} height="200rem" />
          <Link to="/register" className="btn btn-outline-danger mb-2">
            Purchase a Package
          </Link>
        </div>

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
                className="btn btn-dark btn-lg mt-3 mb-2 w-100"
                disabled={loading}
              >
                {loading ? <BeatLoader color="#36D7B7" size={5} /> : <>Continue</>}
              </button>
            </form>

            <div className="side-lines">or</div>

            <button
              onClick={() => auth?.signinWithGoogle()}
              className="btn btn-primary btn-lg mb-3 mt-2 w-100"
            >
              <ImGoogle /> Login with Google
              </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
