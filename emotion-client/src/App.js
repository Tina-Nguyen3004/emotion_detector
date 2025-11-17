import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AnalyzePage from "./pages/AnalyzePage";
import HistoryPage from "./pages/HistoryPage";
import ImageDetailPage from "./pages/ImageDetailPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis" element={<AnalyzePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/image/:id" element={<ImageDetailPage />} />
        <Route path="/video/:id" element={<VideoDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
