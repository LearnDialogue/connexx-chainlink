import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_INVITED_EVENTS } from '../graphql/queries/eventQueries';
import '../styles/profile-page.css';
import RideList from './RideList';

interface UpcomingClubRidesProps {
  onSelectEvent: (event: any) => void;
  userId: string;
}

const UpcomingClubRides: React.FC<UpcomingClubRidesProps> = ({
  onSelectEvent,
  userId,
}) => {
  const [currDate] = useState<Date>(new Date());

  const { data: invitedData } = useQuery(GET_INVITED_EVENTS, { variables: { userId } });

  const invitedEvents = invitedData?.getInvitedEvents || [];
  const upcomingInvited = invitedEvents.filter((e: any) => new Date(e.startTime) > currDate);
  const pastRides = invitedEvents.filter((e: any) => new Date(e.startTime) <= currDate);

  return (
    <div className='club-page'>
      <h3>Upcoming Club Rides</h3>
      <div className='profile-page-user-upcoming-rides'>
        <div className='profile-page-user-upcoming-rides-data'>
          <RideList
            title="Rides the club is invited to"
            events={upcomingInvited}
            onSelectEvent={onSelectEvent}
            currDate={currDate}
          />
          <RideList
            title="Past Club Rides"
            events={invitedEvents}
            currDate={new Date()}
            onSelectEvent={onSelectEvent}
            showPast
          />
        </div>
      </div>
    </div>
  );
};

export default UpcomingClubRides;
