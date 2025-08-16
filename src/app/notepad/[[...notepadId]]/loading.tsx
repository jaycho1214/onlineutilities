export default function Loading() {
  return (
    <div className="relative h-full flex flex-col overflow-hidden animate-pulse">
      <div className="flex-shrink-0 relative z-10">
        <div className="w-full p-6 pb-4 pr-12 md:pr-24">
          <div className="h-8 bg-muted/20 rounded w-1/3"></div>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">
        <div className="w-full h-full p-6 pt-2 pr-12 md:pr-24 pb-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted/20 rounded"></div>
            <div className="h-4 bg-muted/20 rounded w-5/6"></div>
            <div className="h-4 bg-muted/20 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
