import React, { useEffect, useState, useRef } from 'react';
import AWS from 'aws-sdk';
import Avatar from 'react-avatar';
import featureFlags from '../featureFlags';
import { useQuery } from '@apollo/client';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';

interface UserAvatarProps {
  username: string | undefined;
  // This is tech debt for the next team. Sorry. If you know ahead of time that a user has a profile image, you can pass this prop to skip the query.
  // Otherwise, the component will query the user to determine if they have a profile image, then cache the result of that
  hasProfileImage?: boolean | undefined;
  useLarge?: boolean | undefined;
  showImage?: boolean; // used for disabling image for private users
}

const s3 = new AWS.S3({
  region: import.meta.env.VITE_AWS_REGION,
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET,
  apiVersion: '2006-03-01',
  params: { Bucket: import.meta.env.VITE_AWS_BUCKET_NAME }
});

const generatePresignedUrl = async (key: string) => {
  const params = {
    Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
    Key: key,
    Expires: 60 * 60, // URL expires in 1 hour
  };
  return s3.getSignedUrlPromise('getObject', params);
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  hasProfileImage,
  useLarge,
  showImage = false
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [skipQuery, setSkipQuery] = useState<boolean>(true);
  const cacheRef = useRef<{ [key: string]: { url: string, expiry: number } }>({});

  const nodeEnv = import.meta.env.MODE;

  useEffect(() => {
    const checkCache = () => {
      if (username) {
        const cacheKey = `profile-pictures/${nodeEnv}/${username}`;
        const cachedData = cacheRef.current[cacheKey] || JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (cachedData && cachedData.expiry > Date.now()) {
          setImageUrl(cachedData.url);
          setSkipQuery(true); // Skip the query if cache is valid
        } else {
          setSkipQuery(false); // Do not skip the query if cache is invalid
        }
      }
    };
    checkCache();
  }, [username]);

  const { data: userQueryData, loading, error } = useQuery(FETCH_USER_BY_NAME, { 
    variables: { username },
    skip: skipQuery || (hasProfileImage !== null && hasProfileImage !== undefined) // Skip if cache is valid or hasProfileImage is provided
  });

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (username) {
        const cacheKey = `profile-pictures/${nodeEnv}/${username}`;
        const cachedData = cacheRef.current[cacheKey] || JSON.parse(localStorage.getItem(cacheKey) || 'null');

        if (cachedData && cachedData.expiry > Date.now()) {
          setImageUrl(cachedData.url);
        } else {
          let profileImageStatus = hasProfileImage;
          if (profileImageStatus === null || profileImageStatus === undefined) {
            if (userQueryData) {
              profileImageStatus = userQueryData.getUser.hasProfileImage;
            } else {
              return; // Exit early if userQueryData is not available
            }
          }

          const expiry = Date.now() + 55 * 60 * 1000; // 55 minutes from now
          let url = '';
          if (profileImageStatus) {
            url = await generatePresignedUrl(cacheKey);
          }
          const newCacheData = { url: url, expiry: expiry };
          cacheRef.current[cacheKey] = newCacheData;
          localStorage.setItem(cacheKey, JSON.stringify(newCacheData));
          setImageUrl(url);
        }
      }
    };

    if (featureFlags.profilePicturesEnabled && showImage) {
      fetchImageUrl();
    }
  }, [hasProfileImage, username, userQueryData]);

  return (
    <div>
      <Avatar 
        src={imageUrl ? imageUrl : ""} 
        round={true} 
        name={username}
        size={useLarge ? '100' : '50'} 
      />
    </div>
  ); 
};

export default UserAvatar;