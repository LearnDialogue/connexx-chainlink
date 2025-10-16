import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CLUBS } from '../graphql/queries/clubQueries';
import { JOIN_CLUB, DECLINE_TO_JOIN } from '../graphql/mutations/clubMutations';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import { useNavigate } from 'react-router-dom';
import '../styles/components/club-list.css';
import {toast} from "react-toastify";
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

  // Accept invite
  const [acceptClubInvitation] = useMutation(JOIN_CLUB, {
    onCompleted: () => setSelectedClub(null),
    update: (cache, { data }) => {
      const existing: any = cache.readQuery({ query: GET_CLUBS });
      if (existing && data?.joinClub) {
        const updated = existing.getClubs.map((club: any) =>
          club.id === data.joinClub.id
            ? { ...club, requestedMembers: [] }
            : club
        );
        cache.writeQuery({ query: GET_CLUBS, data: { getClubs: updated } });
      }
    }
  });

  const handleAccept = (clubId: string) => {
    const userId = thisUserData?.getUser?.id;
    if (!userId) return;

    acceptClubInvitation({ variables: { clubId, userId } })
      .then(() => {
                   toast.success("Joined club successfully");
                    //remove pending invite
                    refetch();
        }
      )
      .catch(() => {
        alert('Sorry, this invite is no longer available.');
        navigate('/app/profile');
      });
  };

  // Decline invite
  const [declineClubInvitation] = useMutation(DECLINE_TO_JOIN, {
    onCompleted: () => setSelectedClub(null),
    update: (cache, { data }) => {
      const existing: any = cache.readQuery({ query: GET_CLUBS });
      if (existing && data?.declineToJoin) {
        const updated = existing.getClubs.map((club: any) =>
          club.id === data.declineToJoin.id
            ? {
                ...club,
                requestedMembers: club.requestedMembers.filter((u: any) => u.username !== username)
              }
            : club
        );
        refetch();
      }
    }
  });

  const handleRemoveInvite = (clubId: string) => {
    const userId = thisUserData?.getUser?.id;
    if (!userId) return;
    declineClubInvitation({ variables: { clubId, userId } });
  };

  const filteredClubs = clubsData?.getClubs?.filter((club: any) =>
    club.requestedMembers.some((u: any) => u.username === username)
  );  

  const filterMemberClubs = (clubs: any[]) =>
    clubs.filter(club =>
      club.owners.some((o: any) => o.username === username) ||
      club.admins.some((a: any) => a.username === username) ||
      club.members.some((m: any) => m.username === username)
  );

  const memberClubs = clubsData?.getClubs ? filterMemberClubs(clubsData.getClubs) : [];

  if (clubsLoading) return <p>Loading...</p>;

  return (
    <div className="profile-page-clubs-container">
      <div className="button-row">    
          <button onClick={() => navigate('/app/create/club')} className="club-button">
            Create a Club +
          </button>
          <button onClick={() => navigate('/app/explore/clubs')} className="club-button">
            Explore Clubs
          </button>
      </div>

      <div className="profile-page-clubs-tabs">
        <button
          className="profile-page-club-list-tab"
          onClick={() => setShowRequests(false)}
          style={{
            backgroundColor: showRequests ? 'white' : 'var(--primary-color)',
            color: showRequests ? 'black' : 'white'
          }}
        >
          Clubs
        </button>
        <button
          className="profile-page-club-list-tab"
          onClick={() => setShowRequests(true)}
          style={{
            backgroundColor: showRequests ? 'var(--primary-color)' : 'white',
            color: showRequests ? 'white' : 'black'
          }}
        >
          Club Invites
          {(filteredClubs.length > 0) ? 
          <span className='buttonBadge'>
            <i className='fas fa-circle-exclamation'></i>
          </span>
          : null}  
        </button>
      </div>

      
      <div className="profile-page-club-list">
        {showRequests ? (
          (filteredClubs && filteredClubs.length > 0) ? (
          clubsData.getClubs
            .filter((club: any) =>
              club.requestedMembers.some((u: any) => u.username === username)
            )
            .map((club: any) => (
              <div key={club.id} className="profile-page-club-list-item" onClick={() => navigate(`/app/club/${club.id}`)}>
                <span className="club-name"><b>{club.name}</b></span>
                <div className="profile-page-club-request-button-container">
                  <button
                    className="profile-page-club-request-reject-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveInvite(club.id)}
                    }
                  ><i className="fa-solid fa-xmark"></i></button>
                  <button
                    className="profile-page-club-request-accept-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(club.id)}
                    }
                  ><i className="fa-solid fa-check"></i></button>
                </div>
              </div>
            ))
          ) : (
            <p>No clubs invites found.</p>
          )
        ) : (
          ((memberClubs && memberClubs.length > 0) ? (
            filterMemberClubs(clubsData.getClubs).map((club: any) => (
              <div
                key={club.id}
                className="profile-page-club-list-item"
                onClick={() => navigate(`/app/club/${club.id}`)}
              >
                <span className="club-name"><b>{club.name}</b></span>
                <span className={`club-position club-${
                  club.owners.some((o: any) => o.username === username)
                    ? 'owner'
                    : club.admins.some((a: any) => a.username === username)
                    ? 'admin'
                    : 'member'
                }`}><b>
                  {club.owners.some((o: any) => o.username === username)
                    ? 'Owner'
                    : club.admins.some((a: any) => a.username === username)
                    ? 'Admin'
                    : 'Member'
                  }
                </b></span>
              </div>
            ))
          ) : (
            <p>No clubs found.</p>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubList;