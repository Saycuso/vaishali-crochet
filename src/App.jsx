import HomePage from "./pages/home/HomePage";
import Navbar from "./components/custom/Navbar"; // Your new Navbar component
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Careers from "./pages/careers/Careers";
import OrdersAndTracking from "./pages/orders/orders";
import Shop from "./pages/shop/Shop";
import OrderSuccessPage from "./pages/checkout/OrderSuccessPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import "./App.css";
import LoginPage from "./components/custom/LoginPage";
import ProductPage from "./pages/shop/Product/ProuctPage";
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
      {showNavbar && <Navbar />}
      <CartSidebar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:productId" element={<ProductPage />}></Route>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/ordersandtracking" element={<OrdersAndTracking/>}></Route>
        <Route
          path="/order-success/:orderId"
          element={<OrderSuccessPage />} // 👈 This page handles the redirect URL
        />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/checkout" element={<CheckoutPage db={db} />} />
      </Routes>
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
