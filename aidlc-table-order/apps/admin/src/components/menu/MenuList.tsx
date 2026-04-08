import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { formatPrice } from 'shared';
import type { Menu } from 'shared';
import { Pencil, Trash2 } from 'lucide-react';

interface MenuListProps {
  menus: Menu[];
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onToggleAvailable: (menu: Menu) => void;
}

export function MenuList({
  menus,
  onEdit,
  onDelete,
  onToggleAvailable,
}: MenuListProps) {
  return (
    <Table data-testid="menu-list-table">
      <TableHeader>
        <TableRow>
          <TableHead>메뉴명</TableHead>
          <TableHead>가격</TableHead>
          <TableHead>인기</TableHead>
          <TableHead>판매</TableHead>
          <TableHead className="text-right">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {menus.map((menu) => (
          <TableRow key={menu.id} data-testid={`menu-row-${menu.id}`}>
            <TableCell>
              <div className="flex items-center gap-3">
                {menu.image_url && (
                  <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{menu.name}</p>
                  {menu.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {menu.description}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{formatPrice(menu.price)}</TableCell>
            <TableCell>
              {menu.is_popular && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  인기
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Switch
                checked={menu.is_available}
                onCheckedChange={() => onToggleAvailable(menu)}
                data-testid={`menu-available-switch-${menu.id}`}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(menu)}
                  data-testid={`menu-edit-button-${menu.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(menu)}
                  data-testid={`menu-delete-button-${menu.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
