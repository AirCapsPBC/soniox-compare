export const ALL_PROVIDERS_LIST = [
  "openai",
  "deepgram",
  "azure",
  "google",
  "speechmatics",
  "assembly",
] as const;
export type ProviderName = (typeof ALL_PROVIDERS_LIST)[number];
