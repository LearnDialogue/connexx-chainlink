import React, { useContext, useEffect, useState } from 'react';
import '../styles/components/navbar.css';
import SideMenu from './SideMenu';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { User } from '../context/auth';

const Navbar: React.FC = () => {
  const context = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [userData, setUserData] = useState<User | null | undefined>();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const storedUser = context.user;
    setUserData(storedUser);
  }, []);

  return (
    <>
      <div className='navbar-placeholder'></div>
      <div className='navbar-main-container'>
        <div className='navbar-brand'>
          <Link to='/app/rides'>
            <div>Connexx ChainLink</div>
          </Link>
        </div>

        <div className='navbar-main-menu-container'>
          <Link to='/app/create'>
            <div className='navbar-main-menu-option'>
              Create <i className='fas fa-plus'></i>
            </div>
          </Link>
          <Link to='/app/rides'>
            <div className='navbar-main-menu-option'>
              Explore <i className='fa-solid fa-magnifying-glass'></i>
            </div>
          </Link>
          <div
            onMouseLeave={() => setProfileMenu(false)}
            onMouseEnter={() => setProfileMenu(true)}
            className='navbar-main-menu-username'
          >
            {userData ? userData.username.slice(0, 1).toLocaleUpperCase() : '-'}
          </div>

          {profileMenu ? (
            <div
              onMouseLeave={() => setProfileMenu(false)}
              onMouseEnter={() => setProfileMenu(true)}
              className='navbar-main-menu-profile-dropdown'
            >
              <Link to='/app/profile'>
                <ul>Profile</ul>
              </Link>
              <Link to='/app/profile/edit'>
                <ul>Edit profile</ul>
              </Link>
              <Link to='/'>
                <ul className='log-out-btn' onClick={context.logout}>
                  Log out
                </ul>
              </Link>
            </div>
          ) : null}
        </div>

        {/* mobile menu */}
        <div onClick={toggleMenu} className='hamburger-navbar-menu-container'>
          <div className='hamburger-navbar-menu'></div>
        </div>
        <SideMenu isOpen={menuOpen} onClose={toggleMenu} />
      </div>
    </>
  );
};

export default Navbar;
