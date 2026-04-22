"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const USER_API = process.env.NEXT_PUBLIC_USER_API!;
const TASK_API = process.env.NEXT_PUBLIC_TASK_API!;

type Task = {
  _id: string;
  title: string;
  description: string;
  completed?: boolean;
};

type AppType = {
  token: string | null;
  role: string | null;
  initialized: boolean;
  tasks: Task[];
  loading: boolean;

  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;

  fetchTasks: () => Promise<void>;
  createTask: (title: string, description: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

const AppContext = createContext<AppType | null>(null);

export const AppProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const decodeRole = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      setRole(decodeRole(stored));
    }
    setInitialized(true);
  }, []);

  const registerUser = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      await axios.post(`${USER_API}/auth/register`, { name, email, password });
      toast.success("Registered successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed");
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${USER_API}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setRole(decodeRole(res.data.token));
      toast.success("Login successful");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
    toast.success("Logged out");
    window.location.href = "/login";
  };

  const taskAPI = axios.create({ baseURL: TASK_API });

  taskAPI.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.get("/tasks");
      setTasks(res.data);
    } catch {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description: string) => {
    try {
      await taskAPI.post("/tasks", { title, description });
      toast.success("Task created");
      fetchTasks();
    } catch {
      toast.error("Create failed");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskAPI.delete(`/tasks/${id}`);
      toast.success("Deleted");
      fetchTasks();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <AppContext.Provider
      value={{
        token,
        role,
        initialized,
        tasks,
        loading,
        loginUser,
        registerUser,
        logout,
        fetchTasks,
        createTask,
        deleteTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext)!;
