import L from 'leaflet';
import startMarkerIcon from '../assets/start-marker.png';
import finishMarkerIcon from '../assets/finish-marker.png';

const startMarker = new L.Icon({
  iconUrl: startMarkerIcon,
  iconRetinaUrl: startMarkerIcon,
  iconAnchor: undefined,
  popupAnchor: undefined,
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined,
  iconSize: new L.Point(60, 75),
  className: 'leaflet-div-icon',
});

const finishMarker = new L.Icon({
  iconUrl: finishMarkerIcon,
  iconRetinaUrl: finishMarkerIcon,
  iconAnchor: undefined,
  popupAnchor: undefined,
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined,
  iconSize: new L.Point(60, 75),
  className: 'leaflet-div-icon',
});

export { startMarker, finishMarker };
