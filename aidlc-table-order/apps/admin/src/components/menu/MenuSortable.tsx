import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Save } from 'lucide-react';
import { formatPrice } from 'shared';
import type { Menu } from 'shared';

interface SortableMenuItemProps {
  menu: Menu;
}

function SortableMenuItem({ menu }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
      data-testid={`sortable-menu-${menu.id}`}
    >
      <button
        className="cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        data-testid={`sortable-handle-${menu.id}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 font-medium">{menu.name}</span>
      <span className="text-sm text-muted-foreground">
        {formatPrice(menu.price)}
      </span>
    </div>
  );
}

interface MenuSortableProps {
  menus: Menu[];
  onSave: (menuIds: string[]) => void;
  isLoading: boolean;
}

export function MenuSortable({ menus, onSave, isLoading }: MenuSortableProps) {
  const [items, setItems] = useState(menus);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((m) => m.id === active.id);
        const newIndex = prev.findIndex((m) => m.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    onSave(items.map((m) => m.id));
    setHasChanges(false);
  };

  return (
    <div className="space-y-3" data-testid="menu-sortable">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((menu) => (
            <SortableMenuItem key={menu.id} menu={menu} />
          ))}
        </SortableContext>
      </DndContext>

      {hasChanges && (
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full"
          data-testid="menu-sort-save-button"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? '저장 중...' : '순서 저장'}
        </Button>
      )}
    </div>
  );
}
