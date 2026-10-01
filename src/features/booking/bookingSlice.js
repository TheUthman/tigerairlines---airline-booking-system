import { createSlice } from "@reduxjs/toolkit";
const initialSearchParams = {
  originCode: "LOS",
  destinationCode: "ABV",
  departDate: "2026-10-15",
  returnDate: "2026-10-22",
  tripType: "roundTrip",
  cabinClass: "Economy",
  passengersCount: 1,
};
const initialExtras = {
  baggageKg: 20,
  mealPreference: "Standard Meal",
  priorityBoarding: false,
  travelInsurance: false,
  loungeAccess: false,
};
const initialState = {
  searchParams: initialSearchParams,
  selectedFlight: null,
  returnFlight: null,
  currentStep: 1,
  passengers: [],
  selectedSeats: [],
  extras: initialExtras,
  confirmedBooking: null,
};
const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    selectFlight: (state, action) => {
      state.selectedFlight = action.payload;
    },
    selectReturnFlight: (state, action) => {
      state.returnFlight = action.payload;
    },
    setBookingStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setPassengers: (state, action) => {
      state.passengers = action.payload;
    },
    updatePassenger: (state, action) => {
      if (state.passengers[action.payload.index]) {
        state.passengers[action.payload.index] = {
          ...state.passengers[action.payload.index],
          ...action.payload.data,
        };
      }
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
      state.passengers.forEach((p, idx) => {
        if (action.payload[idx]) {
          p.seat = action.payload[idx];
        }
      });
    },
    setExtras: (state, action) => {
      state.extras = { ...state.extras, ...action.payload };
    },
    setConfirmedBooking: (state, action) => {
      state.confirmedBooking = action.payload;
    },
    resetBookingFlow: (state) => {
      state.selectedFlight = null;
      state.returnFlight = null;
      state.currentStep = 1;
      state.selectedSeats = ["12A"];
      state.extras = initialExtras;
    },
  },
});
const {
  setSearchParams,
  selectFlight,
  selectReturnFlight,
  setBookingStep,
  setPassengers,
  updatePassenger,
  setSelectedSeats,
  setExtras,
  setConfirmedBooking,
  resetBookingFlow,
} = bookingSlice.actions;
var stdin_default = bookingSlice.reducer;
export {
  bookingSlice,
  stdin_default as default,
  resetBookingFlow,
  selectFlight,
  selectReturnFlight,
  setBookingStep,
  setConfirmedBooking,
  setExtras,
  setPassengers,
  setSearchParams,
  setSelectedSeats,
  updatePassenger,
};
