import React, { useEffect, useContext, useState } from 'react';
import Navbar from '../../components/Navbar';
import GpxMap from '../../util/GpxHandler';
import '../../styles/profile-page.css';
import mockUserData from '../../mockData/userMockUp.json';
import { AuthContext } from '../../context/auth';
import { useSearchParams, Link } from 'react-router-dom';
import { gql, useMutation, useLazyQuery, useQuery } from '@apollo/client';
import Button from '../../components/Button';
import EventModal from '../../components/EventModal';
import Footer from '../../components/Footer';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  return formatter.format(date);
};

const getUserAge = (dateStr: string): string => {
  const date = new Date(dateStr);

  return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
};

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState<any | null>(null);
  const [currDate, setCurrDate] = useState<Date>(new Date());
  const [showRequests, setShowRequest] = useState(false);

  const handleModalClose = (nullEvent: any | null) => {
    setEvent(nullEvent);
  };

  const foreColor = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color-light');

  let username: string | null = null;
  if (user) {
    username = user.username;
  }
  const token: string | null = localStorage.getItem('jwtToken');

  const {
    loading: hostedLoading,
    data: hostedEvents,
    refetch: hostRefetch,
  } = useQuery(GET_HOSTED_EVENTS);

  const {
    loading: joinedLoading,
    data: joinedEvents,
    refetch: joinRefetch,
  } = useQuery(GET_JOINED_EVENTS);

  const {
    loading: userLoading,
    error,
    data: userData,
  } = useQuery(FETCH_USER_QUERY, {
    variables: {
      username: user?.username,
    },
  });

  const {
    loading: friendsLoading,
    data: friends,
  } = useQuery(GET_FRIENDS, {
    variables: {
        userID: user?.id,
      },
  });

  useEffect(() => {
    hostRefetch();
    joinRefetch();
  }, []);

  return (
    <div className='profile-page-main-container'>
      <Navbar />

      {event ? <EventModal event={event} setEvent={handleModalClose} /> : <></>}

      <div className='profile-page-grid'>
        <div className='profile-page-user-info'>
          <div className='user-name-and-image-container'>
            <div className='user-image'>
              {user?.username.slice(0, 1).toLocaleUpperCase()}
              <input
                type='file'
                id='file-upload'
                style={{ display: 'none' }}
                onChange={() => null}
                accept='image/*'
              />
              <label htmlFor='file-upload' className='upload-label'>
                <i className='fa-solid fa-image-portrait'></i>
                <span>Upload a picture</span>
              </label>
            </div>

            <div className='user-name'>
                <div style={{textAlign: 'center'}}>
                    <span>
                        {userData ? 
                            userData?.getUser.firstName +
                            ', ' +
                            getUserAge(userData.getUser.birthday)
                        : null}
                    </span> <br/>
                    <b>
                        {userData ? 
                            user?.username
                        : null}
                    </b>
                </div>
            </div>

            <div className='profile-page-edit-profile-btn'>
              <Link to='/app/profile/edit'>
                <Button type='secondary'>
                  <i className='fa-solid fa-pen'></i> &nbsp; &nbsp; Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className='profile-page-user-stats-data'>
            <div>
              <div>FTP</div>
              <div>{userData?.getUser.FTP ?? '-'}</div>
            </div>
            <div>
              <div>Last FTP</div>
              <div>{userData?.getUser.FTPdate.slice(0, 10) ?? '-'}</div>
            </div>
            <div>
              <div>Weight</div>
              <div>{userData?.getUser.weight ?? '-'} kg</div>
            </div>
            <div>
              <div>Experience level</div>
              <div>{userData?.getUser.experience ?? '-'}</div>
            </div>
            <div>
              <div>Rides hosted</div>
              <div>
                {hostedEvents ? hostedEvents.getHostedEvents.length : 0}
              </div>
            </div>
            <div>
              <div>Rides joined</div>
              <div>
                {joinedEvents ? joinedEvents.getJoinedEvents.length : 0}
              </div>
            </div>
          </div>
        </div>

        <h3>Your upcoming rides</h3>
        <div className='profile-page-user-upcoming-rides'>
          <div className='profile-page-user-upcoming-rides-data'>
            <div className='profile-page-user-rides-hosted'>
              <h5>
                Rides you are hosting &nbsp; (
                {hostedEvents?.getHostedEvents.length ?? 0})
              </h5>
              <div>
                {hostedEvents && hostedEvents.getHostedEvents ? (
                  hostedEvents.getHostedEvents
                    .filter(
                      (event: any) => new Date(event.startTime) > currDate
                    )
                    .map((event: any, index: number) => (
                      <div
                        onClick={() => setEvent(event)}
                        className='profile-page-user-rides-list-item'
                        key={index}
                      >
                        <div className='ride-title'>
                          <span>
                            <b>{event.name}</b>
                          </span>
                          <span className='ride-date'>
                            {formatDate(event.startTime)}
                          </span>
                        </div>
                        <p className='ride-location'>
                          <i className='fa-solid fa-location-dot'></i>
                          {event.locationName}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className='profile-page-user-event-no-rides-text'>
                    No rides to show
                  </div>
                )}
              </div>
            </div>

            <div className='profile-page-user-rides-joined'>
              <h5>
                Rides you are joining &nbsp; (
                {joinedEvents?.getJoinedEvents.length ?? 0})
              </h5>
              <div>
                {joinedEvents && joinedEvents.getJoinedEvents ? (
                  joinedEvents.getJoinedEvents
                    .filter(
                      (event: any) => new Date(event.startTime) > currDate
                    )
                    .map((event: any, index: number) => (
                      <div
                        onClick={() => setEvent(event)}
                        className='profile-page-user-rides-list-item'
                        key={index}
                      >
                        <div className='ride-title'>
                          <span>
                            <b>{event.name}</b>
                          </span>
                          <span className='ride-date'>
                            {formatDate(event.startTime)}
                          </span>
                        </div>
                        <p className='ride-location'>
                          <i className='fa-solid fa-location-dot'></i>
                          {event.locationName}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className='profile-page-user-event-no-rides-text'>
                    No rides to show
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <h3>Your past rides</h3>
        <div className='profile-page-user-past-rides'>
          <div className='profile-page-user-past-rides-data'>
            <div className='profile-page-user-rides-hosted'>
              <h5>Rides you hosted &nbsp; (0)</h5>
              <div>
                {hostedEvents && hostedEvents.getHostedEvents ? (
                  hostedEvents.getHostedEvents
                    .filter(
                      (event: any) => new Date(event.startTime) < currDate
                    )
                    .map((event: any, index: number) => (
                      <div
                        onClick={() => setEvent(event)}
                        className='profile-page-user-rides-list-item'
                        key={index}
                      >
                        <div className='ride-title'>
                          <span>
                            <b>{event.name}</b>
                          </span>
                          <span className='ride-date'>
                            {formatDate(event.startTime)}
                          </span>
                        </div>
                        <p className='ride-location'>
                          <i className='fa-solid fa-location-dot'></i>
                          {event.locationName}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className='profile-page-user-event-no-rides-text'>
                    No rides to show
                  </div>
                )}
              </div>
            </div>

            <div className='profile-page-user-rides-joined'>
              <h5>Rides you joined &nbsp; (0)</h5>
              <div>
                {joinedEvents && joinedEvents.getJoinedEvents ? (
                  joinedEvents.getJoinedEvents
                    .filter(
                      (event: any) => new Date(event.startTime) < currDate
                    )
                    .map((event: any, index: number) => (
                      <div
                        onClick={() => setEvent(event)}
                        className='profile-page-user-rides-list-item'
                        key={index}
                      >
                        <div className='ride-title'>
                          <span>
                            <b>{event.name}</b>
                          </span>
                          <span className='ride-date'>
                            {formatDate(event.startTime)}
                          </span>
                        </div>
                        <p className='ride-location'>
                          <i className='fa-solid fa-location-dot'></i>
                          {event.locationName}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className='profile-page-user-event-no-rides-text'>
                    No rides to show
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <h3>Friend List</h3>
        <div className='profile-page-friends-container'>
            <div className='profile-page-list-display'>

                <button 
                    className='profile-page-friend-list-tab' 
                    onClick={() => setShowRequest(false)}
                    style={showRequests ? {backgroundColor: 'white', color: 'black'} : {backgroundColor: foreColor, color: 'white'}}
                >
                    Friends
                </button>

                <button 
                    className='profile-page-friend-list-tab' 
                    onClick={() => setShowRequest(true)}
                    style={showRequests ? {backgroundColor: foreColor, color: 'white'} : {backgroundColor: 'white', color: 'black'}}
                >
                    Friend Requests
                </button>

                <div className='profile-page-friend-list'>
                    {friends ? (
                        [...friends.getUsers]
                        .map((user: any, index: number) => (
                        <div key={index}>
                            <div className='profile-page-friend-list-item'>
                                <span className='image'>
                                    {user.username.slice(0,1).toLocaleUpperCase()}
                                </span>
                                <span className='name'>
                                    <b>{user.firstName + " " + user.lastName + " (" + user.username + ")"}</b>
                                </span>

                                {showRequests ?
                                (   <div className='profile-page-friend-request-button-container'>
                                        <button className='profile-page-friend-request-reject-button'>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                {
                                                    //Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
                                                }
                                                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                                            </svg>
                                        </button>
                                        <button className='profile-page-friend-request-accept-button'>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                {
                                                    //Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
                                                }
                                                <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <></>
                                )
                                }
                            </div>
                        </div>
                        ))
                    ) : (
                        <></>
                    )}
                </div>
            </div>
            <div>
                {
                    // Recommending Do Profile Panel Here
                }
            </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

const FETCH_USER_QUERY = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      FTP
      weight
      FTPdate
      birthday
      firstName
      experience
    }
  }
`;

const GET_HOSTED_EVENTS = gql`
  query getHostedEvents {
    getHostedEvents {
      _id
      host
      name
      locationName
      locationCoords
      startTime
      description
      bikeType
      difficulty
      wattsPerKilo
      intensity
      route
      participants
    }
  }
`;

const GET_FRIENDS = gql`
  query getFriends {
    getUsers {
      birthday
      firstName
      lastName
      experience
      locationName
      username
    }
  }
`;

export const GET_JOINED_EVENTS = gql`
  query getJoinedEvents {
    getJoinedEvents {
      _id
      host
      name
      locationName
      locationCoords
      startTime
      description
      bikeType
      difficulty
      wattsPerKilo
      intensity
      route
      participants
    }
  }
`;
export default ProfilePage;
