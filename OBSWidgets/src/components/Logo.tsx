import { cn } from "@/lib/utils";

export function Logo({ 
  className,
  boxClass = "fill-primary",
  textClass = "fill-primary-foreground"
}: { 
  className?: string;
  boxClass?: string;
  textClass?: string;
}) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("w-10 h-10", className)}
    >
      <rect width="40" height="40" rx="4" className={boxClass} />
      <text 
        x="36" 
        y="32" 
        textAnchor="end" 
        className={cn("font-heading", textClass)} 
        fontSize="24"
      >
        /gp
      </text>
    </svg>
  );
}
