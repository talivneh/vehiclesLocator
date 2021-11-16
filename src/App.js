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
    if (!isPolygonOn) {
      async function fetchAllVehiclesData() {
        await fetch(
          "https://vehicles-locator.herokuapp.com/vehicles/api/locations"
        )
          .then((res) => res.json())
          .then((res) => allVehicles(res));
      }
      fetchAllVehiclesData();
    }
  }, [isPolygonOn]);

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
    <div className="flex relative bg-red-400 h-screen">
      <section className="overflow-scroll w-52">
        <h1 className="text-lg font-bold text-white text-center py-2">
          {isPolygonOn
            ? `List Of Vehacles In Selected Area:`
            : `List Of All Vehacles:`}
        </h1>
        <ul>
          {selectedVehicle.map((result) => (
            <li
              key={result.id}
              className="flex py-2 px-2 cursor-default hover:bg-gray-400
              shadow-md transition duration-200 ease-out first:border-t bg-gray-200 my-1 mx-1 rounded-md "
            >
              <p className=" truncate" tooltip={result.id}>
                <span className="font-bold ">ID: </span>
                {result.id}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex-grow relative h-screen  min-w-[700px]">
        <Map />
      </section>
    </div>
  );
}

export default App;
