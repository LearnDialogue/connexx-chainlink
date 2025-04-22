import { Key, useContext, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import Button from "./Button";
import "../styles/components/ride-feed-card.css";
import RsvpButton from "./RsvpButton";
import { AuthContext } from "../context/auth";
import { formatDate, formatDistance, formatTime } from "../util/Formatters";
import { FETCH_ROUTE } from "../graphql/queries/eventQueries";
import ShareRide from "./ShareRide";
import featureFlags from "../featureFlags";

export interface RideFeedCardProps {
  _id: Key | null | undefined;
  event: any | null;
  setEvent: (nullEvent: string | null) => void;
}

const RideFeedCard: React.FC<RideFeedCardProps> = ({ event, setEvent }) => {
  const { user } = useContext(AuthContext);
  const [isJoined, setIsJoined] = useState(
    user?.username && event.participants.includes(user?.username)
  );

  const [showShareRide, setShowShareRide] = useState(false);

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareRide(true);
  };

  const handleCloseShare = () => {
    setShowShareRide(false);
  };

  const matchIcon = () => {
    if (event.match == 1) {
      return (
        <span>
          Great match <i className="fa-solid fa-circle-check"></i>
        </span>
      );
    } else if (event.match == 2) {
      return (
        <span>
          Good match <i className="fa-solid fa-circle-minus"></i>
        </span>
      );
    } else if (event.match == 3) {
      return (
        <span>
          Poor match <i className="fa-solid fa-circle-xmark"></i>
        </span>
      );
    }
  };

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

  const cardMap = () => {
    const mapKey = JSON.stringify({
      bounds,
      center: routeData.getRoute.startCoordinates,
    });
    return (
      <MapContainer
        key={mapKey}
        style={{
          height: "250px",
          width: "100%",
          minWidth: "250px",
          maxWidth: "80vw",
          zIndex: -1,
        }}
        bounds={bounds as L.LatLngBoundsExpression}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        touchZoom={false}
        boxZoom={false}
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

  return (
    <div
      onClick={() => setEvent(event)}
      className="ride-feed-card-main-container"
    >
      <div className="ride-feed-card-route-map">
        {routeData ? (
          <div className="card-map-view">{cardMap()}</div>
        ) : (
          <div
            style={{
              width: "250px",
              height: "250px",
              backgroundColor: "#f2f2f2",
            }}
          ></div>
        )}
      </div>
      {routeData ? (
        <div className="ride-feed-card-values">
          <div className="ride-feed-card-tags">
            {event.privateWomen ? (
              <div className="tag">Women</div>
            ) : (
              <div></div>
            )}
            {event.privateNonBinary ? (
              <div className="tag">Non-Binary</div>
            ) : (
              <div></div>
            )}
            {featureFlags.privateRidesEnabled && event.private ? (
              <div className="tag">Private</div>
            ) : (
              <div></div>
            )}
            {featureFlags.privateRidesEnabled &&
            event.invited?.includes(user?.username) ? (
              <div className="invited-tag">Invited</div>
            ) : (
              <div></div>
            )}
          </div>

          <h2>{event.name}</h2>
          <p>
            Created by <b>{event.host}</b>
          </p>
          <p>
            Starts at <b>{formatTime(event.startTime)}</b> on{" "}
            <b>{formatDate(event.startTime)}</b>
          </p>
          <p>
            Bike Type: <b>{event.bikeType.join(", ")}</b>
          </p>
          <p>
            <b>{event.difficulty}</b> average watts per kilogram effort expected
          </p>
          <p>{formatDistance(routeData.getRoute.distance)} mi</p>
          <div className="rsvp-button">
            <div className="rsvp-icons">
              <span>
                {event.participants.length}
                <i className="fa-solid fa-user-check"></i>
              </span>
              {/* 
                <span onClick={handleShareClick} className='share-icon'>
                  Share <i className='fa-regular fa-paper-plane'></i>
                </span>
              */}

              {showShareRide && (
                <ShareRide event={event} onClose={handleCloseShare} />
              )}
            </div>
            <RsvpButton
              eventID={event._id}
              isJoined={isJoined}
              setJoinedStatus={setIsJoined}
              type="secondary"
            />
          </div>
        </div>
      ) : (
        <></>
      )}
      <div
        style={{ display: "none" }}
        className="ride-feed-card-matching-score"
      >
        {" "}
        {/* Hiding match for now */}
        <div className={event.match}>
          <span>{matchIcon()}</span>
        </div>
      </div>
    </div>
  );
};

export default RideFeedCard;
