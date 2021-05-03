import { Component } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

interface Props { }
interface State { }

export default class PaymentSuccess extends Component<Props, State> {
    render() {
        return (
            <div className="bg-dark d-flex vh-100 justify-content-center align-items-center">
                <div>
                    <h1 className="text-white">Payment Successful!</h1>
                    <div className="card shadow border-0">
                        <div className="card-body">
                            <p>
                                Thank you for your order. You will receive an email shortly with next steps for you to get started on our platform.
                            </p>

                            <p className="mb-0">
                                Welcome to the Air family!
                        </p>
                        </div>
                    </div>
                    <Link className="btn btn-dark p-3 mt-2" to="/"><FaArrowLeft /> Back to Login</Link>
                </div>
            </div>
        );
    }
}
