"use client";

import { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import type { DayWithActivities } from "@/lib/dibotrip/db/types";
import MapDaySelector from "./MapDaySelector";
import MapPin from "./MapPin";

const BADGE_COLORS = [
  "#f97316",
  "#f59e0b",
  "#f43f5e",
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
];

interface MappableActivity {
  id: string;
  title: string;
  lat: number;
  lng: number;
  dayNumber: number;
  color: string;
  sortOrder: number;
  indexInDay: number; // 1-based position within the day
}

interface Props {
  days: DayWithActivities[];
}

// ─── Inner component (uses hooks that need Map context) ───────────────────────

function MapController({
  activities,
  selectedDay,
}: {
  activities: MappableActivity[];
  selectedDay: number | null;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  // Fit bounds whenever selection changes
  useEffect(() => {
    if (!map || activities.length === 0) return;

    const targets = selectedDay
      ? activities.filter((a) => a.dayNumber === selectedDay)
      : activities;

    if (targets.length === 0) return;

    if (targets.length === 1) {
      map.panTo({ lat: targets[0].lat, lng: targets[0].lng });
      map.setZoom(13);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    targets.forEach((a) => bounds.extend({ lat: a.lat, lng: a.lng }));
    map.fitBounds(bounds, 60);
  }, [map, activities, selectedDay]);

  // Draw route polylines for the selected day
  useEffect(() => {
    // Clear previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!map || !mapsLib || !selectedDay) return;

    const dayActivities = activities
      .filter((a) => a.dayNumber === selectedDay)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (dayActivities.length < 2) return;

    const color =
      BADGE_COLORS[(selectedDay - 1) % BADGE_COLORS.length];

    const polyline = new mapsLib.Polyline({
      path: dayActivities.map((a) => ({ lat: a.lat, lng: a.lng })),
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0,
      strokeWeight: 2,
      icons: [
        {
          icon: {
            path: "M 0,-1 0,1",
            strokeOpacity: 0.75,
            strokeWeight: 2.5,
            scale: 3,
          },
          offset: "0",
          repeat: "12px",
        },
      ],
    });
    polyline.setMap(map);
    polylinesRef.current = [polyline];

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, mapsLib, activities, selectedDay]);

  return null;
}

// ─── Main map wrapper ─────────────────────────────────────────────────────────

function TripMapInner({ days }: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const allActivities: MappableActivity[] = days.flatMap((day) => {
    let indexInDay = 0;
    return day.activities
      .filter((a) => a.latitude != null && a.longitude != null)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((a) => ({
        id: a.id,
        title: a.title,
        lat: a.latitude!,
        lng: a.longitude!,
        dayNumber: day.day_number,
        color: BADGE_COLORS[(day.day_number - 1) % BADGE_COLORS.length],
        sortOrder: a.sort_order,
        indexInDay: ++indexInDay,
      }));
  });

  if (allActivities.length === 0) {
    return (
      <div className="bg-stone-100 rounded-2xl h-36 mb-4 flex items-center justify-center text-stone-400 text-sm border border-stone-200">
        🗺️ No location data yet — add locations to activities to see them on the map
      </div>
    );
  }

  const visibleActivities =
    selectedDay !== null
      ? allActivities.filter((a) => a.dayNumber === selectedDay)
      : allActivities;

  const defaultCenter = { lat: allActivities[0].lat, lng: allActivities[0].lng };

  return (
    <div className="mb-4">
      <div className="rounded-2xl overflow-hidden border border-stone-200" style={{ height: 280 }}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={8}
          mapId="DEMO_MAP_ID"
          disableDefaultUI
          gestureHandling="cooperative"
          style={{ width: "100%", height: "100%" }}
        >
          <MapController activities={allActivities} selectedDay={selectedDay} />

          {allActivities.map((activity) => {
            const dimmed =
              selectedDay !== null && activity.dayNumber !== selectedDay;
            return (
              <AdvancedMarker
                key={activity.id}
                position={{ lat: activity.lat, lng: activity.lng }}
                title={activity.title}
                zIndex={dimmed ? 0 : 10}
              >
                <MapPin
                  dayNumber={activity.dayNumber}
                  color={activity.color}
                  dimmed={dimmed}
                  index={activity.indexInDay}
                />
              </AdvancedMarker>
            );
          })}
        </Map>
      </div>

      <MapDaySelector
        days={days}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
    </div>
  );
}

// ─── Public export wraps everything with APIProvider ─────────────────────────

export default function TripMap({ days }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "your-google-maps-api-key") {
    return (
      <div className="bg-stone-100 rounded-2xl h-36 mb-4 flex items-center justify-center text-stone-400 text-sm border border-stone-200">
        🗺️ Add <code className="mx-1 font-mono text-xs bg-stone-200 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable the map
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <TripMapInner days={days} />
    </APIProvider>
  );
}
