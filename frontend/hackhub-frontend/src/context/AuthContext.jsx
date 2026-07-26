import { createContext, useContext, useState } from 'react';
import {
    saveToken,
    saveUser,
    getToken,
    getUser,
    removeToken,
    removeUser,
    isAuthenticated
} from '../utils/tokenUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(getToken());
    const [user, setUser] = useState(getUser());

    const login = (loginData) => {
        saveToken(loginData.token);
        saveUser({
            userId: loginData.userId,
            name: loginData.name,
            email: loginData.email,
            role: loginData.role,
            status: loginData.status,
        });
        setToken(loginData.token);
        setUser({
            userId: loginData.userId,
            name: loginData.name,
            email: loginData.email,
            role: loginData.role,
            status: loginData.status,
        });
    };

    const logout = () => {
        removeToken();
        removeUser();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            user,
            login,
            logout,
            isAuthenticated: isAuthenticated(),
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within AuthProvider');
    return context;
};