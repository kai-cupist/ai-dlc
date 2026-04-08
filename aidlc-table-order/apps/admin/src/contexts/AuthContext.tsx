import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'shared';
import { authApi } from 'shared';
import type { AdminLoginRequest } from 'shared';

interface AuthContextValue {
  isAuthenticated: boolean;
  isAdmin: boolean;
  storeId: string | null;
  accessToken: string | null;
  loginError: string | null;
  isLoggingIn: boolean;
  login: (data: AdminLoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useCallback(
    async (data: AdminLoginRequest) => {
      setLoginError(null);
      setIsLoggingIn(true);
      try {
        const response = await authApi.adminLogin(data);
        const { access_token, refresh_token } = response.data.data;
        auth.login(access_token, refresh_token);
        navigate('/', { replace: true });
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: { message?: string } }; status?: number } };
        if (error.response?.status === 423) {
          setLoginError('계정이 잠겼습니다. 15분 후에 다시 시도해주세요.');
        } else if (error.response?.status === 401) {
          setLoginError('매장ID, 사용자명 또는 비밀번호가 올바르지 않습니다.');
        } else {
          setLoginError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } finally {
        setIsLoggingIn(false);
      }
    },
    [auth, navigate],
  );

  const logout = useCallback(() => {
    auth.logout();
    navigate('/login', { replace: true });
  }, [auth, navigate]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: auth.isAuthenticated,
        isAdmin: auth.isAdmin,
        storeId: auth.storeId,
        accessToken: auth.accessToken,
        loginError,
        isLoggingIn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
