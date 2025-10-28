import React, { useEffect, useState, useRef } from 'react';
import AWS from 'aws-sdk';
import Avatar from 'react-avatar';
import featureFlags from '../featureFlags';
import { useQuery } from '@apollo/client';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';

interface UserAvatarProps {
  username: string | undefined;
  hasProfileImage?: boolean | undefined;
  useLarge?: boolean | undefined;
  showImage?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  hasProfileImage,
  useLarge,
  showImage = true
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [skipQuery, setSkipQuery] = useState<boolean>(true);
  const cacheRef = useRef<{ [key: string]: { url: string, expiry: number } }>({});

  const nodeEnv = import.meta.env.MODE;

  const { data: userQueryData, loading, error } = useQuery(FETCH_USER_BY_NAME, { 
    variables: { username },
    skip: skipQuery || (hasProfileImage !== null && hasProfileImage !== undefined)
  });

  useEffect(() => {
    const loadProfilePicture = async () => {
      // reset imageUrl at the start for every change
      setImageUrl(null);
      
      if (hasProfileImage === false) {
        return;
      }
      if (hasProfileImage && username) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/profile-pic/${username}`,
            { credentials: 'include' }
          );
          
          if (response.ok) {
            const data = await response.json();
            const fullUrl = data.imageUrl.startsWith('http')
              ? data.imageUrl
              : `${import.meta.env.VITE_API_URL}${data.imageUrl}`;
            setImageUrl(fullUrl);
          } else {
            // If fetch fails, ensure imageUrl stays null
            setImageUrl(null);
          }
        } catch (error) {
          console.error('Error loading profile picture:', error);
          setImageUrl(null);
        }
      }
    };

    loadProfilePicture();
  }, [username, hasProfileImage]);

  return (
    <div>
      <Avatar 
        src={imageUrl && showImage ? imageUrl : undefined} 
        round={true} 
        name={username}
        size={useLarge ? '100' : '50'} 
      />
    </div>
  ); 
};

export default UserAvatar;