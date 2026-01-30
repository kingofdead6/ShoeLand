import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import Navbar from "./Components/Shared/NavBar";
import Footer from "./Components/Shared/Footer";
import Products from "./Components/Products/Products";
import ProductDetailsPage from "./Components/Products/ProductDetails";
import MenProductsPage from "./Components/Products/MenProducts";
import WomenProductsPage from "./Components/Products/WomenProducts";
import CartPage from "./Components/Shared/Cart";
import Login from "./Pages/Login";
import ProtectedRoute from "./Components/Shared/ProtectedRoute";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import AdminProducts from "./Components/Admin/AdminProducts";
import AdminCategories from "./Components/Admin/AdminCategories";
import ScrollToTop from "./Components/Shared/ScrollToTop";
import AdminDeliveryAreas from "./Components/Admin/AdminDeleiveryAreas";
import AdminUsers from "./Components/Admin/AdminUsers";
import FinalizeOrder from "./Components/Products/FinalizeOrder";
import AdminOrders from "./Components/Admin/AdminOrders";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/men" element={<MenProductsPage /> } />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/products/women" element={<WomenProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<FinalizeOrder />} />
          <Route path="/login" element={<Login /> }/>

           <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/delivery-areas" element={<AdminDeliveryAreas />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Route>

      </Routes>
      <Footer />
    </Router>
  );
}

export default App;