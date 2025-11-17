import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AnalyzePage from "./pages/AnalyzePage";
import HistoryImagePage from "./pages/HistoryPage";
import ImageDetailPage from "./pages/ImageDetailPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis" element={<AnalyzePage />} />
        <Route path="/history" element={<HistoryImagePage />} />
        <Route path="/image/:id" element={<ImageDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
