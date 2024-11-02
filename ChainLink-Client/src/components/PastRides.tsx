import React, { useState, useContext } from 'react';
import { useQuery } from '@apollo/client';
import { GET_HOSTED_EVENTS, GET_JOINED_EVENTS } from '../graphql/queries/eventQueries';
import { AuthContext } from '../context/auth';
import '../styles/profile-page.css';

interface PastRidesProps {
  onSelectEvent: (event: any) => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  return formatter.format(date);
};

const PastRides: React.FC<PastRidesProps> = ({ onSelectEvent }) => {
  const { user } = useContext(AuthContext);
  const [currDate] = useState<Date>(new Date());

  const { data: hostedEvents } = useQuery(GET_HOSTED_EVENTS);
  const { data: joinedEvents } = useQuery(GET_JOINED_EVENTS);

  const filterPastEvents = (events: any[]) =>
    events.filter((event) => new Date(event.startTime) < currDate);

  return (
    <>
      <h3>Your past rides</h3>
      <div className='profile-page-user-past-rides'>
        <div className='profile-page-user-past-rides-data'>
          <div className='profile-page-user-rides-hosted'>
            <h5>
              Rides you hosted &nbsp; (
              {hostedEvents?.getHostedEvents ? filterPastEvents(hostedEvents.getHostedEvents).length : 0})
            </h5>
            <div>
              {hostedEvents?.getHostedEvents ? (
                filterPastEvents(hostedEvents.getHostedEvents).map((event: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => onSelectEvent(event)}
                    className='profile-page-user-rides-list-item'
                  >
                    <div className='ride-title'>
                      <span>
                        <b>{event.name}</b>
                      </span>
                      <span className='ride-date'>{formatDate(event.startTime)}</span>
                    </div>
                    <p className='ride-location'>
                      <i className='fa-solid fa-location-dot'></i>
                      {event.locationName}
                    </p>
                  </div>
                ))
              ) : (
                <div className='profile-page-user-event-no-rides-text'>No rides to show</div>
              )}
            </div>
          </div>

          <div className='profile-page-user-rides-joined'>
            <h5>
              Rides you joined &nbsp; (
              {joinedEvents?.getJoinedEvents ? filterPastEvents(joinedEvents.getJoinedEvents).length : 0})
            </h5>
            <div>
              {joinedEvents?.getJoinedEvents ? (
                filterPastEvents(joinedEvents.getJoinedEvents).map((event: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => onSelectEvent(event)}
                    className='profile-page-user-rides-list-item'
                  >
                    <div className='ride-title'>
                      <span>
                        <b>{event.name}</b>
                      </span>
                      <span className='ride-date'>{formatDate(event.startTime)}</span>
                    </div>
                    <p className='ride-location'>
                      <i className='fa-solid fa-location-dot'></i>
                      {event.locationName}
                    </p>
                  </div>
                ))
              ) : (
                <div className='profile-page-user-event-no-rides-text'>No rides to show</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PastRides;
