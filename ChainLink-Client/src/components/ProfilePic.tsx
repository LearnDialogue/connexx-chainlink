import { useEffect, useContext, useState, ChangeEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { AuthContext } from '../context/auth';
import { Link } from 'react-router-dom';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import Button from '../components/Button';
import featureFlags from '../featureFlags';
import { toast } from 'react-toastify';
import { useApolloClient } from '@apollo/client';

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



const ProfilePic = () => {
    const { user} = useContext(AuthContext);
    const client = useApolloClient(); 
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
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
      
    const {
      loading: userLoading,
      error,
      data: userData, refetch
    } = useQuery(FETCH_USER_BY_NAME, {
      variables: {
        username: user?.username,
      },
    });

    useEffect(() => {
      const loadProfilePicture = async () => {
        if (userData?.getUser?.hasProfileImage && user?.username && !imageUrl) {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/profile-pic/${user.username}`,
              { credentials: 'include' }
            );
            
            if (response.ok) {
              const data = await response.json();
              const fullUrl = data.imageUrl.startsWith('http')
                ? data.imageUrl
                : `${import.meta.env.VITE_API_URL}${data.imageUrl}`;
              setImageUrl(fullUrl);
            }
          } catch (error) {
            console.error('Error loading profile picture:', error);
          }
        }
      };

      loadProfilePicture();
    }, [userData, user?.username]);
  
    const handleUpload = async () => {
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', user?.username || '');

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload-profile-pic`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status}`);
        }
        if (data.imageUrl) {
          const fullUrl = data.imageUrl.startsWith('http')
            ? data.imageUrl
            : `${import.meta.env.VITE_API_URL}${data.imageUrl}`;
          setImageUrl(`${fullUrl}?t=${Date.now()}`);        
          toast.success('Profile picture uploaded successfully!');
          window.location.reload();
        }
      } catch (err) {
        toast.error('Error uploading profile picture');
        console.error(err);
      }
    };


    useEffect(() => {
      if (featureFlags.profilePicturesEnabled && file) {
        handleUpload();
      }
    }, [file]);

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
            
                