import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import CategoryList from './pages/CategoryList';
import OrderList from './pages/OrderList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth';
import OrderDetails from './pages/OrderDetails';
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';
import ProductAnalytics from './pages/ProductAnalytics';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={
            <RequireAuth>
              <div className="d-flex min-vh-100">
                <Sidebar />
                <div className="main-content-area p-4">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id/edit" element={<EditProduct />} />
                    <Route path="/categories" element={<CategoryList />} />
                    <Route path="/products/add" element={<AddProduct />} />
                    <Route path="/orders" element={<OrderList />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/users" element={<UsersList />} />
                    <Route path="/users/:id" element={<UserDetails />} />
                    <Route path="/product-analytics" element={<ProductAnalytics />} />
                  </Routes>
                </div>
              </div>
            </RequireAuth>
          } />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

