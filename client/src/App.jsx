import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import { Toaster } from 'react-hot-toast';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function UserOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login?redirect=admin" />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#1a1a24', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.2)' } }} />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<UserOnlyRoute><Home /></UserOnlyRoute>} />
          <Route path="/products" element={<UserOnlyRoute><Products /></UserOnlyRoute>} />
          <Route path="/products/:id" element={<UserOnlyRoute><ProductDetail /></UserOnlyRoute>} />
          <Route path="/cart" element={<UserOnlyRoute><Cart /></UserOnlyRoute>} />
          <Route path="/checkout" element={<UserOnlyRoute><Checkout /></UserOnlyRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
