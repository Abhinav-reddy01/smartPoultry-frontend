
import React from 'react';

import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { clearAuth, getToken } from './api';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard';
import EggStock from './pages/EggStock';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Tax from './pages/Tax';
import Reports from './pages/Reports';

// Sidebar menu
const menu = [
  ['/', 'Dashboard', '⌂'],
  ['/stock', 'Egg Stock', '🥚'],
  ['/sales', 'Egg Sales', '🥚'],
  ['/customers', 'Customers', '👥'],
  ['/income', 'Income', '₹'],
  ['/expenses', 'Expenses', '↘'],
  ['/tax', 'Tax', '%'],
  ['/reports', 'Reports', '▤'],
];

// Protect pages that require login
function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
// Main application layout
function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    clearAuth();

    navigate('/login', {
      replace: true,
    });
  };

  const currentPage =
    menu.find(([path]) => path === location.pathname)?.[1]
    || 'Management';

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            🐔
          </div>

          <div>
            <div className="brand-title">
              Smart Poultry
            </div>

            <div className="brand-subtitle">
              Farm Management
            </div>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="nav-menu">

          {menu.map(([path, label, icon]) => (

            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >

              <span className="nav-icon">
                {icon}
              </span>

              <span>
                {label}
              </span>

            </NavLink>

          ))}

        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">

          <div className="status-pill">
            <span className="status-dot" />
            System connected
          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        <header className="topbar">

          <div>

            <div className="breadcrumb">
              Smart Poultry Farm
            </div>

            <h1 className="page-title">
              {currentPage}
            </h1>

          </div>

          <div className="topbar-user">

            <div className="avatar">
              A
            </div>

            <div>
              <div className="user-name">
                Farm Admin
              </div>

              <div className="user-role">
                Administrator
              </div>
            </div>

          </div>

        </header>

        {/* PAGE ROUTES */}
        <section className="page-body">

          <Routes>

            {/* DASHBOARD */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* NEW EGG STOCK PAGE */}
            <Route
              path="/stock"
              element={
                <ProtectedRoute>
                  <EggStock />
                </ProtectedRoute>
              }
            />

            {/* EGG SALES */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />

            {/* CUSTOMERS */}
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              }
            />

            {/* INCOME */}
            <Route
              path="/income"
              element={
                <ProtectedRoute>
                  <Income />
                </ProtectedRoute>
              }
            />

            {/* EXPENSES */}
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />

            {/* TAX */}
            <Route
              path="/tax"
              element={
                <ProtectedRoute>
                  <Tax />
                </ProtectedRoute>
              }
            />

            {/* REPORTS */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* UNKNOWN URL */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </section>

      </main>

    </div>
  );
}

// Application entry component
export default function App() {
  const location = useLocation();

  if (location.pathname === '/login') {
    return <Login />;
  }

  return <Layout />;
}
