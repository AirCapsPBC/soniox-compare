import React from "react";
import { Panel } from "@/components/panel";
import { useUrlSettings } from "@/hooks/use-url-settings";
import { useComparison } from "@/contexts/comparison-context";
import type { ProviderName } from "@/lib/provider-features";
import { cn } from "@/lib/utils";
import { useFeatures } from "@/contexts/feature-context";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { TranscriptRenderer } from "./transcript-renderer";

export const ProviderGrid: React.FC = () => {
  const { settings } = useUrlSettings();
  const { selectedProviders = [] } = settings;

  const { providerOutputs, appError } = useComparison();
  const { providerFeatures, getProviderFeaturesTextTable } = useFeatures();

  const providersToDisplay: ProviderName[] = selectedProviders;

  const getGridColsClass = (count: number): string => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count === 3) return "grid-cols-1 md:grid-cols-3";
    if (count === 4) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 md:grid-cols-3";
  };

  const numProviders = providersToDisplay.length;
  const gridColsClass = getGridColsClass(numProviders);

  return (
    <div
      className={cn(
        "grid gap-px bg-gray-200 dark:bg-gray-700 h-full overflow-y-auto",
        gridColsClass
      )}
    >
      {providersToDisplay.map((providerName) => {
        const outputData = providerOutputs[providerName] || {
          statusMessage: "Waiting for data...",
          finalParts: [],
          nonFinalParts: [],
          error: null,
          infoMessages: [],
        };
        const panelTitle =
          providerFeatures?.[providerName]?.name ?? providerName;

        return (
          <TooltipProvider key={providerName}>
            <Panel
              providerName={providerName}
              title={panelTitle}
              subtitle={providerFeatures?.[providerName]?.model}
              titleTooltip={getProviderFeaturesTextTable(providerName)}
            >
              <div className="absolute inset-0">
                <TranscriptRenderer
                  outputData={outputData}
                  appError={appError}
                />
              </div>
            </Panel>
          </TooltipProvider>
        );
      })}
    </div>
  );
};
