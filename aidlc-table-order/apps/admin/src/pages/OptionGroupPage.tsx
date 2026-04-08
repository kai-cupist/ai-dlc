import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptionGroupList } from '@/components/option/OptionGroupList';
import { OptionGroupFormDialog } from '@/components/option/OptionGroupFormDialog';
import { MenuOptionLinker } from '@/components/option/MenuOptionLinker';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import {
  useOptionGroups,
  useCreateOptionGroup,
  useUpdateOptionGroup,
  useDeleteOptionGroup,
} from '@/hooks/useOptionGroups';
import type {
  OptionGroupWithItems,
  CreateOptionGroupRequest,
  UpdateOptionGroupRequest,
} from 'shared';
import { Plus } from 'lucide-react';

export default function OptionGroupPage() {
  const { data: groups, isLoading, error, refetch } = useOptionGroups();
  const createMutation = useCreateOptionGroup();
  const updateMutation = useUpdateOptionGroup();
  const deleteMutation = useDeleteOptionGroup();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OptionGroupWithItems | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OptionGroupWithItems | null>(null);
  const [linkTarget, setLinkTarget] = useState<OptionGroupWithItems | null>(null);

  const handleCreate = async (
    data: CreateOptionGroupRequest | UpdateOptionGroupRequest,
  ) => {
    await createMutation.mutateAsync(data as CreateOptionGroupRequest);
    setFormOpen(false);
  };

  const handleUpdate = async (
    data: CreateOptionGroupRequest | UpdateOptionGroupRequest,
  ) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      groupId: editTarget.id,
      data: data as UpdateOptionGroupRequest,
    });
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading) return <LoadingSpinner className="py-24" />;
  if (error) return <ErrorFallback onRetry={() => refetch()} />;

  return (
    <div className="space-y-6" data-testid="option-group-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">옵션 그룹 관리</h1>
        <Button
          onClick={() => setFormOpen(true)}
          data-testid="option-group-create-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          새 옵션 그룹
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            옵션 그룹 ({groups?.length ?? 0}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {groups && groups.length > 0 ? (
            <OptionGroupList
              groups={groups}
              onEdit={(g) => setEditTarget(g)}
              onDelete={(g) => setDeleteTarget(g)}
              onLink={(g) => setLinkTarget(g)}
            />
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              등록된 옵션 그룹이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      <OptionGroupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      <OptionGroupFormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        group={editTarget}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="옵션 그룹 삭제"
        description={`"${deleteTarget?.name}" 옵션 그룹을 삭제하시겠습니까? 연결된 메뉴에서 자동으로 해제됩니다.`}
        confirmLabel="삭제"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      <MenuOptionLinker
        open={!!linkTarget}
        onOpenChange={(open) => !open && setLinkTarget(null)}
        group={linkTarget}
      />
    </div>
  );
}
