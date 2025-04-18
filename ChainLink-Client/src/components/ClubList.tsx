// ClubList.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CLUBS, GET_CLUB } from '../graphql/queries/clubQueries';
import { JOIN_CLUB, DECLINE_TO_JOIN } from '../graphql/mutations/clubMutations';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/components/club-list.css';
import featureFlags from '../featureFlags';import Button from './Button';

interface ClubListProps {
  username: string | null;
}

const ClubList: React.FC<ClubListProps> = ({ username }) => {
  const navigate = useNavigate();

  const [showRequests, setShowRequests] = useState(false);
  // show club invites
  
  const [friendSelected, setSelectedFriend] = useState<string | null>(null);
  const [clubSelected, setSelectedClub] = useState<string | null>(null);
  
  const [removeFriendFlag, setRemoveFriend] = useState(false);
  const [leaveClubFlag, setLeaveClub] = useState(false);

  const { loading: clubsLoading, data: clubsData, refetch } = useQuery(GET_CLUBS);

  const location = useLocation();

  const { loading: thisUserLoading, data: thisUserData} = useQuery(FETCH_USER_BY_NAME, { variables: { username: username }, skip: !username });
  const { loading: clubLoading, data:clubData } = useQuery(GET_CLUB, { variables: { clubId: clubSelected }, skip: !clubSelected});

  const foreColor = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

  const getUserAge = (dateStr: string): string => {
    const date = new Date(dateStr);
    return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
  };

  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
    }
  }, [location.state, refetch]);
  
  // const [leaveClub] = useMutation(LEAVE_CLUB, {
  //   update(cache, { data: { leaveClub } }) {
  //     cache.modify({
  //       fields: {
  //         getClubs(currentClubs = []) {
  //           return currentClubs.filter((club: any) => (
  //             club !== leaveClub.name
  //           ));
  //         },
  //       },
  //     });
  //     setSelectedClub(null);
  //   },
  // });

  // const handleLeaveClub = (name: string) => {
  //   leaveClub({
  //     variables: { name },
  //   }).catch(error => console.error('Error removing friend:', error));
  //   setLeaveClub(false);
  // }

  const [acceptClubInvitation] = useMutation(JOIN_CLUB, {
    onCompleted: () => {
      setSelectedClub(null);
    },
  });

  const handleAccept = (clubId: string) => {
    acceptClubInvitation({ variables: { clubId, userId: thisUserData?.getUser?.id }})
  }

  const [declineClubInvitation] = useMutation(DECLINE_TO_JOIN, {
    onCompleted: () => {
      setSelectedClub(null);
    },
  })

  const handleReject = (clubId: string) => {
    declineClubInvitation({ variables: { clubId, userId: thisUserData?.getUser?.id } })
  };

  const handleListChange = (showRequestsFlag: boolean) => {
    setShowRequests(showRequestsFlag);
    setSelectedClub(null);
  };

  // const showProfileInfo = (friendSelected != "") && (!featureFlags.privateProfilesEnabled || (!userData?.getUser.isPrivate || !showRequests));

  const createClub = () => {
    navigate('/app/create/club');
  }

  return (
  <div className="profile-page-clubs-container">

    {/* Tabs */}
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

    <div>
      {!showRequests ? (
        <button onClick={createClub} className="create-club-button">
          Create a Club +
        </button>
      ) : (
        <></>
      )}
    </div>


    <div className="profile-page-flex-container">
      <div className="profile-page-club-list">
        {clubsLoading ? (
          <p className="clubs-small-text">Loading...</p>
        ) : showRequests ? (
          <>
            {clubsData.getClubs.some((club: { requestedMembers: { username: string }[] }) => club.requestedMembers.some(user => user.username === username)) ? (
                clubsData.getClubs.map((club: { id: string, name: string, requestedMembers: { username: string }[] }) => {
                  const isInvited = club.requestedMembers.some(user => user.username === username);

                  if (!isInvited) {
                    return null;
                  }

                  return (
                    <div key={club.id} className="profile-page-club-list-item">
                      <span className="club-name"><b>{club.name}</b></span>
                      <div className="profile-page-friend-request-button-container">
                        <button
                          className="profile-page-friend-request-reject-button"
                          onClick={() => handleReject(club.id)}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                        <button
                          className="profile-page-friend-request-accept-button"
                          onClick={() => handleAccept(club.id)}
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                      </div>
                    </div>
                  )
                })
            ) : (
              <p className="clubs-small-text">No club requests at this time.</p>
            )}
          </>
        ) : (
          clubsData?.getClubs.length > 0 ? (
            <div className = "clubs-list-grid-container">
              {clubsData.getClubs.map((club: { id: string; name: string; owners: { username: string }[], admins: { username: string }[], members: { username: string }[] }) => {
                const isOwner = club.owners.some(user => user.username === username);
                const isAdmin = club.admins.some(user => user.username === username);
                const isMember = club.members.some(user => user.username === username);

                let userRole: 'Owner' | 'Admin' | 'Member' | null = null;

                if (isOwner) {
                  userRole = 'Owner';
                }
                else if (isAdmin) {
                  userRole = 'Admin';
                }
                else if (isMember) {
                  userRole = 'Member';
                }

                if (!userRole) {
                  return null;
                }

                return (
                  <div key={club.id} className="profile-page-club-list-item">
                    <span className="club-name"><b>{club.name}</b></span>
                    <span className={`club-position club-${userRole.toLowerCase()}`}><b>{userRole}</b></span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="clubs-small-text">No clubs at this time.</p>
          )
        )}
      </div>
    </div>
  </div>

  );
};

export default ClubList;
