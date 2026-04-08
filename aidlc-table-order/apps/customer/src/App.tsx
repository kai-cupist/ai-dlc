import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { CustomerLayout } from './layouts/CustomerLayout';
import { MenuPage } from './pages/MenuPage';
import { MenuDetailPage } from './pages/MenuDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WaitingPage } from './pages/WaitingPage';
import { ReceiptPage } from './pages/ReceiptPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { SetupGuidePage } from './pages/SetupGuidePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<MenuPage />} />
                  <Route path="/menu/:menuId" element={<MenuDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/waiting" element={<WaitingPage />} />
                  <Route path="/receipt" element={<ReceiptPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                </Route>
                <Route path="/setup" element={<SetupGuidePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </ErrorProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
