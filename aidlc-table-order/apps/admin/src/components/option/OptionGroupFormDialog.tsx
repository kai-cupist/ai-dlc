import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type {
  OptionGroupWithItems,
  CreateOptionGroupRequest,
  UpdateOptionGroupRequest,
  CreateOptionItemRequest,
} from 'shared';
import { Plus, X } from 'lucide-react';

interface OptionGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: OptionGroupWithItems | null;
  onSubmit: (data: CreateOptionGroupRequest | UpdateOptionGroupRequest) => void;
  isLoading: boolean;
}

export function OptionGroupFormDialog({
  open,
  onOpenChange,
  group,
  onSubmit,
  isLoading,
}: OptionGroupFormDialogProps) {
  const isEdit = !!group;
  const [name, setName] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [items, setItems] = useState<CreateOptionItemRequest[]>([
    { name: '', extra_price: 0 },
  ]);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setIsRequired(group.is_required);
      setItems(
        group.items.map((i) => ({
          name: i.name,
          extra_price: i.extra_price,
          sort_order: i.sort_order,
        })),
      );
    } else {
      setName('');
      setIsRequired(false);
      setItems([{ name: '', extra_price: 0 }]);
    }
  }, [group, open]);

  const addItem = () => {
    setItems([...items, { name: '', extra_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof CreateOptionItemRequest,
    value: string | number,
  ) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items
      .filter((i) => i.name.trim())
      .map((i, idx) => ({ ...i, sort_order: idx }));
    if (isEdit) {
      onSubmit({ name, is_required: isRequired, items: validItems });
    } else {
      onSubmit({ name, is_required: isRequired, items: validItems });
    }
  };

  const isValid = name.trim() && items.some((i) => i.name.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="option-group-form-dialog">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? '옵션 그룹 수정' : '새 옵션 그룹'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>그룹명 *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 맵기 단계, 사이즈"
              data-testid="option-group-name-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isRequired}
              onCheckedChange={setIsRequired}
              data-testid="option-group-required-switch"
            />
            <Label>필수 선택</Label>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>옵션 항목</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addItem}
                data-testid="option-item-add-button"
              >
                <Plus className="mr-1 h-3 w-3" />
                추가
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="항목명"
                  className="flex-1"
                  data-testid={`option-item-name-${index}`}
                />
                <Input
                  type="number"
                  min={0}
                  value={item.extra_price}
                  onChange={(e) =>
                    updateItem(index, 'extra_price', Number(e.target.value))
                  }
                  placeholder="추가 가격"
                  className="w-28"
                  data-testid={`option-item-price-${index}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                  data-testid={`option-item-remove-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              data-testid="option-group-form-submit"
            >
              {isLoading ? '저장 중...' : isEdit ? '수정' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
