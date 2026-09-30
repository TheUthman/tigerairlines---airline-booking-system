/**
 * Central Modular Service Barrel Export for TigerAirlines Microservices API Layer.
 * Direct mapping to endpoints described in API_ENDPOINTS.md
 */

export { apiClient, extractData } from "./apiClient";
export { authService } from "./authService";
export { pricingService } from "./pricingService";
export { passengerService } from "./passengerService";
export { bookingService } from "./bookingService";
export { paymentService } from "./paymentService";
export { notificationService } from "./notificationService";
export { flightService } from "./flightService";
export { adminService } from "./adminService";

// Default export providing all services namespaced
import apiClient from "./apiClient";
import authService from "./authService";
import pricingService from "./pricingService";
import passengerService from "./passengerService";
import bookingService from "./bookingService";
import paymentService from "./paymentService";
import notificationService from "./notificationService";
import flightService from "./flightService";
import adminService from "./adminService";

const services = {
  apiClient,
  authService,
  pricingService,
  passengerService,
  bookingService,
  paymentService,
  notificationService,
  flightService,
  adminService
};

export default services;
