import React from 'react';

interface UserStatsProps {
  userData: {
    getUser: {
      FTP: number | null;
      FTPdate: string | null;
      weight: number | null;
      experience: string | null;
    };
  } | null;
  hostedEventsCount: number;
  joinedEventsCount: number;
}

const UserStats: React.FC<UserStatsProps> = ({ userData, hostedEventsCount, joinedEventsCount }) => {
  return (
    <div className='profile-page-user-stats-data'>
      <div>
        <div>FTP</div>
        <div>{userData?.getUser.FTP ?? '-'}</div>
      </div>
      <div>
        <div>Last FTP</div>
        <div>{userData?.getUser.FTPdate?.slice(0, 10) ?? '-'}</div>
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
        <div>{hostedEventsCount}</div>
      </div>
      <div>
        <div>Rides joined</div>
        <div>{joinedEventsCount}</div>
      </div>
    </div>
  );
};

export default UserStats;
