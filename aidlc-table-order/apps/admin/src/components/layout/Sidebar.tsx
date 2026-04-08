import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Settings2,
  Tablet,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/menus', icon: UtensilsCrossed, label: '메뉴 관리' },
  { to: '/option-groups', icon: Settings2, label: '옵션 관리' },
  { to: '/tables/setup', icon: Tablet, label: '테이블 설정' },
];

export function Sidebar() {
  return (
    <aside
      className="flex w-56 flex-col border-r border-border bg-sidebar"
      data-testid="admin-sidebar"
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-lg font-bold text-primary">테이블오더</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )
            }
            data-testid={`sidebar-nav-${item.label}`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
