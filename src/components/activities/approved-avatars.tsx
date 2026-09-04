import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ApprovedAvatars({ users }: { users: { name: string; lastName: string }[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {users.slice(0, 8).map((user, index) => (
          <Tooltip key={index}>
            <TooltipTrigger render={<Avatar className="size-7 border-2 border-background" />}>
              <AvatarFallback className="text-xs">{initials(`${user.name} ${user.lastName}`)}</AvatarFallback>
            </TooltipTrigger>
            <TooltipContent>
              {user.name} {user.lastName}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {users.length} {users.length === 1 ? "persona ha aprobado" : "personas han aprobado"} esta actividad
      </span>
    </div>
  );
}
