import Card from "@/components/ui/Card";

export default function LeadDetailLoading() {
  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header skeleton */}
          <div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4" />
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Contact card skeleton */}
          <Card>
            <div className="h-4 w-28 bg-muted rounded animate-pulse mb-5" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-12 bg-muted rounded animate-pulse mb-1" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Conversation summary skeleton */}
          <Card>
            <div className="h-4 w-44 bg-muted rounded animate-pulse mb-4" />
            <div className="h-8 w-40 bg-muted rounded-lg animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          </Card>

          {/* Objections skeleton */}
          <Card>
            <div className="h-4 w-20 bg-muted rounded animate-pulse mb-4" />
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-28 bg-muted rounded-full animate-pulse" />
            </div>
          </Card>

          {/* Notes skeleton */}
          <Card>
            <div className="h-4 w-16 bg-muted rounded animate-pulse mb-4" />
            <div className="h-32 w-full bg-muted rounded animate-pulse" />
          </Card>

          {/* Transcript skeleton */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          </Card>

          {/* Status timeline skeleton */}
          <Card>
            <div className="h-4 w-14 bg-muted rounded animate-pulse mb-4" />
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                  <div className="h-3 w-10 bg-muted rounded animate-pulse mt-1.5" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column skeleton */}
        <div className="lg:col-span-1 space-y-6">
          {/* Scores skeleton */}
          <Card>
            <div className="h-4 w-36 bg-muted rounded animate-pulse mb-5" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
              </div>
            ))}
            <div className="pt-4 mt-2 border-t border-border flex justify-between items-center">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
            </div>
          </Card>

          {/* Appointment skeleton */}
          <Card>
            <div className="h-4 w-14 bg-muted rounded animate-pulse mb-4" />
            <div className="h-8 w-36 bg-muted rounded-lg animate-pulse" />
          </Card>

          {/* Briefing skeleton */}
          <Card>
            <div className="h-4 w-28 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          </Card>

          {/* Next steps skeleton */}
          <Card>
            <div className="h-4 w-28 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded-full animate-pulse shrink-0" />
                  <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
