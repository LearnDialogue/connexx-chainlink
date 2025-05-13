import { useContext, useEffect, useState } from 'react';
import Button from '../../components/Button';
import '../../styles/create-club.css';
import { useMutation, useQuery } from '@apollo/client';
import { extractRouteInfo } from '../../util/GpxHandler';
import { AuthContext } from '../../context/auth';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LatLngExpression } from 'leaflet';
import Footer from '../../components/Footer';
import { FETCH_USER_BY_NAME } from '../../graphql/queries/userQueries';
import { CREATE_EVENT_MUTATION } from '../../graphql/mutations/eventMutations';
import { CREATE_CLUB } from '../../graphql/mutations/clubMutations';
import { JOIN_RIDE_MINIMAL } from '../../graphql/mutations/eventMutations';
import featureFlags from '../../featureFlags';

const CreateClub = () => {
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [rsvp, setRSVP] = useState(true);

  const [clubName, setClubName] = useState<string>('');
  const [clubDescription, setClubDescription] = useState<string>('');
  const [clubLocation, setClubLocation] = useState<string>('');
  const [clubCoords, setClubCoords] = useState([0, 0]);
  const [clubRadius, setClubRadius] = useState(0);
  const [clubMetric, setClubMetric] = useState(true);
  const [clubPrivate, setClubPrivate] = useState(false);

  const [values, setValues] = useState({
    name: '',
    description: '',
    locationName: '',
    locationCoords: [0, 0],
    radius: 0,
    metric: true,
    createdAt: new Date().toISOString(),
    owners: [context.user?.username],
    isPrivate: false
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      name: e.target.value,
    }));
    setClubName(e.target.value);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      description: e.target.value,
    }));
    setClubDescription(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      locationName: e.target.value,
    }));
    setClubLocation(e.target.value);
  };

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    setValues((prevValues) => ({
      ...prevValues,
      locationCoords: [lat, prevValues.locationCoords[1]]
    }));
    setClubCoords([lat, clubCoords[1]]);
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const long = parseFloat(e.target.value);
    setValues((prevValues) => ({
      ...prevValues,
      locationCoords: [prevValues.locationCoords[0], long]
    }));
    setClubCoords([clubCoords[0], long]);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setValues((prevValues) => ({
      ...prevValues,
      radius: value,
    }));
    setClubRadius(value);
  };

  const handleMetricChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      metric: event.target.checked,
    }));
    setClubMetric(event.target.checked);
  }
    
  const handlePrivateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      isPrivate: event.target.checked,
    }));
    setClubPrivate(event.target.checked);
  }

  const handleButtonClick = () => {
    createClub();
    notify(); // Call notify function here
  };

  const token: string | null = localStorage.getItem('jwtToken');

  const [createClub, { loading }] = useMutation(CREATE_CLUB, {
    onError(err) {
      // console.log(JSON.stringify(err.graphQLErrors, null, 2));
      setErrors(err.graphQLErrors);
      const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception?.errors;
      const errorMessage = Object.values(errorObject).flat().join(', ');
      setErrors(errorMessage);
    },
    onCompleted(data) {
      setTimeout(() => {
        // navigate to designated club page afterwards
        navigate('/app/profile');
      }, 1500);
    },
    variables: {
      clubInput: values
    },
  });

  const enableButton = () => {
    return (
      clubName != '' &&
      clubDescription != '' &&
      clubLocation != ''
    );
  };

  const toastStyle = {
    background: 'lightgreen', // Change background color to light green
    color: 'black', // Change text color
  };

  // Custom toast container style
  const toastContainerStyle = {
    width: 'auto', // Adjust width as needed
    textAlign: 'center', // Center the toast
  };
  const notify = () => toast('Club Created!');

  const {
    loading: userLoading,
    error,
    data: userData,
  } = useQuery(FETCH_USER_BY_NAME, {
    variables: {
      username: context?.user?.username,
    },
  });

  return (
    <>
      <div className='create-club-main-container'>
        <div className='create-club-form-container'>
          <h2>Create a club</h2>

          <div className='create-club-form-input'>
            <label htmlFor='club-name'>Club name</label>
            <input
              id='club-name'
              onChange={handleNameChange}
              type='text'
              value={clubName}
            />
          </div>

          <div className='create-club-form-input'>
            <label htmlFor='club-description'>Description</label>
            <textarea
              placeholder='Enter club details'
              id='club-description'
              onChange={handleDescChange}
              value={clubDescription}
            />
          </div>

          <div className='create-club-form-input' id='club-location'>
            <label htmlFor='club-location'>Club location</label>
            <input
              id='club-location'
              onChange={handleLocationChange}
              type='text'
              value={clubLocation}
            />
          </div>

          <div className="create-club-coordinates-container">
            <div className="create-club-form-input">
              <label htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                type="number"
                step="any"
                value={clubCoords[0]}
                onChange={(e) =>
                  handleLatitudeChange(e)
                }
              />
            </div>

            <div className="create-club-form-input">
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                type="number"
                step="any"
                value={clubCoords[1]}
                onChange={(e) =>
                  handleLongitudeChange(e)
                }
              />
            </div>

            <div className='create-club-form-input'>
              <label htmlFor='club-name'>Radius</label>
              <input
                id='club-name'
                type='number'
                value={clubRadius}
                onChange={(e) =>
                  handleRadiusChange(e)
                }
              />
            </div>
          </div>

          <div className='club-feed-filter-options'>
            <h5>Club metric</h5>
            <label htmlFor='private-club'>
                  <input
                    name='private-club'
                    onChange={handleMetricChange}
                    id='private-club'
                    type='checkbox'
                    checked={clubMetric}
                  />{' '}
                  Metric?
              </label>
          </div>

          <div className='club-feed-filter-options'>
            <h5>Members and Visibility:</h5>
            <label htmlFor='private-club'>
                  <input
                    name='private-club'
                    onChange={handlePrivateChange}
                    id='private-club'
                    type='checkbox'
                    checked={clubPrivate}
                  />{' '}
                  Private Club (Invite Only)
              </label>
          </div>

          <Button
            disabled={!enableButton()}
            onClick={handleButtonClick}
            type='primary'
          >
            Create club
          </Button>
          <ToastContainer toastStyle={toastStyle} autoClose={1000} />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default CreateClub;
