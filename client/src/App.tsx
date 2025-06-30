import { Download, Image as ImageIcon, Loader2, Settings, Sliders, Upload, Wand2 } from "lucide-react";
import React, { useState } from "react";
import ImageDisplay from "./components/ImageDisplay";
import MaskingTool from "./components/MaskingTool";
import ParameterPanel from "./components/ParameterPanel";
import PromptInput from "./components/PromptInput";
import { GenerationParameters, SamplerOption, SchedulerOption } from "./types";

type TabType = "txt2img" | "img2img" | "settings";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("txt2img");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [parameters, setParameters] = useState<GenerationParameters>({
    prompt: "",
    steps: 35,
    cfg_scale: 4.0,
    sampler: "DPM++ 2M" as SamplerOption,
    scheduler: "BETA" as SchedulerOption,
    width: 512,
    height: 512,
    negative_prompt: "",
    seed: undefined,
    subseed: undefined,
    subseed_strength: 0,
    seed_resize_from_h: 0,
    seed_resize_from_w: 0,
    batch_size: 1,
    n_iter: 1,
    restore_faces: false,
    tiling: false,
    enable_hr: false,
    hr_scale: 1.0,
    hr_upscaler: "",
    hr_second_pass_steps: 0,
    hr_resize_x: 0,
    hr_resize_y: 0,
    denoising_strength: 0.4,
    eta: 0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 0,
    override_settings: undefined,
    override_settings_restore_afterwards: false,
    script_args: undefined,
    alwayson_scripts: undefined,
    init_images: undefined,
    mask: undefined,
    mask_blur: 0,
    inpainting_fill: 0,
    inpaint_full_res: false,
    inpaint_full_res_padding: 0,
    inpainting_mask_invert: 0,
  });

  /**
   * Generate image using the AI model
   */
  const generateImage = async () => {
    if (!parameters.prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Prepare the request payload
      const payload: GenerationParameters = {
        ...parameters,
        prompt: parameters.prompt.trim(),
      };

      // Add img2img parameters if we have an uploaded image
      if (uploadedImage && activeTab === "img2img") {
        // Convert the uploaded image to base64
        const response = await fetch(uploadedImage);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
          };
          reader.readAsDataURL(blob);
        });

        payload.init_images = [base64];
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const result = await response.json();

      if (result.success) {
        setGeneratedImage(result.imageUrl);
      } else {
        throw new Error(result.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Check if it's a NaN error and format it nicely
      if (errorMessage.includes("NaN Error:")) {
        const lines = errorMessage.split('\n');
        const title = lines[0];
        const solutions = lines.slice(1).filter(line => line.trim());
        
        const formattedMessage = `${title}\n\nSolutions:\n${solutions.map(s => `• ${s.replace(/^\d+\.\s*/, '')}`).join('\n')}`;
        alert(formattedMessage);
      } else {
        alert(`Error generating image: ${errorMessage}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle image upload for img2img
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  /**
   * Process image file and convert to data URL
   */
  const processImageFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image file");
    }
  };

  /**
   * Handle drag and drop events
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  };

  /**
   * Download the generated image
   */
  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Stable Diffusion WebUI</h1>
                <p className="text-sm text-gray-400">AI Image Generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2 text-sm"
              >
                <Sliders className="h-4 w-4" />
                <span>{showAdvanced ? "Hide" : "Show"} Advanced</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("txt2img")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "txt2img"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Text to Image
            </button>
            <button
              onClick={() => setActiveTab("img2img")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "img2img"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Image to Image
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "txt2img" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prompt Input */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
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
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Generation Parameters
                  </h2>
                  <ParameterPanel
                    parameters={parameters}
                    onChange={setParameters}
                    activeTab={activeTab}
                  />
                </div>
              )}

              {/* Generate Button */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <button
                  onClick={generateImage}
                  disabled={isGenerating || !parameters.prompt.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-200">Error</h3>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                </div>
              )}
            </div>

            {/* Right Panel - Image Display */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Generated Image</h2>
                  {generatedImage && (
                    <button
                      onClick={downloadImage}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
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
        )}

        {activeTab === "img2img" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Image Upload */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Input Image
                </h2>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                    isDragOver 
                      ? "border-blue-500 bg-blue-900/20" 
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className={`h-12 w-12 mb-2 transition-colors duration-200 ${
                      isDragOver ? "text-blue-400" : "text-gray-400"
                    }`} />
                    <span className={`transition-colors duration-200 ${
                      isDragOver ? "text-blue-400" : "text-gray-400"
                    }`}>
                      {isDragOver ? "Drop image here" : "Click to upload or drag and drop"}
                    </span>
                  </label>
                </div>
                {uploadedImage && (
                  <div className="mt-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Masking Tool for Inpainting */}
              <MaskingTool
                imageUrl={uploadedImage}
                onMaskChange={(maskDataUrl) => {
                  setMaskDataUrl(maskDataUrl);
                  // Convert to base64 for API
                  const base64 = maskDataUrl.split(',')[1];
                  setParameters({ ...parameters, mask: base64 });
                }}
                maskDataUrl={maskDataUrl}
              />

              {/* Prompt Input */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
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
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Generation Parameters
                  </h2>
                  <ParameterPanel
                    parameters={parameters}
                    onChange={setParameters}
                    activeTab={activeTab}
                  />
                </div>
              )}

              {/* Generate Button */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <button
                  onClick={generateImage}
                  disabled={isGenerating || !parameters.prompt.trim() || !uploadedImage}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      <span>{parameters.mask ? "Inpaint" : "Generate"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Image Display */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Generated Image</h2>
                  {generatedImage && (
                    <button
                      onClick={downloadImage}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
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
        )}

        {activeTab === "settings" && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-white mb-3">Model Information</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 text-sm">Current Model: Stable Diffusion</p>
                  <p className="text-gray-300 text-sm">API Status: Connected</p>
                  <p className="text-gray-300 text-sm">Server: http://localhost:7860</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-white mb-3">Default Parameters</h3>
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <p className="text-gray-300 text-sm">Sampler: DPM++ 2M</p>
                  <p className="text-gray-300 text-sm">Scheduler: BETA</p>
                  <p className="text-gray-300 text-sm">Steps: 35</p>
                  <p className="text-gray-300 text-sm">CFG Scale: 4.0</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App; 