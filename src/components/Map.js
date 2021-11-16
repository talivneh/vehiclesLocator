import { selectedVehicleList, isPolygon } from "../atoms/modalAtom";
import { useRef, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl from "!mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import getCenter from "geolib/es/getCenter";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoidGFsaXZuZWgiLCJhIjoiY2t2dDRncGVnMG84NzMwbHluaG1pNTduMyJ9.R5g9D9qYijhR2jWDw6nXQw";

function Map() {
  const [selectedVehicle, setSelectedVehicle] =
    useRecoilState(selectedVehicleList);

  const setIsPolygonOn = useSetRecoilState(isPolygon);

  const [pointList, setPointList] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [center, setCenter] = useState(getCenter([0, 0]));

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
    setPointList([
      selectedVehicle.map((result) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [result.lng, result.lat],
        },
        properties: {
          title: result.id,
        },
      })),
    ]);

    setCoordinates(
      selectedVehicle.map((result) => ({
        longitude: result.lng,
        latitude: result.lat,
      }))
    );

    setCenter(getCenter(coordinates));
  }, [selectedVehicle]);

  useEffect(() => {
    if (pointList.length > 0 && pointList[0].length > 1) {
      createMap();
    }
  }, [pointList]);

  const createMap = () => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      attributionControl: false,
      container: mapContainer.current,
      style: "mapbox://styles/talivneh/ckvt4juxx0ckc14nmkfihh37h?optimize=true",
      center: [
        center.longitude || -0.0493916683,
        center.latitude || 51.4694976807,
      ],
      zoom: 9,
    });

    map.current.addControl(draw, "top-left");

    map.current.on("draw.create", updateArea);
    map.current.on("draw.update", updateArea);
    map.current.on("draw.delete", () => {
      setIsPolygonOn(false);
    });

    map.current.loadImage(
      "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
      (error, image) => {
        if (error) throw error;
        map.current.addImage("custom-marker", image);
        map.current.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              ...pointList[0],
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-0.0493916683, 51.4694976807],
                },
                properties: {
                  title: "Mapbox DC",
                },
              },
            ],
          },
        });
        map.current.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "custom-marker",
          },
        });
      }
    );
  };

  function updateArea(e) {
    const data = draw.getAll();
    console.log(e.type);
    const coordinates = data.features[0].geometry.coordinates[0].slice(0, -1);
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
        .then((res) => selected(res));
    }
    fetchPolygonData();
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
