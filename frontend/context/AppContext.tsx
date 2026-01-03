"use client"

import { AppContextType, AppProviderProps, User } from "@/type";
import { createContext, useContext, useState } from "react"
import { Toaster } from "react-hot-toast"

export const utils_service = "http://localhost:5001";
export const auth_service = "http://localhost:5000";
export const user_service = "http://localhost:5002";
export const job_service = "http://localhost:5003";

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuth, setIsAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const [btnLoading, setBtnLoading] = useState(true)

    return (
        <AppContext.Provider
            value={{
                user,
                loading,
                btnLoading,
                isAuth,
                setUser,
                setBtnLoading,
                setLoading,
                setIsAuth
            }}
        >
            {children}
            <Toaster />
        </AppContext.Provider>
    )
}

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useAppData must be used within AppProvider")
    }
    return context
}
