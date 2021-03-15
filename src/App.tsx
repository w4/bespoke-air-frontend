// import logo from './logo.svg';
// import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { ProvideAuth, useAuth } from "./useAuth";
import Register from "./pages/Register";
import { SkewLoader } from "react-spinners";
import React, { Component } from "react";

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
            {/*<UnauthenticatedRoute
              path="/register"
              component={Register}
            ></UnauthenticatedRoute>*/}
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
          if (auth?.userPackage === null) {
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
            // TODO:
            //} else if (requiresPackage && auth.userPackage === 0) {
            //  return <strong>SORRY!! BUY A PACKAGE HAHA TODO</strong>;
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
  component: ({ match }: { match: any }) => JSX.Element;
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
