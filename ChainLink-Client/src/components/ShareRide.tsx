import React, {useState} from 'react';
import '../styles/components/share-ride.css';
import FriendSelect from './FriendSelect';
import Button from './Button';

interface ShareRideProps {
  event: any;
  onClose: () => void;
}

const ShareRide: React.FC<ShareRideProps> = ({ event, onClose }) => {
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

  return (
    <div className="share-ride-modal" onClick={handleOverlayClick}>
      <div className="share-ride-content">
        <h2>Share Ride</h2>
        <p>Invite friends to the ride.</p>
        <FriendSelect username={event.host} onSelect={handleFriendSelect} />
        <Button type='secondary' onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default ShareRide;