// import logo from './logo.svg';
// import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation
} from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { ProvideAuth, useAuth } from "./useAuth";
import Register from "./pages/Register";
import { SkewLoader } from "react-spinners";
import React, { Component } from "react";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <div className="App">
      <ProvideAuth>
        <Router>
          <Switch>
            <PrivateRoute
              exact
              path="/"
              component={() => <Redirect to="/dashboard" />}
            />
            {/* cant use component here because we use render in *Route */}
            <PrivateRoute
              path="/dashboard"
              requiresPackage={true}
              component={Dashboard}
            ></PrivateRoute>
            <UnauthenticatedRoute
              path="/login"
              component={Login}
            ></UnauthenticatedRoute>
            <UnauthenticatedRoute
              path="/register"
              component={({ location }) => <Register location={location} />}
            ></UnauthenticatedRoute>
            <Route path="/payment-success" component={PaymentSuccess} />
          </Switch>
        </Router>
      </ProvideAuth>
    </div>
  );
}

function PrivateRoute({
  component: Component,
  requiresPackage,
  ...rest
}: {
  component: ({ match }: { match: any }) => JSX.Element;
  requiresPackage?: boolean;
} & { [r: string]: any }) {
  const auth = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (auth?.user) {
          if (auth?.packageExpires === null) {
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "100vh",
                }}
              >
                <SkewLoader size={30} />
              </div>
            );
          } else if (requiresPackage && auth.packageExpires < new Date()) {
            const packageExpires = auth.packageExpires;

            auth.signout().finally(() => {
              let message = "Please purchase a package to continue";

              if (packageExpires.getTime() !== 0) {
                message += `, unfortunately your package expired on ${packageExpires.toLocaleString()}`;
              }

              auth.setError(message);
            });

            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "100vh",
                }}
              >
                <SkewLoader size={30} />
              </div>
            );
          } else {
            return <Component {...props} />;
          }
        } else if (auth?.user === null || auth?.loading) {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
              }}
            >
              <SkewLoader size={30} />
            </div>
          );
        } else {
          return (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          );
        }
      }}
    />
  );
}

function UnauthenticatedRoute({
  component: Component,
  ...rest
}: {
  component: ({ match, location }: { match: any, location: ReturnType<typeof useLocation> }) => JSX.Element;
} & { [r: string]: any }) {
  const auth = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (auth?.loading) {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
              }}
            >
              <SkewLoader size={30} />
            </div>
          );
        } else if (!auth || !auth.user) {
          return <Component {...props} />
        } else {
          return <Redirect
            to={{
              pathname: "/dashboard",
              state: { from: props.location },
            }}
          />;
        }
      }}
    />
  );
}

export default App;
