interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const Loading = ({
  message = "Loading...",
  size = "md",
  fullScreen = true
}: LoadingProps) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClasses = fullScreen
    ? "flex min-h-screen items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center space-y-4">
        <div className="relative">
          {/* Main spinner */}
          <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-muted border-t-primary mx-auto`}></div>

          {/* Pulsing background circle */}
          <div className={`${sizeClasses[size]} absolute inset-0 rounded-full bg-primary/10 animate-pulse mx-auto`}></div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{message}</p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
