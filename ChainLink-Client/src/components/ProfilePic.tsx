import { useEffect, useContext, useState, ChangeEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import AWS from 'aws-sdk';
import { UPDATE_PROFILE_IMAGE } from '../graphql/mutations/userMutations';
import { AuthContext } from '../context/auth';
import { Link } from 'react-router-dom';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import Button from '../components/Button';
import featureFlags from '../featureFlags';
import { toast } from 'react-toastify';
import { current } from '@reduxjs/toolkit';

const getUserAge = (dateStr: string): string => {
    const birthdate = new Date(dateStr);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthdate.getFullYear();
    if (
      currentDate.getMonth() < birthdate.getMonth() ||
      (currentDate.getMonth() === birthdate.getMonth() &&
        currentDate.getDate() < birthdate.getDate())
    ) {
      return (age - 1).toString();
    }else{
      return age.toString();
    }
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
    const nodeEnv = import.meta.env.MODE;
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => { 
      if (event.target.files) {
        const selectedFile = event.target.files[0];
        if (selectedFile.type.startsWith('image/')) {
          setFile(selectedFile);
        } else {
          toast.error("Invalid file type. Please select an image file.");
        }
        
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
  
      
    const {
      loading: userLoading,
      error,
      data: userData,
    } = useQuery(FETCH_USER_BY_NAME, {
      variables: {
        username: user?.username,
      },
    });
  

    if (featureFlags.profilePicturesEnabled) {
      useEffect(() => {
        const handleUpload = async() => {
          if (!file) {
            return;
          }
          
          const cacheKey = `profile-pictures/${nodeEnv}/${user?.username}`;
          const params = {
            Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
            Key: cacheKey,
            Body: file,
            CacheControl: 'public, max-age=3600',
          };
    
          const data = await s3.upload(params).promise();
          const presignedUrl = await generatePresignedUrl(params.Key);
          
          const expiry = Date.now() + 55 * 60 * 1000; // 55 minutes from now
          const newCacheData = { url: presignedUrl, expiry };
          localStorage.setItem(cacheKey, JSON.stringify(newCacheData));
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

      useEffect(() => {
        const fetchImageUrl = async () => {
          if (userData && userData.getUser.hasProfileImage) {
            const cacheKey = `profile-pictures/${nodeEnv}/${user?.username}`;
            const cachedData = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    
            if (cachedData && cachedData.expiry > Date.now()) {
              //console.log('Using cached presigned URL:', cachedData);
              setImageUrl(cachedData.url);
            } else {
              const presignedUrl = await generatePresignedUrl(cacheKey);
              const expiry = Date.now() + 55 * 60 * 1000; // 55 minutes from now
              const newCacheData = { url: presignedUrl, expiry };
              localStorage.setItem(cacheKey, JSON.stringify(newCacheData));
              //console.log('Fetched new presigned URL:', newCacheData);
              setImageUrl(presignedUrl);
            }
          }
        };
    
        if (userData) {
          fetchImageUrl();
        }
    
      }, [userData]);
    }

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
            
                