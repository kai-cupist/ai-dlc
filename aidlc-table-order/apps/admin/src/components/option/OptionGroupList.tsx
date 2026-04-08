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
import { formatPrice } from 'shared';
import type { OptionGroupWithItems } from 'shared';
import { Pencil, Trash2, Link2 } from 'lucide-react';

interface OptionGroupListProps {
  groups: OptionGroupWithItems[];
  onEdit: (group: OptionGroupWithItems) => void;
  onDelete: (group: OptionGroupWithItems) => void;
  onLink: (group: OptionGroupWithItems) => void;
}

export function OptionGroupList({
  groups,
  onEdit,
  onDelete,
  onLink,
}: OptionGroupListProps) {
  return (
    <Table data-testid="option-group-list-table">
      <TableHeader>
        <TableRow>
          <TableHead>그룹명</TableHead>
          <TableHead>필수/선택</TableHead>
          <TableHead>항목</TableHead>
          <TableHead className="text-right">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={group.id} data-testid={`option-group-row-${group.id}`}>
            <TableCell className="font-medium">{group.name}</TableCell>
            <TableCell>
              <Badge
                variant={group.is_required ? 'default' : 'secondary'}
              >
                {group.is_required ? '필수' : '선택'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {group.items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs"
                  >
                    {item.name}
                    {item.extra_price > 0 && (
                      <span className="ml-1 text-primary">
                        +{formatPrice(item.extra_price)}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLink(group)}
                  data-testid={`option-link-button-${group.id}`}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(group)}
                  data-testid={`option-edit-button-${group.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(group)}
                  data-testid={`option-delete-button-${group.id}`}
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
