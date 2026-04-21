"use client";
import { getSocket } from "@/lib/socket";
import React, { useEffect } from "react";

function GeoUpdater({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const emitIdentity = () => {
      console.log("emitting identify for", userId);
      socket.emit("identify", userId);
    };

    if (socket.connected) {
      emitIdentity();
    } else {
      socket.connect();
      socket.once("connect", emitIdentity);
    }

    const watcher = navigator.geolocation?.watchPosition(
      (pos) => {
        socket.emit("update-location", {
          userId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.log(err),
      { enableHighAccuracy: true },
    );

    return () => {
      if (watcher) navigator.geolocation.clearWatch(watcher);
      socket.off("connect", emitIdentity);
    };
  }, [userId]);

  return null;
}

export default GeoUpdater;