import type { ReactNode } from "react";
import QueryProvider from "./query-provider";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </QueryProvider>
  );
}
