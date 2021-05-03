import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../Stage";
import { getAuthToken, useAuth } from "../../useAuth";

function Account() {
  const auth = useAuth();
  const [message, setMessage] = useState({
    message: "",
    header: "",
    action: null,
    actionMessage: "",
    actionClassName: "",
  });
  const [willRenew, setWillRenew] = useState(false);
  const [showingModal, setShowingModal] = useState(false);

  useEffect(() => {
    if (auth?.error) {
      setShowingModal(true);
    }

    setWillRenew(!!auth?.subscriptionId);
  });

  const cancelSubscriptionVerify = () => {
    setMessage({
      header: "Confirm",
      message: <>Are you sure you wish to cancel your subscription at the end of the current billing cycle (currently {auth.packageExpires.toLocaleDateString()})?<br /><br />If you're having issues with Air, please remember you can get in touch with us at any time via email: <a href="mailto:info@airtm.app">info@airtm.app</a>.</>,
      action: async () => {
        try {
          const res = await fetch(`${BASE_URL}/auth/cancel-subscription`, {
            method: 'POST',
            headers: {
              Authorization: await getAuthToken(),
            }
          });
          const json = await res.json();

          if (json.error) {
            setMessage({
              header: "Error",
              message: <>Failed to cancel your subscription, please contact your account manager, or email us at <a href="mailto:info@airtm.app">info@airtm.app</a>.<br /><br />Error message: {json.message || 'unknown'}</>,
              action: null,
            });
            setShowingModal(true);
          } else {
            setMessage({
              header: "Successful",
              message: <>Successfully cancelled your subscription. We're sad to see you go but we hope to see you again soon.<br /><br />If you had problems using our product, we'd appreciate your feedback - please get in touch via email: <a href="mailto:info@airtm.app">info@airtm.app</a>.</>,
              action: null,
            });
            setShowingModal(true);
            setWillRenew(false);
          }
        } catch (e) {
          setMessage({
            header: "Error",
            message: <>Failed to cancel your subscription, please contact your account manager, or email us at <a href="mailto:info@airtm.app">info@airtm.app</a>.<br /><br />Error message: {e.message || 'unknown'}</>,
            action: null,
          });
          setShowingModal(true);
        }
      },
      actionClassName: "btn-danger",
    });
    setShowingModal(true);
  };

  return (
    <>
      <Modal centered show={showingModal} onHide={() => {
        auth?.setError("");
        setShowingModal(false);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{message.header || 'Confirm'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message.message || auth?.error}</Modal.Body>
        {message.action ? (
          <Modal.Footer>
            <a className="btn btn-secondary" onClick={() => setShowingModal(false)}>Cancel</a>
            <a className={`btn ${message.actionClassName}`} onClick={() => message.action()}>Confirm</a>
          </Modal.Footer>
        ) : <></>}
      </Modal>

      <div className="container">
        <div className="d-flex align-items-center">
          {auth.user.photoURL ? <img src={auth.user.photoURL} className="rounded-circle me-3" /> : <></>}
          <h1>{auth.user.displayName}</h1>
        </div>

        <div className="mt-3 card shadow-sm border-0 rounded">
          <div className="card-body text-dark">
            <p>
              Your subscription is currently set to {willRenew ? <strong className="text-success">renew</strong> : <strong className="text-danger">expire</strong>} on{" "}
              <strong>{auth.packageExpires.toLocaleDateString()}</strong>.
            </p>

            <p className="mb-0">
              You have <strong>{auth.remainingProductions.toLocaleString()} productions</strong> and <strong>{auth.remainingOverallCharacters.toLocaleString()}{" "}
              characters</strong> remaining for this billing cycle. Your current package allows you to use a maximum of{" "}
              <strong>{auth.maxCharactersPerProduction.toLocaleString()} characters per production</strong>.
            </p>
          </div>
        </div>

        {willRenew ? <a className="btn btn-danger mt-3" onClick={() => cancelSubscriptionVerify()}>Cancel your subscription</a> : <></>}
      </div>
    </>
  );
}

export default Account;
