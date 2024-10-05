import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { useContext, useEffect } from 'react';
import Button from '../components/Button';
import '../styles/landing-page.css';
import '../assets/Khyay-Regular.ttf';
import Footer from '../components/Footer';

const LandingPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/app/profile');
    }
  }, [navigate, user]);
  return (
    <div className='landing-page-main-container'>
      <div className='landing-page-first-view'>
        <div className='landing-page-header'>
          <div className='landing-page-brand'>Connexx ChainLink</div>
          <div>
            {user ? (
              <div className='landing-page-auth-btns'>
                <Button type='primary' onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className='landing-page-auth-btns'>
                <Link to='/login'>
                  <div className='landing-page-login-btn'>Login</div>
                </Link>
                <Link to='/signup'>
                  <Button type='primary'>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className='landing-page-body'>
          <div className='landing-page-intro'>
            <img
              src='https://i.ibb.co/qW3kGMQ/landing-page-image2.webp'
              alt='landing-page-image2'
            />
            <div className='landing-page-intro-text'>
              <h1>Match with other cyclists in your area.</h1>
              <p>
                Join now to start seeing other people in your area, and meet for
                fun rides and new friends! Connect your{' '}
                <span className='strava'>STRAVA</span> profile, upload your
                metrics, creates rides, and get matched with rides near you!
              </p>
              {user ? (
                <div className='landing-page-get-started'>
                  <Link to='/app/rides'>
                    <Button type='primary'>Explore rides</Button>
                  </Link>
                </div>
              ) : (
                <div className='landing-page-get-started'>
                  <Link to='/signup'>
                    <Button type='primary'>Get started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer absolute />
    </div>
  );
};

export default LandingPage;
