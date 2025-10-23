import React, { useContext, useEffect, useState } from 'react';
import '../styles/components/navbar.css';
import SideMenu from './SideMenu';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import UserAvatar from './UserAvatar';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import { GET_FRIEND_REQUESTS } from '../graphql/queries/friendshipQueries';
import { GET_INVITED_EVENTS } from '../graphql/queries/eventQueries';
import { GET_CLUBS } from '../graphql/queries/clubQueries';
import { useQuery } from '@apollo/client';
import featureFlags from '../featureFlags';
import logoPng from '../assets/pedal-florida-logo.png';

const Navbar: React.FC = () => {
  const context = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [userData, setUserData] = useState<any | null | undefined>();
  const username = user?.username;
  const location = useLocation();

  // Listen for location change in react router and close the menu
  useEffect(() => {
      setMenuOpen(false);
    }, [location]);

  const { loading: userLoading, error, data: userQueryData } = useQuery(FETCH_USER_BY_NAME, { 
    variables: { username: context.user?.username } 
  });

  const { loading: friendRequestsLoading, data: friendRequestsData } = useQuery(GET_FRIEND_REQUESTS, { 
    variables: { username: context.user?.username } 
  });

  const { loading: clubsLoading, data: clubsData, refetch } = useQuery(GET_CLUBS);
  const { data: thisUserData } = useQuery(
    FETCH_USER_BY_NAME,
    { variables: { username }}
  );

const pendingClubRequests = clubsData?.getClubs
  ? clubsData.getClubs.filter((club: any) =>
      club.requestedMembers.some((u: any) => u.username === username)
    )
  : [];
  const { data: invitedEvents } = useQuery(GET_INVITED_EVENTS);

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
          <div>
            <img
              src='/pedal-florida-logo-full.svg'
              alt='Pedal Florida Logo'
              className='navbar-logo'
            />
        </div>
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
              Browse Rides <i className='fa-solid fa-magnifying-glass'></i>
            </div>
          </Link>
          {featureFlags.notificationsEnabled && (
              (friendRequestsData?.getFriendRequests.length === 0 && 
                    invitedEvents?.getInvitedEvents.length === 0 && pendingClubRequests.length === 0) ? (
              <div className='navbar-main-menu-option'>
                <div className='navbar-notification-bell-container-disabled'>
                  <span className='notification-bell'>
                    <i className='fas fa-bell'></i>
                  </span>
                  <span className='tooltip-text'>You have no notifications at this time.</span>
                </div>
              </div>
            ) : (
              <Link to='/app/profile'>
              <div className='navbar-main-menu-option'>
                <div className='navbar-notification-bell-container'>
                  <span className='notification-bell'>
                    <i className='fas fa-bell'></i>
                      <span className='badge'>
                        <i className='fas fa-circle-exclamation'></i>
                      </span>
                  </span>
                  <span className='tooltip-text'>
                    {(friendRequestsData?.getFriendRequests.length > 0 && invitedEvents?.getInvitedEvents.length === 0 && pendingClubRequests.length === 0)
                    ? 'You have a pending friend request! Click here to visit your profile and view it.'
                    : (friendRequestsData?.getFriendRequests.length === 0 && invitedEvents?.getInvitedEvents.length > 0 && pendingClubRequests.length === 0)
                    ? 'You have been invited to a ride! Click here to visit your profile and view it.'
                    : (pendingClubRequests.length > 0 && friendRequestsData?.getFriendRequests.length === 0 &&  invitedEvents?.getInvitedEvents.length === 0) 
                    ? "You have been invited to a club! Click here to visit your profile and view it."
                    : 'You have unaddressed notifications. Click here to visit your profile and view them.'
                    }
                  </span>
                </div>
              </div>
            </Link>
            )
          )
          }
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