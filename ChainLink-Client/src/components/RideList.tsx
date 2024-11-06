import React from 'react';

interface RideListProps {
  title: string;
  events: any[];
  onSelectEvent: (event: any) => void;
  currDate: Date;
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

const RideList: React.FC<RideListProps> = ({ title, events, onSelectEvent, currDate }) => {
  const filterUpcomingEvents = (events: any[]) =>
    events.filter((event) => new Date(event.startTime) > currDate);

  const upcomingEvents = filterUpcomingEvents(events);

  return (
    <div className='profile-page-user-rides-section'>
      <h5>
        {title} &nbsp; ({upcomingEvents.length})
      </h5>
      <div>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event: any, index: number) => (
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
  );
};

export default RideList;