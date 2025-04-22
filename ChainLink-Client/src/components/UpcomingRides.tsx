import React, { useState, useContext } from 'react';
import { useQuery } from '@apollo/client';
import { GET_HOSTED_EVENTS, GET_INVITED_EVENTS, GET_JOINED_EVENTS } from '../graphql/queries/eventQueries';
import { AuthContext } from '../context/auth';
import '../styles/profile-page.css';
import RideList from './RideList';

interface UpcomingRidesProps {
  onSelectEvent: (event: any) => void;
}

const UpcomingRides: React.FC<UpcomingRidesProps> = ({ onSelectEvent }) => {
  const { user } = useContext(AuthContext);
  const [currDate, setCurrDate] = useState<Date>(new Date());

  const { data: hostedEvents } = useQuery(GET_HOSTED_EVENTS);
  const { data: joinedEvents } = useQuery(GET_JOINED_EVENTS);
  const { data: invitedEvents } = useQuery(GET_INVITED_EVENTS);

  return (
    <>
      <h3>Your upcoming rides</h3>
      <div className='profile-page-user-upcoming-rides'>
        <div className='profile-page-user-upcoming-rides-data'>
          <div className='scrollable-ride-list-container'>
            <RideList
              title="Rides you are hosting"
              events={hostedEvents?.getHostedEvents || []}
              onSelectEvent={onSelectEvent}
              currDate={currDate}
            />
            </div>
            <div className='scrollable-ride-list-container'>
            <RideList
              title="Rides you are joining"
              events={joinedEvents?.getJoinedEvents || []}
              onSelectEvent={onSelectEvent}
              currDate={currDate}
            />
            </div>
            <div className='scrollable-ride-list-container'>
            <RideList
              title="Rides you are invited to"
              events={invitedEvents?.getInvitedEvents || []}
              onSelectEvent={onSelectEvent}
              currDate={currDate}
            />
            </div>
        </div>
      </div>
    </>
  );
};

export default UpcomingRides;