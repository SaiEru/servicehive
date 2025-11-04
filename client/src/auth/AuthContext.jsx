import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(() => localStorage.getItem('token'));

	useEffect(() => {
		setAuthToken(token);
		if (token) localStorage.setItem('token', token);
		else localStorage.removeItem('token');
	}, [token]);

	const login = async (email, password) => {
		const { data } = await api.post('/api/auth/login', { email, password });
		setToken(data.token);
		setUser(data.user);
	};

	const signup = async (name, email, password) => {
		const { data } = await api.post('/api/auth/signup', { name, email, password });
		setToken(data.token);
		setUser(data.user);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
	};

	const value = useMemo(() => ({ user, token, login, signup, logout }), [user, token]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}


