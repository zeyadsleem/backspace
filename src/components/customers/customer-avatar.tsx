import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CustomerAvatarProps {
  name: string;
  className?: string;
  onClick?: () => void;
}

export function CustomerAvatar({ name, className, onClick }: CustomerAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Avatar
      className={cn(
        "cursor-pointer transition-transform hover:scale-110 hover:shadow-md",
        onClick && "hover:ring-2 hover:ring-primary",
        className,
      )}
      onClick={onClick}
    >
      <AvatarFallback className="text-sm font-bold">{initials}</AvatarFallback>
    </Avatar>
  );
}
