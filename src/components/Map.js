import { selectedVehicleList, isPolygon } from "../atoms/modalAtom";
import { useRef, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import mapboxgl from "!mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import getCenter from "geolib/es/getCenter";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoidGFsaXZuZWgiLCJhIjoiY2t2dDRncGVnMG84NzMwbHluaG1pNTduMyJ9.R5g9D9qYijhR2jWDw6nXQw";

function Map() {
  const [selectedVehicle, setSelectedVehicle] =
    useRecoilState(selectedVehicleList);

  const setIsPolygonOn = useSetRecoilState(isPolygon);

  const coordinates = selectedVehicle.map((result) => ({
    longitude: result.lng,
    latitude: result.lat,
  }));

  const center = getCenter(coordinates);

  const mapContainer = useRef(null);
  const map = useRef(null);

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
    defaultMode: "draw_polygon",
  });

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      attributionControl: false,
      container: mapContainer.current,
      style: "mapbox://styles/talivneh/ckvt4juxx0ckc14nmkfihh37h",
      center: [
        center.longitude || -0.0493916683,
        center.latitude || 51.4694976807,
      ],
      zoom: 9,
    });

    map.current.addControl(draw, "top-left");

    map.current.on("draw.create", updateArea);
    map.current.on("draw.delete", updateArea);
    map.current.on("draw.update", updateArea);
  });

  useEffect(() => {
    if (selectedVehicle.length > 0) {
      selectedVehicle.map((result) => {
        // <div className="marker" id={result.id} />
        new mapboxgl.Marker()
          .setLngLat([result.lng, result.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<h3 class="font-bold text-lg">Vehicle ID:</h3><p class="text-sm">${result.id}</p>`
            )
            // .on("click", () => {
            //   console.log("clicked popup");
            // })
          )
          .addTo(map.current);
      });
    }
  }, [selectedVehicle]);

  function updateArea(e) {
    const data = draw.getAll();
    if (e.type != "draw.delete") {
      const coordinates = data.features[0].geometry.coordinates[0].slice(0, -1);
      console.log(coordinates);
      setIsPolygonOn(true);
      async function fetchPolygonData() {
        await fetch(
          `https://vehicles-locator.herokuapp.com/vehicles/api/vehiclesIdsInsidePolygon/`,
          {
            headers: {
              "Content-type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(coordinates),
          }
        )
          .then((res) => res.json())
          // .then((res) => JSON.stringify(res))
          .then((res) => selected(res));
      }
      fetchPolygonData();
    } else {
      setIsPolygonOn(false);
    }
  }

  const selected = (vehicles) => {
    let polygonVehiclesList = [];
    vehicles.map((vehicle) => {
      const newVehicleObj = {
        id: vehicle.id,
        lat: vehicle.lat,
        lng: vehicle.lng,
      };
      return polygonVehiclesList.push(newVehicleObj);
    });

    setSelectedVehicle(polygonVehiclesList);
  };

  return (
    <div>
      <div ref={mapContainer} className="map-container h-screen" />
    </div>
  );
}

export default Map;
