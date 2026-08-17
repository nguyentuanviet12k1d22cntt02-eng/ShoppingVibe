'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

interface AuthResult {
  success: boolean;
  error?: string;
  role?: 'admin' | 'customer';
}

interface AuthContextType {
  user: UserSession | null;
  isAdmin: boolean;
  isLoading: boolean;
  isMounted: boolean;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  login: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const supabase = createClient();

  const parseUserFromSupabase = async (sbUser: any): Promise<UserSession> => {
    const fullName =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      sbUser.email?.split('@')[0] ||
      'Khách hàng';

    const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    const isConfiguredAdmin = configuredAdminEmail && sbUser.email?.toLowerCase() === configuredAdminEmail;

    let role: 'admin' | 'customer' = isConfiguredAdmin
      ? 'admin'
      : (sbUser.app_metadata?.role || sbUser.user_metadata?.role || 'customer');

    // Fetch from profiles table for definitive role
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sbUser.id)
        .single();

      if (profile?.role) {
        role = profile.role === 'admin' ? 'admin' : 'customer';
      }
    } catch (e) {
      console.error('Error fetching user profile role:', e);
    }

    return {
      id: sbUser.id,
      name: fullName,
      email: sbUser.email || '',
      role,
    };
  };

  useEffect(() => {
    setIsMounted(true);

    // 1. Get current active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const parsed = await parseUserFromSupabase(session.user);
        setUser(parsed);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // 2. Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const parsed = await parseUserFromSupabase(session.user);
        setUser(parsed);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Đăng ký tài khoản mới qua Supabase Auth
  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      try {
        setIsLoading(true);
        const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
        const initialRole = (configuredAdminEmail && email.trim().toLowerCase() === configuredAdminEmail) ? 'admin' : 'customer';

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              name: name.trim(),
              role: initialRole,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        // Tự động đăng nhập ngay sau khi đăng ký
        if (!data.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInError) {
            return { success: false, error: signInError.message };
          }
          if (signInData.user) {
            const parsed = await parseUserFromSupabase(signInData.user);
            setUser(parsed);
            return { success: true, role: parsed.role };
          }
        } else if (data.user) {
          const parsed = await parseUserFromSupabase(data.user);
          setUser(parsed);
          return { success: true, role: parsed.role };
        }

        return { success: true, role: 'customer' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi không xác định khi đăng ký' };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  // Đăng nhập qua Supabase Auth
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          let userMsg = error.message;
          if (error.message.includes('Invalid login credentials')) {
            userMsg = 'Email hoặc mật khẩu không chính xác.';
          } else if (error.message.includes('Email not confirmed')) {
            userMsg = 'Email chưa được xác thực.';
          }
          return { success: false, error: userMsg };
        }

        if (data.user) {
          const parsed = await parseUserFromSupabase(data.user);
          setUser(parsed);
          return { success: true, role: parsed.role };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi khi đăng nhập' };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  // Đăng xuất qua Supabase Auth
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Error during signOut:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Fallback login alias
  const login = useCallback((name: string, email: string) => {
    const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    const role = (configuredAdminEmail && email.toLowerCase() === configuredAdminEmail) ? 'admin' : 'customer';
    setUser({
      id: 'user-' + Date.now(),
      name: name || 'Khách hàng',
      email: email || '',
      role,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        isMounted,
        signUp,
        signIn,
        signOut,
        logout: signOut,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


