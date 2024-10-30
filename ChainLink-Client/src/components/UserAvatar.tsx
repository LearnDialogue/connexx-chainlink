import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import Avatar from 'react-avatar';

interface UserAvatarProps {
	username: string | undefined;
	hasProfileImage: boolean | undefined;
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
}) => {
	const [imageUrl, setImageUrl] = useState<string | null>(null);

	useEffect(() => {
		const fetchImageUrl = async () => {
			if (hasProfileImage && username) {
				const presignedUrl = await generatePresignedUrl(`profile-pictures/${username}`);
				setImageUrl(presignedUrl);
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
				size='50'
			/>
		</div>
	);
};

export default UserAvatar