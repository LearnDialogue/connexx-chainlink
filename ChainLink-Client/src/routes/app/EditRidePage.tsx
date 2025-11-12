import { useContext, useEffect, useState } from 'react';
import Button from '../../components/Button';
import '../../styles/create-ride.css';
import { useMutation, useQuery } from '@apollo/client';
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
import { EDIT_EVENT, JOIN_RIDE_MINIMAL, LEAVE_RIDE } from '../../graphql/mutations/eventMutations';
import { FETCH_USER_BY_NAME } from "../../graphql/queries/userQueries";
import featureFlags from "../../featureFlags";
import { DELETE_EVENT } from '../../graphql/mutations/eventMutations';
import { FETCH_ROUTE } from '../../graphql/queries/eventQueries';
import MultirangedSlider from '../../components/MultirangedSlider';

export interface RideFeedCardProps {
  _id: string;
  host: string;
  name: string;
  startTime: string;
  description: string;
  bikeType: string[];
  difficulty: number[];
  wattsPerKilo: number[];
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
  const [difficulty, setDifficulty] = useState<number[]>([]);
  const [avgSpeed, setAvgSpeed] = useState<number[]>([0, 40]);
  const [privateWomen, setPrivateWomen] = useState<boolean>(false);
  const [privateNonBinary, setPrivateNonBinary] = useState<boolean>(false);
  const [fileName, setFileName] = useState('');
  const [privateRide, setPrivateRide] = useState<boolean>(false); 
  const [rsvp, setRsvp] = useState<boolean>(true);
  const [initialRsvp, setInitialRsvp] = useState<boolean>(true);             

  

  const [values, setValues] = useState({
    // Event
    host: context.user?.username,
    name: '',
    startTime: '',
    description: '',
    bikeType: [''],
    difficulty: [.5, 7],
    //wattsPerKilo: [0, 0],
    wattsPerKilo: [.5, 7],
    rideAverageSpeed: [0, 40],
    intensity: 'n/a',
    privateWomen: false,
    privateNonBinary: false,
    private: false,
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
  const { data: userData } = useQuery(FETCH_USER_BY_NAME, {
    variables: { username: context?.user?.username },
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
    setRideDate(date);
    setPrivateWomen(!!event.privateWomen);
    setPrivateNonBinary(!!event.privateNonBinary);
    setPrivateRide(!!event.private);
    
    // Initialize RSVP based on whether user is in participants
    const userIsParticipant = event.participants && context.user?.username 
      ? event.participants.includes(context.user.username)
      : false;
    setRsvp(userIsParticipant);
    setInitialRsvp(userIsParticipant);


    //const difficultyVal = event.difficulty ? event.difficulty : [.5, 7]
    const difficultyVal =
      Array.isArray(event.wattsPerKilo) && event.wattsPerKilo.length === 2
        ? event.wattsPerKilo
        : [.5, 7];

    setDifficulty(difficultyVal);
    const speedVal = Array.isArray(event.rideAverageSpeed) ? event.rideAverageSpeed : [0, 40];
    setAvgSpeed(speedVal);


    setValues((prevValues) => ({
      ...prevValues,
      name: event.name,
      startTime: event.startTime,
      description: event.description,
      difficulty: difficultyVal,
      wattsPerKilo: difficultyVal,
      rideAverageSpeed: speedVal,
      bikeType: event.bikeType,
      privateWomen: !!event.privateWomen,
      privateNonBinary: !!event.privateNonBinary,
      private: !!event.private,
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

  const handleWkgSliderChange = (value: number[]) => {
    setValues((prevValues) => ({
      ...prevValues,
      difficulty: value,
      wattsPerKilo: value, 
    }));
    setDifficulty(value);
  };

  const handlePrivateWomen = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateWomen(e.target.checked);
    setValues((prev) => ({ ...prev, privateWomen: e.target.checked }));
  };

  const handlePrivateNonBinary = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateNonBinary(e.target.checked);
    setValues((prev) => ({ ...prev, privateNonBinary: e.target.checked }));
  };

  const handlePrivateRide = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setPrivateRide(checked);
    setValues((prev) => ({ ...prev, private: checked }));
  };

  const handleRsvp = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRsvp(e.target.checked);
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

  const handleButtonClick = async () => {
    // Build exactly what EditEventInput expects
    const input = {
      eventID: values.eventID,
      name: values.name,
      startTime: values.startTime,
      description: values.description || "",
      bikeType: values.bikeType || [],
      wattsPerKilo: values.wattsPerKilo ?? values.difficulty,
      rideAverageSpeed: values.rideAverageSpeed ?? avgSpeed,
      intensity: values.intensity || "n/a",
      points: values.points,
      elevation: values.elevation,
      grade: values.grade,
      terrain: values.terrain,
      distance: values.distance,
      maxElevation: values.maxElevation,
      minElevation: values.minElevation,
      totalElevationGain: values.totalElevationGain,
      startCoordinates: values.startCoordinates,
      endCoordinates: values.endCoordinates,
      privateWomen: privateWomen,
      privateNonBinary: privateNonBinary,
      private: values.private,
    };


    try {
      await editEvent({ variables: { editEventInput: input } });
      
      // Handle RSVP changes
      if (rsvp !== initialRsvp) {
        if (rsvp) {
          await joinRide({ variables: { eventID: values.eventID } });
        } else {
          await leaveRide({ variables: { eventID: values.eventID } });
        }
      }
      
      // Note: editNotify() and navigation are handled in the mutation's onCompleted callback
    } catch (e) {
      console.error("Edit failed", e);
      toast("Failed to save changes");
    }
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

  const [editEvent, { loading, data: editData }] = useMutation(EDIT_EVENT, {
    onError(err) {
      console.error('[EditEvent] GraphQL error:', err);
      toast.error('Failed to save changes');
    },
    onCompleted() {
      refetchRoute();
      editNotify();
      setTimeout(() => window.history.back(), 1000);
    },
  });


  const [deleteEvent, { loading: deleteLoading }] = useMutation(
    DELETE_EVENT,
    {
      onError(err) {
        setErrors(err.graphQLErrors);
        const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
          ?.errors;
        const errorMessage = Object.values(errorObject).flat().join(', ');
        setErrors(errorMessage);
      },
      variables: {
        eventID: event._id,
      },
    }
  );

  const [joinRide] = useMutation(JOIN_RIDE_MINIMAL, {
    onError(err) {
      console.error('[JoinRide] Error:', err);
    },
  });

  const [leaveRide] = useMutation(LEAVE_RIDE, {
    onError(err) {
      console.error('[LeaveRide] Error:', err);
    },
  });

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
      rideTime != ''
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
            <MultirangedSlider
              defaultValues={values.difficulty}
              onChange={handleWkgSliderChange}
            />
            <div className='create-ride-form-input'>
              <label htmlFor='ride-avg-speed'>Average speed (mph)</label>
              <MultirangedSlider
                defaultValues={values.rideAverageSpeed}
                onChange={(vals) => {
                  setAvgSpeed(vals);
                  setValues((prev) => ({ ...prev, rideAverageSpeed: vals }));
                }}
                // these props assume your MultirangedSlider supports configurable bounds
                min={0}
                max={40}
                step={1}
                minDistance={1}
              />
            </div>

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

          <div className='rides-feed-filter-options'>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
              <span style={{ whiteSpace: 'nowrap' }}>Visible only to:</span>
              <span className="tooltip" style={{ display: 'inline-block' }}>
                <i
                  className="fa-solid fa-circle-info"
                  style={{ marginLeft: 0 }}
                ></i>
                <span className="tooltiptext">
                  Selecting one of these boxes will make this ride limited to only users of the specified gender
                </span>
              </span>
            </h5>
            <label>
              <input
                type='checkbox'
                checked={privateWomen}
                onChange={(e) => {
                  setPrivateWomen(e.target.checked);
                  setValues((prev) => ({ ...prev, privateWomen: e.target.checked }));
                }}
              />{' '}
              Women
            </label>
            <label>
              <input
                type='checkbox'
                checked={privateNonBinary}
                onChange={(e) => {
                  setPrivateNonBinary(e.target.checked);
                  setValues((prev) => ({ ...prev, privateNonBinary: e.target.checked }));
                }}
              />{' '}
              Non-binary
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
          {/* Members and Visibility */}
          <div className='create-ride-form-input'>
            <h5>Members and Visibility:</h5>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type='checkbox'
                checked={rsvp}
                onChange={handleRsvp}
              />
              RSVP me for this ride
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type='checkbox'
                checked={privateRide}
                onChange={handlePrivateRide}
              />
              Private Ride (Invite Only)
            </label>
          </div>


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

export default EditRide;
