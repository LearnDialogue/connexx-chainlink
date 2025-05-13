import React from 'react';
import { formatDate } from '../util/Formatters';
import { useQuery } from '@apollo/client';
import { GET_INVITED_EVENTS } from '../graphql/queries/eventQueries';

interface ClubStatsProps {
  club: {
    createdAt: string;
    isPrivate: boolean;
    eventsHosted: any[];
    owners: any[];
    admins: any[];
    members: any[];
    clubUser: { id: string };
  };
}

const ClubStats: React.FC<ClubStatsProps> = ({ club }) => {
  const { loading, error, data } = useQuery(GET_INVITED_EVENTS, {
    variables: { userId: club.clubUser.id }
  });
  const invitedCount = data?.getInvitedEvents?.length ?? 0;
  return (
    <div className="club-page-user-stats-data">
      <div className="club-page-user-stats-data-row-1">
        <div>
          <div>Created</div>
          <div>{formatDate(club.createdAt)}</div>
        </div>
        <div>
          <div>Privacy</div>
          <div>{club.isPrivate ? 'Private' : 'Public'}</div>
        </div>
        <div>
          <div>Events</div>
          <div>{invitedCount}</div>
        </div>
      </div>
      <hr />
      <div className="club-page-user-stats-data-row-2">
        <div>
          <div>Owners</div>
          <div>{club.owners.length}</div>
        </div>
        <div>
          <div>Admins</div>
          <div>{club.admins.length}</div>
        </div>
        <div>
          <div>Members</div>
          <div>{club.members.length}</div>
        </div>
      </div>
    </div>
  );
};

export default ClubStats;