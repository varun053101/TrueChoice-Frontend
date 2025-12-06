import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthContextType, RegisterData, UserRole } from '@/types';
import { authAPI } from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session and validate with backend
    const storedUser = localStorage.getItem('truechoice_user');
    const storedToken = localStorage.getItem('truechoice_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('truechoice_user');
        localStorage.removeItem('truechoice_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      // Store token first so we can make authenticated requests
      if (response.token) {
        localStorage.setItem('truechoice_token', response.token);
      }
      
      // Fetch full profile data after login
      let profileData: any = {};
      try {
        profileData = await authAPI.getCurrentUser();
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
      
      const userData: User = {
        id: response.user.id || response.id,
        email: profileData.email || response.user.email || response.email,
        srn: profileData.SRN || profileData.srn || response.user.srn || response.srn,
        name: profileData.name || response.user.fullName || response.user.name || response.name || 'User',
        role: response.user.role || response.role || 'voter',
        createdAt: response.user.createdAt || response.createdAt || new Date().toISOString(),
      };
      
      console.log('Login - User data:', userData);
      setUser(userData);
      localStorage.setItem('truechoice_user', JSON.stringify(userData));
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // Validate SRN pattern
      const srnPattern = /^R\d{2}[A-Z]{2}\d{3}$/;
      if (!srnPattern.test(data.srn)) {
        setIsLoading(false);
        throw new Error('Invalid SRN format. Expected: R22CS001');
      }

      const response = await authAPI.register({
        email: data.email,
        password: data.password,
        fullName: data.name, // Map 'name' to 'fullName' for backend
        srn: data.srn,
      });
      
      // Store token and user data
      if (response.token) {
        localStorage.setItem('truechoice_token', response.token);
      }
      
      const userData: User = {
        id: response.user.id || response.id,
        email: response.user.email || response.email,
        srn: response.user.srn || response.srn,
        name: response.user.fullName || response.user.name || response.fullName || response.name,
        role: response.user.role || response.role || 'voter',
        createdAt: response.user.createdAt || response.createdAt || new Date().toISOString(),
      };
      
      setUser(userData);
      localStorage.setItem('truechoice_user', JSON.stringify(userData));
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('truechoice_user');
      localStorage.removeItem('truechoice_token');
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
