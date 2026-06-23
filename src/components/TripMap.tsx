"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Day } from "@/types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DAY_COLORS = [
  "#14b8a6",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#10b981",
  "#3b82f6",
  "#6366f1",
  "#d946ef",
  "#f97316",
  "#84cc16",
  "#22d3ee",
  "#a855f7",
];

interface FocusStop {
  dayIndex: number;
  stopIndex: number;
}

interface TripMapProps {
  days: Day[];
  focusStop?: FocusStop | null;
}

export default function TripMap({ days, focusStop }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const markersWithCoords: { lat: number; lng: number; dayIndex: number; stopIndex: number }[] = [];

    days.forEach((day, dayIndex) => {
      day.stops.forEach((stop, stopIndex) => {
        if (stop.lat != null && stop.lng != null) {
          markersWithCoords.push({ lat: stop.lat, lng: stop.lng, dayIndex, stopIndex });
        }
      });
    });

    if (!markersWithCoords.length) return;

    markersWithCoords.forEach((m) => {
      const color = DAY_COLORS[m.dayIndex % DAY_COLORS.length];
      const number = m.stopIndex + 1;
      const icon = L.divIcon({
        className: "",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${color};color:white;font-size:12px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${number}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

      const stop = days[m.dayIndex].stops[m.stopIndex];
      marker.bindPopup(
        `<strong style="font-size:14px">${stop.name}</strong><br/><span style="font-size:12px;color:#666">${stop.description}</span><br/><span style="font-size:11px;color:#999">${stop.suggestedTime}</span>`
      );

      markersRef.current.set(`${m.dayIndex}-${m.stopIndex}`, marker);
    });

    const group = L.featureGroup(
      markersWithCoords.map((m) => L.marker([m.lat, m.lng]))
    );
    map.fitBounds(group.getBounds().pad(0.15));
  }, [days]);

  useEffect(() => {
    if (!focusStop || !mapInstanceRef.current) return;
    const key = `${focusStop.dayIndex}-${focusStop.stopIndex}`;
    const marker = markersRef.current.get(key);
    if (marker) {
      const latlng = marker.getLatLng();
      mapInstanceRef.current.flyTo(latlng, 16, { duration: 1 });
      marker.openPopup();
    }
  }, [focusStop]);

  return (
    <div
      ref={mapRef}
      className="h-full min-h-[400px] w-full rounded-xl overflow-hidden"
    />
  );
}
