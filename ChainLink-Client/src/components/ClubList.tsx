import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CLUBS } from '../graphql/queries/clubQueries';
import { JOIN_CLUB, DECLINE_TO_JOIN } from '../graphql/mutations/clubMutations';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import { useNavigate } from 'react-router-dom';
import '../styles/components/club-list.css';
import featureFlags from '../featureFlags';
import Button from './Button';

interface ClubListProps {
  username: string | null;
}

const ClubList: React.FC<ClubListProps> = ({ username }) => {
  const navigate = useNavigate();
  const [showRequests, setShowRequests] = useState(false);
  const [clubSelected, setSelectedClub] = useState<string | null>(null);
  
  const { loading: clubsLoading, data: clubsData, refetch } = useQuery(GET_CLUBS);
  const { data: thisUserData } = useQuery(
    FETCH_USER_BY_NAME,
    { variables: { username }, skip: !username }
  );

  useEffect(() => {
    if (refetch) refetch();
  }, [refetch]);

  const [acceptClubInvitation] = useMutation(JOIN_CLUB, {
    onCompleted: () => setSelectedClub(null)
  });
  const handleAccept = (clubId: string) => {
    acceptClubInvitation({ variables: { clubId, userId: thisUserData?.getUser?.id }});
    navigate(`/app/club/${clubId}`);
  }

  const [declineClubInvitation] = useMutation(DECLINE_TO_JOIN, {
    onCompleted: () => setSelectedClub(null)
  });
  const handleReject = (clubId: string) =>
    declineClubInvitation({ variables: { clubId, userId: thisUserData?.getUser?.id } });

  const handleListChange = (flag: boolean) => {
    setShowRequests(flag);
    setSelectedClub(null);
  };

  const createClub = () => navigate('/app/create/club');

  const filterMemberClubs = (clubs: any[]) =>
    clubs.filter(club =>
      club.owners.some((o:any) => o.username === username) ||
      club.admins.some((a:any) => a.username === username) ||
      club.members.some((m:any) => m.username === username)
    );

  return (
    <div className="profile-page-clubs-container">
      <div className="profile-page-clubs-tabs">
        <button
          className="profile-page-club-list-tab"
          onClick={() => handleListChange(false)}
          style={{
            backgroundColor: showRequests ? 'white' : 'var(--primary-color-light)',
            color: showRequests ? 'black' : 'white',
          }}
        >
          Clubs
        </button>
        <button
          className="profile-page-club-list-tab"
          onClick={() => handleListChange(true)}
          style={{
            backgroundColor: showRequests ? 'var(--primary-color-light)' : 'white',
            color: showRequests ? 'white' : 'black',
          }}
        >
          Club Invites
        </button>
      </div>

      {!showRequests && (
        <button onClick={createClub} className="create-club-button">
          Create a Club +
        </button>
      )}

      <div className="profile-page-club-list">
        {clubsLoading ? (
          <p className="clubs-small-text">Loading...</p>
        ) : showRequests ? (
          clubsData.getClubs
            .filter((club: any) => club.requestedMembers.some((u: any) => u.username === username))
            .map((club: any) => (
              <div key={club.id} className="profile-page-club-list-item">
                <span className="club-name"><b>{club.name}</b></span>
                <div className="profile-page-club-request-button-container">
                  <button
                    className="profile-page-club-request-reject-button"
                    onClick={() => handleReject(club.id)}
                  ><i className="fa-solid fa-xmark"></i></button>
                  <button
                    className="profile-page-club-request-accept-button"
                    onClick={() => handleAccept(club.id)}
                  ><i className="fa-solid fa-check"></i></button>
                </div>
              </div>
            ))
        ) : (
          filterMemberClubs(clubsData.getClubs)
            .map((club: any) => (
              <div
                key={club.id}
                className="profile-page-club-list-item"
                onClick={() => navigate(`/app/club/${club.id}`)}
              >
                <span className="club-name"><b>{club.name}</b></span>
                <span
                  className={`club-position club-${
                    club.owners.some((o:any) => o.username === username) ? 'owner' :
                    club.admins.some((a:any) => a.username === username) ? 'admin' :
                    'member'
                  }`}
                >
                  <b>
                    {club.owners.some((o:any) => o.username === username)
                      ? 'Owner'
                      : club.admins.some((a:any) => a.username === username)
                      ? 'Admin'
                      : 'Member'}
                  </b>
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ClubList;
