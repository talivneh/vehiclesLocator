import "./App.css";
import { useEffect } from "react";
import Map from "./components/Map";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedVehicleList, isPolygon } from "./atoms/modalAtom";

function App() {
  const [selectedVehicle, setSelectedVehicle] =
    useRecoilState(selectedVehicleList);

  const isPolygonOn = useRecoilValue(isPolygon);

  useEffect(() => {
    async function fetchAllVehiclesData() {
      await fetch(
        "https://vehicles-locator.herokuapp.com/vehicles/api/locations"
      )
        .then((res) => res.json())
        // .then((res) => JSON.stringify(res))
        .then((res) => allVehicles(res));
    }
    fetchAllVehiclesData();
  });

  const allVehicles = (vehicles) => {
    let allVehiclesList = [];
    vehicles.map((vehicle) => {
      const newVehicleObj = {
        id: vehicle.id,
        lat: vehicle.lat,
        lng: vehicle.lng,
      };
      return allVehiclesList.push(newVehicleObj);
    });

    setSelectedVehicle(allVehiclesList);
  };

  return (
    <div className="flex relative bg-green-500 h-screen">
      <section className="overflow-scroll">
        <h1 className="text-lg font-bold text-white text-center py-2">
          {isPolygonOn
            ? `List Of Vehacles In Selected Area:`
            : `List Of All Vehacles:`}
        </h1>
        <ul>
          {selectedVehicle.map((result) => (
            <li
              key={result.id}
              className="flex py-2 px-2 cursor-pointer hover:opacity-80
              hover:shadow-lg transition duration-200 ease-out first:border-t bg-gray-200 my-1 mx-1 rounded-md "
            >
              <p>
                <span className="font-bold">Vehacle ID: </span>
                {result.id}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex-grow relative h-screen">
        <Map />
      </section>
    </div>
  );
}

export default App;
