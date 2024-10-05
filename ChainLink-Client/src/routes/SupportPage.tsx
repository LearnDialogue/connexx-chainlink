import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { useContext } from 'react';
import Button from '../components/Button';
import '../styles/landing-page.css';
import '../assets/Khyay-Regular.ttf';
import Footer from '../components/Footer';

const SupportPage = () => {
  const { user, logout } = useContext(AuthContext);
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
              <h1>Contact Us</h1>
              <p>
                If you have any questions or concerns, please contact us
                <a
                  className='button button-transparent'
                  href='mailto:sunny@learndialogue.org'
                >
                  here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer absolute />
    </div>
  );
};

export default SupportPage;
