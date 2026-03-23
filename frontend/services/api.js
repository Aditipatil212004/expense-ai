import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "https://expense-ai-1.onrender.com/api",
});

// 🔥 Attach token automatically
API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    req.headers.Authorization = token;
  }

  return req;
});

export default API;