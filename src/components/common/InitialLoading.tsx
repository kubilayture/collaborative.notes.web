export default function InitialLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* App Logo/Icon */}
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg"></div>
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Collaborative Notes</h1>
          <p className="text-muted-foreground text-sm">Loading your workspace...</p>
        </div>

        {/* Spinner */}
        <div className="relative">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}