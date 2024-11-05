import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/auth';
import '../styles/components/share-ride.css';
import FriendSelect from './FriendSelect';
import Button from './Button';
import { current } from '@reduxjs/toolkit';

interface ShareRideProps {
  event: any;
  onClose: () => void;
}


const ShareRide: React.FC<ShareRideProps> = ({ event, onClose }) => {
  const { user } = useContext(AuthContext);
  const currentUsername = user?.username;

  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFriendSelect = (friend: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friend) ? prev.filter((f) => f !== friend) : [...prev, friend]
    );
  };

  const handleSelectAll = (friends: string[]) => {
    setSelectedFriends(friends);
  };

  const handleShare = () => {
    console.log('Selected friends:', selectedFriends);
  };

  return (
    <div className="share-ride-modal" onClick={handleOverlayClick}>
      <div className="share-ride-content">
        <span className="close-modal" onClick={onClose}>
          X
        </span>
        <h2>Share Ride</h2>
        <p>Select friends, click share.</p>
        <FriendSelect username={currentUsername} onSelect={handleFriendSelect} onSelectAll={handleSelectAll} />
        <Button type='secondary' onClick={handleShare}>Share</Button>
        <Button type='secondary' marginTop={5} onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
};

export default ShareRide;