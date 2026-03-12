import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthContextType, RegisterData } from '@/types';
import { authAPI } from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Bootstrap session from localStorage. We trust the stored
    // user shape but clear obviously malformed data. If only a
    // token exists, try to hydrate the user from the backend.
    const storedUser = localStorage.getItem('truechoice_user');
    const storedToken = localStorage.getItem('truechoice_token');

    const bootstrap = async () => {
      if (storedUser && storedToken) {
        try {
          const parsed = JSON.parse(storedUser) as User;
          setUser(parsed);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('truechoice_user');
          localStorage.removeItem('truechoice_token');
        }
      }

      // If we have a token but no valid stored user, attempt to
      // fetch the current user profile to restore the session.
      if (storedToken && !storedUser) {
        try {
          const profileRes = await authAPI.getCurrentUser();
          const profileData = (profileRes as any).user || profileRes;
          const hydratedUser: User = {
            id: profileData.id || profileData._id,
            email: profileData.email,
            srn: profileData.SRN || profileData.srn,
            name: profileData.fullName || profileData.name || 'User',
            role: (profileData.role || 'voter') as User['role'],
            createdAt: profileData.createdAt || new Date().toISOString(),
          };
          setUser(hydratedUser);
          localStorage.setItem('truechoice_user', JSON.stringify(hydratedUser));
        } catch (error) {
          console.error('Failed to hydrate session from token:', error);
          localStorage.removeItem('truechoice_token');
          localStorage.removeItem('truechoice_user');
        }
      }

      setIsLoading(false);
    };

    void bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      // After API normalization, authAPI.login returns the inner
      // `{ token, user }` payload from `{ success, message, data }`.
      const resData = response || {};
      const extractedToken = resData.token;

      // Store token first so we can make authenticated requests
      if (extractedToken) {
        localStorage.setItem('truechoice_token', extractedToken);
      }

      // Fetch full profile data after login
      let profileData: any = {};
      try {
        const profileRes = await authAPI.getCurrentUser();
        // getCurrentUser returns the inner `{ user }` payload.
        profileData = profileRes.user || profileRes;
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }

      const userObj = resData.user || {};
      const userData: User = {
        id: userObj.id || userObj._id || profileData.id || profileData._id,
        email: profileData.email || userObj.email,
        srn: profileData.SRN || profileData.srn || userObj.srn,
        name: profileData.fullName || profileData.name || userObj.fullName || userObj.name || 'User',
        role: (userObj.role || profileData.role || 'voter') as User['role'],
        createdAt: userObj.createdAt || profileData.createdAt || new Date().toISOString(),
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

      // After normalization, register returns the inner payload.
      const resData = response || {};
      const extractedToken = resData.token;

      // Store token and user data
      if (extractedToken) {
        localStorage.setItem('truechoice_token', extractedToken);
      }

      const userObj = resData.user || {};
      const userData: User = {
        id: userObj.id || userObj._id,
        email: userObj.email,
        srn: userObj.srn,
        name: userObj.fullName || userObj.name || 'User',
        role: (userObj.role || 'voter') as User['role'],
        createdAt: userObj.createdAt || new Date().toISOString(),
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
