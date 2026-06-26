import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  as = "h2",
}: SectionHeadingProps) {
  const Title = as;
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-medium text-primary mb-3">{eyebrow}</p>
      )}
      <Title
        className={cn(
          as === "h1"
            ? "text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight"
            : "text-2xl sm:text-3xl font-semibold tracking-tight"
        )}
      >
        {title}
      </Title>
      {lead && (
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{lead}</p>
      )}
    </div>
  );
}
