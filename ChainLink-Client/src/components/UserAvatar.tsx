import React, { useEffect, useState, useRef } from 'react';
import AWS from 'aws-sdk';
import Avatar from 'react-avatar';

interface UserAvatarProps {
  username: string | undefined;
  hasProfileImage: boolean | undefined;
  useLarge?: boolean | undefined;
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
  useLarge
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const cacheRef = useRef<{ [key: string]: { url: string, expiry: number } }>({});

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (hasProfileImage && username) {
        const cacheKey = `profile-pictures/${username}`;
        const cachedData = cacheRef.current[cacheKey] || JSON.parse(localStorage.getItem(cacheKey) || 'null');

        if (cachedData && cachedData.expiry > Date.now()) {
          //console.log('Using cached presigned URL:', cachedData);
          setImageUrl(cachedData.url);
        } else {
          const presignedUrl = await generatePresignedUrl(cacheKey);
          const expiry = Date.now() + 55 * 60 * 1000; // 55 minutes from now
          const newCacheData = { url: presignedUrl, expiry };
          cacheRef.current[cacheKey] = newCacheData;
          localStorage.setItem(cacheKey, JSON.stringify(newCacheData));
          //console.log('Fetched new presigned URL:', newCacheData);
          setImageUrl(presignedUrl);
        }
      }
    };
    fetchImageUrl();
  }, [hasProfileImage, username]);

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