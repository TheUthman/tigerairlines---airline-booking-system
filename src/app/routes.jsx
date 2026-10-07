import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import CustomerLayout from "../components/layout/CustomerLayout";
import AdminLayout from "../components/layout/AdminLayout";
import RequireAdminAuth from "../features/auth/RequireAdminAuth";
import RequireAuth from "../features/auth/RequireAuth";

const RouteLoading = () => (
  <div className="grid min-h-[40vh] place-items-center" role="status" aria-label="Loading page">
    <span aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const routePage = (loader) => {
  const LazyPage = lazy(loader);

  return function SuspendedRoutePage(props) {
    return (
      <Suspense fallback={<RouteLoading />}>
        <LazyPage {...props} />
      </Suspense>
    );
  };
};

const Landing = routePage(() => import("../pages/Landing"));
const SearchResultsPage = routePage(() => import("../pages/SearchResultsPage"));
const BookingPage = routePage(() => import("../pages/BookingPage"));
const PaymentPage = routePage(() => import("../pages/PaymentPage"));
const ConfirmationPage = routePage(() => import("../pages/ConfirmationPage"));
const ManageBookingPage = routePage(() => import("../pages/ManageBookingPage"));
const FlightStatusPage = routePage(() => import("../pages/FlightStatusPage"));
const CheckInPage = routePage(() => import("../pages/CheckInPage"));
const MyTripsPage = routePage(() => import("../pages/MyTripsPage"));
const FAQPage = routePage(() => import("../pages/FAQPage"));
const ContactPage = routePage(() => import("../pages/ContactPage"));
const LegalPage = routePage(() => import("../pages/LegalPage"));
const NotFoundPage = routePage(() => import("../pages/NotFoundPage"));
const DestinationsPage = routePage(() => import("../pages/DestinationsPage"));
const OffersPage = routePage(() => import("../pages/OffersPage"));
const LoginPage = routePage(() => import("../pages/LoginPage"));
const RegisterPage = routePage(() => import("../pages/RegisterPage"));
const VerifyEmailPage = routePage(() => import("../pages/VerifyEmailPage"));
const ForgotPasswordPage = routePage(() => import("../pages/ForgotPasswordPage"));
const StyleGuidePage = routePage(() => import("../pages/StyleGuidePage"));
const AdminLoginPage = routePage(() => import("../pages/AdminLoginPage"));
const AdminDashboardPage = routePage(() => import("../pages/AdminDashboardPage"));
const AdminFlightsPage = routePage(() => import("../pages/AdminFlightsPage"));
const AdminAircraftPage = routePage(() => import("../pages/AdminAircraftPage"));
const AdminAirportsPage = routePage(() => import("../pages/AdminAirportsPage"));
const AdminPassengersPage = routePage(() => import("../pages/AdminPassengersPage"));
const AdminBookingsPage = routePage(() => import("../pages/AdminBookingsPage"));
const AdminUsersPage = routePage(() => import("../pages/AdminUsersPage"));
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
