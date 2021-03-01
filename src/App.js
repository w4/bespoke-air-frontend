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

function App() {
  return (
    <div className="App">
      <ProvideAuth>
        <Router>
          <Switch>
            <PrivateRoute exact path="/">
              <Redirect to="/dashboard" />
            </PrivateRoute>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <PrivateRoute path="/dashboard" component={Dashboard} />
          </Switch>
        </Router>
      </ProvideAuth>
    </div>
  );
}

function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();

  // TODO: --IMPORTANT-- FIX THIS. RENDER DOESN'T WORK WITH COMPONENT
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location }
              }}
            />
          )
      }
    />
  );
}

export default App;
