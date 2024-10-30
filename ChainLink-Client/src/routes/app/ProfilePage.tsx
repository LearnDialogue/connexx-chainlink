import { useContext, useState } from 'react';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import EventModal from '../../components/EventModal';
import FriendList from '../../components/FriendList';
import Footer from '../../components/Footer';
import FriendRequest from '../../components/FriendRequest';
import ProfilePic from '../../components/ProfilePic';
import UserStats from '../../components/UserStats';
import UpcomingRides from '../../components/UpcomingRides';
import PastRides from '../../components/PastRides';
import '../../styles/profile-page.css';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState<any | null>(null);

  const handleModalClose = (nullEvent: any | null) => {
    setEvent(nullEvent);
  };

  return (
    <div className='profile-page-main-container'>
      <Navbar />

      {event ? <EventModal event={event} setEvent={handleModalClose} /> : null}

      <div className='profile-page-grid'>
        <div className='profile-page-user-info'>
          <ProfilePic />
          <UserStats />
        </div>

        <FriendRequest />
        <h3>Upcoming Rides:</h3>
        <UpcomingRides onSelectEvent={setEvent} />
        <h3>Past Rides:</h3>
        <PastRides onSelectEvent={setEvent} />
        <FriendList username={user?.username ?? null} />
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
