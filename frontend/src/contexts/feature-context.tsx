import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import {
  ALL_PROVIDERS_LIST,
  type ProviderName,
} from "@/lib/provider-features";
import { snakeCaseToTitle } from "@/lib/utils";

const IGNORED_FEATURES = ["confidence_scores", "timestamps"];

// Schemas (copied from app.tsx, consider moving to a shared types file)
const featureInfoSchema = z.object({
  state: z.enum(["SUPPORTED", "UNSUPPORTED", "PARTIAL"]),
  comment: z.string().optional(),
});

// Use z.string() to accept any provider from backend, then filter to only supported ones
const rawProviderFeaturesSchema = z.record(
  z.string(),
  z
    .object({
      name: z.string(),
      model: z.string(),
    })
    .catchall(z.union([z.boolean(), featureInfoSchema]))
);

export type FeatureInfo = z.infer<typeof featureInfoSchema>;
export type ProviderFeatures = Partial<Record<ProviderName, z.infer<typeof rawProviderFeaturesSchema>[string]>>;

interface FeatureContextType {
  providerFeatures: ProviderFeatures | null;
  availableComparisonProviders: ProviderName[];
  isLoading: boolean;
  error: Error | null;
  getProviderFeatures: (
    providerName: ProviderName
  ) => Record<string, FeatureInfo | boolean | string>;
  getFeatureSet: () => string[];
  getProviderFeaturesTextTable: (providerName: ProviderName) => string;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [providerFeatures, setProviderFeatures] =
    useState<ProviderFeatures | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const availableComparisonProviders = useMemo(() => {
    return providerFeatures ? [...ALL_PROVIDERS_LIST] : [];
  }, [providerFeatures]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/compare/api/providers-features`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        try {
          const rawData = rawProviderFeaturesSchema.parse(data);
          // Filter to only include supported providers from ALL_PROVIDERS_LIST
          const filteredData: ProviderFeatures = {};
          for (const provider of ALL_PROVIDERS_LIST) {
            if (rawData[provider]) {
              filteredData[provider] = rawData[provider];
            }
          }
          setProviderFeatures(filteredData);
        } catch (err) {
          console.error(
            "[FeatureContext] Error parsing provider features:",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err as any).errors || err // Zod errors often have an 'errors' property
          );
          setError(
            err instanceof Error
              ? err
              : new Error("Error parsing provider features")
          );
        }
      })
      .catch((fetchErr) => {
        console.error(
          "[FeatureContext] Error fetching provider features:",
          fetchErr
        );
        setError(fetchErr);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getProviderFeatures = useCallback(
    (providerName: ProviderName) => {
      return Object.fromEntries(
        Object.entries(providerFeatures?.[providerName] || {}).filter(
          ([key]) => ![...IGNORED_FEATURES, "name", "model"].includes(key)
        )
      );
    },
    [providerFeatures]
  );

  const getFeatureSet = useCallback(() => {
    // Get features from the first available provider
    const firstProvider = ALL_PROVIDERS_LIST[0];
    return Object.keys(getProviderFeatures(firstProvider));
  }, [getProviderFeatures]);

  const getProviderFeaturesTextTable = useCallback(
    (providerName: ProviderName) => {
      const filteredProviderFeatures = getProviderFeatures(providerName);

      const getStateIcon = (state: FeatureInfo["state"]) => {
        switch (state) {
          case "SUPPORTED":
            return "✅";
          case "UNSUPPORTED":
            return "❌";
          case "PARTIAL":
            return "⚠️";
        }
      };

      return Object.entries(filteredProviderFeatures)
        .filter(([, value]) => {
          if (typeof value === "string") {
            return false;
          }
          return true;
        })
        .map(([key, value]) => {
          if (typeof value === "boolean") {
            return `${value ? "✅" : "❌"} ${key}:`;
          }
          if (typeof value === "string") {
            return null;
          }
          return `${getStateIcon(value.state)} ${snakeCaseToTitle(key)}`;
        })
        .join("\n");
    },
    [getProviderFeatures]
  );

  return (
    <FeatureContext.Provider
      value={{
        providerFeatures,
        availableComparisonProviders,
        isLoading,
        error,
        getProviderFeatures,
        getFeatureSet,
        getProviderFeaturesTextTable,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = (): FeatureContextType => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return context;
};
