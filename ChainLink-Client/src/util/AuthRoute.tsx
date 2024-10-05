import React, { useContext, ReactNode } from "react";
import { Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth";

interface Props {
  children: ReactNode;
}

function AuthRoute({ children }: Props) {
  const { user } = useContext(AuthContext);

  return user ? <Navigate to="/" /> : <>{children}</>;
}

export default AuthRoute;