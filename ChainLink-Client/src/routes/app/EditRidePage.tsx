import { useContext, useEffect, useState } from 'react';
import Button from '../../components/Button';
import Navbar from '../../components/Navbar';
import '../../styles/create-ride.css';
import { gql, useMutation, useQuery } from '@apollo/client';
import { extractRouteInfo } from '../../util/GpxHandler';
import { AuthContext } from '../../context/auth';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

export interface RideFeedCardProps {
  _id: string;
  host: string;
  name: string;
  startTime: string;
  description: string;
  bikeType: string[];
  difficulty: string;
  wattsPerKilo: number;
  intensity: string;
  route: string;
  match: string;
  participants: string[];
}

const EditRide = () => {
  const location = useLocation();
  const { event } = location.state;

  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [deleteWarningModal, setShowDeleteWarningModal] =
    useState<boolean>(false);

  const [rideName, setRideName] = useState<string>('');
  const [rideDate, setRideDate] = useState<string>('');
  const [rideTime, setRideTime] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [bikeType, setBikeType] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');
  const [rideAverageSpeed, setRideAverageSpeed] = useState<string>('');
  const [fileName, setFileName] = useState('');

  const [values, setValues] = useState({
    // Event
    host: context.user?.username,
    name: '',
    startTime: '',
    description: '',
    bikeType: [''],
    difficulty: '',
    wattsPerKilo: 0,
    intensity: 'n/a',
    eventID: '',

    // Route
    points: [[0, 0]],
    elevation: [0],
    grade: [0],
    terrain: [''],
    distance: 0,
    maxElevation: 0.0,
    minElevation: 0.0,
    totalElevationGain: 0.0,
    startCoordinates: [0, 0],
    endCoordinates: [0, 0],
  });

  const { data: routeData, refetch: refetchRoute } = useQuery(FETCH_ROUTE, {
    variables: {
      routeID: event.route,
    },
  });

  useEffect(() => {
    const startDate = new Date(event.startTime);
    const date = startDate.toISOString().split('T')[0];
    const hours = startDate.getHours();
    const minutes = startDate.getMinutes();
    const formattedTime = `${hours < 10 ? '0' + hours : hours}:${
      minutes < 10 ? '0' + minutes : minutes
    }`;

    setRideName(event.name);
    setRideTime(formattedTime);
    setDesc(event.description);
    setBikeType(event.bikeType);
    setDifficulty(event.difficulty);
    setRideDate(date);

    setValues((prevValues) => ({
      ...prevValues,
      name: event.name,
      startTime: event.startTime,
      description: event.description,
      difficulty: event.difficulty,
      bikeType: event.bikeType,
      eventID: event._id,
    }));
  }, []);

  useEffect(() => {
    if (routeData) {
      setValues((prevValues) => ({
        ...prevValues,
        points: routeData.getRoute.points,
        elevation: routeData.getRoute.elevation,
        distance: routeData.getRoute.distance,
        maxElevation: routeData.getRoute.maxElevation,
        minElevation: routeData.getRoute.minElevation,
        totalElevationGain: routeData.getRoute.totalElevationGain,
        startCoordinates: routeData.getRoute.startCoordinates,
        endCoordinates: routeData.getRoute.endCoordinates,
      }));
    }
  }, [routeData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      name: e.target.value,
    }));
    setRideName(e.target.value);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      description: e.target.value,
    }));
    setDesc(e.target.value);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, id } = event.target;
    let newBikes: string[] = [...bikeType];

    if (checked && !newBikes.includes(name)) {
      newBikes.push(name);
      setBikeType(newBikes);
    } else if (!checked && newBikes.includes(name)) {
      newBikes = newBikes.filter((item) => item !== name);
      setBikeType(newBikes);
    }
    setValues((prevValues) => ({
      ...prevValues,
      bikeType: newBikes,
    }));
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      difficulty: e.target.value,
    }));
    setDifficulty(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRideDate(e.target.value);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRideTime(e.target.value);
  };

  function refreshDate() {
    if (rideDate && rideTime) {
      const mergedDate: string = `${rideDate}T${rideTime}:00.000`;
      const dateString: string = new Date(mergedDate).toISOString();

      setValues((prevValues) => ({
        ...prevValues,
        startTime: dateString,
      }));
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        try {
          const routeInfo = await extractRouteInfo(file);
          setValues((prevValues) => ({
            ...prevValues,
            points: routeInfo.points,
            elevation: routeInfo.elevation,
            distance: routeInfo.distance,
            maxElevation: routeInfo.max_elevation,
            minElevation: routeInfo.min_elevation,
            totalElevationGain: routeInfo.total_elevation_gain,
            startCoordinates: routeInfo.startCoordinates,
            endCoordinates: routeInfo.endCoordinates,
          }));
        } catch (error) {
          console.error('Error parsing GPX:', error);
        }
      }
    } catch (error) {
      console.error('Error loading GPX file:', error);
    }
  };

  const calculateBounds = () => {
    if (values.points.length <= 0) return null;

    const points = values.points;
    const latitudes = points.map((point: any[]) => point[0]);
    const longitudes = points.map((point: any[]) => point[1]);

    const southWest = [Math.min(...latitudes), Math.min(...longitudes)];
    const northEast = [Math.max(...latitudes), Math.max(...longitudes)];

    return [southWest, northEast];
  };

  const rideMap = () => {
    const bounds = calculateBounds();
    const mapKey = JSON.stringify({ bounds, center: values.startCoordinates });

    return (
      <MapContainer
        key={mapKey}
        style={{ height: '400px', width: '100%', minWidth: '250px', zIndex: 1 }}
        bounds={bounds as L.LatLngBoundsExpression}
        center={values.startCoordinates as LatLngExpression}
        dragging={true}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        touchZoom={true}
        boxZoom={true}
        tap={true}
      >
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        {values.points.length > 1 && (
          <Polyline
            pathOptions={{ fillColor: 'red', color: 'blue' }}
            positions={values.points as LatLngExpression[]}
          />
        )}
        {values.startCoordinates?.length > 0 && (
          <Marker position={values.startCoordinates as LatLngExpression}>
            <Popup>Start Point</Popup>
          </Marker>
        )}
        {values.endCoordinates?.length > 0 && (
          <Marker position={values.endCoordinates as LatLngExpression}>
            <Popup>End Point</Popup>
          </Marker>
        )}
      </MapContainer>
    );
  };

  const handleButtonClick = () => {
    editEvent();
    editNotify(); // Call notify function here

    // Adding 2 second delay before redirecting to the profile page
    setTimeout(() => {
      window.history.back();
    }, 1500);
  };

  const handleDeleteButtonClick = () => {
    // showDeleteWarningModal
    setShowDeleteWarningModal(true);
  };

  const deleteRideConfirm = () => {
    deleteEvent();
    deleteNotify(); // Call notify function here

    setShowDeleteWarningModal(false);

    // Adding 2 second delay before redirecting to the profile page
    setTimeout(() => {
      window.history.back();
    }, 1500);
  };

  const token: string | null = localStorage.getItem('jwtToken');

  const [editEvent, { loading, data: editData }] = useMutation(
    EDIT_EVENT_MUTATION,
    {
      onError(err) {
        setErrors(err.graphQLErrors);
        const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
          ?.errors;
        const errorMessage = Object.values(errorObject).flat().join(', ');
        setErrors(errorMessage);
      },
      onCompleted() {
        refetchRoute();
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      variables: values,
    }
  );

  const [deleteEvent, { loading: deleteLoading }] = useMutation(
    DELETE_EVENT_MUTATION,
    {
      onError(err) {
        setErrors(err.graphQLErrors);
        const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
          ?.errors;
        const errorMessage = Object.values(errorObject).flat().join(', ');
        setErrors(errorMessage);
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      variables: {
        eventID: event._id,
      },
    }
  );

  useEffect(() => {
    refreshDate();
  }, [rideDate, rideTime]);

  const toastStyle = {
    background: 'lightgreen', // Change background color to light green
    color: 'black', // Change text color
  };

  // Custom toast container style
  const toastContainerStyle = {
    width: 'auto', // Adjust width as needed
    textAlign: 'center', // Center the toast
  };
  const editNotify = () => toast('Ride Edited!');
  const deleteNotify = () => toast('Ride Deleted!');

  const enableButton = () => {
    return (
      rideName != '' &&
      rideDate != '' &&
      rideTime != '' &&
      bikeType.length !== 0 &&
      difficulty != ''
    );
  };

  return (
    <>
      {deleteWarningModal ? (
        <div className='delete-ride-modal'>
          <div className='delete-ride-modal-container'>
            <h2 style={{ textAlign: 'center' }}>
              Are you sure you want to delete this ride?
            </h2>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                marginTop: 24,
              }}
            >
              <Button
                color='red'
                onClick={() => deleteRideConfirm()}
                width={40}
                type='primary'
              >
                Delete ride
              </Button>
              <Button
                onClick={() => setShowDeleteWarningModal(false)}
                width={40}
                type='secondary'
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Navbar />
      <div className='create-ride-main-container'>
        <div className='create-ride-form-container'>
          <div
            className='edit-ride-back-btn'
            onClick={() => window.history.back()}
          >
            <i className='fa-solid fa-arrow-left'></i>
            <span>Back</span>
          </div>

          <h2>Edit Ride</h2>

          <div className='create-ride-form-input'>
            <label htmlFor='ride-name'>Ride name</label>
            <input
              id='ride-name'
              onChange={handleNameChange}
              type='text'
              value={rideName}
            />
          </div>

          <div className='create-ride-form-input'>
            <label htmlFor='ride-date'>Date</label>
            <input
              id='ride-date'
              onChange={handleDateChange}
              type='date'
              value={rideDate}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className='create-ride-form-input'>
            <label htmlFor='ride-start-time'>Start time</label>
            <input
              id='ride-start-time'
              onChange={handleTimeChange}
              type='time'
              value={rideTime}
            />
          </div>

          <div className='create-ride-form-input'>
            <label htmlFor='ride-difficulty'>Watts/kg</label>
            <select
              id='ride-difficulty'
              value={difficulty}
              onChange={handleDifficultyChange}
            >
              <option value='' disabled>
                -- Select difficulty --
              </option>
              <option value='Above 4.5'>Above 4.5</option>
              <option value='4.1 to 4.5'>4.1 to 4.5</option>
              <option value='3.8 to 4.1'>3.8 to 4.1</option>
              <option value='3.5 to 3.8'>3.5 to 3.8</option>
              <option value='3.2 to 3.5'>3.2 to 3.5</option>
              <option value='2.9 to 3.2'>2.9 to 3.2</option>
              <option value='2.6 to 2.9'>2.6 to 2.9</option>
              <option value='2.3 to 2.6'>2.3 to 2.6</option>
              <option value='2.0 to 2.3'>2.0 to 2.3</option>
              <option value='Below 2.0'>Below 2.0</option>
            </select>
          </div>

          <div className='rides-feed-filter-options'>
            <h5>Bike type</h5>
            <label htmlFor='mountain-bike'>
              <input
                name='Mountain'
                checked={bikeType.includes('Mountain')}
                onChange={handleCheckboxChange}
                type='checkbox'
              />{' '}
              Mountain
            </label>
            <label htmlFor='road-bike'>
              <input
                name='Road'
                checked={bikeType.includes('Road')}
                onChange={handleCheckboxChange}
                type='checkbox'
              />{' '}
              Road
            </label>
            <label htmlFor='hybrid-bike'>
              <input
                name='Hybrid'
                checked={bikeType.includes('Hybrid')}
                onChange={handleCheckboxChange}
                type='checkbox'
              />{' '}
              Hybrid
            </label>
            <label htmlFor='touring-bike'>
              <input
                name='Touring'
                checked={bikeType.includes('Touring')}
                onChange={handleCheckboxChange}
                type='checkbox'
              />{' '}
              Touring
            </label>
            <label htmlFor='gravel-bike'>
              <input
                name='Gravel'
                checked={bikeType.includes('Gravel')}
                onChange={handleCheckboxChange}
                type='checkbox'
              />{' '}
              Gravel
            </label>
          </div>

          <div className='create-ride-form-input'>
            <label htmlFor='ride-description'>Description</label>
            <textarea
              placeholder='Enter details such as number of stops, rules,'
              id='ride-name'
              onChange={handleDescChange}
              value={desc}
            />
          </div>

          <div className='create-ride-form-input'>
            <div className='input-file-container'>
              <label htmlFor='input-gpx-file'>
                {fileName ? (
                  fileName
                ) : (
                  <>
                    <i className='fa-solid fa-arrow-up-from-bracket'></i>
                    <span>Press to upload a GPX file</span>
                  </>
                )}
              </label>
              <input
                id='input-gpx-file'
                type='file'
                onChange={handleFileSelect}
                accept='.gpx'
              />
            </div>
          </div>

          {values.points.length > 1 && (
            <div className='create-ride-form-input'>
              <label htmlFor='ride-map'>Map</label>

              <div>{rideMap()}</div>
            </div>
          )}
          <Button
            marginTop={24}
            disabled={!enableButton()}
            onClick={handleButtonClick}
            type='primary'
          >
            Edit ride
          </Button>
          <Button
            onClick={handleDeleteButtonClick}
            type='warning'
            marginTop={10}
          >
            Delete ride
          </Button>
          <ToastContainer toastStyle={toastStyle} autoClose={1000} />
        </div>
      </div>
    </>
  );
};

const EDIT_EVENT_MUTATION = gql`
  mutation editEvent(
    $name: String!
    $startTime: Date!
    $description: String!
    $bikeType: [String!]
    $difficulty: String!
    $wattsPerKilo: Float!
    $intensity: String!
    $points: [[Float]]!
    $elevation: [Float]!
    $grade: [Float]!
    $terrain: [String]!
    $distance: Float!
    $maxElevation: Float!
    $minElevation: Float!
    $totalElevationGain: Float!
    $startCoordinates: [Float]!
    $endCoordinates: [Float]!
    $eventID: String!
  ) {
    editEvent(
      editEventInput: {
        name: $name
        startTime: $startTime
        description: $description
        bikeType: $bikeType
        difficulty: $difficulty
        wattsPerKilo: $wattsPerKilo
        intensity: $intensity
        points: $points
        elevation: $elevation
        grade: $grade
        terrain: $terrain
        distance: $distance
        maxElevation: $maxElevation
        minElevation: $minElevation
        totalElevationGain: $totalElevationGain
        startCoordinates: $startCoordinates
        endCoordinates: $endCoordinates
        eventID: $eventID
      }
    ) {
      _id
      name
      bikeType
      route
    }
  }
`;

const FETCH_ROUTE = gql`
  query getRoute($routeID: String!) {
    getRoute(routeID: $routeID) {
      points
      elevation
      grade
      terrain
      distance
      maxElevation
      minElevation
      totalElevationGain
      startCoordinates
      endCoordinates
    }
  }
`;

const DELETE_EVENT_MUTATION = gql`
  mutation deleteEvent($eventID: String!) {
    deleteEvent(eventID: $eventID) {
      username
    }
  }
`;

export default EditRide;
