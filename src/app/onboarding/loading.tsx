import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-12">
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
