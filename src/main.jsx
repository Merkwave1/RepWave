// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Note the .jsx extension
import './index.css';
import './utils/localeOverrides.js';

// Initialize comprehensive mock data
import { initializeMockData, getMockDataStats } from './mock';

initializeMockData();

// Optional: Log mock data statistics in development
if (import.meta.env.DEV) {
  const stats = getMockDataStats();
  console.log('📊 Mock Data Loaded:', stats);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
