import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/user';
import { supabase } from '../lib/supabase';
import { authService } from '../services/supabaseService';
import { userActivityService } from '../services/userActivityService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Date strings'leri Date objelerine çevir
        const user = {
          ...userData,
          createdAt: new Date(userData.createdAt),
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined
        };
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
    
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Simulated API call - gerçek uygulamada backend'e istek atılacak
      
      // Supabase ile giriş yapmayı dene
      const user = await authService.login(credentials);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Admin kontrolü
      if (credentials.username === 'admin' && credentials.password === 'pass46') {
        const adminUser: User = {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@telegramgruplari.com',
          fullName: 'Site Yöneticisi',
          role: 'admin',
          createdAt: new Date('2023-01-01'), // Sabit bir tarih
          lastLogin: new Date()
        };

        localStorage.setItem('user', JSON.stringify(adminUser));
        setAuthState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Kullanıcıyı allUsers listesine ekle veya güncelle
        try {
          const savedUsers = localStorage.getItem('allUsers');
          let allUsers = [];
          
          if (savedUsers) {
            allUsers = JSON.parse(savedUsers);
            // Kullanıcı zaten varsa güncelle
            const existingUserIndex = allUsers.findIndex((u: User) => u.id === adminUser.id);
            if (existingUserIndex !== -1) {
              allUsers[existingUserIndex] = adminUser;
            } else {
              allUsers.push(adminUser);
            }
          } else {
            allUsers = [adminUser];
          }
          
          localStorage.setItem('allUsers', JSON.stringify(allUsers));
        } catch (error) {
          console.error('Error updating allUsers:', error);
        }
        
        // Record login activity
        userActivityService.addActivity(
          adminUser.id,
          'login',
          'user',
          {}
        );
        
        return true;
      }

      // Normal kullanıcı kontrolü (demo amaçlı)
      if (credentials.username === 'demo' && credentials.password === 'demo123') {
        const demoUser: User = {
          id: 'user-1',
          username: 'demo',
          email: 'demo@example.com',
          fullName: 'Demo Kullanıcı',
          role: 'user',
          createdAt: new Date('2023-06-15'), // Sabit bir tarih
          lastLogin: new Date()
        };

        localStorage.setItem('user', JSON.stringify(demoUser));
        setAuthState({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Kullanıcıyı allUsers listesine ekle veya güncelle
        try {
          const savedUsers = localStorage.getItem('allUsers');
          let allUsers = [];
          
          if (savedUsers) {
            allUsers = JSON.parse(savedUsers);
            // Kullanıcı zaten varsa güncelle
            const existingUserIndex = allUsers.findIndex((u: User) => u.id === demoUser.id);
            if (existingUserIndex !== -1) {
              allUsers[existingUserIndex] = demoUser;
            } else {
              allUsers.push(demoUser);
            }
          } else {
            allUsers = [demoUser];
          }
          
          localStorage.setItem('allUsers', JSON.stringify(allUsers));
        } catch (error) {
          console.error('Error updating allUsers:', error);
        }
        
        // Record login activity
        userActivityService.addActivity(
          demoUser.id,
          'login',
          'user',
          {}
        );
        
        return true;
      }

      // Hatalı giriş
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Simulated API call
      
      // Supabase ile kayıt olmayı dene
      const user = await authService.register(data);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (data.password !== data.confirmPassword) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Kullanıcı adı kontrolü (admin rezerve)
      if (data.username === 'admin') {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date()
      };

      localStorage.setItem('user', JSON.stringify(newUser));

      // Kullanıcıyı allUsers listesine ekle
      try {
        const savedUsers = localStorage.getItem('allUsers');
        let allUsers = [];

        if (savedUsers) {
          allUsers = JSON.parse(savedUsers);
        }

        allUsers.push(newUser);
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        
        // Kullanıcı için boş bir gruplar listesi oluştur
        localStorage.setItem(`userGroups_${newUser.id}`, JSON.stringify([]));
        
        // Create empty activities list
        localStorage.setItem(`userActivities_${newUser.id}`, JSON.stringify([]));
        
        // Record registration activity
        userActivityService.addActivity(
          newUser.id,
          'register',
          'user',
          {}
        );
      } catch (error) {
        console.error('Error updating allUsers:', error);
      }
      
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');

    // Record logout activity if user exists
    if (authState.user) {
      userActivityService.addActivity(
        authState.user.id,
        'logout',
        'user',
        {}
      );
    }
    
    // Kullanıcı çıkış yaptığında, grupları yeniden yüklemek için bir event tetikle
    window.dispatchEvent(new Event('storage'));
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!authState.user) return false;

      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Supabase ile profil güncellemeyi dene
      const success = await authService.updateProfile(authState.user.id, data);
      if (success) {
        const updatedUser = { ...authState.user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAuthState({
          user: updatedUser,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      }

      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = { ...authState.user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};