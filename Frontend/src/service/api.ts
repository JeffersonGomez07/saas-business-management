import axios from "axios";

export const apiFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> => {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem("token");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return response;
};

const API = axios.create({ // Crear instancia de Axios con configuración base
  baseURL: "http://localhost:4000" // url backend
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;

