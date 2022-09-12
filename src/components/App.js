import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Dashboard from "./Dashboard.js";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Navigate to="/search" />} />
        <Route exact path="/search" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}