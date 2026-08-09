// Thin re-export so "../services/api" keeps working everywhere,
// while requests actually go through api/axios.js (env baseURL +
// auto token attach + auto-logout on 401).
import API from "../api/axios";

export default API;
