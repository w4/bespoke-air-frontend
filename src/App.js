// import logo from './logo.svg';
// import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { ProvideAuth, useAuth } from "./useAuth";
import Register from "./pages/Register";
import { useEffect, useState } from "react";
import { SkewLoader } from "react-spinners";

function App() {
  return (
    <div className="App">
      <ProvideAuth>
        <Router>
          <Switch>
            <PrivateRoute exact path="/">
              <Redirect to="/dashboard" />
            </PrivateRoute>
            {/* cant use component here because we use render in *Route */}
            <PrivateRoute path="/dashboard" requiresPackage={true} component={Dashboard}></PrivateRoute>
            <UnauthenticatedRoute path="/login" component={Login}></UnauthenticatedRoute>
            <UnauthenticatedRoute path="/register" component={Register}></UnauthenticatedRoute>
          </Switch>
        </Router>
      </ProvideAuth>
    </div>
  );
}

function PrivateRoute({ component: Component, requiresPackage, children, ...rest }) {
  const auth = useAuth();

  return <Route {...rest} render={props => {
    if (auth.user) {
      if (auth.userPackage === null) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <SkewLoader size={30} />
        </div>;
        // TODO:
        //} else if (requiresPackage && auth.userPackage === 0) {
        //  return <strong>SORRY!! BUY A PACKAGE HAHA TODO</strong>;
      } else {
        return <Component {...props} />;
      }
    } else if (auth.user === null) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <SkewLoader size={30} />
      </div>;
    } else {
      return <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
    }
  }} />;
}

function UnauthenticatedRoute({ component: Component, children, ...rest }) {
  const auth = useAuth();

  return (
    <Route {...rest} render={props => !auth.user ? (
      <Component {...props} />
    ) : (
        <Redirect
          to={{
            pathname: "/dashboard",
            state: { from: props.location }
          }}
        />
      )}
    />
  );
}

export default App;
