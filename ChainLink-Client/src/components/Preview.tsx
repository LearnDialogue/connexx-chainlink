import React from 'react';
import '../styles/profile-page.css';
import { formatDate, formatTime } from '../util/Formatters';
import { useQuery } from '@apollo/client';
import { GET_EVENT_PREVIEW } from '../graphql/queries/previewQueries';
import { FETCH_ROUTE } from '../graphql/queries/eventQueries';
import Button from './Button';
import {
    MapContainer,
    Marker,
    Polyline,
    TileLayer,
    Popup,
  } from 'react-leaflet';
  import 'leaflet/dist/leaflet.css';
interface PreviewEventModalProps {
    event: any;
    route: any;
    onClose: (value: any | null) => void;
}

const PreviewEventModal: React.FC<PreviewEventModalProps> = ({ event, route, onClose }) => {
    const routeData = route;
    
    
      const modalMap = () => {
        if (!routeData) return null;
        
        console.log("routeData:", routeData);

        const points = routeData.points;
        const latitudes = points.map((point: any[]) => point[0]);
        const longitudes = points.map((point: any[]) => point[1]);
      
        const latMin = Math.min(...latitudes);
        const latMax = Math.max(...latitudes);
        const lngMin = Math.min(...longitudes);
        const lngMax = Math.max(...longitudes);
      
        const latPadding = (latMax - latMin) * 0.1;
        const lngPadding = (lngMax - lngMin) * 0.1;
      
        const southWest = [latMin - latPadding, lngMin - lngPadding];
        const northEast = [latMax + latPadding, lngMax + lngPadding];
        const bounds = [southWest, northEast];
      
        const mapKey = JSON.stringify({ bounds });
      
        return (
          <MapContainer
            key={mapKey}
            style={{ height: '400px', width: '100%', minWidth: '250px', zIndex: 1 }}
            bounds={bounds as L.LatLngBoundsExpression}
            dragging={false}
            zoomControl={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            touchZoom={false}
            boxZoom={false}
            zoom={11}
          >
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            <Polyline pathOptions={{ fillColor: 'red', color: 'blue' }} positions={points} />
            {routeData.startCoordinates?.length > 0 && (
              <Marker position={routeData.startCoordinates}>
                <Popup>Start Point</Popup>
              </Marker>
            )}
            {routeData.endCoordinates?.length > 0 && (
              <Marker position={routeData.endCoordinates}>
                <Popup>End Point</Popup>
              </Marker>
            )}
        
          </MapContainer>
          
        );
      };      
    

  return (
    <div className='profile-page-popover-ride-details-container'>
      <div className='ride-card-modal-overlay'>
        <div className='ride-card-modal-container'>
          <span className='ride-card-close-modal' onClick={onClose}>
            <i className='fa fa-times'></i>
          </span>
          <div style={{ width: '100%', height: '400px', marginBottom: '1rem' }}>
          {!routeData?.points ? (
            <div
                style={{
                height: '100%',
                backgroundColor: '#f2f2f2',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '10px',
                }}
            >
                Map preview unavailable
            </div>
            ) : (
            modalMap()
)}
          </div>


          <div className='ride-card-modal-values'>
            <h2>{event.name}</h2>
            <p>
              Created by <b>{event.host}</b>
            </p>
            <p>
              Starts at <b>{formatTime(event.startTime)}</b> on{' '}
              <b>{formatDate(event.startTime)}</b>
            </p>
            <p>
              Bike Type: <b>{event.bikeType?.join(', ')}</b>
            </p>
            <p>
              <b>{event.difficulty}</b> average watts per kilogram effort expected
            </p>
            <p>{event.description}</p>
          </div>

          <div className='rsvp-button'>
            <Button
              marginTop={12}
              type='secondary'
              onClick={() => {
                window.location.href = '/signup?redirect=event';
              }}
            >
              Sign up to join
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewEventModal;
