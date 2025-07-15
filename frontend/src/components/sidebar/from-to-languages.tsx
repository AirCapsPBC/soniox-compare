import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";
import { AlertTriangle } from "lucide-react";
import {
  getEveryPossibleSourceLanguage,
  getEveryPossibleTargetLanguage,
  getValidSourceLanguages,
  getValidTargetLanguages,
  isOneWayTranslationPairValid,
  type Language,
} from "@/lib/translation-utils";
import { cn } from "@/lib/utils";
import { useModelData } from "@/contexts/model-data-context";
import { useUrlSettings } from "@/hooks/use-url-settings";

interface FromToLanguagesProps {
  controlsDisabled: boolean;
}

export const FromToLanguages: React.FC<FromToLanguagesProps> = ({
  controlsDisabled,
}) => {
  const {
    settings,
    setTargetTranslationLanguage,
    setSourceTranslationLanguages,
  } = useUrlSettings();

  const { sourceTranslationLanguages, targetTranslationLanguage } = settings;
  const sourceLanguage =
    sourceTranslationLanguages.length > 0 ? sourceTranslationLanguages[0] : "";

  const { modelInfo } = useModelData();

  const [allSources, setAllSources] = useState<Language[]>([]);
  const [allTargets, setAllTargets] = useState<Language[]>([]);
  const [validTargets, setValidTargets] = useState<Language[]>([]);
  const [validSources, setValidSources] = useState<Language[]>([]);
  const [isPairValid, setIsPairValid] = useState<boolean>(true);

  useEffect(() => {
    if (modelInfo) {
      setAllSources(getEveryPossibleSourceLanguage(modelInfo));
      setAllTargets(getEveryPossibleTargetLanguage(modelInfo));
    } else {
      setAllSources([]);
      setAllTargets([]);
    }
  }, [modelInfo]);

  useEffect(() => {
    if (modelInfo && sourceLanguage) {
      setValidTargets(getValidTargetLanguages(modelInfo, sourceLanguage));
    } else {
      setValidTargets([]);
    }
  }, [modelInfo, sourceLanguage]);

  useEffect(() => {
    if (modelInfo && targetTranslationLanguage) {
      setValidSources(
        getValidSourceLanguages(modelInfo, targetTranslationLanguage)
      );
    } else {
      setValidSources([]);
    }
  }, [modelInfo, targetTranslationLanguage]);

  useEffect(() => {
    if (modelInfo && sourceLanguage && targetTranslationLanguage) {
      setIsPairValid(
        isOneWayTranslationPairValid(
          modelInfo,
          sourceLanguage,
          targetTranslationLanguage
        )
      );
    } else {
      setIsPairValid(true);
    }
  }, [modelInfo, sourceLanguage, targetTranslationLanguage]);

  const handleSourceChange = (value: string) => {
    setSourceTranslationLanguages(value ? [value] : []);
  };

  const currentSourceValue =
    sourceTranslationLanguages.length === 1
      ? sourceTranslationLanguages[0]
      : undefined;

  return (
    <div>
      <div className="mt-4">
        <Label
          htmlFor="source-lang-search-select"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1"
        >
          From
        </Label>
        <SearchSelect
          value={currentSourceValue}
          onValueChange={handleSourceChange}
          disabled={controlsDisabled}
          options={allSources.map((lang) => ({
            value: lang.code,
            label: lang.name,
          }))}
          highlightedValues={validSources.map((lang) => lang.code)}
          placeholder="Select 'from' language"
          searchPlaceholder="Search 'from' language..."
          notFoundMessage="No 'from' language found."
          className={cn("w-full text-sm bg-white dark:bg-zinc-800")}
        />
      </div>

      <div className="mt-4">
        <Label
          htmlFor="target-lang-search-select"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1"
        >
          To
        </Label>
        <SearchSelect
          value={targetTranslationLanguage}
          onValueChange={setTargetTranslationLanguage}
          disabled={controlsDisabled}
          options={allTargets.map((lang) => ({
            value: lang.code,
            label: lang.name,
          }))}
          highlightedValues={validTargets.map((lang) => lang.code)}
          placeholder="Select 'to' language"
          searchPlaceholder="Search 'to' language..."
          notFoundMessage="No 'to' language found."
          className="w-full text-sm bg-white dark:bg-zinc-800"
        />
      </div>
      {!isPairValid && (
        <div className="mt-2 flex items-center space-x-2 text-xs text-yellow-600 dark:text-yellow-400 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>This language pair is not supported for translation.</span>
        </div>
      )}
    </div>
  );
};
