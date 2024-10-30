import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth";
import { useQuery } from "@apollo/client";
import { FETCH_USER_BY_NAME } from "../graphql/queries/userQueries";
import AWS from "aws-sdk";
import "../styles/components/profile-thumbnail.css"; // Create this CSS file

AWS.config.update({
  region: import.meta.env.VITE_AWS_REGION,
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET,
});

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: import.meta.env.VITE_AWS_BUCKET_NAME },
});

const ProfileThumbnail = () => {
  const { user } = useContext(AuthContext);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: userData } = useQuery(FETCH_USER_BY_NAME, {
    variables: { username: user?.username },
  });

  const generatePresignedUrl = async (key: string) => {
    const params = {
      Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
      Key: key,
      Expires: 60 * 60, // URL expires in 1 hour
    };
    return s3.getSignedUrlPromise("getObject", params);
  };

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (userData?.getUser.hasProfileImage) {
        const presignedUrl = await generatePresignedUrl(
          `profile-pictures/${user?.username}`
        );
        setImageUrl(presignedUrl);
      }
    };

    if (userData) {
      fetchImageUrl();
    }
  }, [userData]);

  return (
    <div className="profile-thumbnail">
      {imageUrl ? (
        <img src={imageUrl} alt={`${user?.username}'s profile`} />
      ) : (
        <div className="thumbnail-initial">
          {user?.username.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default ProfileThumbnail;

