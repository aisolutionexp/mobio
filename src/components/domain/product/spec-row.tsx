interface SpecRowProps {
  label: string;
  value: string;
}

export function SpecRow({ label, value }: SpecRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
      <dd className="text-right text-sm">{value}</dd>
    </div>
  );
}
