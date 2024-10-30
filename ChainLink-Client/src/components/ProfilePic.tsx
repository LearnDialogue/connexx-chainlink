import { useEffect, useContext, useState, ChangeEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import AWS from 'aws-sdk';
import { UPDATE_PROFILE_IMAGE } from '../graphql/mutations/userMutations';
import { AuthContext } from '../context/auth';
import { Link } from 'react-router-dom';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import Button from '../components/Button';

const getUserAge = (dateStr: string): string => {
    const date = new Date(dateStr);
    return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
  };

AWS.config.update({
    region: import.meta.env.VITE_AWS_REGION,
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET,
  })
  
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: import.meta.env.VITE_AWS_BUCKET_NAME },
  })

const ProfilePic = () => {
    const { user } = useContext(AuthContext);
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [updateProfileImage] = useMutation(UPDATE_PROFILE_IMAGE);
  
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => { 
      if (event.target.files) {
        setFile(event.target.files[0]);
      }
    }
  
    const generatePresignedUrl = async (key: string) => {
      const params = {
        Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
        Key: key,
        Expires: 60 * 60, // URL expires in 1 hour
      };
      return s3.getSignedUrlPromise('getObject', params);
    };
  
    useEffect(() => {
      const handleUpload = async() => {
        if (!file) {
          return;
        }
  
        const params = {
          Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
          Key: `profile-pictures/${user?.username}`,
          Body: file
        };
  
        const data = await s3.upload(params).promise();
        const presignedUrl = await generatePresignedUrl(params.Key);
        setImageUrl(presignedUrl); 
        await updateProfileImage({
          variables: {
            updateProfileImageInput: {
              username: user?.username,
              hasProfileImage: true
            },
          },
        });
      }
  
      if (file) {
        handleUpload();
      }
  
    }, [file]);
  
    const {
        loading: userLoading,
        error,
        data: userData,
      } = useQuery(FETCH_USER_BY_NAME, {
        variables: {
          username: user?.username,
        },
      });
  
    useEffect(() => {
      const fetchImageUrl = async () => {
          if (userData && userData.getUser.hasProfileImage) {
            const presignedUrl = await generatePresignedUrl(`profile-pictures/${user?.username}`);
            setImageUrl(presignedUrl);
          }
        };
  
  
        if (userData) {
          fetchImageUrl();
        }
  
      }, [userData]
    );

    return (
        <div className='user-name-and-image-container'>
            <div className='user-image'>
              { 
                imageUrl
                ? <img src={imageUrl} /> 
                : user?.username.slice(0, 1).toLocaleUpperCase()
              }
              <input
                type='file'
                id='file-upload'
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept='image/*'
              />
              <label htmlFor='file-upload' className='upload-label'>
                <i className='fa-solid fa-image-portrait'></i>
                <span>Upload a picture</span>
              </label>
            </div>

            <div className='user-name'>
              <div style={{ textAlign: 'center' }}>
                <span>
                  {userData
                    ? userData?.getUser.firstName +
                      ', ' +
                      getUserAge(userData.getUser.birthday)
                    : null}
                </span>{' '}
                <br />
                <b>
                  {userData ? user?.username : null}
                  {userData?.getUser.isPrivate && (
                    <span className='private-profile-badge'>
                      <i className='fa-solid fa-lock'></i>
                    </span>
                  )}
                </b>
              </div>
            </div>

            <div className='profile-page-edit-profile-btn'>
              <Link to='/app/profile/edit'>
                <Button type='secondary'>
                  <i className='fa-solid fa-pen'></i> &nbsp; &nbsp; Edit Profile
                </Button>
              </Link>
            </div>
          </div>
    );
};

export default ProfilePic;
            
                