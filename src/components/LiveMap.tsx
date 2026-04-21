"use client";
import React, { useEffect } from "react";
import { LatLngExpression } from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ✅ FIX: Import L only on client side to avoid SSR window error
import dynamic from "next/dynamic";

function Recenter({ positions }: { positions: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (positions[0] !== 0 && positions[1] !== 0) {
      map.setView(positions, map.getZoom(), { animate: true });
    }
  }, [positions, map]);
  return null;
}

interface ILocation {
  latitude: number;
  longitude: number;
}

interface Iprops {
  userLocation: ILocation;
  deliveryBoyLocation: ILocation | null;
}

function LiveMap({ userLocation, deliveryBoyLocation }: Iprops) {
  // ✅ FIX: Create icons inside useEffect or lazily to avoid SSR crash
  const L = require("leaflet");

  const deliveryBoyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
    iconSize: [45, 45],
  });

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
    iconSize: [45, 45],
  });

  const hasDeliveryLocation =
    deliveryBoyLocation != null &&
    deliveryBoyLocation.latitude !== 0 &&
    deliveryBoyLocation.longitude !== 0;

  const hasUserLocation =
    userLocation?.latitude !== 0 && userLocation?.longitude !== 0;

  const linePositions =
    hasDeliveryLocation && hasUserLocation
      ? [
          [userLocation.latitude, userLocation.longitude],
          [deliveryBoyLocation!.latitude, deliveryBoyLocation!.longitude],
        ]
      : [];

  const center: LatLngExpression | null = hasUserLocation
    ? [userLocation.latitude, userLocation.longitude]
    : hasDeliveryLocation
      ? [deliveryBoyLocation!.latitude, deliveryBoyLocation!.longitude]
      : null;

  if (!center) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Fetching location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow relative z-2">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <Recenter positions={center as [number, number]} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hasUserLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>Delivery Address</Popup>
          </Marker>
        )}

        {hasDeliveryLocation && (
          <Marker
            position={[
              deliveryBoyLocation!.latitude,
              deliveryBoyLocation!.longitude,
            ]}
            icon={deliveryBoyIcon}
          >
            <Popup>Delivery Boy</Popup>
          </Marker>
        )}

        {linePositions.length > 0 && (
          <Polyline positions={linePositions as any} color="green" />
        )}
      </MapContainer>
    </div>
  );
}

export default LiveMap;