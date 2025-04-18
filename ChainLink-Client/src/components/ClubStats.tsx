import React from 'react';
import { formatDate } from '../util/Formatters';

interface ClubStatsProps {
  club: {
    createdAt: string;
    isPrivate: boolean;
    eventsHosted: any[];
    owners: any[];
    admins: any[];
    members: any[];
  };
}

const ClubStats: React.FC<ClubStatsProps> = ({ club }) => (
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
        <div>{club.eventsHosted.length}</div>
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

export default ClubStats;