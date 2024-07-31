import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { AuthData } from "../../auth/AuthWrapper";
import { nav } from "./navigation";
import "../style/menu.css"

export const RenderRoutes = () => {
  const { user } = AuthData();
  
  return (
    <Routes>
      {nav.map((r, i) => {
        if ((r.isPrivate && user.isAuthenticated) || !r.isPrivate) {
          return <Route key={i} path={r.path} element={r.element} />;
        } else {
          return null;
        }
      })}
    </Routes>
  );
};

export const RenderMenu = () => {
  const { user, logout } = AuthData();

  const MenuItem = ({ r }) => {
    return (
      <div className="menuItem">
        <Link to={r.path}>{r.name}</Link>
      </div>
    );
  };

  return (
    <div className="menu">
      {nav.map((r, i) => {
        if ((!user.isAuthenticated && r.isMenu) ||              // Show if user is not authenticated and isMenu
            (user.isAuthenticated && r.isMenu && r.isLogged !== false)) {  // Or if user is authenticated, isMenu, and isLogged is not false
          return <MenuItem key={i} r={r} />;
        } else {
          return null;
        }
      })}

      {user.isAuthenticated ? (
        <div className="menuItem">
          <Link to={'#'} onClick={logout}>Log out</Link>
        </div>
      ) : (
        <div className="menuItem">
          <Link to={'login'}>Log in</Link>
        </div>
      )}
    </div>
  );
};

