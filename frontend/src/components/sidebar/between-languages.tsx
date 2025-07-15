import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";
import { AlertTriangle } from "lucide-react";
import {
  getPartnerLanguagesForTwoWay,
  getUniqueLanguagesFromTwoWayPairs,
  isTwoWayTranslationPairValid,
  type Language,
} from "@/lib/translation-utils";
import { useModelData } from "@/contexts/model-data-context";
import { useUrlSettings } from "@/hooks/use-url-settings";
import { cn } from "@/lib/utils";

interface BetweenLanguagesProps {
  controlsDisabled: boolean;
}

export const BetweenLanguages: React.FC<BetweenLanguagesProps> = ({
  controlsDisabled,
}) => {
  const { settings, setTranslationLanguageA, setTranslationLanguageB } =
    useUrlSettings();
  const { translationLanguageA, translationLanguageB } = settings;

  const { modelInfo } = useModelData();

  const [twoWayAllLangs, setTwoWayAllLangs] = useState<Language[]>([]);
  const [partnersForA, setPartnersForA] = useState<Language[]>([]);
  const [partnersForB, setPartnersForB] = useState<Language[]>([]);
  const [isPairValid, setIsPairValid] = useState<boolean>(true);

  useEffect(() => {
    if (modelInfo) {
      setTwoWayAllLangs(getUniqueLanguagesFromTwoWayPairs(modelInfo));
    } else {
      setTwoWayAllLangs([]);
    }
  }, [modelInfo]);

  useEffect(() => {
    if (modelInfo && translationLanguageA) {
      setPartnersForA(
        getPartnerLanguagesForTwoWay(modelInfo, translationLanguageA)
      );
    } else {
      setPartnersForA([]);
    }
  }, [modelInfo, translationLanguageA]);

  useEffect(() => {
    if (modelInfo && translationLanguageB) {
      setPartnersForB(
        getPartnerLanguagesForTwoWay(modelInfo, translationLanguageB)
      );
    } else {
      setPartnersForB([]);
    }
  }, [modelInfo, translationLanguageB]);

  useEffect(() => {
    if (modelInfo && translationLanguageA && translationLanguageB) {
      setIsPairValid(
        isTwoWayTranslationPairValid(
          modelInfo,
          translationLanguageA,
          translationLanguageB
        )
      );
    } else {
      setIsPairValid(true);
    }
  }, [modelInfo, translationLanguageA, translationLanguageB]);

  return (
    <div>
      <div className="mt-4">
        <Label
          htmlFor="language-a-search-select"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1"
        >
          Between
        </Label>
        <SearchSelect
          value={translationLanguageA}
          onValueChange={setTranslationLanguageA}
          disabled={controlsDisabled || twoWayAllLangs.length === 0}
          options={twoWayAllLangs.map((lang) => ({
            value: lang.code,
            label: lang.name,
          }))}
          highlightedValues={partnersForB.map((lang) => lang.code)}
          placeholder="Select Language A"
          searchPlaceholder="Search Language A..."
          notFoundMessage="No languages available for two-way translation."
          className={cn("w-full text-sm bg-white dark:bg-zinc-800")}
        />
      </div>
      <div className="mt-4">
        <Label
          htmlFor="language-b-search-select"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1"
        >
          And
        </Label>
        <SearchSelect
          value={translationLanguageB}
          onValueChange={setTranslationLanguageB}
          disabled={controlsDisabled || twoWayAllLangs.length === 0}
          options={twoWayAllLangs.map((lang) => ({
            value: lang.code,
            label: lang.name,
          }))}
          highlightedValues={partnersForA.map((lang) => lang.code)}
          placeholder="Select Language B"
          searchPlaceholder="Search Language B..."
          notFoundMessage="No languages available for two-way translation."
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
