"use client";

import { AppContextType, AppProivderProps, User } from "@/type";
import React, { createContext, useState, useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

export const auth_service = 'http://localhost:3000'
export const job_service = 'http://localhost:3003'
export const user_service = 'http://localhost:3002'
export const utils_service = 'http://localhost:3001'

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProivderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  async function fetchUser() {
    try {
      if (!token) {
        setIsAuth(false);
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${user_service}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function logoutUser() {
    Cookies.remove("token");  
    toast.success("Logout Successful");
    setUser(null);
    setIsAuth(false);
  }

  useEffect(() => {
    if (token !== undefined) fetchUser();
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        btnLoading,
        isAuth,
        setIsAuth,
        setLoading,
        setUser,
        setBtnLoading,
        logoutUser,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export default AppContext;

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within App Provider");
  }
  return context;
};
