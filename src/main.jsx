// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Note the .jsx extension
import './index.css';
import './utils/localeOverrides.js';
import { seedMockData } from "./mock/mockData";

seedMockData();
import { seedBigMockData } from "./mock/seedBigMockData";

seedBigMockData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
