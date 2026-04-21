"use client";
import React, { useEffect, useRef } from "react";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

type AddressState = {
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  fullName: string;
  mobile: string;
};

type DraggableMarkerProps = {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setAddress: React.Dispatch<React.SetStateAction<AddressState>>;
};

// ✅ Moved outside CheckOutMap to prevent re-creation on every render
const DraggableMarker: React.FC<DraggableMarkerProps> = ({
  position,
  setPosition,
  setAddress,
}) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  const geocodeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    map.setView(position as LatLngExpression, 15, { animate: true });
  }, [position, map]);

  useEffect(() => {
    if (!position) return;

    geocodeTimer.current = setTimeout(async () => {
      try {
        const result = await axios.get(
          `/api/geocode?lat=${position[0]}&lon=${position[1]}`,
        );
        setAddress((prev) => ({
          ...prev,
          city:
            result.data.address.city ||
            result.data.address.town ||
            result.data.address.suburb ||
            result.data.address.county ||
            result.data.address.district ||
            result.data.address.state_district ||
            "",
          state: result.data.address.state || "",
          pincode: result.data.address.postcode || "",
          fullAddress: result.data.display_name || "",
        }));
      } catch (error) {
        console.log(error);
      }
    }, 1000);

    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
  }, [position, setAddress]);

  return (
    <Marker
      ref={markerRef}
      icon={markerIcon}
      position={position as LatLngExpression}
      draggable={true}
      eventHandlers={{
        dragstart: () => {
          if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
          map.dragging.disable();
        },
        dragend: (e: L.LeafletEvent) => {
          map.dragging.enable();
          const marker = e.target as L.Marker;
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
        },
      }}
    />
  );
};

type CheckOutMapProps = {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setAddress: React.Dispatch<React.SetStateAction<AddressState>>; // ✅ Added missing prop
};

function CheckOutMap({ position, setPosition, setAddress }: CheckOutMapProps) {
  return (
    <MapContainer
      center={position as LatLngExpression}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* ✅ Pass all required props down to DraggableMarker */}
      <DraggableMarker
        position={position}
        setPosition={setPosition}
        setAddress={setAddress}
      />
    </MapContainer>
  );
}

export default CheckOutMap;
