import { useEffect, useContext, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { FETCH_USER_BY_NAME } from '../../graphql/queries/userQueries';
import { GET_HOSTED_EVENTS, GET_JOINED_EVENTS } from '../../graphql/queries/eventQueries';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import EventModal from '../../components/EventModal';
import FriendList from '../../components/FriendList';
import Footer from '../../components/Footer';
import '../../styles/profile-page.css';
import AWS from 'aws-sdk';
import { UPLOAD_PROFILE_PICTURE, UPDATE_PROFILE_PICTURE  } from '../../graphql/mutations/userMutations';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  return formatter.format(date);
};

const getUserAge = (dateStr: string): string => {
  const date = new Date(dateStr);
  return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
};

// AWS.config.update({
//   region: import.meta.env.VITE_AWS_REGION,
//   accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
//   secretAccessKey: import.meta.env.VITE_AWS_SECRET,
// })

// const s3 = new AWS.S3({
//   apiVersion: '2006-03-01',
//   params: { Bucket: import.meta.env.VITE_AWS_BUCKET_NAME },
// })

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState<any | null>(null);
  const [currDate, setCurrDate] = useState<Date>(new Date());
  const [showRequests, setShowRequest] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [updateProfileImage] = useMutation(UPDATE_PROFILE_PICTURE);
  const [uploadProfilePicture] = useMutation(UPLOAD_PROFILE_PICTURE);

  const handleModalClose = (nullEvent: any | null) => {
    setEvent(nullEvent);
  };

  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => { 
  //   console.log("hit change func");
  //   if (event.target.files) {
  //     //console.log("hit branch");
  //     console.log("event.target.files[0]: ", event.target.files[0]);
  //     setFile(event.target.files[0]);
  //   }
  // }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setFile(file);
  
      setUploading(true);
      setMessage('');
      console.log("file: ", file);  
      try {
        const { data } = await uploadProfilePicture({ variables: { file } });
        const imageUrl = data.uploadProfilePicture;
        setImageUrl(imageUrl);
        setMessage('File uploaded successfully');
  
        await updateProfileImage({
          variables: {
            updateProfileImageInput: {
              username: user?.username,
              hasProfileImage: true,
            },
          },
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessage('Error uploading file');
      } finally {
        setUploading(false);
      }
    }
  };
  // const generatePresignedUrl = async (key: string) => {
  //   const params = {
  //     Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
  //     Key: key,
  //     Expires: 60 * 60, // URL expires in 1 hour
  //   };
  //   return s3.getSignedUrlPromise('getObject', params);
  // };

  // useEffect(() => {
  //   const handleUpload = async() => {
  //     console.log("file", file);  
  //     if (!file) {
  //       console.log("Please select a file to upload.");
  //       setMessage('Please select a file to upload.');
  //       return;
  //     }

  //     setUploading(true);
  //     setMessage('');

  //     console.log("bucket name: ", import.meta.env.VITE_AWS_BUCKET_NAME);
  //     const params = {
  //       Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
  //       Key: `profile-pictures/${user?.username}`,
  //       Body: file
  //     };

  //     try {
  //       const data = await s3.upload(params).promise();
  //       console.log("File uploaded successfully: ", data.Location);
  //       setMessage(`File uploaded successfully: ${data.Location}`);
  //       const presignedUrl = await generatePresignedUrl(params.Key);
  //       setImageUrl(presignedUrl); 
  //       await updateProfileImage({
  //         variables: {
  //           updateProfileImageInput: {
  //             username: user?.username,
  //             hasProfileImage: true
  //           },
  //         },
  //       });

  //     } catch (error) {
  //       console.log("Error uploading file: ", error);
  //       setMessage("Error uploading file");
  //       //setMessage(`Error uploading file: ${error.message}`);
  //     } finally {
  //       console.log("finally");
  //       setUploading(false);
  //     }
  //   }

  //   if (file) {
  //     handleUpload();
  //   }

  // }, [file]);

  const foreColor = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color-light');

  let username: string | null = null;
  if (user) {
    username = user.username;
  }
  const token: string | null = localStorage.getItem('jwtToken');

  const {
    loading: hostedLoading,
    data: hostedEvents,
    refetch: hostRefetch,
  } = useQuery(GET_HOSTED_EVENTS);

  const {
    loading: joinedLoading,
    data: joinedEvents,
    refetch: joinRefetch,
  } = useQuery(GET_JOINED_EVENTS);

  const {
    loading: userLoading,
    error,
    data: userData,
  } = useQuery(FETCH_USER_BY_NAME, {
    variables: {
      username: user?.username,
    },
  });

  // useEffect(() => {
  //   const fetchImageUrl = async () => {
  //       console.log("userData: ", userData);
  //       if (userData && userData.getUser.hasProfileImage) {
  //         const presignedUrl = await generatePresignedUrl(`profile-pictures/${user?.username}`);
  //         console.log("presignedUrl: ", presignedUrl);
  //         setImageUrl(presignedUrl);
  //       }
  //     };


  //     if (userData) {
  //       fetchImageUrl();
  //     }

  //   }, [userData]
  // );

  useEffect(() => {
    hostRefetch();
    joinRefetch();
  }, []);

  return (
    <div className='profile-page-main-container'>
      <Navbar />

      {event ? <EventModal event={event} setEvent={handleModalClose} /> : <></>}

      <div className='profile-page-grid'>
        <div className='profile-page-user-info'>
          <div className='user-name-and-image-container'>
            <div className='user-image'>
              {user?.username.slice(0, 1).toLocaleUpperCase()}
              <input
                type='file'
                id='file-upload'
                style={{ display: 'none' }}
                onChange={() => null}
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

          <div className='profile-page-user-stats-data'>
            <div>
              <div>FTP</div>
              <div>{userData?.getUser.FTP ?? '-'}</div>
            </div>
            <div>
              <div>Last FTP</div>
              <div>{userData?.getUser.FTPdate.slice(0, 10) ?? '-'}</div>
            </div>
            <div>
              <div>Weight</div>
              <div>{userData?.getUser.weight ?? '-'} kg</div>
            </div>
            <div>
              <div>Experience level</div>
              <div>{userData?.getUser.experience ?? '-'}</div>
            </div>
            <div>
              <div>Rides hosted</div>
              <div>
                {hostedEvents ? hostedEvents.getHostedEvents.length : 0}
              </div>
            </div>
            <div>
              <div>Rides joined</div>
              <div>
                {joinedEvents ? joinedEvents.getJoinedEvents.length : 0}
              </div>
            </div>
          </div>
        </div>

        <h3>Your upcoming rides</h3>
        <div className='profile-page-user-upcoming-rides'>
          <div className='profile-page-user-upcoming-rides-data'>
            <div className='profile-page-user-rides-hosted'>
              <h5>
                Rides you are hosting &nbsp; (
                {hostedEvents?.getHostedEvents.length ?? 0})
              </h5>
              <div>
                {hostedEvents && hostedEvents.getHostedEvents ? (
                  hostedEvents.getHostedEvents
                    .filter(
                      (event: any) => new Date(event.startTime) > currDate
                    )
                    .map((event: any, index: number) => (
                      <div
                        onClick={() => setEvent(event)}
                        className='profile-page-user-rides-list-item'
                        key={index}
                      >
                        <div className='ride-title'>
                          <span>
                            <b>{event.name}</b>
                          </span>
                          <span className='ride-date'>
                            {formatDate(event.startTime)}
                          </span>
                        </div>
                        <p className='ride-location'>
                          <i className='fa-solid fa-location-dot'></i>
                          {event.locationName}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className='profile-page-user-event-no-rides-text'>
                    No rides to show
                  </div>
                )}
              </div>
            </div>

            <div className='profile-page-user-rides-joined'>
              <h5>
                Rides you are joining &nbsp; (
                {joinedEvents?.getJoinedEvents.length ?? 0})
              </h5>
              <div>
                {joinedEvents && joinedEvents.getJoinedEvents ? (
                  joinedEvents.getJoinedEvents
                    .filter(
                      (event: any) => new Date(event.startTime) > currDate
                    )
                    .map((event: any, index: number) => (
                      <div
                        onClick={() => setEvent(event)}
                        className='profile-page-user-rides-list-item'
                        key={index}
                      >
                        <div className='ride-title'>
                          <span>
                            <b>{event.name}</b>
                          </span>
                          <span className='ride-date'>
                            {formatDate(event.startTime)}
                          </span>
                        </div>
                        <p className='ride-location'>
                          <i className='fa-solid fa-location-dot'></i>
                          {event.locationName}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className='profile-page-user-event-no-rides-text'>
                    No rides to show
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <h3>Your past rides</h3>
        <div className='profile-page-user-past-rides'>
          <div className='profile-page-user-past-rides-data'>
            <div className='profile-page-user-rides-hosted'>
              <h5>Rides you hosted &nbsp; (0)</h5>
              <div>
                {hostedEvents && hostedEvents.getHostedEvents ? (
                  hostedEvents.getHostedEvents
                    .filter(
                      (event: any) => new Date(event.startTime) < currDate
                    )
                    .map((event: any, index: number) => (
                      <div
                        onClick={() => setEvent(event)}
                        className='profile-page-user-rides-list-item'
                        key={index}
                      >
                        <div className='ride-title'>
                          <span>
                            <b>{event.name}</b>
                          </span>
                          <span className='ride-date'>
                            {formatDate(event.startTime)}
                          </span>
                        </div>
                        <p className='ride-location'>
                          <i className='fa-solid fa-location-dot'></i>
                          {event.locationName}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className='profile-page-user-event-no-rides-text'>
                    No rides to show
                  </div>
                )}
              </div>
            </div>

            <div className='profile-page-user-rides-joined'>
              <h5>Rides you joined &nbsp; (0)</h5>
              <div>
                {joinedEvents && joinedEvents.getJoinedEvents ? (
                  joinedEvents.getJoinedEvents
                    .filter(
                      (event: any) => new Date(event.startTime) < currDate
                    )
                    .map((event: any, index: number) => (
                      <div
                        onClick={() => setEvent(event)}
                        className='profile-page-user-rides-list-item'
                        key={index}
                      >
                        <div className='ride-title'>
                          <span>
                            <b>{event.name}</b>
                          </span>
                          <span className='ride-date'>
                            {formatDate(event.startTime)}
                          </span>
                        </div>
                        <p className='ride-location'>
                          <i className='fa-solid fa-location-dot'></i>
                          {event.locationName}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className='profile-page-user-event-no-rides-text'>
                    No rides to show
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <FriendList username={user?.username ?? null} />

      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;