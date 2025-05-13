import { useContext, useState } from 'react';
import { AuthContext } from '../../context/auth';
import EventModal from '../../components/EventModal';
import FriendList from '../../components/FriendList';
import ClubList from '../../components/ClubList';
import Footer from '../../components/Footer';
import FriendRequest from '../../components/FriendRequest';
import '../../styles/profile-page.css';
import ProfilePic from '../../components/ProfilePic';
import UserStats from '../../components/UserStats';
import UpcomingRides from '../../components/UpcomingRides';
import PastRides from '../../components/PastRides';
import featureFlags from '../../featureFlags';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState<any | null>(null);

  const handleModalClose = (nullEvent: any | null) => {
    setEvent(nullEvent);
  };

  return (
    <div className='profile-page-main-container'>

      {event ? <EventModal event={event} setEvent={handleModalClose} /> : null}

      <div data-testid="profile-page-grid" className='profile-page-grid'>
        <div className='profile-page-user-info'>
          <ProfilePic />
          <UserStats />
        </div>

        <UpcomingRides onSelectEvent={setEvent} />

        {featureFlags.friendsFeatureEnabled && <FriendRequest />}
        <div className="profile-page-friends-clubs-container">
          {featureFlags.friendsFeatureEnabled && <FriendList username={user?.username ?? null} />}
          {featureFlags.friendsFeatureEnabled && <ClubList username={user?.username ?? null} />}
        </div>

        <PastRides onSelectEvent={setEvent} />

      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
