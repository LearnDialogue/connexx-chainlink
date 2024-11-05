import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FRIENDS } from '../graphql/queries/friendshipQueries';
import '../styles/components/friend-select.css';
import UserAvatar from './UserAvatar';

interface FriendSelectProps {
  username: string | null | undefined;
  onSelect: (friend: string) => void;
  onSelectAll: (friends: string[]) => void;
}

const FriendSelect: React.FC<FriendSelectProps> = ({ username, onSelect, onSelectAll }) => {
  const { data, loading, error } = useQuery(GET_FRIENDS, {
    variables: { username },
  });

  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setSelectedFriends([]); // Initialize with no friends selected
    }
  }, [data]);

  const handleSelect = (friend: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friend) ? prev.filter((f) => f !== friend) : [...prev, friend]
    );
    onSelect(friend);
  };

  const handleSelectAll = () => {
    if (selectedFriends.length === data.getFriends.length) {
      setSelectedFriends([]);
      onSelectAll([]);
    } else {
      setSelectedFriends(data.getFriends);
      onSelectAll(data.getFriends);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading friends</p>;

  return (
    <div className="friend-select">
      <label>
        <input
          type="checkbox"
          checked={selectedFriends.length === data.getFriends.length}
          onChange={handleSelectAll}
        />
        Select All
      </label>
      <ul>
        {data.getFriends.map((friend: string) => (
          <li key={friend}>
            <label>
              <input
                type="checkbox"
                checked={selectedFriends.includes(friend)}
                onChange={() => handleSelect(friend)}
              />
              <UserAvatar username={friend} hasProfileImage={true} useLarge={false} />
              {friend}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSelect;