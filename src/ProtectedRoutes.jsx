import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const loggedIn = localStorage.getItem("shop");
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
