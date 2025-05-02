import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ConsumerDashboard from './pages/ConsumerDashboard';
import LenderDashboard from './pages/LenderDashboard';
import Login from './pages/LoginForm';
import Register from './pages/RegisterForm';
import HomePage from './pages/HomePage';
import PrivateRoute from './pages/PrivateRoute';
import './App.css';

// New feature components
import CreditReport from './pages/CreditReport';
import CreditChart from './pages/CreditChart';
import PayLoan from './pages/PayLoan';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/consumer/dashboard/*" element={<ConsumerDashboard />} />
          <Route path="/lender/dashboard/*" element={<LenderDashboard />} />
          <Route path="/consumer/credit-report" element={<CreditReport />} />
          <Route path="/consumer/credit-chart" element={<CreditChart />} />
          <Route path="/consumer/pay-loan" element={<PayLoan />} />
        </Route>

        {/* ✅ Redirect all unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
