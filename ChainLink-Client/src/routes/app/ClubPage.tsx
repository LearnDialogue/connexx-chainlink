import React, { useState, useContext, useEffect } from 'react';
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

  // Always fetch fresh data on mount/refresh
  const { loading, error, data, refetch } = useQuery(GET_CLUB, {
    variables: { id },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  });

  // Trigger an immediate refetch on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Redirect non‑members out of private clubs whenever data updates
  useEffect(() => {
    // don’t even run until we have both the club data AND the signed‑in user
    if (loading || error || !data?.getClub || !user?.id) return;
    if (!user?.id) return <div>Loading...</div>;
  
    const { isPrivate, owners, admins, members } = data.getClub;
    const isAdminOrOwner =
      owners.some((o: any) => o.id === user.id) ||
      admins.some((a: any) => a.id === user.id);
    const isMember = members.some((m: any) => m.id === user.id);
  
    if (isPrivate && !isAdminOrOwner && !isMember) {
      navigate('/app/profile', {
        state: { message: 'Not allowed to view this club' },
      });
    }
  }, [loading, error, data, navigate, user]);

  if (loading) return <div>Loading...</div>;
  if (error || !data?.getClub) return <div>Error loading club.</div>;
  const club = data.getClub;

  const isAdminOrOwner =
    club.owners.some((o: any) => o.id === user?.id) ||
    club.admins.some((a: any) => a.id === user?.id);

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
              {isAdminOrOwner && (
                <button
                  className="edit-club-button"
                  onClick={() => navigate(`/app/club/${id}/edit`)}
                >
                  Edit Club
                </button>
              )}
            </div>
            {/* Club description, width limited to avatar */}
            {club.description && (
              <p className="club-description">{club.description}</p>
            )}
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
          <MemberList
            clubId={id!}
            users={club.members}
            owners={club.owners}
            admins={club.admins}
            requestedMembers={club.requestedMembers}
            isAdminOrOwner={isAdminOrOwner}
            refetchClub={refetch}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ClubPage;
