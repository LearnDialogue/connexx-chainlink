import React, { useContext } from 'react';
import { useQuery } from '@apollo/client';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import { GET_HOSTED_EVENTS, GET_JOINED_EVENTS } from '../graphql/queries/eventQueries';
import { AuthContext } from '../context/auth';

const UserStats: React.FC = () => {
  const { user } = useContext(AuthContext);

  const { data: userData, loading: userLoading } = useQuery(FETCH_USER_BY_NAME, {
    variables: { username: user?.username },
    skip: !user?.username, // Skip query if username is undefined
  });

  const { data: hostedEvents, loading: hostedLoading } = useQuery(GET_HOSTED_EVENTS);
  const { data: joinedEvents, loading: joinedLoading } = useQuery(GET_JOINED_EVENTS);

  if (userLoading || hostedLoading || joinedLoading) {
    return <div>Loading...</div>; // Display loading while fetching data
  }

  return (
    <div className='profile-page-user-stats-data'>
      <div className='profile-page-user-stats-data-row-1'>
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
        <div className='profile-page-tooltip'>
          <i className='fa fa-eye-slash'></i>
          <span className='tooltip-text'>This information is hidden from all other users at all times, even if your profile is public.</span>
        </div>
      </div>

      <hr></hr>

      <div className='profile-page-user-stats-data-row-2'>
        <div>
          <div>Experience level</div>
          <div>{userData?.getUser.experience ?? '-'}</div>
        </div>
        <div>
          <div>Rides hosted</div>
          <div>{hostedEvents ? hostedEvents.getHostedEvents.length : 0}</div>
        </div>
        <div>
          <div>Rides joined</div>
          <div>{joinedEvents ? joinedEvents.getJoinedEvents.length : 0}</div>
        </div> 
        <div className='profile-page-tooltip'>
          <i className='fa fa-eye-low-vision'></i>
          <span className='tooltip-text'>This information is visible to all users if your profile is public. If your profile is private, only users you've friended can see it.</span>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
