"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const USER_API = process.env.NEXT_PUBLIC_USER_API!;
const TASK_API = process.env.NEXT_PUBLIC_TASK_API!;

// ================= TYPES =================

type Task = {
  _id: string;
  title: string;
  description: string;
  completed?: boolean;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type AppType = {
  token: string | null;
  role: string | null;
  initialized: boolean;
  tasks: Task[];
  loading: boolean;

  // AUTH
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;

  // TASKS
  fetchTasks: () => Promise<void>;
  createTask: (title: string, description: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;

  // ADMIN
  fetchUsers: () => Promise<User[] | undefined>;
  deleteUser: (id: string) => Promise<void>;
};

const AppContext = createContext<AppType | null>(null);

// ================= PROVIDER =================

export const AppProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const taskAPI = useRef(axios.create({ baseURL: TASK_API }));

  // ================= UTIL =================

  const decodeRole = (token: string) => {
    try {
      return JSON.parse(atob(token.split(".")[1])).role;
    } catch {
      return null;
    }
  };

  // ================= INIT =================

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      setRole(decodeRole(stored));
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    taskAPI.current.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }, [token]);

  // ================= AUTH =================

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
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
    window.location.href = "/login";
  };

  // ================= TASK =================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.current.get("/tasks");
      setTasks(res.data.tasks);
    } catch {
      toast.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description: string) => {
    try {
      await taskAPI.current.post("/tasks", { title, description });
      toast.success("Created");
      fetchTasks();
    } catch {
      toast.error("Create failed");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskAPI.current.delete(`/tasks/${id}`);
      toast.success("Deleted");
      fetchTasks();
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      await taskAPI.current.put(`/tasks/${id}`, data);
      toast.success("Task updated");
      fetchTasks();
    } catch {
      toast.error("Update failed");
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await taskAPI.current.put(`/tasks/${id}`, {
        completed: !completed,
      });
      fetchTasks();
    } catch {
      toast.error("Toggle failed");
    }
  };

  // ================= ADMIN =================

  const fetchUsers = async (): Promise<User[] | undefined> => {
    try {
      const res = await axios.get(`${USER_API}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch {
      toast.error("Fetch users failed");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`${USER_API}/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted");
    } catch {
      toast.error("Delete user failed");
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
        updateTask,
        toggleTask,
        fetchUsers,
        deleteUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext)!;
