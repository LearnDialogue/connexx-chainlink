import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FRIENDS } from '../graphql/queries/friendshipQueries';
import '../styles/components/friend-select.css';

interface FriendSelectProps {
  username: string;
  onSelect: (friend: string) => void;
}

const FriendSelect: React.FC<FriendSelectProps> = ({ username, onSelect }) => {
  const { data, loading, error } = useQuery(GET_FRIENDS, {
    variables: { username },
  });

  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const handleSelect = (friend: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friend) ? prev.filter((f) => f !== friend) : [...prev, friend]
    );
    onSelect(friend);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading friends</p>;

  return (
    <div className="friend-select">
      <h3>Select friends to invite.</h3>
      <ul>
        {data.getFriends.map((friend: string) => (
          <li key={friend}>
            <label>
              <input
                type="checkbox"
                checked={selectedFriends.includes(friend)}
                onChange={() => handleSelect(friend)}
              />
              {friend}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSelect;