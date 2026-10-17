"use client";

import dynamic from "next/dynamic";

const DeliveryMapCanvas = dynamic(() => import("./DeliveryMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="delivery-map-loading" role="status">
      Loading interactive map…
    </div>
  ),
});

export default function DeliveryLocationMap({
  coordinates,
  showUnavailable = false,
}) {
  return (
    <DeliveryMapCanvas
      coordinates={coordinates}
      showUnavailable={showUnavailable}
    />
  );
}
