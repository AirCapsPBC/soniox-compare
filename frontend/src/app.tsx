import { ComparisonProvider } from "@/contexts/comparison-context";
import { MainLayout } from "@/components/main-layout";
import { ProviderGrid } from "@/components/provider-grid";
import { ModelDataProvider } from "@/contexts/model-data-context";
import { FeatureProvider, useFeatures } from "@/contexts/feature-context";
import { Mic } from "lucide-react";

function App() {
  return (
    <FeatureProvider>
      <AppCore />
    </FeatureProvider>
  );
}

function AppCore() {
  const { providerFeatures, isLoading, error } = useFeatures();

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Mic className="w-16 h-16 text-blue-600 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p>Error loading features: {error.message}</p>
      </div>
    );
  }

  if (!providerFeatures) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Mic className="w-16 h-16 text-blue-600" />
          <p className="text-gray-600">No features data available.</p>
        </div>
      </div>
    );
  }

  return (
    <ModelDataProvider>
      <ComparisonProvider>
        <MainLayout mainContent={<ProviderGrid />} />
      </ComparisonProvider>
    </ModelDataProvider>
  );
}

export default App;
