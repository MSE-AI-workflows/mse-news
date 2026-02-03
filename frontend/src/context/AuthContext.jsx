import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (error) {
            console.error('Error checking authentication:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }    

};
const login = () => {
    window.location.href = 'http://localhost:4000/api/auth/google';
};

    const logout = async() => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error logging out:', error);
        }
        setUser(null);
        window.location.href = '/login';
    };
    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const context = useContext(AuthContext);
    if (!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}