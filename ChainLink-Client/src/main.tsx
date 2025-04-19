import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './routes/LandingPage';
import LoginPage from './routes/LoginPage';
import SignupPage from './routes/SignupPage';
import RedirectPage from './routes/RedirectPage';
import ProfilePage from './routes/app/ProfilePage';
import ClubPage from './routes/app/ClubPage';
import EditClubPage from './routes/app/EditClubPage';
import RidesFeed from './routes/app/RidesFeed';
import CreateRide from './routes/app/CreateRide';
import CreateClub from './routes/app/CreateClub';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink } from '@apollo/client';
import { AuthContext, AuthProvider } from './context/auth';
import AuthRoute from './util/AuthRoute';
import UserRoute from './util/UserRoute';
import EditProfile from './routes/app/EditProfilePage';
import EditRide from './routes/app/EditRidePage';
import ConnectToStravaPage from './routes/ConnectToStravaPage';
import SupportPage from './routes/SupportPage';
import ResetPasswordPage from './routes/ResetPasswordPage';
import SetNewPasswordPage from './routes/SetNewPasswordPage';
import Navbar from './components/Navbar';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  //enable this to debug what environment we are in
  //console.log(import.meta.env);

  const { user } = useContext(AuthContext);
  
  return (
    <>
      {user && <Navbar />} 
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route
          path='/login'
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/set-new-password" element={<SetNewPasswordPage />} />
        <Route
          path='/signup'
          element={
            <AuthRoute>
              <SignupPage />
            </AuthRoute>
          }
        />
        <Route
          path='/app/profile'
          element={
            <UserRoute>
              <ProfilePage />
            </UserRoute>
          }
        />
        <Route
          path='/app/profile/edit'
          element={
            <UserRoute>
              <EditProfile />
            </UserRoute>
          }
        />
        <Route
          path='/app/profile/edit/ride'
          element={
            <UserRoute>
              <EditRide />
            </UserRoute>
          }
        />
        <Route
          path='/app/club/:id'
          element={
            <UserRoute>
              <ClubPage />
            </UserRoute>
          }
        />
        <Route 
          path="/app/club/:id/edit" 
          element={
            <EditClubPage />
          }
        />
        <Route
          path='/app/rides'
          element={
            <UserRoute>
              <RidesFeed />
            </UserRoute>
          }
        />
        <Route
          path='/app/create'
          element={
            <UserRoute>
              <CreateRide />
            </UserRoute>
          }
        />
        <Route
          path='/app/create/club'
          element={
            <UserRoute>
              <CreateClub />
            </UserRoute>
          }
        />
        <Route
          path='/app/connect-with-strava'
          element={
            <UserRoute>
              <ConnectToStravaPage />
            </UserRoute>
          }
        />
        <Route
          path='/redirect'
          element={
            <UserRoute>
              <RedirectPage />
            </UserRoute>
          }
        />
        <Route path='/support' element={<SupportPage />} />
      </Routes>
    </>
  );
}

const httpLink = new HttpLink({ uri: import.meta.env.VITE_SERVER_URI });

const authlink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: authlink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </ApolloProvider>
);

export default App;
