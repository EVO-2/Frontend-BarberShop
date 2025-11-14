export const environment = {
  production: false,
  apiUrl: window.location.hostname === 'localhost' 
          ? 'http://localhost:3000/api' 
          : 'http://backend:3000/api',
  baseUrl: window.location.hostname === 'localhost' 
          ? 'http://localhost:3000' 
          : 'http://backend:3000'
};
