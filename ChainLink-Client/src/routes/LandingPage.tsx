import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { useContext, useEffect, useState } from 'react';
import Button from '../components/Button';
import '../styles/landing-page.css';
import '../assets/Khyay-Regular.ttf';
import Footer from '../components/Footer';

const localImages = Object.values(
  import.meta.glob('../assets/landing_page/*.jpg', { eager: true, as: 'url' })
) as string[];

const LandingPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Pick a random image from localImages once on mount
  const [heroSrc, setHeroSrc] = useState<string>(() => {
    if (localImages.length === 0) return ''; // nothing to show
    const rand = Math.floor(Math.random() * localImages.length);
    return localImages[rand];
  });

  // redirect if logged in
  useEffect(() => {
    if (user) navigate('/app/profile');
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
                  <button className='button button-primary'>Sign up</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className='landing-page-body'>
          <div className='landing-page-intro'>
            {heroSrc && (
                <img
                  src={heroSrc}
                  alt='landing-hero'
                  draggable={false}
                  loading='eager'
                  decoding='async'
                />
              )}
            <div className='landing-page-intro-text'>
              <h1>Match with other cyclists in your area.</h1>
              <p>
                Join now to start seeing other people in your area, and meet for
                fun rides and new friends!
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
        <Footer absolute/>
      </div>
    </div>
  );
};

export default LandingPage;
