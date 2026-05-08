import { Plate } from "@/components/editorial/plate";

interface FinishSwatchProps {
  finish: {
    id: string;
    name: string;
    description: string | null;
  };
}

export function FinishSwatch({ finish }: FinishSwatchProps) {
  return (
    <Plate className="space-y-1">
      <p className="text-sm font-medium">{finish.name}</p>
      {finish.description && (
        <p className="text-muted-foreground text-xs">{finish.description}</p>
      )}
    </Plate>
  );
}
