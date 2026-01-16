import Button from "@/shared/ui/button";
import Card from "@/shared/ui/card";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";

export default function GlobalErrorBoundary({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/50">
        <Card.Header>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <Card.Title>Something went wrong</Card.Title>
          </div>
        </Card.Header>
        <Card.Content className="space-y-2">
          <p className="text-sm text-muted-foreground">
            An error occurred while loading this section.
          </p>
          <div className="rounded-md bg-muted p-2 text-xs font-mono text-destructive break-all">
            {errorMessage}
          </div>
        </Card.Content>
        <Card.Footer>
          <Button onClick={resetErrorBoundary} className="w-full gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
