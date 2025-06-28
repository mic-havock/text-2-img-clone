import React from "react";
import { GenerationParameters, SamplerOption, SchedulerOption } from "../types";

interface ParameterPanelProps {
  parameters: GenerationParameters;
  onChange: (parameters: GenerationParameters) => void;
}

const ParameterPanel: React.FC<ParameterPanelProps> = ({ parameters, onChange }) => {
  const samplerOptions: SamplerOption[] = [
    "DPM++ 2M SDE",
    "DPM++ 3M SDE",
    "Euler",
    "Euler a",
    "LMS",
    "Heun",
    "DPM2",
    "DPM2 a",
    "DPM++ 2S a",
    "DPM++ 2M",
    "DPM++ SDE",
    "DPM fast",
    "DPM adaptive",
    "LMS Karras",
    "DPM2 Karras",
    "DPM2 a Karras",
    "DPM++ 2S a Karras",
    "DPM++ 2M Karras",
    "DPM++ SDE Karras",
    "DDIM",
    "PLMS",
  ];

  const schedulerOptions: SchedulerOption[] = [
    "Exponential",
    "Karras",
    "Linear",
    "Cosine",
    "Cosine with restart",
    "Polynomial",
    "Constant",
    "Constant with restart",
  ];

  const updateParameter = <K extends keyof GenerationParameters>(
    key: K,
    value: GenerationParameters[K]
  ): void => {
    onChange({ ...parameters, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Steps */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Steps: {parameters.steps}
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={parameters.steps}
          onChange={(e) => updateParameter("steps", parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10</span>
          <span>100</span>
        </div>
      </div>

      {/* CFG Scale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CFG Scale: {parameters.cfg}
        </label>
        <input
          type="range"
          min="1"
          max="20"
          step="0.1"
          value={parameters.cfg}
          onChange={(e) => updateParameter("cfg", parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1.0</span>
          <span>20.0</span>
        </div>
      </div>

      {/* Sampler */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sampler
        </label>
        <select
          value={parameters.sampler}
          onChange={(e) => updateParameter("sampler", e.target.value as SamplerOption)}
          className="input-field"
        >
          {samplerOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Scheduler */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scheduler
        </label>
        <select
          value={parameters.scheduler}
          onChange={(e) => updateParameter("scheduler", e.target.value as SchedulerOption)}
          className="input-field"
        >
          {schedulerOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Image Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Width: {parameters.width}
          </label>
          <input
            type="range"
            min="256"
            max="1024"
            step="64"
            value={parameters.width}
            onChange={(e) => updateParameter("width", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>256</span>
            <span>1024</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height: {parameters.height}
          </label>
          <input
            type="range"
            min="256"
            max="1024"
            step="64"
            value={parameters.height}
            onChange={(e) => updateParameter("height", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>256</span>
            <span>1024</span>
          </div>
        </div>
      </div>

      {/* Highres Fix */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Highres Fix</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upscale: {parameters.upscale}
            </label>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={parameters.upscale}
              onChange={(e) => updateParameter("upscale", parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Denoising: {parameters.denoising}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={parameters.denoising}
              onChange={(e) => updateParameter("denoising", parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1</span>
              <span>1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Settings */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Recommended Settings</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Sampler: DPM++ 2M SDE or DPM++ 3M SDE</li>
          <li>• Scheduler: Exponential or Karras</li>
          <li>• Steps: 30</li>
          <li>• CFG: 2.5-4.5</li>
          <li>• Highres fix: 1.4-1.5 upscale, ~0.4 denoising</li>
        </ul>
      </div>
    </div>
  );
};

export default ParameterPanel; 