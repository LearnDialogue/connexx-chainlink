import React, { useContext, useState } from "react";
import "../styles/profile-page.css";
import { useQuery } from "@apollo/client";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { AuthContext } from "../context/auth";
import RsvpButton from "./RsvpButton";
import Button from "./Button";
import { formatDate, formatDistance, formatTime } from "../util/Formatters";
import { Link } from "react-router-dom";
import { FETCH_ROUTE } from "../graphql/queries/eventQueries";
import { ProfileModal } from "./ProfileModal";
import UserAvatar from "./UserAvatar";
import { GET_FRIEND_STATUSES } from "../graphql/queries/friendshipQueries";
import ShareRide from "./ShareRide";
import featureFlags from "../featureFlags";

interface EventModalProps {
  event: any | null;
  setEvent: (nullEvent: string | null) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, setEvent }) => {
  const { user } = useContext(AuthContext);
  if (!event) {
    return null;
  }
  const [isJoined, setIsJoined] = useState(
    user?.username && event.participants.includes(user?.username)
  );
  console.log("Event received in EventModal:", event);
  const [showShareRide, setShowShareRide] = useState(false);
  const toggleShareModal = () => setShowShareRide(!showShareRide);

  // Fetch friend statuses for event participants
  const { data: friendStatusesData } = useQuery(GET_FRIEND_STATUSES, {
    variables: {
      currentUsername: user?.username,
      usernameList: event.participants,
    },
    skip: !event.participants.length || !user?.username,
  });

  const friendStatuses = friendStatusesData?.getFriendStatuses || [];

  const { data: routeData } = useQuery(FETCH_ROUTE, {
    variables: {
      routeID: event.route,
    },
  });

  const calculateBounds = () => {
    if (!routeData) return null;

    const points = routeData.getRoute.points;
    const latitudes = points.map((point: any[]) => point[0]);
    const longitudes = points.map((point: any[]) => point[1]);

    const southWest = [Math.min(...latitudes), Math.min(...longitudes)];
    const northEast = [Math.max(...latitudes), Math.max(...longitudes)];

    return [southWest, northEast];
  };

  const bounds = calculateBounds();

  const modalMap = () => {
    const mapKey = JSON.stringify({
      bounds,
      center: routeData.getRoute.startCoordinates,
    });

    return (
      <MapContainer
        key={mapKey}
        style={{ height: "400px", width: "100%", minWidth: "250px", zIndex: 1 }}
        bounds={bounds as L.LatLngBoundsExpression}
        center={routeData.getRoute.startCoordinates}
        dragging={true}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        touchZoom={true}
        boxZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline
          pathOptions={{ fillColor: "red", color: "blue" }}
          positions={routeData.getRoute.points}
        />
        {routeData.getRoute.startCoordinates?.length > 0 && (
          <Marker position={routeData.getRoute.startCoordinates}>
            <Popup>Start Point</Popup>
          </Marker>
        )}
        {routeData.getRoute.endCoordinates?.length > 0 && (
          <Marker position={routeData.getRoute.endCoordinates}>
            <Popup>End Point</Popup>
          </Marker>
        )}
      </MapContainer>
    );
  };

  const generateGPXFile = () => {
    if (!routeData || !routeData.getRoute) return;

    const now = new Date().toISOString();

    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxdata="http://www.cluetrust.com/XML/GPXDATA/1/0" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.cluetrust.com/XML/GPXDATA/1/0 http://www.cluetrust.com/Schemas/gpxdata10.xsd" version="1.1" creator="http://ridewithgps.com/">
      <metadata>
        <name>${event.name}</name>
        <link href="https://ridewithgps.com/routes/${event.route}">
          <text>${event.name}</text>
        </link>
        <time>${now}</time>
      </metadata>
      <trk>
        <name>${event.name}</name>
        <trkseg>`;

    for (let i = 0; i < routeData.getRoute.points.length; i++) {
      const [lat, lon] = routeData.getRoute.points[i];
      const ele = routeData.getRoute.elevation[i];
      gpxContent += `
          <trkpt lat="${lat}" lon="${lon}">
            <ele>${ele}</ele>
          </trkpt>`;
    }

    gpxContent += `
        </trkseg>
      </trk>
    </gpx>`;

    const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.name}.gpx`;
    link.click();
  };

  const toggleJoinedStatus = (status: boolean) => {
    setIsJoined(status);
  };

  const handleClose = () => {
    setEvent(null);
  };

  return (
    <div className="profile-page-popover-ride-details-container">
      {event ? (
        <div className="ride-card-modal-overlay">
          <div className="ride-card-modal-container">
            <span className="ride-card-close-modal" onClick={handleClose}>
              <i className="fa fa-times"></i>
            </span>
            <div style={{ textAlign: "center" }}>
              {routeData ? (
                <div>{modalMap()}</div>
              ) : (
                <div
                  style={{
                    width: "400px",
                    height: "400px",
                    backgroundColor: "#f2f2f2",
                  }}
                ></div>
              )}
            </div>
            {routeData ? (
              <div>
                <div className="ride-card-modal-values-container">
                  <div className="ride-card-modal-values">
                    <h2>{event.name}</h2>
                    <p>
                      Created by <b>{event.host}</b>
                    </p>
                    <p>
                      Riders: <b>{event.participants.length}</b>
                    </p>
                    <p>
                      Starts at <b>{formatTime(event.startTime)}</b> on{" "}
                      <b>{formatDate(event.startTime)}</b>
                    </p>
                    <p>
                      Bike Type: <b>{event.bikeType.join(", ")}</b>
                    </p>
                    {Array.isArray(event.wattsPerKilo) &&
                    event.wattsPerKilo.length === 2 &&
                    Number.isFinite(event.wattsPerKilo[0]) &&
                    Number.isFinite(event.wattsPerKilo[1]) && (
                      <p>
                        <b>{event.wattsPerKilo[0]}</b> to <b>{event.wattsPerKilo[1]}</b> average watts per kilogram effort expected
                      </p>
                    )}
                    {Array.isArray(event.expectedMph) &&
                    event.expectedMph.length === 2 &&
                    Number.isFinite(event.expectedMph[0]) &&
                    Number.isFinite(event.expectedMph[1]) && (
                      <p>
                        Expected speed: <b>{event.expectedMph[0]}</b> to <b>{event.expectedMph[1]}</b> mph
                      </p>
                    )}
                    <p>{formatDistance(routeData.getRoute.distance)} mi</p>
                    {event.description?.split('\n').map((line: string, index: number) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <div>
                    Riders:
                    <div>
                      <div className="ride-card-users-container">
                        {event.participants ? (
                          [...event.participants]
                            .sort((a: string, b: string) => a.localeCompare(b))
                            .map((username: any, index: number) => (
                              <div key={index}>
                                <div
                                  id={"profile-modal-anchor-" + username}
                                  className="ride-card-users"
                                >
                                  <UserAvatar username={username} />
                                  <span className="name">
                                    <b>{username}</b>
                                  </span>
                                </div>
                                <ProfileModal
                                  user={username}
                                  friendStatus={
                                    friendStatuses.find(
                                      (status: any) =>
                                        status.otherUser === username
                                    )?.status
                                  }
                                />
                              </div>
                            ))
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rsvp-button">
                  <br />
                  <RsvpButton
                    eventID={event._id}
                    isJoined={isJoined}
                    setJoinedStatus={toggleJoinedStatus}
                    type="secondary"
                  />
                  <Button
                    marginTop={12}
                    type="secondary"
                    onClick={generateGPXFile}
                  >
                    Download
                  </Button>
                  {event.host === user?.username && (
                    <Link to={"/app/profile/edit/ride"} state={{ event }}>
                      <Button marginTop={12} type="secondary">
                        Edit
                      </Button>
                    </Link>
                  )}
                  {featureFlags.rideInvitesEnabled &&
                    (!event.private || event.host == user?.username) && (
                      <Button
                        marginTop={12}
                        type="secondary"
                        onClick={toggleShareModal}
                      >
                        Share
                      </Button>
                    )}
                </div>
                {showShareRide && (
                  <ShareRide event={event} onClose={toggleShareModal} />
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default EventModal;
