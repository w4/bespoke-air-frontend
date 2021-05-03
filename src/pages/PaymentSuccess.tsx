import { Component } from "react";
import { Link } from "react-router-dom";

interface Props { }
interface State { }

export default class PaymentSuccess extends Component<Props, State> {
    render() {
        return (
            <div id="login-page">
                <div
                    id="login-container"
                    className="d-flex vh-100 justify-content-center align-items-center"
                >
                    {/*<img src={logo} height="200rem" />*/}

                    <div className="card shadow border-0">
                        <div className="card-header">
                            <strong>Thank you for your custom</strong>
                        </div>
                        <div className="card-body">
                            <p>
                                Thank you for your order. You will receive an email shortly with next steps for you to get started on our platform.
                            </p>

                            <p className="mb-0">
                                Welcome to the Air family!
                            </p>
                        </div>
                        <div className="card-footer">
                            <Link className="btn btn-primary" to="/">Back to Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
