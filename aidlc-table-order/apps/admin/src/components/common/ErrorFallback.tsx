import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorFallback({
  message = '데이터를 불러오는 중 오류가 발생했습니다.',
  onRetry,
}: ErrorFallbackProps) {
  return (
    <Alert variant="destructive" data-testid="error-fallback">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>오류</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            data-testid="error-retry-button"
          >
            재시도
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
