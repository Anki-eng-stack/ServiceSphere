import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import BookService from "./pages/BookService";
import Chat from "./pages/Chat";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProviderServices from "./pages/ProviderServices";
import ProviderBookings from "./pages/ProviderBookings";
import ProviderDashboard from "./pages/ProviderDashboard";
import CustomerBookings from "./pages/CustomerBookings";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book/:id" element={<BookService />} />
        <Route path="/chat/:bookingId" element={<Chat />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/my-bookings" element={<CustomerBookings />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/services" element={<ProviderServices />} />
        <Route path="/provider/bookings" element={<ProviderBookings />} />
      </Routes>
    </Router>
  );
}

export default App;
