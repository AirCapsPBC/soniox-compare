import React from "react";
import { Mic, StopCircle } from "lucide-react";
import { useComparison } from "@/contexts/comparison-context";
import { AudioWaveButton } from "./audio-wave-button";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  mainContent: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ mainContent }) => {
  const { recordingState, startRecording, stopRecording } = useComparison();

  const isRecording = recordingState === "recording";
  const isStarting = recordingState === "starting";
  const isStopping = recordingState === "stopping";
  const isConnecting = recordingState === "connecting";

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="w-full h-dvh flex flex-col font-sans antialiased bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Main content area */}
      <main className="flex-grow relative h-full flex flex-col">
        <div className="w-full flex-1 overflow-hidden">{mainContent}</div>

        {/* Floating Start/Stop Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <AudioWaveButton
            onClick={handleButtonClick}
            disabled={isStarting || isStopping}
            className={cn(
              "px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transition-all duration-300",
              "min-w-[200px]",
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isRecording ? (
              <div className="flex flex-row items-center gap-x-3">
                <StopCircle className="w-6 h-6" />
                <span>
                  {isConnecting
                    ? "Connecting..."
                    : isStopping
                    ? "Stopping..."
                    : "Stop"}
                </span>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-x-3">
                <Mic className="w-6 h-6" />
                <span>{isStarting ? "Starting..." : "Start Talking"}</span>
              </div>
            )}
          </AudioWaveButton>
        </div>
      </main>
    </div>
  );
};
