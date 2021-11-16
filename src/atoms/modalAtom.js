import { atom } from "recoil";

const selectedVehicleList = atom({
  key: "selectedVehicleList",
  default: [],
});

const isPolygon = atom({
  key: "isPolygon",
  default: false,
});

export { selectedVehicleList, isPolygon };
