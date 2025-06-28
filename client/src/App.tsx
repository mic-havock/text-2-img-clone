import { Download, Image as ImageIcon, Loader2, Settings, Wand2 } from "lucide-react";
import React, { useState } from "react";
import ImageDisplay from "./components/ImageDisplay";
import ParameterPanel from "./components/ParameterPanel";
import PromptInput from "./components/PromptInput";
import { GenerationError, GenerationParameters, GenerationResult, SamplerOption, SchedulerOption } from "./types";

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  const [parameters, setParameters] = useState<GenerationParameters>({
    prompt: "",
    steps: 30,
    cfg: 3.0,
    sampler: "DPM++ 2M SDE" as SamplerOption,
    scheduler: "Exponential" as SchedulerOption,
    width: 512,
    height: 512,
    upscale: 1.4,
    denoising: 0.4,
  });

  /**
   * Generate image using the Lustify model
   */
  const generateImage = async (): Promise<void> => {
    if (!parameters.prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      });

      const data: GenerationResult | GenerationError = await response.json();

      if ("error" in data) {
        setError(data.error);
      } else if (data.success) {
        setGeneratedImage(data.imageUrl);
      } else {
        setError("Failed to generate image");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Download the generated image
   */
  const downloadImage = (): void => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `lustify-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Wand2 className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lustify</h1>
                <p className="text-sm text-gray-500">Text-to-Image Generator</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>{showAdvanced ? "Hide" : "Show"} Advanced</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Input */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Prompt
              </h2>
              <PromptInput
                value={parameters.prompt}
                onChange={(prompt) => setParameters({ ...parameters, prompt })}
                onGenerate={generateImage}
                isGenerating={isGenerating}
              />
            </div>

            {/* Advanced Parameters */}
            {showAdvanced && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Advanced Parameters
                </h2>
                <ParameterPanel
                  parameters={parameters}
                  onChange={setParameters}
                />
              </div>
            )}

            {/* Generate Button */}
            <div className="card p-6">
              <button
                onClick={generateImage}
                disabled={isGenerating || !parameters.prompt.trim()}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    <span>Generate Image</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="card p-6 border-l-4 border-red-500 bg-red-50">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Image Display */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Generated Image</h2>
                {generatedImage && (
                  <button
                    onClick={downloadImage}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>
              <ImageDisplay
                imageUrl={generatedImage}
                isGenerating={isGenerating}
                prompt={parameters.prompt}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Powered by the Lustify model. Recommended parameters: DPM++ 2M SDE/DPM++ 3M SDE sampler, 
              Exponential/Karras scheduler, 30 steps, CFG 2.5-4.5.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App; 