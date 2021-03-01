import './Login.css';
import ReactTooltip from 'react-tooltip';
import { loadStripe } from '@stripe/stripe-js';
import { BASE_URL } from "../Stage";
import { Component, FormEvent } from 'react';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface Props { }
interface State {
    packages: { id: number, name: string, description: string, price: number }[];
    email: string,
    package: number,
}

export default class Register extends Component<Props, State> {
    componentDidMount() {
        fetch(`${BASE_URL}/auth/packages`)
            .then(v => v.json())
            .then(packages => this.setState({ packages }));
    }

    async handleSubmit(form: FormEvent<HTMLFormElement>) {
        form.preventDefault();
        const stripe = await stripePromise;

        if (!stripe)
            throw new Error("oh no!");

        const resp = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: this.state.email,
                package: this.state.package,
                success_url: "https://google.com/",
                cancel_url: "https://yahoo.com/"
            }),
        });
        const json = await resp.json();

        stripe.redirectToCheckout({ sessionId: json.session_id })
    }

    render() {
        return (
            <div id="login-page">
                <div id="login-container" className="d-flex vh-100 justify-content-center align-items-center">
                    {/*<img src={logo} height="200rem" />*/}

                    <div className="card shadow border-0">
                        <div className="card-header">
                            <strong>Register an Account</strong>
                        </div>
                        <div className="card-body">
                            <p>Thanks for your interest in joining Air™, we'd love to see you on our platform.</p>

                            <p>Please enter your email address, and select a package and you'll be away in no time!</p>

                            <form onSubmit={(e) => this.handleSubmit(e)}>
                                <div className="form-floating">
                                    <input type="email" name="email" id="email" className="form-control form-control-lg"
                                        placeholder="john.smith@gmail.com" required
                                        onChange={e => this.setState({ ...this.state, email: e.target.value })}
                                    />
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                </div>

                                <div className="mt-2">
                                    <ReactTooltip />
                                    {Object.entries(this.state ? this.state.packages : []).map(([k, v]) => <div className="form-check" key={v.id}>
                                        <input className="form-check-input" type="radio" name="package" value={v.id} id={`package-${v.id}`}
                                            onChange={e => this.setState({ ...this.state, package: v.id })}
                                        />
                                        <label className="form-check-label" htmlFor={`package-${v.id}`}>
                                            <span data-tip={v.description} style={{ textDecoration: 'underline dotted', cursor: 'help' }}>{v.name}</span> - ${v.price / 100}
                                        </label>
                                    </div>)}
                                </div>

                                <button type="submit" className="btn btn-danger btn-lg btn-primary mt-3 mb-3 w-100">Pay Now</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
