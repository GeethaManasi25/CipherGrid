// src/api/client.js
import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_BASE?.replace(/\/+$/, "") || "http://localhost:5001";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});










