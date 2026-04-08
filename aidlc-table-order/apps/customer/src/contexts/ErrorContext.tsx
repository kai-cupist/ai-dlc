import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

export type ErrorType = 'network' | 'server' | 'auth' | null;

interface ErrorState {
  type: ErrorType;
  message: string;
}

interface ErrorContextValue {
  error: ErrorState | null;
  showError: (type: ErrorType, message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextValue>({
  error: null,
  showError: () => {},
  clearError: () => {},
});

const AUTO_DISMISS_MS = 5000;

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<ErrorState | null>(null);

  const showError = useCallback((type: ErrorType, message: string) => {
    setError({ type, message });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}
