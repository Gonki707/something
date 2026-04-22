import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-in fade-in duration-500">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
      <p className="text-lg font-medium">Се вчитува...</p>
    </div>
  );
}
