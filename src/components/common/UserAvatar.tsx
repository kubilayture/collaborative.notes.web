import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib/utils";

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-32 w-32 text-4xl",
};

export function UserAvatar({
  name,
  avatar,
  className,
  size = "lg",
  onClick,
}: UserAvatarProps) {
  const initials = name.charAt(0).toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size], className)} onClick={onClick}>
      {avatar && <AvatarImage src={avatar} alt={`${name}'s avatar`} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
