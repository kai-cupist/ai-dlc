import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuList } from '@/components/menu/MenuList';
import { MenuFormDialog } from '@/components/menu/MenuFormDialog';
import { MenuSortable } from '@/components/menu/MenuSortable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import {
  useMenus,
  useCategories,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useReorderMenus,
} from '@/hooks/useMenus';
import type { Menu, CreateMenuRequest, UpdateMenuRequest } from 'shared';
import { Plus, ArrowUpDown } from 'lucide-react';

export default function MenuManagementPage() {
  const { data: menusByCategory, isLoading, error, refetch } = useMenus();
  const { data: categories } = useCategories();
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const deleteMutation = useDeleteMenu();
  const reorderMutation = useReorderMenus();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Menu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [sortMode, setSortMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const allMenus =
    menusByCategory?.flatMap((group) => group.menus) ?? [];
  const filteredMenus =
    activeTab === 'all'
      ? allMenus
      : menusByCategory?.find((g) => g.category.id === activeTab)?.menus ?? [];

  const handleCreate = async (data: CreateMenuRequest | UpdateMenuRequest) => {
    await createMutation.mutateAsync(data as CreateMenuRequest);
    setFormOpen(false);
  };

  const handleUpdate = async (data: CreateMenuRequest | UpdateMenuRequest) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      menuId: editTarget.id,
      data: data as UpdateMenuRequest,
    });
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleToggleAvailable = (menu: Menu) => {
    updateMutation.mutate({
      menuId: menu.id,
      data: { is_available: !menu.is_available },
    });
  };

  const handleReorder = (menuIds: string[]) => {
    reorderMutation.mutate({ menu_ids: menuIds });
  };

  if (isLoading) return <LoadingSpinner className="py-24" />;
  if (error) return <ErrorFallback onRetry={() => refetch()} />;

  return (
    <div className="space-y-6" data-testid="menu-management-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">메뉴 관리</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSortMode(!sortMode)}
            data-testid="menu-sort-toggle"
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortMode ? '목록 보기' : '순서 변경'}
          </Button>
          <Button
            onClick={() => setFormOpen(true)}
            data-testid="menu-create-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            새 메뉴
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="menu-category-tabs">
          <TabsTrigger value="all">전체</TabsTrigger>
          {categories?.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                메뉴 목록 ({filteredMenus.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMenus.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  등록된 메뉴가 없습니다.
                </p>
              ) : sortMode ? (
                <MenuSortable
                  menus={filteredMenus}
                  onSave={handleReorder}
                  isLoading={reorderMutation.isPending}
                />
              ) : (
                <MenuList
                  menus={filteredMenus}
                  onEdit={(menu) => setEditTarget(menu)}
                  onDelete={(menu) => setDeleteTarget(menu)}
                  onToggleAvailable={handleToggleAvailable}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MenuFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={categories ?? []}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      <MenuFormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        menu={editTarget}
        categories={categories ?? []}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="메뉴 삭제"
        description={`"${deleteTarget?.name}" 메뉴를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
