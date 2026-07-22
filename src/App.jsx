import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePageSimple from './components/HomePageSimple';
import TimetableApp from './components/TimetableApp';
import FacialRecognitionApp from './components/FacialRecognitionApp';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePageSimple />} />
          <Route path="/timetable/*" element={<TimetableApp />} />
          <Route path="/facial-recognition/*" element={<FacialRecognitionApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
