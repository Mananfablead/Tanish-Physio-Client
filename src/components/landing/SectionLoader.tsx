import { Skeleton } from "@/components/ui/skeleton";

export const SectionLoader = ({ height = "h-96" }: { height?: string }) => {
  return (
    <div className={`w-full ${height} animate-pulse`}>
      <div className="container h-full">
        <div className="space-y-4 py-12">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <div className="grid grid-cols-3 gap-4 pt-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
