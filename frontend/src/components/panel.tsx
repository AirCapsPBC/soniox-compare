import { cn } from "@/lib/utils";
import React from "react";
import { ResponsiveTooltip } from "./ui/responsive-tooltip";
import type { ProviderName } from "@/lib/provider-features";

// Base path for Vite - must match vite.config.ts
const BASE_PATH = "/compare/ui";

// Provider logo components
const ProviderLogo: React.FC<{ provider: ProviderName; className?: string }> = ({
  provider,
  className = "w-10 h-10 md:w-12 md:h-12",
}) => {
  // Use image files for providers that have them
  const logoMap: Partial<Record<ProviderName, string>> = {
    openai: `${BASE_PATH}/logos/openai.png`,
    deepgram: `${BASE_PATH}/logos/deepgram.png`,
    azure: `${BASE_PATH}/logos/microsoft.png`,
  };

  if (logoMap[provider]) {
    return (
      <img
        src={logoMap[provider]}
        alt={`${provider} logo`}
        className={cn(className, "object-contain")}
      />
    );
  }

  // Fallback SVGs for providers without image files
  switch (provider) {
    case "google":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    case "speechmatics":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      );
    case "assembly":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
};

export const Panel = ({
  providerName,
  title,
  subtitle,
  titleTooltip,
  children,
  muted = false,
}: {
  providerName?: ProviderName;
  title: string;
  subtitle?: string;
  titleTooltip?: string;
  children: React.ReactNode;
  muted?: boolean;
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
      <div className="sticky top-0 border-b py-3 bg-white">
        <div className="flex flex-row justify-center px-4 items-center gap-3">
          {providerName && (
            <div className="flex items-center justify-center">
              <ProviderLogo provider={providerName} />
            </div>
          )}
          <h2
            className={cn(
              "text-2xl md:text-4xl font-bold text-center capitalize",
              muted ? "bg-zinc-100 text-zinc-700" : "bg-white text-zinc-800"
            )}
          >
            {titleElement}
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm md:text-base font-bold text-center text-zinc-400 lowercase mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-grow overflow-y-auto relative">{children}</div>
    </section>
  );
};
