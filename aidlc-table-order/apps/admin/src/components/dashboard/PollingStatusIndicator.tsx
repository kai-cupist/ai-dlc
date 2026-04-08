import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PollingStatusIndicatorProps {
  isActive: boolean;
  isFailed: boolean;
  onRetry: () => void;
}

export function PollingStatusIndicator({
  isActive,
  isFailed,
  onRetry,
}: PollingStatusIndicatorProps) {
  if (isFailed) {
    return (
      <Alert
        variant="destructive"
        className="mb-4"
        data-testid="polling-failed-alert"
      >
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>실시간 업데이트 중단 - 주문이 누락될 수 있습니다</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            data-testid="polling-retry-button"
          >
            재연결
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className="flex items-center gap-2 text-xs text-muted-foreground"
      data-testid="polling-status-indicator"
    >
      <Wifi className={`h-3 w-3 ${isActive ? 'text-emerald-400' : 'text-muted-foreground'}`} />
      <span>실시간 업데이트 {isActive ? '활성' : '대기 중'}</span>
    </div>
  );
}
