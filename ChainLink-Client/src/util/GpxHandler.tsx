import "leaflet/dist/leaflet.css";
import React, { useState, ChangeEvent } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { RouteInfo, extractRouteInfo } from "./extractRouteInfo";

// Set up the default icon for markers
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const GpxMap: React.FC = () => {
  const [routeData, setRouteData] = useState<RouteInfo | null>(null);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];

      if (file) {
        try {
          const routeInfo = await extractRouteInfo(file);

          // Set the route data state
          setRouteData(routeInfo);
        } catch (error) {
          console.error("Error parsing GPX:", error);
        }
      }
    } catch (error) {
      console.error("Error loading GPX file:", error);
    }
  };

  if (!routeData) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <input type="file" onChange={handleFileSelect} accept=".gpx" />
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <MapContainer
        center={routeData.startCoordinates}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "300px", width: "250px", margin: "20px auto" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline
          pathOptions={{ fillColor: "red", color: "blue" }}
          positions={routeData.points}
        />
        <Marker position={routeData.startCoordinates}>
          <Popup>Start Point</Popup>
        </Marker>
        <Marker position={routeData.endCoordinates}>
          <Popup>End Point</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default GpxMap;
