import { Send } from "lucide-react";
import React, { KeyboardEvent } from "react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onGenerate,
  isGenerating,
}) => {
  /**
   * Handle Enter key press to generate image
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && value.trim()) {
        onGenerate();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe the image you want to generate... (e.g., 'a beautiful sunset over mountains, photorealistic')"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        />
        <button
          onClick={onGenerate}
          disabled={isGenerating || !value.trim()}
          className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      
      <div className="text-xs text-gray-400 space-y-1">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use descriptive language for better results</li>
          <li>Add style modifiers like "photorealistic", "artistic", "detailed"</li>
          <li>Press Enter to generate (Shift+Enter for new line)</li>
          <li>Try danbooru tags for specific styles</li>
        </ul>
      </div>
    </div>
  );
};

export default PromptInput; 