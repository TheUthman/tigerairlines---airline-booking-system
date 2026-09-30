import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "../features/auth/authSlice";
import bookingReducer from "../features/booking/bookingSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer
  }
});
const useAppDispatch = () => useDispatch();
const useAppSelector = useSelector;
export {
  store,
  useAppDispatch,
  useAppSelector
};
