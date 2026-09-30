import { Routes, Route } from "react-router-dom";
import CustomerLayout from "../components/layout/CustomerLayout";
import AdminLayout from "../components/layout/AdminLayout";
import Landing from "../pages/Landing";
import SearchResultsPage from "../pages/SearchResultsPage";
import BookingPage from "../pages/BookingPage";
import PaymentPage from "../pages/PaymentPage";
import ConfirmationPage from "../pages/ConfirmationPage";
import ManageBookingPage from "../pages/ManageBookingPage";
import FlightStatusPage from "../pages/FlightStatusPage";
import CheckInPage from "../pages/CheckInPage";
import MyTripsPage from "../pages/MyTripsPage";
import FAQPage from "../pages/FAQPage";
import ContactPage from "../pages/ContactPage";
import LegalPage from "../pages/LegalPage";
import NotFoundPage from "../pages/NotFoundPage";
import DestinationsPage from "../pages/DestinationsPage";
import OffersPage from "../pages/OffersPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import StyleGuidePage from "../pages/StyleGuidePage";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminFlightsPage from "../pages/AdminFlightsPage";
import AdminAircraftPage from "../pages/AdminAircraftPage";
import AdminAirportsPage from "../pages/AdminAirportsPage";
import AdminPassengersPage from "../pages/AdminPassengersPage";
import AdminBookingsPage from "../pages/AdminBookingsPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import RequireAdminAuth from "../features/auth/RequireAdminAuth";
import RequireAuth from "../features/auth/RequireAuth";
const AppRoutes = () => {
  return <Routes>
      {
    /* Customer Routes inside Main Customer Layout */
  }
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Landing />} />
        <Route path="search" element={<SearchResultsPage />} />

        {
    /* Customer Protected Routes - RequireAuth guard with redirect-back pattern */
  }
        <Route
    path="book"
    element={<RequireAuth>
              <BookingPage />
            </RequireAuth>}
  />
        <Route
    path="payment"
    element={<RequireAuth>
              <PaymentPage />
            </RequireAuth>}
  />
        <Route
    path="manage-booking"
    element={<RequireAuth>
              <ManageBookingPage />
            </RequireAuth>}
  />
        <Route
    path="my-trips"
    element={<RequireAuth>
              <MyTripsPage />
            </RequireAuth>}
  />

        {
    /* Public Information Pages */
  }
        <Route path="confirmation" element={<ConfirmationPage />} />
        <Route path="flight-status" element={<FlightStatusPage />} />
        <Route path="check-in" element={<CheckInPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="legal" element={<LegalPage />} />
        <Route path="terms" element={<LegalPage />} />
        <Route path="privacy" element={<LegalPage />} />
        <Route path="baggage-policy" element={<LegalPage />} />
        <Route path="customer-service-plan" element={<LegalPage />} />
        <Route path="destinations" element={<DestinationsPage />} />
        <Route path="offers" element={<OffersPage />} />

        {
    /* Customer Auth Pages */
  }
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />

        {
    /* Internal Developer Style-Guide (Not in Nav) */
  }
        <Route path="dev/style-guide" element={<StyleGuidePage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {
    /* Admin Login Route */
  }
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {
    /* Admin Route Group - Role Guarded (Soliat's scope) */
  }
      <Route
    path="/admin"
    element={<RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>}
  >
        <Route index element={<AdminDashboardPage />} />
        <Route path="flights" element={<AdminFlightsPage />} />
        <Route path="aircraft" element={<AdminAircraftPage />} />
        <Route path="airports" element={<AdminAirportsPage />} />
        <Route path="passengers" element={<AdminPassengersPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {
    /* Wildcard Fallback */
  }
      <Route path="*" element={<NotFoundPage />} />
    </Routes>;
};
var stdin_default = AppRoutes;
export {
  AppRoutes,
  stdin_default as default
};
