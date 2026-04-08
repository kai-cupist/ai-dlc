import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';

export function Header() {
  const { storeId, logout } = useAuthContext();

  return (
    <header
      className="flex h-14 items-center justify-between border-b border-border bg-card px-6"
      data-testid="admin-header"
    >
      <div className="text-sm text-muted-foreground">
        매장: <span className="font-medium text-foreground">{storeId}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        data-testid="header-logout-button"
      >
        <LogOut className="mr-2 h-4 w-4" />
        로그아웃
      </Button>
    </header>
  );
}
