import "./Login.css";
import ReactTooltip from "react-tooltip";
import { loadStripe } from "@stripe/stripe-js";
import { BASE_URL } from "../Stage";
import { Component, FormEvent } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useLocation } from "react-router";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe("pk_test_51HocJLGXUxS8x6sbYNNRtOgVA1SXydkQOxjyaTIwCPTRv7ujs2ruBwWTj96b8QOMtw6SoiUEByM4eO51DVwvXsz8003979Xqag");

interface Props {
  location: ReturnType<typeof useLocation>,
}

interface Package {
  stripe_price_id: number;
  name: string;
  description: string;
  frequency: string;
  price: number;
  currency: string;
  max_characters_per_production: number;
  productions: number;
  characters: number;
}

interface State {
  packages: Package[];
  email: string;
  package: number;
  error: JSX.Element | null;
}

export default class Register extends Component<Props, State> {
  componentDidMount() {
    fetch(`${BASE_URL}/auth/packages`)
      .then((v) => v.json())
      .then((packages) => this.setState({ packages: packages.sort((first: Package, second: Package) => first.price - second.price) }))
      .catch((e) => this.setState({ error: <>We failed to load our packages: {e.message}. Please try again later or contact us via email <a href="mailto:info@airtm.app">info@airtm.app</a></> }));
  }

  async handleSubmit(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    const stripe = await stripePromise;

    if (!stripe) {
      this.setState({ error: <>We failed to load our payment processing gateway, please try again later or contact us via email <a href="mailto:info@airtm.app">info@airtm.app</a>.</> });
      return;
    }

    if (!this.state.email || !this.state.package) {
      this.setState({ error: <>Please select a package to continue.</> });
      return;
    }

    try {
      const searchParams = new URLSearchParams(this.props.location.search);

      const resp = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.state.email,
          package: this.state.package,
          success_url: `${window.location.origin.toString()}/payment-success`,
          cancel_url: `${window.location.origin.toString()}/register`,
          promotion_code: searchParams.get('code'),
        }),
      });
      const json = await resp.json();

      if (json.error) {
        this.setState({
          error: json.message,
        });
        return;
      }

      stripe.redirectToCheckout({ sessionId: json.session_id });
    } catch (e) {
      this.setState({
        error: <>Failed to redirect you to our payment processing gateway: {e.message}. Please try again later or contact us via email <a href="mailto:info@airtm.app">info@airtm.app</a></>
      })
    }
  }

  render() {
    const searchParams = new URLSearchParams(this.props.location.search);

    return (
      <div className="bg-dark d-flex vh-100 justify-content-center align-items-center">
        <div>
          <h1 className="text-white">Register for a Package</h1>
          <div className="card shadow border-0">
            <div className="card-body">
              <p>
                Thanks for your interest in joining Air™, we'd love to see you
                on our platform.
                </p>

              <p>
                Please enter your email address, and select a package and you'll
                be away in no time!
                </p>

              <form onSubmit={(e) => this.handleSubmit(e)}>
                <div className="form-floating">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control form-control-lg"
                    placeholder="john.smith@gmail.com"
                    required
                    onChange={(e) =>
                      this.setState({ ...this.state, email: e.target.value })
                    }
                  />
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                </div>

                <div className="mt-2">
                  <ReactTooltip />
                  {Object.entries(this.state && this.state.packages ? this.state.packages : []).map(
                    ([k, v]) => (
                      <div className="form-check" key={v.stripe_price_id}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="package"
                          value={v.stripe_price_id}
                          id={`package-${k}`}
                          onChange={(e) =>
                            this.setState({ ...this.state, package: v.stripe_price_id })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`package-${v.stripe_price_id}`}
                        >
                          <OverlayTrigger overlay={(props) => (
                            <Tooltip id="button-tooltip" {...props}>
                              {v.description || `A total of ${v.characters.toLocaleString()} characters and ${v.productions.toLocaleString()} productions (with a maximum ${v.max_characters_per_production.toLocaleString()} characters per production) per billing period.`}
                            </Tooltip>
                          )}>
                            <span
                              style={{
                                textDecoration: "underline dotted",
                                cursor: "help",
                              }}
                            >
                              {v.name}
                            </span></OverlayTrigger>{" "}
                          - {(v.price / 100).toLocaleString(undefined, {
                              style: 'currency',
                              currency: v.currency,
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}/{v.frequency}
                        </label>
                      </div>
                    )
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-lg btn-dark mt-3 mb-3 w-100"
                >
                  Pay Now
                </button>

                {searchParams.has('code') ? <div className="small">Your discount code will apply at checkout.</div> : <></>}

                {this.state?.error ? <div className="small text-danger">{this.state.error}</div> : <></>}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
