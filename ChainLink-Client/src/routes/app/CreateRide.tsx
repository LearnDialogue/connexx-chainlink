import { useContext, useEffect, useState } from "react";
import Button from "../../components/Button";
import "../../styles/create-ride.css";
import { useMutation, useQuery } from "@apollo/client";
import { extractRouteInfo } from "../../util/GpxHandler";
import { AuthContext } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { LatLngExpression } from "leaflet";
import Footer from "../../components/Footer";
import { FETCH_USER_BY_NAME } from "../../graphql/queries/userQueries";
import { CREATE_EVENT_MUTATION } from "../../graphql/mutations/eventMutations";
import { JOIN_RIDE_MINIMAL } from "../../graphql/mutations/eventMutations";
import featureFlags from "../../featureFlags";
import MultirangedSlider from '../../components/MultirangedSlider';

const CreateRide = () => {
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [rsvp, setRSVP] = useState(true);

  const [rideName, setRideName] = useState<string>("");
  const [rideDate, setRideDate] = useState<string>("");
  const [rideTime, setRideTime] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [bikeType, setBikeType] = useState<string[] | never[]>([]);
  const [wattsPerKilo, setDifficulty] = useState<number[]>([.5, 7]);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [eventID, setEventID] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [privateWomen, setPrivateWomen] = useState(false);
  const [privateNonBinary, setPrivateNonBinary] = useState(false);
  const [privateRide, setPrivate] = useState(false);
  const [avgSpeed, setAvgSpeed] = useState<number[]>([0, 30]);
  const [rideAverageSpeed, setRideAverageSpeed] = useState<number[]>([0, 30]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [rsvpTouched, setRsvpTouched] = useState(false);
  const [privateRideTouched, setPrivateRideTouched] = useState(false);


  const computeMissingFields = (): string[] => {
    const missing: string[] = [];

    // Bike Type: treat [""] as empty too
    const bikes = Array.isArray(values.bikeType)
      ? values.bikeType.filter((b) => b && b.trim() !== "")
      : [];
    if (bikes.length === 0) {
      missing.push("Bike Type");
    }

    // Visible only to (only shown for woman / non-binary users)
    const userCanSeeGenderVisibility =
      userData?.getUser?.sex === "gender-woman" ||
      userData?.getUser?.sex === "gender-non-binary";
    if (userCanSeeGenderVisibility && !privateWomen && !privateNonBinary) {
      missing.push("Visible only to");
    }

    // Description
    if (!values.description || values.description.trim() === "") {
      missing.push("Description");
    }

    // GPX upload
    if (!fileUploaded) {
      missing.push("Upload a GPX file");
    }

    // Members & Visibility: consider filled if at least one choice is active
    const privateRidesOn = !!featureFlags.privateRidesEnabled;
    const hasSelection = rsvp || (privateRidesOn && privateRide);
    if (!hasSelection) {
      missing.push("Members and Visibility");
    }

    return missing;
  };

  

  const [values, setValues] = useState({
    // Event
    host: context.user?.username,
    name: "",
    startTime: "",
    description: "",
    bikeType: [""],
    wattsPerKilo: [.5, 7],
    rideAverageSpeed: [0, 40],
    intensity: "n/a",
  
    // Route
    points: [[0, 0]],
    elevation: [0],
    grade: [0],
    terrain: [""],
    distance: 0,
    maxElevation: 0.0,
    minElevation: 0.0,
    totalElevationGain: 0.0,
    startCoordinates: [0, 0],
    endCoordinates: [0, 0],
    error: "",
    privateWomen: false,
    privateNonBinary: false,
    private: false,
  });

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

  const handleBikeCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked, id } = event.target;
    let newBikes = [...bikeType];
    if (id == "bike") {
      if (checked) {
        newBikes.push(name);
        setBikeType(newBikes);
      } else {
        newBikes = newBikes.filter((item) => item !== name);
        setBikeType(newBikes);
      }
    }
    setValues((prevValues) => ({
      ...prevValues,
      bikeType: newBikes,
    }));
  };

  const handlePrivateWomenChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues((prevValues) => ({
      ...prevValues,
      privateWomen: event.target.checked,
    }));
    setPrivateWomen(event.target.checked);
  };

  const handlePrivateNonBinaryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues((prevValues) => ({
      ...prevValues,
      privateNonBinary: event.target.checked,
    }));
    setPrivateNonBinary(event.target.checked);
  };

  /*
  const handlePrivateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      private: event.target.checked,
    }));
    setPrivate(event.target.checked);
  };
  */

  const handlePrivateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevValues) => ({
      ...prevValues,
      private: event.target.checked,
    }));
    setPrivate(event.target.checked);
    setPrivateRideTouched(true);
  };

  /*
  const handleRSVP = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setRSVP(checked);
  };
  */

  const handleRSVP = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setRSVP(checked);
    setRsvpTouched(true);
  };

  // const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setValues((prevValues) => ({
  //     ...prevValues,
  //     difficulty: e.target.value,
  //   }));
  //   setDifficulty(e.target.value);
  // };

  const handleWkgSliderChange = (value: number[]) => {
    // console.log('Slider values: ', value);
    setValues((prevValues) => ({
      ...prevValues,
      wattsPerKilo: value,
    }));
    setDifficulty(value);
  };

  const handleAvgSpeedChange = (value: number[]) => {
    setValues((prevValues) => ({
      ...prevValues,
      rideAverageSpeed: value,
    }));
    setAvgSpeed(value);
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
            error: "",
          }));
          setFileUploaded(true);
        } catch (error) {
          e.target.value = "";
          setFileName("");
          setValues((prevValues) => ({
            ...prevValues,
            points: [[0, 0]],
            elevation: [0],
            grade: [0],
            terrain: [""],
            distance: 0,
            maxElevation: 0.0,
            minElevation: 0.0,
            totalElevationGain: 0.0,
            startCoordinates: [0, 0],
            endCoordinates: [0, 0],
            error: (error as Error).toString(),
          }));
          console.error("Error parsing GPX:", error);
          setFileUploaded(false);
        }
      }
    } catch (error) {
      console.error("Error loading GPX file:", error);
    }
  };

  /*
  const handleButtonClick = () => {
    addEvent();
    notify(); // Call notify function here
  };
  */

  const handleButtonClick = () => {
    // Required fields already enforced by enableButton()
    const missing = computeMissingFields();
    if (missing.length > 0) {
      setMissingFields(missing);
      setConfirmOpen(true);
      return;
    }
    // No missing optional fields -> proceed
    addEvent();
    notify();
  };

  const handleCreateAnyway = () => {
    setConfirmOpen(false);
    addEvent();
    notify();
  };

  const token: string | null = localStorage.getItem("jwtToken");

  const [addEvent, { loading }] = useMutation(CREATE_EVENT_MUTATION, {
    onError(err) {
      setErrors(err.graphQLErrors);
      const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
        ?.errors;
      const errorMessage = Object.values(errorObject).flat().join(", ");
      setErrors(errorMessage);
    },
    onCompleted(data) {
      if (rsvp) {
        setEventID(data.createEvent._id);
      }
      setTimeout(() => {
        navigate("/app/profile");
      }, 1500);
    },
    variables: values,
  });

  const [joinRide] = useMutation(JOIN_RIDE_MINIMAL, {
    onError(err) {
      setErrors(err.graphQLErrors);
      const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
        ?.errors;
      if (errorObject) {
        const errorMessage = Object.values(errorObject).flat().join(", ");
        setErrors(errorMessage);
      } else {
        setErrors("An unknown error occurred.");
      }
    },
    variables: {
      eventID: eventID,
    },
  });

  useEffect(() => {
    if (rsvp) joinRide();
  }, [eventID]);

  useEffect(() => {
    refreshDate();
  }, [rideDate, rideTime]);


  /*
  const enableButton = () => {
    return (
      rideName != "" &&
      rideDate != "" &&
      rideTime != "" &&
      bikeType.length !== 0 &&
      rideAverageSpeed.length > 0 &&
      fileUploaded
    );
  };
  */

  const enableButton = () => {
    return rideName !== "" && rideDate !== "" && rideTime !== "";
  };

  const toastStyle = {
    background: "lightgreen", // Change background color to light green
    color: "black", // Change text color
  };

  // Custom toast container style
  const toastContainerStyle = {
    width: "auto", // Adjust width as needed
    textAlign: "center", // Center the toast
  };
  const notify = () => toast("Ride Created!");

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
        style={{ height: "400px", width: "100%", minWidth: "250px", zIndex: 1 }}
        bounds={bounds as L.LatLngBoundsExpression}
        center={values.startCoordinates as LatLngExpression}
        dragging={true}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        touchZoom={true}
        boxZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {values.points.length > 1 && (
          <Polyline
            pathOptions={{ fillColor: "red", color: "blue" }}
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
      <div className="create-ride-main-container">
        <div className="create-ride-form-container">
          <h2>Create a ride</h2>
          <p className="create-ride-note">
            Only <b>Ride name</b>, <b>Date</b>, and <b>Start time</b> are required. You can add the rest later.
          </p>


          <div className="create-ride-form-input">
            <label htmlFor="ride-name">Ride name</label>
            <input
              id="ride-name"
              onChange={handleNameChange}
              type="text"
              value={rideName}
            />
          </div>

          <div className="create-ride-form-input">
            <label htmlFor="ride-date">Date</label>
            <input
              id="ride-date"
              onChange={handleDateChange}
              type="date"
              value={rideDate}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="create-ride-form-input">
            <label htmlFor="ride-start-time">Start time</label>
            <input
              id="ride-start-time"
              onChange={handleTimeChange}
              type="time"
              value={rideTime}
            />
          </div>

          <div className="create-ride-form-input">
            <label htmlFor="ride-difficulty">Watts/kg</label>
            <MultirangedSlider
              defaultValues={values.wattsPerKilo}
              onChange={handleWkgSliderChange}
            />
          </div>
          

          <div className="create-ride-slider">
            <h5>Average speed (mph)</h5>
            <MultirangedSlider
              defaultValues={avgSpeed}
              onChange={handleAvgSpeedChange}
              min={0}
              max={40}
              step={1}
              minDistance={1}
            />
          </div>


          <div className="rides-feed-filter-options">
            <h5>Bike type</h5>
            <label htmlFor="mountain-bike">
              <input
                name="Mountain"
                onChange={handleBikeCheckboxChange}
                id="bike"
                type="checkbox"
              />{" "}
              Mountain
            </label>
            <label htmlFor="road-bike">
              <input
                name="Road"
                onChange={handleBikeCheckboxChange}
                id="bike"
                type="checkbox"
              />{" "}
              Road
            </label>
            <label htmlFor="hybrid-bike">
              <input
                name="Hybrid"
                onChange={handleBikeCheckboxChange}
                id="bike"
                type="checkbox"
              />{" "}
              Hybrid
            </label>
            <label htmlFor="touring-bike">
              <input
                name="Touring"
                onChange={handleBikeCheckboxChange}
                id="bike"
                type="checkbox"
              />{" "}
              Touring
            </label>
            <label htmlFor="gravel-bike">
              <input
                name="Gravel"
                onChange={handleBikeCheckboxChange}
                id="bike"
                type="checkbox"
              />{" "}
              Gravel
            </label>
          </div>

          {(userData?.getUser?.sex === 'gender-woman' || userData?.getUser.sex === "gender-non-binary") && (
              <div className='rides-feed-filter-options'>
                <h5 style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>Visible only to:</span>
                  <span className="tooltip" style={{ display: 'inline-block' }}>
                    <i
                      className="fa-solid fa-circle-info"
                      style={{ marginLeft: '0px' }}
                    ></i>
                    <span className="tooltiptext">
                      Selecting one of these boxes will make this ride limited to only users of the specified gender
                    </span>
                  </span>
                </h5>
                <label htmlFor='private-women'>
                    <input
                    name='Women'
                    onChange={handlePrivateWomenChange}
                    id='private-women'
                    type='checkbox'
                    checked={privateWomen}
                    />{' '}
                    Women
                </label>
                <label htmlFor='private-non-binary'>
                    <input
                        name='Non-binary'
                        onChange={handlePrivateNonBinaryChange}
                        id='private-non-binary'
                        type='checkbox'
                        checked={privateNonBinary}
                    />{' '}
                    Non-binary
                    </label>
            </div>
          )}

          <div className="create-ride-form-input">
            <label htmlFor="ride-description">Description</label>
            <textarea
              placeholder="Enter details such as number of stops, rules,"
              id="ride-name"
              onChange={handleDescChange}
              value={desc}
            />
          </div>

          <div className="create-ride-form-input">
            <div className="input-file-container">
              <label htmlFor="input-gpx-file">
                {fileName ? (
                  <>
                    <i className="fa-solid fa-file-circle-check"></i>
                    <span>{fileName}</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-arrow-up-from-bracket"></i>
                    <span>Press to upload a GPX file</span>
                  </>
                )}
              </label>
              <input
                id="input-gpx-file"
                type="file"
                onChange={handleFileSelect}
                accept=".gpx"
              />
            </div>
          </div>

          {values.points.length > 1 && (
            <div className="create-ride-form-input">
              <label htmlFor="ride-map">Map</label>

              <div>{rideMap()}</div>
            </div>
          )}

          {values.error != "" ? (
            <p className="error-text">{values.error}</p>
          ) : (
            <></>
          )}

          <div className='rides-feed-filter-options'>
          <h5 style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>Members and Visibility:</span>
                  <span className="tooltip" style={{ display: 'inline-block'}}>
                    <i
                      className="fa-solid fa-circle-info"
                      style={{ marginLeft: '0px'}} 
                    ></i>
                    <span className="tooltiptext">
                      RSVP: automatically joins the ride <br/> Private Ride: ride is not public to all users
                    </span>
                  </span>
              </h5>
              <label htmlFor='rsvp'>
                <input
                  name='rsvp'
                  checked={rsvp}
                  onChange={handleRSVP}
                  id='rsvp'
                  type='checkbox'
                />{' '}
                RSVP me for this ride
              </label>
            {featureFlags.privateRidesEnabled && 
              <label htmlFor='private-ride'>
                  <input
                    name='private-ride'
                    onChange={handlePrivateChange}
                    id='private-ride'
                    type='checkbox'
                    checked={privateRide}
                  />{' '}
                  Private Ride (Invite Only)
              </label>
            }
          </div>

          <Button
            disabled={!enableButton()}
            onClick={handleButtonClick}
            type="primary"
          >
            Create ride
          </Button>
          <ToastContainer toastStyle={toastStyle} autoClose={1000} />

          {/* Confirm Missing Fields Modal */}
          {confirmOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
              onClick={() => setConfirmOpen(false)}
            >
              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  width: "min(500px, 90vw)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0 }}>Optional details missing</h3>
                <p style={{ margin: "8px 0 12px" }}>
                  You can fill these in now or create the ride anyway:
                </p>
                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                  {missingFields.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setConfirmOpen(false)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Go back
                  </button>
                  <button
                    onClick={handleCreateAnyway}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#22c55e",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Create ride anyway
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        <Footer />
      </div>
    </>
  );
};


export default CreateRide;
 