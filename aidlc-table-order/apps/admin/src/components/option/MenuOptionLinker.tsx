import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useMenus } from '@/hooks/useMenus';
import {
  useLinkOptionToMenu,
  useUnlinkOptionFromMenu,
} from '@/hooks/useOptionGroups';
import type { OptionGroupWithItems, MenusByCategory } from 'shared';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuOptionLinkerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: OptionGroupWithItems | null;
}

export function MenuOptionLinker({
  open,
  onOpenChange,
  group,
}: MenuOptionLinkerProps) {
  const { data: menusByCategory, isLoading } = useMenus();
  const linkMutation = useLinkOptionToMenu();
  const unlinkMutation = useUnlinkOptionFromMenu();
  const [linkedMenuIds, setLinkedMenuIds] = useState<Set<string>>(new Set());

  const handleToggle = async (menuId: string) => {
    if (!group) return;
    if (linkedMenuIds.has(menuId)) {
      await unlinkMutation.mutateAsync({ groupId: group.id, menuId });
      setLinkedMenuIds((prev) => {
        const next = new Set(prev);
        next.delete(menuId);
        return next;
      });
    } else {
      await linkMutation.mutateAsync({ groupId: group.id, menuId });
      setLinkedMenuIds((prev) => new Set(prev).add(menuId));
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="menu-option-linker">
        <DialogHeader>
          <DialogTitle>"{group.name}" 메뉴 연결</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner className="py-8" />
        ) : (
          <div className="max-h-80 space-y-4 overflow-y-auto">
            {menusByCategory?.map((group: MenusByCategory) => (
              <div key={group.category.id}>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  {group.category.name}
                </p>
                <div className="space-y-1">
                  {group.menus.map((menu) => {
                    const isLinked = linkedMenuIds.has(menu.id);
                    return (
                      <button
                        key={menu.id}
                        onClick={() => handleToggle(menu.id)}
                        disabled={
                          linkMutation.isPending || unlinkMutation.isPending
                        }
                        className={cn(
                          'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                          isLinked
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted',
                        )}
                        data-testid={`link-menu-${menu.id}`}
                      >
                        <span>{menu.name}</span>
                        {isLinked && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
