import React, { useContext, useEffect, useState } from 'react';
import '../styles/components/navbar.css';
import SideMenu from './SideMenu';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import UserAvatar from './UserAvatar';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import { useQuery } from '@apollo/client';

const Navbar: React.FC = () => {
  const context = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [userData, setUserData] = useState<any | null | undefined>();

  const { loading: userLoading, error, data: userQueryData } = useQuery(FETCH_USER_BY_NAME, { 
    variables: { username: context.user?.username } 
  });

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    if (userQueryData) {
      setUserData(userQueryData);
    }
  }, [userQueryData]);

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
            {userData?.getUser && 
            <UserAvatar 
              username={userData.getUser.username} 
              hasProfileImage={userData.getUser.hasProfileImage} 
            />}
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