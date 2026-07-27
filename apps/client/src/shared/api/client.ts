import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not defined");
}

export const api = axios.create({
  baseURL: API_URL,

  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});
