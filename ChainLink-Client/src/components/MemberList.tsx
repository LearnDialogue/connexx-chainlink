import React from 'react';
import UserAvatar from './UserAvatar'; // existing component

interface MemberListProps {
  title: string;
  users: { id: string; username: string }[];
}

const MemberList: React.FC<MemberListProps> = ({ title, users }) => (
  <div className="member-list">
    <h2>{title}</h2>
    <div className="member-list-grid">
      {users.map(u => (
        <div key={u.id} className="member-list-item">
          <UserAvatar username={u.username} /> {/* reuses your avatar */}
          <span>{u.username}</span>
        </div>
      ))}
    </div>
  </div>
);

export default MemberList;
