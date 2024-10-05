import React, { useReducer, createContext, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { NavLink, useNavigate } from "react-router-dom";

export interface User {
    username: string;
    loginToken: string;
}

interface State {
    user: User | null | undefined;
}

interface Action {
    type: string;
    payload?: User;
}

let initialState: State = {
    user: null,
};

const token: string | null = localStorage.getItem("jwtToken");

if (token) {
  const decodedToken: any = jwtDecode(token);

  if (decodedToken.exp*1000 < Date.now()) {
    localStorage.removeItem("jwtToken");
  } else {
    initialState.user = decodedToken;
  }
}

const AuthContext = createContext<{
    user: User | null | undefined;
    login: (userData: User) => void;
    logout: () => void;
}>({
    user: initialState.user,
    login: () => {},
    logout: () => {},
});


function authReducer(state: State, action: Action): State {
    switch (action.type) {
        case "LOGIN":
        return {
            ...state,
            user: action.payload,
        };
        case "LOGOUT":
        return {
            ...state,
            user: null,
        };
        default:
        return state;
    }
}

function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();
    
    function login(userData: User) {
      localStorage.setItem("jwtToken", userData.loginToken);
      dispatch({
        type: "LOGIN",
        payload: userData
      });
    }
  
    function logout() {
      localStorage.removeItem("jwtToken");
      dispatch({
        type: "LOGOUT"
      });
      navigate("/");
      window.location.reload();
    }
  
    return (
        <AuthContext.Provider
        value={{ user: state.user, login, logout }}
        >
        {children}
        </AuthContext.Provider>
    );
  }

export { AuthContext, AuthProvider }