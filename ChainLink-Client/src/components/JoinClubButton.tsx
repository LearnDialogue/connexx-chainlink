import React from 'react';
import { useMutation, gql } from '@apollo/client';

const JOIN_CLUB = gql`
  mutation JoinClub($clubId: ID!, $userId: ID!) {
    joinClub(clubId: $clubId, userId: $userId) {
      id
      members { id username }
    }
  }
`;

interface JoinClubButtonProps {
  clubId: string;
  isMember: boolean;
}

const JoinClubButton: React.FC<JoinClubButtonProps> = ({ clubId, isMember }) => {
  const [joinClub, { loading, error }] = useMutation(JOIN_CLUB, {
    variables: { clubId, userId: /* pull from AuthContext */ '' },
    refetchQueries: ['GetClub'],
  });

  if (isMember) return <button disabled>Member</button>;
  if (error)    return <button onClick={() => joinClub()}>Try Again</button>;

  return (
    <button onClick={() => joinClub()} disabled={loading}>
      {loading ? 'Joining…' : 'Join Club'}
    </button>
  );
};

export default JoinClubButton;
