import React, { useEffect, useContext, useState } from 'react';
import Navbar from '../../components/Navbar';
import GpxMap from '../../util/GpxHandler';
import '../../styles/profile-page.css';
import mockUserData from '../../mockData/userMockUp.json';
import { AuthContext } from '../../context/auth';
import { useSearchParams, Link } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';
import Button from '../../components/Button';
import EventModal from '../../components/EventModal';
import Footer from '../../components/Footer';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '../../graphql/queries/friendshipQueries';
import { FETCH_USER_BY_NAME } from '../../graphql/queries/userQueries';
import { GET_HOSTED_EVENTS, GET_JOINED_EVENTS } from '../../graphql/queries/eventQueries';

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
  } = useQuery(FETCH_USER_BY_NAME, {
    variables: {
      username: user?.username,
    },
  });

  const {
    loading: friendsLoading,
    data: friendsData,
  } = useQuery(GET_FRIENDS, {
    variables: {
      username: user?.username,
    },
  });

  const {
    loading: friendRequestsLoading,
    data: friendRequestsData,
  } = useQuery(GET_FRIEND_REQUESTS, {
    variables: {
      username: user?.username,
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
              <div style={{ textAlign: 'center' }}>
                <span>
                  {userData
                    ? userData?.getUser.firstName +
                      ', ' +
                      getUserAge(userData.getUser.birthday)
                    : null}
                </span>{' '}
                <br />
                <b>
                  {userData ? user?.username : null}
                  {userData?.getUser.isPrivate && (
                    <span className='private-profile-badge'>
                      <i className='fa-solid fa-lock'></i>
                    </span>
                  )}
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
              style={
                showRequests
                  ? { backgroundColor: 'white', color: 'black' }
                  : { backgroundColor: foreColor, color: 'white' }
              }
            >
              Friends
            </button>

            <button
              className='profile-page-friend-list-tab'
              onClick={() => setShowRequest(true)}
              style={
                showRequests
                  ? { backgroundColor: foreColor, color: 'white' }
                  : { backgroundColor: 'white', color: 'black' }
              }
            >
              Friend Requests
            </button>

            <div className='profile-page-friend-list'>
            {friendsLoading ? (
              <p>Loading...</p>
            ) : showRequests ? (
              friendRequestsData.getFriendRequests.map((request: { sender: string }, index: number) => (
                <div key={index}>
                  <div className='profile-page-friend-list-item'>
                    <span className='image'>
                      {request.sender.slice(0, 1).toLocaleUpperCase()}
                    </span>
                    <span className='name'>
                      <b>{request.sender}</b>
                    </span>
                    <div className='profile-page-friend-request-button-container'>
                      <button className='profile-page-friend-request-reject-button'>
                        <i className='fa-solid fa-xmark'></i>
                      </button>
                      <button className='profile-page-friend-request-accept-button'>
                        <i className='fa-solid fa-check'></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              friendsData.getFriends.map((friend: string, index: number) => (
                <div key={index}>
                  <div className='profile-page-friend-list-item'>
                    <span className='image'>
                      {friend.slice(0, 1).toLocaleUpperCase()}
                    </span>
                    <span className='name'>
                      <b>{friend}</b>
                    </span>
                  </div>
                </div>
              ))
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

export default ProfilePage;