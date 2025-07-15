import type { TranslationType } from "@/hooks/use-url-settings";
import { z } from "zod";

// Zod Schemas
export const languageSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export const translationTargetRuleSchema = z.object({
  exclude_source_languages: z.array(z.string()),
  source_languages: z.array(z.string()),
  target_language: z.string(),
});

export const modelInfoSchema = z.object({
  id: z.string(),
  languages: z.array(languageSchema),
  name: z.string(),
  transcription_mode: z.string(),
  translation_targets: z.array(translationTargetRuleSchema),
  two_way_translation_pairs: z.array(z.string()),
});

export type Language = z.infer<typeof languageSchema>;
export type TranslationTargetRule = z.infer<typeof translationTargetRuleSchema>;
export type ModelInfo = z.infer<typeof modelInfoSchema>;

export function getAllLanguagesForModel(model: ModelInfo | null): Language[] {
  return model ? model.languages : [];
}

export function getLanguageNameByCode(
  model: ModelInfo | null,
  code: string
): string {
  if (code === "*") return "_Any Language (AUTO)";
  if (code === "AUTO") return "Multilingual (auto-identify)"; // For STT language hint
  if (!model) return code; // Fallback to code if no model
  const lang = model.languages.find((l) => l.code === code);
  return lang?.name || code; // Fallback to code if name not found in model
}

export function getAvailableTargetLanguagesForModel(
  model: ModelInfo | null
): Language[] {
  if (!model) return [];

  const targetLangCodes = new Set<string>();
  model.translation_targets.forEach((rule) =>
    targetLangCodes.add(rule.target_language)
  );
  model.two_way_translation_pairs.forEach((pair) => {
    const [lang1, lang2] = pair.split(":");
    targetLangCodes.add(lang1);
    targetLangCodes.add(lang2);
  });

  return Array.from(targetLangCodes)
    .map((langCode) => ({
      code: langCode,
      name: getLanguageNameByCode(model, langCode), // Pass model here
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAvailableSourceLanguagesForModel(
  model: ModelInfo | null,
  targetLanguage: string,
  translationType: TranslationType
): Language[] {
  if (!model || !targetLanguage) return [];

  const availableSourceLangCodes = new Set<string>();

  if (translationType === "one_way") {
    const applicableRule = model.translation_targets.find(
      (rule) => rule.target_language === targetLanguage
    );
    if (applicableRule) {
      applicableRule.source_languages.forEach((code) => {
        availableSourceLangCodes.add(code);
      });
      if (applicableRule.source_languages.includes("*")) {
        model.languages.forEach((lang) => {
          availableSourceLangCodes.add(lang.code);
        });
      }
    }
  } else {
    // two-way
    model.two_way_translation_pairs.forEach((pair) => {
      const [lang1, lang2] = pair.split(":");
      if (lang1 === targetLanguage) {
        availableSourceLangCodes.add(lang2);
      }
      if (lang2 === targetLanguage) {
        availableSourceLangCodes.add(lang1);
      }
    });
  }

  return Array.from(availableSourceLangCodes).map((code) => ({
    code,
    name: getLanguageNameByCode(model, code), // Pass model here
  }));
}

export function getUniqueLanguagesFromTwoWayPairs(
  model: ModelInfo | null
): Language[] {
  if (!model || !model.two_way_translation_pairs) return [];

  const uniqueLangCodes = new Set<string>();
  model.two_way_translation_pairs.forEach((pair) => {
    const [lang1, lang2] = pair.split(":");
    if (lang1) uniqueLangCodes.add(lang1);
    if (lang2) uniqueLangCodes.add(lang2);
  });

  return Array.from(uniqueLangCodes)
    .map((code) => ({
      code,
      name: getLanguageNameByCode(model, code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPartnerLanguagesForTwoWay(
  model: ModelInfo | null,
  langCode: string
): Language[] {
  if (!model || !model.two_way_translation_pairs || !langCode) return [];

  const partnerLangCodes = new Set<string>();
  model.two_way_translation_pairs.forEach((pair) => {
    const [lang1, lang2] = pair.split(":");
    if (lang1 === langCode && lang2) {
      partnerLangCodes.add(lang2);
    } else if (lang2 === langCode && lang1) {
      partnerLangCodes.add(lang1);
    }
  });

  return Array.from(partnerLangCodes)
    .map((code) => ({
      code,
      name: getLanguageNameByCode(model, code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getEveryPossibleSourceLanguage(
  model: ModelInfo | null
): Language[] {
  if (!model) return [];
  const sourceLangCodes = new Set<string>();

  const hasWildcard = model.translation_targets.some((rule) =>
    rule.source_languages.includes("*")
  );

  if (hasWildcard) {
    sourceLangCodes.add("*");
    model.languages.forEach((lang) => sourceLangCodes.add(lang.code));
  } else {
    model.translation_targets.forEach((rule) => {
      rule.source_languages.forEach((langCode) => {
        if (langCode !== "*") {
          sourceLangCodes.add(langCode);
        }
      });
    });
  }

  return Array.from(sourceLangCodes)
    .map((langCode) => ({
      code: langCode,
      name: getLanguageNameByCode(model, langCode),
    }))
    .sort((a, b) => {
      if (a.code === "*") return -1;
      if (b.code === "*") return 1;
      return a.name.localeCompare(b.name);
    });
}

export function getEveryPossibleTargetLanguage(
  model: ModelInfo | null
): Language[] {
  if (!model) return [];
  const targetLangCodes = new Set<string>();
  model.translation_targets.forEach((rule) => {
    targetLangCodes.add(rule.target_language);
  });
  return Array.from(targetLangCodes)
    .map((langCode) => ({
      code: langCode,
      name: getLanguageNameByCode(model, langCode),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function isOneWayTranslationPairValid(
  model: ModelInfo | null,
  sourceLanguage: string,
  targetLanguage: string
): boolean {
  if (!model || !sourceLanguage || !targetLanguage) return false;

  if (sourceLanguage === "*") {
    const any = model.translation_targets.find((rule) =>
      rule.source_languages.includes("*")
    );
    return targetLanguage === any?.target_language;
  }

  if (sourceLanguage === targetLanguage) return false;

  const rule = model.translation_targets.find(
    (r) => r.target_language === targetLanguage
  );

  if (!rule) return false;

  if (rule.source_languages.includes("*")) {
    return true;
  }

  return rule.source_languages.includes(sourceLanguage);
}

export function isTwoWayTranslationPairValid(
  model: ModelInfo | null,
  langA: string,
  langB: string
): boolean {
  if (!model || !langA || !langB) {
    return false;
  }

  if (langA === langB) {
    return false;
  }

  return model.two_way_translation_pairs.some((pair) => {
    const [p1, p2] = pair.split(":");
    return (p1 === langA && p2 === langB) || (p1 === langB && p2 === langA);
  });
}

export function getValidTargetLanguages(
  model: ModelInfo | null,
  sourceLanguage: string
): Language[] {
  if (!model || !sourceLanguage) return [];

  if (sourceLanguage === "*") {
    const any = model.translation_targets.find((rule) =>
      rule.source_languages.includes("*")
    );
    const code = any?.target_language ?? "en";
    const englishName = getLanguageNameByCode(model, code);
    if (model.languages.some((l) => l.code === code)) {
      return [{ code, name: englishName }];
    }
    return [];
  }

  const validTargetCodes = new Set<string>();

  model.translation_targets.forEach((rule) => {
    const sourceAllowed =
      rule.source_languages.includes(sourceLanguage) ||
      rule.source_languages.includes("*");

    if (sourceAllowed) {
      validTargetCodes.add(rule.target_language);
    }
  });

  validTargetCodes.delete(sourceLanguage);

  return Array.from(validTargetCodes)
    .map((langCode) => ({
      code: langCode,
      name: getLanguageNameByCode(model, langCode),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getValidSourceLanguages(
  model: ModelInfo | null,
  targetLanguage: string
): Language[] {
  if (!model || !targetLanguage) return [];

  const validSourceCodes = new Set<string>();

  const rule = model.translation_targets.find(
    (r) => r.target_language === targetLanguage
  );

  if (rule) {
    if (rule.source_languages.includes("*")) {
      model.languages.forEach((lang) => {
        validSourceCodes.add(lang.code);
      });
      validSourceCodes.add("*");
    } else {
      rule.source_languages.forEach((langCode) => {
        validSourceCodes.add(langCode);
      });
    }
  }

  validSourceCodes.delete(targetLanguage);

  return Array.from(validSourceCodes)
    .map((langCode) => ({
      code: langCode,
      name: getLanguageNameByCode(model, langCode),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
