import { Routes, Route, Navigate } from 'react-router-dom';
import { RegisterPage } from './pages/RegisterPage';
import { BookingPage } from './pages/BookingPage';
import { ClaimsPage } from './pages/ClaimsPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/booking" replace />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/claims" element={<ClaimsPage />} />
    </Routes>
  );
}