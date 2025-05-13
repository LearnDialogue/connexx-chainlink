import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CLUBS } from '../graphql/queries/clubQueries';
import '../styles/components/club-select.css'; // reuse FriendSelect styling

interface ClubSelectProps {
  onSelect: (username: string) => void;
  onSelectAll: (usernames: string[]) => void;
}

const ClubSelect: React.FC<ClubSelectProps> = ({ onSelect, onSelectAll }) => {
  const { data, loading, error } = useQuery(GET_CLUBS);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);

  const userClubs = data?.getClubs || [];

  // Reset selection once when club data arrives
  useEffect(() => {
    if (data) {
      setSelectedClubs([]);
      onSelectAll([]);
    }
    // Only run when `data` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleSelect = (username: string) => {
    const updated = selectedClubs.includes(username)
      ? selectedClubs.filter(u => u !== username)
      : [...selectedClubs, username];
    setSelectedClubs(updated);
    onSelect(username);
  };

  const handleSelectAll = () => {
    const allUsernames = userClubs.map((club: any) => club.clubUser.username);
    if (selectedClubs.length === allUsernames.length) {
      setSelectedClubs([]);
      onSelectAll([]);
    } else {
      setSelectedClubs(allUsernames);
      onSelectAll(allUsernames);
    }
  };

  if (loading) return <p>Loading clubs...</p>;
  if (error) return <p>Error loading clubs</p>;
  if (userClubs.length === 0) return null;

  return (
    <div className="club-select">
      <div className="select-all">
        <input
          type="checkbox"
          checked={selectedClubs.length === userClubs.length}
          onChange={handleSelectAll}
        />
        <span>Select All Clubs</span>
      </div>
      <ul>
        {userClubs.map((club: any) => {
          const username = club.clubUser.username;
          return (
            <li key={club.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedClubs.includes(username)}
                  onChange={() => handleSelect(username)}
                />
                <span className="user-avatar">{club.name.charAt(0)}</span>
                {club.name}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ClubSelect;