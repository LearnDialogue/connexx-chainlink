import React, { useState, useContext } from 'react';
import { useMutation } from '@apollo/client';
import { AuthContext } from '../context/auth';
import '../styles/components/share-ride.css';
import FriendSelect from './FriendSelect';
import Button from './Button';
import { current } from '@reduxjs/toolkit';
import { INVITE_TO_EVENT } from '../graphql/mutations/eventMutations';
import ClubSelect from './ClubSelect';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GENERATE_PREVIEW_TOKEN } from '../graphql/mutations/previewMutation';

interface ShareRideProps {
  event: any;
  onClose: () => void;
}

const ShareRide: React.FC<ShareRideProps> = ({ event, onClose }) => {
  const { user } = useContext(AuthContext);
  const currentUsername = user?.username;
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [isRidePrivate] = useState<boolean>(event.private || event.privateWomen || event.privateNonBinary);

  const [inviteToEvent] = useMutation(INVITE_TO_EVENT, {
    onCompleted: () => {
      toast.success("Friends invited successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to invite friends: ${error.message}`);
    },
  });

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFriendSelect = (friend: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friend)
        ? prev.filter((f) => f !== friend)
        : [...prev, friend]
    );
  };

  const handleSelectAll = (friends: string[]) => {
    setSelectedFriends(friends);
  };

  const handleShare = () => {
    const invitees = [...selectedFriends, ...selectedClubs];
    inviteToEvent({
      variables: {
        eventID: event._id,
        invitees,
      },
    });
  };

  const [ generatePreviewToken, {loading, error, data}] = useMutation(GENERATE_PREVIEW_TOKEN);

  const copyLink = async () => {
    try {
      // calls mutation in previewMutations to create a jwt, attaches jwt to link 
      const origin = window.location.origin;
      const eventIdString = event._id.toString();
      const {data}  = await generatePreviewToken({ variables : {eventID : eventIdString}});

      navigator.clipboard.writeText(`Join my ride! ${origin}/preview/${data.generatePreviewToken}`);
      toast.success('Link copied to clipboard!');
    }
    catch(err){
      toast.error('Error copying link');
      console.error("Error generating preview token");
    }
  }

  return (
    <div className="share-ride-modal" onClick={handleOverlayClick}>
      <div className="share-ride-content">
        <span className="close-modal" onClick={onClose}>
          <i className="fa fa-times"></i>
        </span>
        <h2>Share Ride</h2>
        <p>Select friends, click share.</p>
        <FriendSelect
          username={currentUsername}
          eventID={event._id.toString()}
          onSelect={handleFriendSelect}
          onSelectAll={handleSelectAll}
        />
        <div className='tooltip' style={{ marginLeft: '0px', width: '100%'  }}>
          <ClubSelect
          userId={user!.id}
          onSelect={(clubUserId: string) => {
            setSelectedClubs(prev =>
              prev.includes(clubUserId)
                ? prev.filter(id => id !== clubUserId)
                : [...prev, clubUserId]
            );
          }}
          onSelectAll={(clubUserIds: string[]) => {
            setSelectedClubs(clubUserIds);
          }}
        />
        <Button type="secondary" marginTop={5} disabled={isRidePrivate} onClick={copyLink}>
            Copy Link
          </Button>
          {isRidePrivate ?
            <span className='tooltiptext'>Rides marked as private or limited to women/nonbinary participants cannot be shared via link.</span>
            : undefined
          }
        </div>
        <Button type="secondary" marginTop={5} onClick={handleShare}>
          Share
          <i className="fa-regular fa-paper-plane share-ride-icon"></i>
        </Button>
        <Button type="secondary" marginTop={5} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ShareRide;
