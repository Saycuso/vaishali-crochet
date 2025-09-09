import HomePage from "./pages/home/HomePage";
import Navbar from "./components/custom/Navbar"; // Your new Navbar component
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Careers from "./pages/careers/Careers";
import Shop from "./pages/shop/Shop";
import "./App.css";
import LoginPage from "./components/custom/LoginPage";
import ProductDetails from "./pages/shop/ProductDetails/ProuctDetails";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

const AppContent = () => {
  const location = useLocation();

  // Conditionally render the Navbar
  const showNavbar = location.pathname !== "/";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:productId" element={<ProductDetails />}></Route>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/Login" element={<LoginPage />} />
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
