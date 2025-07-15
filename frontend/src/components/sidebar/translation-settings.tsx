import React from "react";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertTriangle, Info, Languages } from "lucide-react";
import { useUrlSettings } from "@/hooks/use-url-settings";
import { useComparison } from "@/contexts/comparison-context";
import { useModelData } from "@/contexts/model-data-context";
import { ResponsiveTooltip } from "../ui/responsive-tooltip";
import { FromToLanguages } from "./from-to-languages";
import { BetweenLanguages } from "./between-languages";

export const TranslationSettings: React.FC = () => {
  const { settings, setTranslationType } = useUrlSettings();
  const { translationType } = settings;

  const { recordingState } = useComparison();
  const isRecording = recordingState === "recording";
  const isStarting = recordingState === "starting";

  const {
    modelInfo,
    isLoading: isModelLoading,
    error: modelError,
  } = useModelData();

  if (isModelLoading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 px-1">
        Loading translation model data...
      </p>
    );
  }

  if (!modelInfo) {
    return (
      <div className="mt-4 p-2 border border-red-300 dark:border-red-700 rounded-md bg-red-50 dark:bg-red-900/30">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            Critical Error: Translation features unavailable.
          </p>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 pl-7">
          Could not load required model data.
        </p>
      </div>
    );
  }

  const controlsDisabled = isRecording || isStarting || !modelInfo;

  return (
    <>
      {modelError && (
        <div className="mt-4 p-2 border border-yellow-300 dark:border-yellow-700 rounded-md bg-yellow-50 dark:bg-yellow-900/30">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              API for model data failed. Using fallback translation settings.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-1">
          <Label
            htmlFor="translation-type-toggle"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 block"
          >
            3. Select translation type
          </Label>
          <TooltipProvider>
            <ResponsiveTooltip
              content={
                <>
                  <p>
                    <strong>From-to:</strong> Translate from one or more source
                    languages into a single target language.
                  </p>
                  <p className="mt-1">
                    <strong>Between</strong> Translate bi-directionally between
                    two specific languages. Ideal for conversational use cases.
                    All spoken audio in either of the two specified languages is
                    translated into the other.
                  </p>
                </>
              }
            >
              <Info className="h-3.5 w-3.5 cursor-help opacity-50" />
            </ResponsiveTooltip>
          </TooltipProvider>
        </div>
        <ToggleGroup
          id="translation-type-toggle"
          type="single"
          value={translationType}
          onValueChange={setTranslationType}
          className="w-full grid grid-cols-2 border border-input rounded-md"
          disabled={controlsDisabled}
        >
          <ToggleGroupItem
            value="one_way"
            aria-label="One-way translation"
            className="data-[state=on]:text-soniox text-gray-700 dark:text-gray-300 hover:bg-soniox/10 dark:hover:bg-soniox/20"
          >
            <Languages className="h-4 w-4 mr-2 opacity-70" />
            From-To
          </ToggleGroupItem>
          <ToggleGroupItem
            value="two_way"
            aria-label="Two-way translation"
            className="data-[state=on]:text-soniox text-gray-700 dark:text-gray-300 hover:bg-soniox/10 dark:hover:bg-soniox/20"
          >
            <Languages className="h-4 w-4 mr-2 opacity-70" />
            Between
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {translationType === "one_way" && (
        <FromToLanguages controlsDisabled={controlsDisabled} />
      )}
      {translationType === "two_way" && (
        <BetweenLanguages controlsDisabled={controlsDisabled} />
      )}
    </>
  );
};
