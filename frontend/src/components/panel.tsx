import { cn } from "@/lib/utils";
import React from "react";
import { ResponsiveTooltip } from "./ui/responsive-tooltip";

export const Panel = ({
  title,
  subtitle,
  titleTooltip,
  children,
  muted = false,
  className = "",
  trailingElement,
}: {
  title: string;
  subtitle?: string;
  titleTooltip?: string;
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
  trailingElement?: React.ReactNode;
}) => {
  const titleElement = titleTooltip ? (
    <ResponsiveTooltip
      content={
        <p className="font-mono text-xs whitespace-pre-wrap">{titleTooltip}</p>
      }
    >
      <span className="cursor-default">{title}</span>
    </ResponsiveTooltip>
  ) : (
    title
  );

  return (
    <section
      className={cn(
        "w-full pt-0 flex flex-col",
        muted ? "bg-zinc-100" : "bg-white"
      )}
    >
      <div className="sticky top-0 border-b py-2">
        <div className="flex flex-row justify-center px-4 items-center">
          <div className="w-10 flex items-center justify-center"></div>
          <h2
            className={cn(
              "text-sm md:text-xl font-bold text-center capitalize",
              muted ? "bg-zinc-100 text-zinc-700" : "bg-white text-zinc-800",
              className
            )}
          >
            {titleElement}
          </h2>
          <div className="w-10 flex items-center justify-center">
            {trailingElement}
          </div>
        </div>
        {subtitle && (
          <p className="text-[10px] font-bold text-center text-zinc-400 lowercase">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-grow overflow-y-auto relative">{children}</div>
    </section>
  );
};
