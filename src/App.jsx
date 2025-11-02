import HomePage from "./pages/home/HomePage";
import Navbar from "./components/custom/Navbar"; // Your new Navbar component
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Careers from "./pages/careers/Careers";
import Shop from "./pages/shop/Shop";
import OrderSuccessPage from "./pages/checkout/OrderSuccessPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import Login from "./components/custom/Login";
import Signup from "./components/custom/Signup";
import "./App.css";
import DetailsPage from "./components/custom/DetailsPage";
import ProductPage from "./pages/shop/Product/ProuctPage";
import CartSync from "./components/custom/CartSync";
import OrderTrackingPage from "./pages/orders/OrderTrackingPage";
import OrderTrackingDetails from "./pages/orders/OrderTrackingDetails";
import Wishlist from "./components/custom/Wishlist";
import TermsAndConditionsPage from "./pages/policy pages/Terms-and-conditions";
import PrivacyPolicyPage from "./pages/policy pages/Privacy-policy";
import RefundPolicyPage from "./pages/policy pages/Refund-policy";
import Footer from "./components/custom/Footer";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminRoute from "./components/custom/auth/AdminRoute";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import CartSidebar from "./components/CartSidebar";
import { db } from "./firebase";

const AppContent = () => {
  const location = useLocation();

  // Conditionally render the Navbar
  const showNavbar = location.pathname !== "/";

  return (
    <>
      <CartSync />
      {showNavbar && <Navbar />}
      <CartSidebar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:productId" element={<ProductPage />}></Route>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/orderstrackingpage" element={<OrderTrackingPage />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route
          path="/terms-and-conditions"
          element={<TermsAndConditionsPage />}
        />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route
          path="/ordertrackingdetails/:orderId"
          element={<OrderTrackingDetails />}
        />
        <Route path="/detailspage" element={<DetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage db={db} />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin/orders" element={<AdminOrdersPage db={db} />} />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage db={db} />
            </AdminRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};
export default App;
