import { useEffect, useContext, useState, ChangeEvent } from 'react';
import { useQuery } from '@apollo/client';
import { FETCH_USER_BY_NAME } from '../../graphql/queries/userQueries';
import { GET_HOSTED_EVENTS, GET_JOINED_EVENTS } from '../../graphql/queries/eventQueries';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import EventModal from '../../components/EventModal';
import FriendList from '../../components/FriendList';
import Footer from '../../components/Footer';
import FriendRequest from '../../components/FriendRequest';
import '../../styles/profile-page.css';
import ProfilePic from '../../components/ProfilePic';
import UserStats from '../../components/UserStats'; 
import UpcomingRides from '../../components/UpcomingRides';

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
          <ProfilePic />

          <UserStats
            userData={userData}
            hostedEventsCount={hostedEvents?.getHostedEvents.length ?? 0}
            joinedEventsCount={joinedEvents?.getJoinedEvents.length ?? 0}
          />
        </div>
        
        <FriendRequest />

        <h3>Your upcoming rides</h3>

        <UpcomingRides onSelectEvent={setEvent} />

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

        <FriendList username={user?.username ?? null} />

      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;