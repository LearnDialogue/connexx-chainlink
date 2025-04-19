// src/pages/ClubPage.tsx
import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CLUB } from '../../graphql/queries/clubQueries';
import '../../styles/club-page.css';
import EventModal from '../../components/EventModal';
import ClubStats from '../../components/ClubStats';
import UpcomingClubRides from '../../components/UpcomingClubRides';
import MemberList from '../../components/MemberList';
import Footer from '../../components/Footer';
import { AuthContext } from '../../context/auth';

const ClubPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any | null>(null);

  const { loading, error, data } = useQuery(GET_CLUB, { variables: { id } });
  if (loading) return <div>Loading...</div>;
  if (error || !data?.getClub) return <div>Error loading club.</div>;
  const club = data.getClub;

  const isAdminOrOwner =
    club.owners.some((o: any) => o.id === user?.id) ||
    (club.admins || []).some((a: any) => a.id === user?.id);

  return (
    <div className="club-page-main-container">
      {event && <EventModal event={event} setEvent={setEvent} />}

      <div className="club-page-grid">
        {/* Avatar, Title, and Stats */}
        <div className="club-header">
          <div className="club-header-left">
            <div className="user-image">{club.name.charAt(0)}</div>
            <div className="club-title">
              <h2>{club.name}</h2>
                <button className="edit-club-button" onClick={() => navigate(`/app/club/${id}/edit`)}>
                  Edit Club
                </button>
            </div>
          </div>
          <div className="club-page-user-stats">
            <ClubStats club={club} />
          </div>
      </div>

        {/* Upcoming Rides */}
        <UpcomingClubRides
          eventsHosted={club.eventsHosted}
          eventsJoined={club.eventsJoined}
          eventsInvited={club.eventsInvited}
          onSelectEvent={setEvent}
          isAdminOrOwner={isAdminOrOwner}
        />

        {/* Members List */}
        <div className="club-page-member-list-container">
          <h3>Members</h3>
          <div className="club-page-member-list-item">
            <MemberList users={club.members} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ClubPage;
