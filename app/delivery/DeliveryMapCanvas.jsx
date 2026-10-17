"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const restaurantPosition = [9.03, 38.74];
const restaurantIcon = L.divIcon({
  className: "delivery-map-marker delivery-map-restaurant",
  html: "<span>R</span>",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const destinationIcon = L.divIcon({
  className: "delivery-map-marker delivery-map-destination",
  html: "<span>D</span>",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapView({ coordinates }) {
  const map = useMap();
  const lat = coordinates?.lat;
  const lng = coordinates?.lng;

  useEffect(() => {
    map.setView(
      lat !== undefined && lng !== undefined
        ? [lat, lng]
        : restaurantPosition,
      lat !== undefined && lng !== undefined ? 14 : 12
    );
  }, [lat, lng, map]);
  return null;
}

export default function DeliveryMapCanvas({
  coordinates,
  showUnavailable = false,
}) {
  const [tileError, setTileError] = useState(false);
  const destination = coordinates
    ? [coordinates.lat, coordinates.lng]
    : null;

  return (
    <div className="delivery-map-frame">
      <MapContainer
        center={destination ?? restaurantPosition}
        zoom={destination ? 14 : 12}
        scrollWheelZoom
        className="delivery-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTileError(true) }}
        />
        <Marker position={restaurantPosition} icon={restaurantIcon}>
          <Popup>Addis Eats restaurant location (illustrative demo point)</Popup>
        </Marker>
        {destination && (
          <Marker position={destination} icon={destinationIcon}>
            <Popup>Saved delivery destination</Popup>
          </Marker>
        )}
        <MapView coordinates={coordinates} />
      </MapContainer>
      <div className="delivery-map-legend">
        <span><i className="delivery-map-legend-restaurant">R</i> Addis Eats (illustrative demo point)</span>
        {destination && (
          <span><i className="delivery-map-legend-destination">D</i> Saved delivery destination</span>
        )}
      </div>
      {showUnavailable && (
        <p className="delivery-map-warning" role="status">
          No delivery coordinates have been saved for this order. The map
          shows only the illustrative Addis Eats location, not your destination.
        </p>
      )}
      {tileError && (
        <p className="delivery-map-warning" role="status">
          Map tiles could not be loaded. Check the network connection; saved
          delivery coordinates and status remain available.
        </p>
      )}
    </div>
  );
}
