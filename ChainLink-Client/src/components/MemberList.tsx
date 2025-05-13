import React, { useState, useContext } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import InviteModal from './InviteModal';
import { AuthContext } from '../context/auth';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import {
  REQUEST_TO_JOIN,
  REJECT_MEMBER,
  ADD_ADMIN,
  REMOVE_MEMBER,
  REMOVE_ADMIN,
} from '../graphql/mutations/clubMutations';
import '../styles/components/member-list.css';
import '../styles/components/invite-modal.css';

interface MemberListProps {
  clubId: string;
  users: { id: string; username: string }[];
  owners: { id: string; username: string }[];
  admins: { id: string; username: string }[];
  requestedMembers?: { id: string; username: string }[];
  isAdminOrOwner: boolean;
  refetchClub: () => void;
}

const MemberList: React.FC<MemberListProps> = ({
  clubId,
  users,
  owners,
  admins,
  requestedMembers = [],
  isAdminOrOwner,
  refetchClub,
}) => {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);

  const [fetchUserByName] = useLazyQuery(FETCH_USER_BY_NAME);
  const [requestToJoin] = useMutation(REQUEST_TO_JOIN);
  const [rejectMember] = useMutation(REJECT_MEMBER);
  const [addAdmin] = useMutation(ADD_ADMIN);
  const [removeMember] = useMutation(REMOVE_MEMBER);
  const [removeAdmin] = useMutation(REMOVE_ADMIN);

  // Filter out any pending requests for users already in the club
  const pendingRequests = requestedMembers.filter(
    r => !users.some(u => u.id === r.id)
  );

  const getRole = (userId: string): 'Owner' | 'Admin' | 'Member' => {
    if (owners.some(o => o.id === userId)) return 'Owner';
    if (admins.some(a => a.id === userId)) return 'Admin';
    return 'Member';
  }; 

  const handleInvite = async (username: string) => {
    try {
      const { data } = await fetchUserByName({ variables: { username } });
      const usr = data?.getUser;
      if (!usr) return;
      await requestToJoin({ variables: { clubId, userId: usr.id } });
      setInviteOpen(false);
      refetchClub();
    } catch {
      // error handling
    }
  };

  const handlePromote = async (userId: string) => {
    await addAdmin({ variables: { clubId, userId } });
    refetchClub();
  };

  const handleDemote = async (userId: string) => {
    if (userId === currentUserId) return; // no self-demotion
    await removeAdmin({ variables: { clubId, userId } });
    refetchClub();
  };

  const handleRemove = async (userId: string) => {
    if (userId === currentUserId) return;
    if (admins.some(a => a.id === userId)) {
      await removeAdmin({ variables: { clubId, userId } });
    }
    await removeMember({ variables: { clubId, userId } });
    refetchClub();
  };

  // Self leave uses removeAdmin/removeMember to ensure correct schema
  const handleLeave = async (role: string) => {
    if (role === 'Owner' || !currentUserId) return;
    // demote if admin
    if (admins.some(a => a.id === currentUserId)) {
      await removeAdmin({ variables: { clubId, userId: currentUserId } });
    }
    await removeMember({ variables: { clubId, userId: currentUserId } });
    refetchClub();
    navigate('/app/profile');
  };

  return (
    <div className="member-list">
      {isAdminOrOwner && (
        <button
          className="invite-new-member"
          onClick={() => setInviteOpen(true)}
        >
          Invite New Member
        </button>
      )}
      {inviteOpen && (
        <InviteModal onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
      )}

      <div className="member-list-grid">
        {users.map(u => {
          const role = getRole(u.id);
          const isSelf = u.id === currentUserId;
          return (
            <div key={u.id} className="member-list-item">
              <div className="member-info">
                <UserAvatar username={u.username} />
                <span>{u.username}</span>
                <ul className="inline-list">
                  <li>{role}</li>
                </ul>
              </div>
              <div className="member-actions">
                {isAdminOrOwner && !isSelf && role !== 'Owner' && (
                  <>
                    {role === 'Member' ? (
                      <button onClick={() => handlePromote(u.id)}>Promote</button>
                    ) : (
                      <button onClick={() => handleDemote(u.id)}>Demote</button>
                    )}
                    <button onClick={() => handleRemove(u.id)}>Remove</button>
                  </>
                )}
                {isSelf && (
                  <>
                    <button
                      className="leave-button"
                      disabled={role === 'Owner'}
                      onClick={() => handleLeave(role)}
                    >
                      Leave Club
                    </button>
                    {role === 'Owner' && (
                      <span className="info-icon">
                        i
                        <span className="tooltip-text">
                          You must promote another member to owner before leaving.
                        </span>
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdminOrOwner && pendingRequests.length > 0 && (
        <div className="pending-list">
          {pendingRequests.map(u => (
            <div key={u.id} className="pending-member">
              <span>{u.username}</span>
              <button
                className="rescind-invite"
                onClick={async () => {
                  await rejectMember({ variables: { clubId, userId: u.id } });
                  refetchClub();
                }}
              >
                Rescind Invite
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberList;