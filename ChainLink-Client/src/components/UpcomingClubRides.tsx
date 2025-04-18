import React, { useState } from 'react';
import RideList from './RideList';

interface UpcomingClubRidesProps {
  eventsHosted: any[];
  eventsJoined: any[];
  eventsInvited: any[];
  onSelectEvent: (e: any) => void;
  isAdminOrOwner: boolean;
}

const UpcomingClubRides: React.FC<UpcomingClubRidesProps> = ({
  eventsHosted,
  eventsJoined,
  eventsInvited,
  onSelectEvent,
  isAdminOrOwner,
}) => {
  const [currDate] = useState(new Date());

  return (
    <>
      <h3>Upcoming Club Rides</h3>
      <div className="club-page-user-upcoming-rides">
        <div className="club-page-user-upcoming-rides-data">
          <RideList
            title="Rides the club is hosting"
            events={eventsHosted}
            onSelectEvent={onSelectEvent}
            currDate={currDate}
          />
          <RideList
            title="Rides the club has joined"
            events={eventsJoined}
            onSelectEvent={onSelectEvent}
            currDate={currDate}
          />
          {isAdminOrOwner && (
            <RideList
              title="Rides the club is invited to"
              events={eventsInvited}
              onSelectEvent={onSelectEvent}
              currDate={currDate}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default UpcomingClubRides;
