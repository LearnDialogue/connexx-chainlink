import { useEffect, useContext, useState, ChangeEvent } from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import featureFlags from '../featureFlags';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import { GET_CLUB } from '../graphql/queries/clubQueries';
import { GET_CLUB_USER } from '../graphql/queries/clubQueries';
import '../styles/club-page.css';


interface ClubPictureProps {
  id?: string; // allow either prop OR URL param
  clubName: string;
  showUploadButton?: boolean;
}

const ClubPicture: React.FC<ClubPictureProps> = ({id, clubName, showUploadButton}) => {
  const { user } = useContext(AuthContext);
  const params = useParams<{ id: string }>();
  const clubId = id || params.id;
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // 1️⃣ Fetch club data to get clubUser
  const {
    loading: clubLoading,
    error: clubError,
    data: clubData,
    refetch: refetchClub,
  } = useQuery(GET_CLUB, {
    variables: { clubId },
    fetchPolicy: 'network-only',
  });

  const { loading, error, data } = useQuery(GET_CLUB_USER, {
    variables: { clubId: id },
    fetchPolicy: 'network-only',
  });

const clubUser = data?.getClubUser;
const clubUsername = clubUser?.username;

  // 3️⃣ Load profile picture from backend
  useEffect(() => {
    const loadProfilePicture = async () => {
      if (clubUsername && clubUser?.hasProfileImage && !imageUrl) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/profile-pic/${clubUsername}`,
            { credentials: 'include' }
          );
          if (res.ok) {
            const data = await res.json();
            const fullUrl = data.imageUrl.startsWith('http')
              ? data.imageUrl
              : `${import.meta.env.VITE_API_URL}${data.imageUrl}`;
            setImageUrl(fullUrl);
          }
        } catch (err) {
          console.error('Error loading club picture:', err);
        }
      }
    };

    loadProfilePicture();
  }, [clubUsername, clubUser]);

  // 4️⃣ Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
      } else {
        toast.error('Invalid file type. Please select an image file.');
      }
    }
  };

  // 5️⃣ Upload handler — uses clubUsername, not auth user
  const handleUpload = async () => {
    if (!file || !clubUsername) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', clubUsername);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload-profile-pic`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      if (data.imageUrl) {
        const fullUrl = data.imageUrl.startsWith('http')
          ? data.imageUrl
          : `${import.meta.env.VITE_API_URL}${data.imageUrl}`;
        setImageUrl(`${fullUrl}?t=${Date.now()}`);
        toast.success('Club picture uploaded successfully!');
        refetchClub();
      }
    } catch (err) {
      toast.error('Error uploading club picture');
      console.error(err);
    }
  };

  // Automatically upload when file is selected (if feature flag is on)
  useEffect(() => {
    if (featureFlags.profilePicturesEnabled && file) {
      handleUpload();
    }
  }, [file]);

  if (clubLoading) return <p>Loading club...</p>;

  return (
    <div className='user-name-and-image-container'>
      

        {showUploadButton ? 
        (
         <div className='user-image'>
        {imageUrl ? (
          <img src={imageUrl} alt={`${clubName} logo`} />
        ) : (
          <span className='placeholder-icon'>{clubName.slice(0, 1).toUpperCase()}</span>
        )}
          <input
            type='file'
            id='file-upload'
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept='image/*'
          />
          <label htmlFor='file-upload' className='upload-label'>
          <i className='fa-solid fa-image-portrait'></i>
          <span>Upload club picture</span>
          </label>
          </div>
        ) : 
         <div className='user-image'>
        {imageUrl ? (
          <img src={imageUrl} alt={`${clubName} logo`} />
        ) : (
          <span className='placeholder-icon'>{clubName.slice(0, 1).toUpperCase()}</span>
        )}
        </div>
        } 
      </div>
  );
};

export default ClubPicture;
