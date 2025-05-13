import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_INVITABLE_FRIENDS } from '../graphql/queries/friendshipQueries';
import '../styles/components/friend-select.css';
import UserAvatar from './UserAvatar';

interface FriendSelectProps {
  username: string | null | undefined;
  eventID: string | null;
  onSelect: (friend: string) => void;
  onSelectAll: (friends: string[]) => void;
}

const FriendSelect: React.FC<FriendSelectProps> = ({ username, eventID, onSelect, onSelectAll }) => {
  const { data, loading, error } = useQuery(GET_INVITABLE_FRIENDS, {
    variables: { 
        username: username,
        eventID: eventID
    },
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
    if (selectedFriends.length === data.getInvitableFriends.length) {
      setSelectedFriends([]);
      onSelectAll([]);
    } else {
      setSelectedFriends(data.getInvitableFriends);
      onSelectAll(data.getInvitableFriends);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading friends</p>;

  return (
    <div className="friend-select">
      <div className='select-all'>
        <input
          type="checkbox"
          checked={selectedFriends.length === data.getInvitableFriends.length}
          onChange={handleSelectAll}
        />
        <span className='input'>
          Select All Friends
        </span>
      </div>
      <ul>
        {data.getInvitableFriends.map((friend: string) => (
          <li key={friend}>
            <label>
              <input
                type="checkbox"
                checked={selectedFriends.includes(friend)}
                onChange={() => handleSelect(friend)}
              />
              <span className="user-avatar"><UserAvatar username={friend} hasProfileImage={true} useLarge={false} />
              </span>
              {friend}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSelect;