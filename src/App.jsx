import React, { Suspense } from "react"; // 👈 IMPORT SUSPENSE
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
// --------------------------------------------------------
// 1. (EAGER LOAD) - The user sees these instantly
// --------------------------------------------------------
import HomePage from "./pages/homepage/HomePage";
import Navbar from "./components/custom/Navbar"; // Your new Navbar component
import Footer from "./components/custom/Footer";
import ScrollToTop from "./components/custom/ScrollToTop";
import CartSidebar from "./components/CartSidebar";
import CartSync from "./components/custom/CartSync";
import AdminRoute from "./components/custom/auth/AdminRoute";
import { db } from "./firebase";
import "./App.css";

// --------------------------------------------------------
// 2. LAZY LOAD THESE - Download these only when clicked
// --------------------------------------------------------
// Shop & Products
const Shop = React.lazy(()=> import ("./pages/shop/Shop"));
const ProductPage = React.lazy(() => import("./pages/shop/Product/ProuctPage"));
const DetailsPage = React.lazy(() => import("./components/custom/DetailsPage"));
const Wishlist = React.lazy(() => import("./components/custom/Wishlist"));

// Admin Dashboard (HUGE SAVINGS HERE)
const AdminOrdersPage = React.lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminOrderDetailPage = React.lazy(() => import("./pages/admin/AdminOrderDetailPage"));
const AdminProductsPage = React.lazy(() => import("./pages/admin/AdminProductsPage"));

// Auth & Checkout
const Login = React.lazy(() => import("./components/custom/Login"));
const Signup = React.lazy(() => import("./components/custom/Signup"));
const CheckoutPage = React.lazy(() => import("./pages/checkout/CheckoutPage"));
const OrderSuccessPage = React.lazy(() => import("./pages/checkout/OrderSuccessPage"));
const OrderTrackingPage = React.lazy(() => import("./pages/orders/OrderTrackingPage"));
const OrderTrackingDetails = React.lazy(() => import("./pages/orders/OrderTrackingDetails"));

// Info Pages
const About = React.lazy(() => import("./pages/about/About"));
const Contact = React.lazy(() => import("./pages/contact/Contact"));
const Careers = React.lazy(() => import("./pages/careers/Careers"));
const TermsAndConditionsPage = React.lazy(() => import("./pages/policy pages/Terms-and-conditions"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/policy pages/Privacy-policy"));
const RefundPolicyPage = React.lazy(() => import("./pages/policy pages/Refund-policy"));

// --------------------------------------------------------
// 3. LOADER COMPONENT - What users see while the chunk downloads
// --------------------------------------------------------
const PageLoader = () => (
  <div className="flex justify-center items-center h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>
);


const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <>  
      <CartSync />
      {showNavbar && <Navbar />}
      <CartSidebar />
       <ScrollToTop />

       <Suspense fallback={<PageLoader />}>
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
        <Route
          path="/admin/orders/:orderId"
          element={
            <AdminRoute>
              <AdminOrderDetailPage />
            </AdminRoute>
          }
        />
        <Route path="/detailspage" element={<DetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage db={db} />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage db={db} />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
      </Routes>
      </Suspense>
      
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
