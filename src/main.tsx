import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// GitHub Pages serves 404.html for a directly opened detail route.
const redirect = new URLSearchParams(location.search).get('route');
if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
  history.replaceState(null, '', import.meta.env.BASE_URL.replace(/\/$/, '') + redirect);
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter basename={import.meta.env.BASE_URL}><App /></BrowserRouter></React.StrictMode>,
);
