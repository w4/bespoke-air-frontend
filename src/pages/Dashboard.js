import "./Dashboard.css";
import logo from "../logo.png";
import { Link, NavLink, Route } from "react-router-dom";
import DashboardHome from "./dashboard/Home.tsx";
import DashboardSettings from "./dashboard/Settings";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../useAuth";

function Dashboard({ match }) {
  const auth = useAuth();

  return (
    <div
      className="min-vh-100 bg-blue"
      style={{ paddingBottom: "20px" /*fix this*/ }}
    >
      <nav className="navbar navbar-light w-100 navbar-expand-sm bg-white shadow-sm">
        <div className="container-fluid">
          <Link to="/dashboard" className="navbar-brand">
            <img src={logo} width="48" />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink
                  to={match.url}
                  exact
                  className="nav-link"
                  activeClassName="active"
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to={match.url + "/settings"}
                  className="nav-link"
                  activeClassName="active"
                >
                  Settings
                </NavLink>
              </li>
            </ul>

            <div>
              <button
                type="button"
                className="btn"
                onClick={(e) => auth.signout()}
              >
                <FiLogOut />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mt-3 text-white">
        <Route path={`${match.url}/`} exact component={DashboardHome} />
        <Route
          path={`${match.url}/settings`}
          exact
          component={DashboardSettings}
        />
      </div>
    </div>
  );
}

export default Dashboard;
