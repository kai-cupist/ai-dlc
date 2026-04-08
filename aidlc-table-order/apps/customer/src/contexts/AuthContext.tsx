import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, useAuth as useSharedAuth } from '@table-order/shared';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  tableId: string | null;
  storeId: string | null;
  tableNumber: number | null;
  loginFailed: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  tableId: null,
  storeId: null,
  tableNumber: null,
  loginFailed: false,
});

const TABLE_STORE_ID_KEY = 'table_store_id';
const TABLE_NUMBER_KEY = 'table_number';
const TABLE_PASSWORD_KEY = 'table_password';

export function AuthProvider({ children }: { children: ReactNode }) {
  const sharedAuth = useSharedAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loginFailed, setLoginFailed] = useState(false);
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  const attemptAutoLogin = useCallback(async () => {
    const storeId = localStorage.getItem(TABLE_STORE_ID_KEY);
    const tableNum = localStorage.getItem(TABLE_NUMBER_KEY);
    const password = localStorage.getItem(TABLE_PASSWORD_KEY);

    if (!storeId || !tableNum || !password) {
      setLoginFailed(true);
      setIsLoading(false);
      navigate('/setup', { replace: true });
      return;
    }

    try {
      const response = await authApi.tableAutoLogin({
        store_id: storeId,
        table_number: Number(tableNum),
        password,
      });
      const { access_token, refresh_token } = response.data.data;
      sharedAuth.login(access_token, refresh_token);
      setTableNumber(Number(tableNum));
      setLoginFailed(false);
    } catch {
      setLoginFailed(true);
      navigate('/setup', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [sharedAuth, navigate]);

  useEffect(() => {
    if (sharedAuth.isAuthenticated && sharedAuth.isTable) {
      setIsLoading(false);
      return;
    }
    attemptAutoLogin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextValue = {
    isAuthenticated: sharedAuth.isAuthenticated,
    isLoading,
    tableId: sharedAuth.tableId,
    storeId: sharedAuth.storeId,
    tableNumber,
    loginFailed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useCustomerAuth() {
  return useContext(AuthContext);
}
