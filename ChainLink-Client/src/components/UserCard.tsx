// FriendRequest.tsx
import React, { useState, useContext, useEffect } from "react";
import "../styles/components/user-card.css";
import { AuthContext } from "../context/auth";
import { FETCH_USER_BY_NAME } from "../graphql/queries/userQueries";
import UserAvatar from './UserAvatar';
import { useQuery } from "@apollo/client";

interface UserCardProps {
  username: string;
  hasProfileImage: boolean;
  size?: 'small' | 'large';
  showImage?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  username,
  hasProfileImage,
  showImage  = false
}) => {

    const { data: user } = useQuery(FETCH_USER_BY_NAME, {
        variables: { username },
    })

  return (
     <div className="user-card-container">
        <div className="user-card-avatar">
            <UserAvatar 
                username={username} 
                hasProfileImage={hasProfileImage}
                showImage={showImage}
            />
        </div>
        <div className="user-card-username">
            <h4>{username}</h4>
            {user?.getUser ? (
                <div>{user.getUser.firstName}</div>
            ) : (
                <div>User not found</div>
            )}
        </div>
    </div>
  );
};

export default UserCard;
