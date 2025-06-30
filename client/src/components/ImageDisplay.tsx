import { Image as ImageIcon, Loader2 } from "lucide-react";
import React from "react";

interface ImageDisplayProps {
  imageUrl: string | null;
  isGenerating: boolean;
  prompt: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isGenerating, prompt }) => {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Generating Image...</h3>
        <p className="text-sm text-gray-400">
          Creating your image with the AI model. This may take a few moments.
        </p>
        {prompt && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600 max-w-md">
            <p className="text-xs text-gray-300 font-medium">Prompt:</p>
            <p className="text-sm text-white">{prompt}</p>
          </div>
        )}
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600">
        <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Image Generated</h3>
        <p className="text-sm text-gray-400 text-center max-w-md">
          Enter a prompt and click "Generate Image" to create your first image with the AI model.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        <img
          src={imageUrl}
          alt={`Generated image for prompt: ${prompt}`}
          className="w-full h-auto rounded-lg shadow-lg border border-gray-600"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-700 rounded-lg">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Failed to load image</p>
          </div>
        </div>
      </div>
      
      {prompt && (
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <h4 className="text-sm font-medium text-white mb-2">Generated Prompt:</h4>
          <p className="text-sm text-gray-300">{prompt}</p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay; 