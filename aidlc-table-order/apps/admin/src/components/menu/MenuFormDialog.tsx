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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Menu, Category, CreateMenuRequest, UpdateMenuRequest } from 'shared';

interface MenuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu?: Menu | null;
  categories: Category[];
  onSubmit: (data: CreateMenuRequest | UpdateMenuRequest) => void;
  isLoading: boolean;
}

export function MenuFormDialog({
  open,
  onOpenChange,
  menu,
  categories,
  onSubmit,
  isLoading,
}: MenuFormDialogProps) {
  const isEdit = !!menu;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (menu) {
      setName(menu.name);
      setPrice(String(menu.price));
      setDescription(menu.description ?? '');
      setCategoryId(menu.category_id);
      setImageUrl(menu.image_url ?? '');
      setIsPopular(menu.is_popular);
      setIsAvailable(menu.is_available);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setCategoryId(categories[0]?.id ?? '');
      setImageUrl('');
      setIsPopular(false);
      setIsAvailable(true);
    }
  }, [menu, categories, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      const data: UpdateMenuRequest = {
        name,
        price: Number(price),
        description: description || undefined,
        category_id: categoryId,
        image_url: imageUrl || undefined,
        is_popular: isPopular,
        is_available: isAvailable,
      };
      onSubmit(data);
    } else {
      const data: CreateMenuRequest = {
        name,
        price: Number(price),
        description: description || undefined,
        category_id: categoryId,
        image_url: imageUrl || undefined,
      };
      onSubmit(data);
    }
  };

  const isValid = name.trim() && price && Number(price) >= 0 && categoryId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="menu-form-dialog">
        <DialogHeader>
          <DialogTitle>{isEdit ? '메뉴 수정' : '새 메뉴 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="menu-name">메뉴명 *</Label>
            <Input
              id="menu-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="메뉴명을 입력하세요"
              data-testid="menu-form-name-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-price">가격 (원) *</Label>
            <Input
              id="menu-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              data-testid="menu-form-price-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-category">카테고리 *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger data-testid="menu-form-category-select">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-description">설명</Label>
            <Textarea
              id="menu-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="메뉴 설명 (선택)"
              rows={2}
              data-testid="menu-form-description-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-image">이미지 URL</Label>
            <Input
              id="menu-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              data-testid="menu-form-image-input"
            />
          </div>

          {isEdit && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isPopular}
                  onCheckedChange={setIsPopular}
                  data-testid="menu-form-popular-switch"
                />
                <Label>인기 메뉴</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                  data-testid="menu-form-available-switch"
                />
                <Label>판매 가능</Label>
              </div>
            </div>
          )}

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
              data-testid="menu-form-submit-button"
            >
              {isLoading ? '저장 중...' : isEdit ? '수정' : '등록'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
