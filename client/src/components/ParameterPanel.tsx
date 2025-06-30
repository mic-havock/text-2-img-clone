import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import React, { useState } from "react";
import { GenerationParameters, SamplerOption, SchedulerOption } from "../types";

interface ParameterPanelProps {
  parameters: GenerationParameters;
  onChange: (parameters: GenerationParameters) => void;
  activeTab?: "txt2img" | "img2img" | "settings";
}

/**
 * ParameterPanel component for configuring image generation parameters
 * Groups parameters into logical sections with tooltips and collapsible groups
 */
const ParameterPanel: React.FC<ParameterPanelProps> = ({ parameters, onChange, activeTab = "txt2img" }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHighRes, setShowHighRes] = useState(false);

  const samplerOptions: SamplerOption[] = [
    "DPM++ 2M SDE",
    "DPM++ 3M SDE",
    "DPM++ 2M",
    "Euler",
    "Euler a",
    "LMS",
    "Heun",
    "DPM2",
    "DPM2 a",
    "DPM++ 2S a",
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
    "BETA",
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

  /**
   * Helper function to create a parameter input with tooltip
   */
  const createParameterInput = (
    label: string,
    value: number | string | boolean,
    onChange: (value: number | string | boolean) => void,
    type: "number" | "text" | "checkbox" | "select",
    min?: number,
    max?: number,
    step?: number,
    options?: { value: string; label: string }[],
    tooltip?: string,
    placeholder?: string
  ) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300 flex items-center">
          {label}
          <div className="group relative ml-1">
            <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300 whitespace-normal z-50 max-w-xs w-64 shadow-lg border border-gray-700 pointer-events-none">
              {tooltip || ""}
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </label>
      </div>
      {type === "number" && (
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      {type === "text" && (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      {type === "checkbox" && (
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
        />
      )}
      {type === "select" && options && (
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* BASIC PARAMETERS */}
      <div className="border-b border-gray-700 pb-4">
        <h3 className="text-md font-semibold text-white mb-3">Basic Parameters</h3>
        <p className="text-sm text-gray-400 mb-4">
          Essential settings that control the core generation process.
        </p>
        
        {createParameterInput(
          "Steps",
          parameters.steps,
          (value) => onChange({ ...parameters, steps: value as number }),
          "number",
          1,
          150,
          1,
          undefined,
          "Number of denoising steps. Higher values = better quality but slower generation. 20-50 is usually good. For fast testing use 20, for final images use 30-50.",
        )}

        {createParameterInput(
          "CFG Scale",
          parameters.cfg_scale,
          (value) => onChange({ ...parameters, cfg_scale: value as number }),
          "number",
          1,
          30,
          0.5,
          undefined,
          "How closely the image follows your prompt. Higher values = more prompt adherence but less creativity. 7-11 is typical. Below 5 = very creative, above 15 = very strict.",
        )}

        {createParameterInput(
          "Sampler",
          parameters.sampler,
          (value) => onChange({ ...parameters, sampler: value as any }),
          "select",
          undefined,
          undefined,
          undefined,
          [
            { value: "Euler", label: "Euler" },
            { value: "Euler a", label: "Euler Ancestral" },
            { value: "Heun", label: "Heun" },
            { value: "DPM2", label: "DPM2" },
            { value: "DPM2 a", label: "DPM2 Ancestral" },
            { value: "DPM++ 2S a", label: "DPM++ 2S Ancestral" },
            { value: "DPM++ 2M", label: "DPM++ 2M" },
            { value: "DPM++ SDE", label: "DPM++ SDE" },
            { value: "DPM fast", label: "DPM Fast" },
            { value: "DPM adaptive", label: "DPM Adaptive" },
            { value: "LMS", label: "LMS" },
            { value: "DDIM", label: "DDIM" },
            { value: "UniPC", label: "UniPC" },
          ],
          "The algorithm used for denoising. DPM++ 2M is often the best balance of quality and speed. DPM++ SDE is slower but higher quality. Euler is fast but lower quality.",
        )}

        {createParameterInput(
          "Scheduler",
          parameters.scheduler || "BETA",
          (value) => onChange({ ...parameters, scheduler: value as any }),
          "select",
          undefined,
          undefined,
          undefined,
          [
            { value: "BETA", label: "Beta" },
            { value: "ALPHA", label: "Alpha" },
            { value: "SIGMA", label: "Sigma" },
            { value: "KARRAS", label: "Karras" },
            { value: "EXPONENTIAL", label: "Exponential" },
            { value: "SGM_UNIFORM", label: "SGM Uniform" },
            { value: "UNIFORM", label: "Uniform" },
          ],
          "Controls how noise is scheduled during generation. Karras often works well with DPM++ samplers. Exponential is good for fast generation. Beta is the most common default.",
        )}

        {createParameterInput(
          "Width",
          parameters.width,
          (value) => onChange({ ...parameters, width: value as number }),
          "number",
          64,
          2048,
          8,
          undefined,
          "Image width in pixels. Must be divisible by 8. Higher values = more detail but slower generation and more VRAM usage. 512-1024 is typical.",
        )}

        {createParameterInput(
          "Height",
          parameters.height,
          (value) => onChange({ ...parameters, height: value as number }),
          "number",
          64,
          2048,
          8,
          undefined,
          "Image height in pixels. Must be divisible by 8. Higher values = more detail but slower generation and more VRAM usage. 512-1024 is typical.",
        )}

        {createParameterInput(
          "Negative Prompt",
          parameters.negative_prompt || "",
          (value) => onChange({ ...parameters, negative_prompt: value as string }),
          "text",
          undefined,
          undefined,
          undefined,
          undefined,
          "Words to avoid in the generated image. Common: 'lowres, bad anatomy, blurry, watermark, text, deformed, ugly, bad proportions'. Separate with commas.",
          "lowres, bad anatomy, blurry, watermark"
        )}

        {createParameterInput(
          "Seed",
          parameters.seed || "",
          (value) => onChange({ ...parameters, seed: value === "" ? undefined : (value as number) }),
          "number",
          -1,
          2147483647,
          1,
          undefined,
          "Random seed for reproducible results. -1 = random seed. Same seed + same settings = same image. Use to recreate good results or make variations.",
        )}

        {createParameterInput(
          "Restore Faces",
          parameters.restore_faces || false,
          (value) => onChange({ ...parameters, restore_faces: value as boolean }),
          "checkbox",
          undefined,
          undefined,
          undefined,
          undefined,
          "Automatically fix facial features using GFPGAN. Can help with portrait generation but may affect other details and slow generation slightly.",
        )}

        {createParameterInput(
          "Tiling",
          parameters.tiling || false,
          (value) => onChange({ ...parameters, tiling: value as boolean }),
          "checkbox",
          undefined,
          undefined,
          undefined,
          undefined,
          "Generate seamless tileable images. Useful for textures, patterns, and backgrounds. May reduce overall image quality slightly.",
        )}
      </div>

      {/* HIGH-RES FIX PARAMETERS */}
      <div className="border-b border-gray-700 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold text-white">High-Res Fix</h3>
          <button
            onClick={() => setShowHighRes(!showHighRes)}
            className="text-gray-400 hover:text-white"
          >
            {showHighRes ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Two-pass generation for higher resolution images with better detail preservation.
        </p>
        
        {showHighRes && (
          <div className="space-y-4">
            {createParameterInput(
              "Enable High-Res Fix",
              parameters.enable_hr || false,
              (value) => onChange({ ...parameters, enable_hr: value as boolean }),
              "checkbox",
              undefined,
              undefined,
              undefined,
              undefined,
              "Enable two-pass generation. First pass at lower resolution, then upscale and refine.",
            )}

            {createParameterInput(
              "High-Res Scale",
              parameters.hr_scale || 1.0,
              (value) => onChange({ ...parameters, hr_scale: value as number }),
              "number",
              1,
              4,
              0.1,
              undefined,
              "Upscaling factor for the second pass. 1.5-2.0 is typical for good results.",
            )}

            {createParameterInput(
              "High-Res Upscaler",
              parameters.hr_upscaler || "",
              (value) => onChange({ ...parameters, hr_upscaler: value as string }),
              "select",
              undefined,
              undefined,
              undefined,
              [
                { value: "Latent", label: "Latent" },
                { value: "Latent (antialiased)", label: "Latent (antialiased)" },
                { value: "Latent (bicubic)", label: "Latent (bicubic)" },
                { value: "Latent (bicubic antialiased)", label: "Latent (bicubic antialiased)" },
                { value: "Latent (nearest)", label: "Latent (nearest)" },
                { value: "Latent (nearest-exact)", label: "Latent (nearest-exact)" },
                { value: "None", label: "None" },
              ],
              "Upscaling method for the second pass. Latent methods are usually best for AI generation.",
            )}

            {createParameterInput(
              "High-Res Steps",
              parameters.hr_second_pass_steps || 0,
              (value) => onChange({ ...parameters, hr_second_pass_steps: value as number }),
              "number",
              0,
              150,
              1,
              undefined,
              "Number of denoising steps for the second pass. Usually 50-75% of original steps.",
            )}

            {createParameterInput(
              "High-Res Resize X",
              parameters.hr_resize_x || 0,
              (value) => onChange({ ...parameters, hr_resize_x: value as number }),
              "number",
              0,
              2048,
              8,
              undefined,
              "Target width for high-res pass. 0 = auto-calculate based on scale.",
            )}

            {createParameterInput(
              "High-Res Resize Y",
              parameters.hr_resize_y || 0,
              (value) => onChange({ ...parameters, hr_resize_y: value as number }),
              "number",
              0,
              2048,
              8,
              undefined,
              "Target height for high-res pass. 0 = auto-calculate based on scale.",
            )}
          </div>
        )}
      </div>

      {/* ADVANCED PARAMETERS */}
      <div className="border-b border-gray-700 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold text-white">Advanced Parameters</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-400 hover:text-white"
          >
            {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Advanced settings for fine-tuning generation behavior. Most users can leave these at defaults.
        </p>
        
        {showAdvanced && (
          <div className="space-y-4">
            {createParameterInput(
              "Subseed",
              parameters.subseed || "",
              (value) => onChange({ ...parameters, subseed: value === "" ? undefined : (value as number) }),
              "number",
              -1,
              2147483647,
              1,
              undefined,
              "Secondary seed for sub-sampling. Used with subseed_strength for controlled variation.",
            )}

            {createParameterInput(
              "Subseed Strength",
              parameters.subseed_strength || 0,
              (value) => onChange({ ...parameters, subseed_strength: value as number }),
              "number",
              0,
              1,
              0.01,
              undefined,
              "How much the subseed affects generation. 0 = no effect, 1 = full effect.",
            )}

            {createParameterInput(
              "Seed Resize From H",
              parameters.seed_resize_from_h || 0,
              (value) => onChange({ ...parameters, seed_resize_from_h: value as number }),
              "number",
              0,
              2048,
              8,
              undefined,
              "Height to resize from when using seed resizing. 0 = disabled.",
            )}

            {createParameterInput(
              "Seed Resize From W",
              parameters.seed_resize_from_w || 0,
              (value) => onChange({ ...parameters, seed_resize_from_w: value as number }),
              "number",
              0,
              2048,
              8,
              undefined,
              "Width to resize from when using seed resizing. 0 = disabled.",
            )}

            {createParameterInput(
              "Batch Size",
              parameters.batch_size || 1,
              (value) => onChange({ ...parameters, batch_size: value as number }),
              "number",
              1,
              4,
              1,
              undefined,
              "Number of images to generate in parallel. Higher values use more VRAM.",
            )}

            {createParameterInput(
              "Batch Count",
              parameters.n_iter || 1,
              (value) => onChange({ ...parameters, n_iter: value as number }),
              "number",
              1,
              10,
              1,
              undefined,
              "Number of batches to generate. Total images = batch_size × batch_count.",
            )}

            {createParameterInput(
              "Eta",
              parameters.eta || 0,
              (value) => onChange({ ...parameters, eta: value as number }),
              "number",
              0,
              1,
              0.01,
              undefined,
              "Eta parameter for DDIM sampler. Controls noise level in early steps.",
            )}

            {createParameterInput(
              "S Churn",
              parameters.s_churn || 0,
              (value) => onChange({ ...parameters, s_churn: value as number }),
              "number",
              0,
              100,
              0.1,
              undefined,
              "SDE churn parameter. Adds noise during sampling for better exploration.",
            )}

            {createParameterInput(
              "S Tmax",
              parameters.s_tmax || 0,
              (value) => onChange({ ...parameters, s_tmax: value as number }),
              "number",
              0,
              1000,
              0.1,
              undefined,
              "SDE tmax parameter. Maximum timestep for SDE sampling.",
            )}

            {createParameterInput(
              "S Tmin",
              parameters.s_tmin || 0,
              (value) => onChange({ ...parameters, s_tmin: value as number }),
              "number",
              0,
              1000,
              0.1,
              undefined,
              "SDE tmin parameter. Minimum timestep for SDE sampling.",
            )}

            {createParameterInput(
              "S Noise",
              parameters.s_noise || 0,
              (value) => onChange({ ...parameters, s_noise: value as number }),
              "number",
              0,
              100,
              0.1,
              undefined,
              "SDE noise parameter. Controls noise level in SDE sampling.",
            )}
          </div>
        )}
      </div>

      {/* IMG2IMG/INPAINTING PARAMETERS */}
      {activeTab === "img2img" && (
        <div className="border-b border-gray-700 pb-4 mb-4">
          <h3 className="text-md font-semibold text-white mb-3">img2img / Inpainting</h3>
          <p className="text-sm text-gray-400 mb-4">
            Parameters specific to image-to-image generation and inpainting workflows.
          </p>
          
          {createParameterInput(
            "Denoising Strength",
            parameters.denoising_strength || 0.4,
            (value) => onChange({ ...parameters, denoising_strength: value as number }),
            "number",
            0,
            1,
            0.01,
            undefined,
            "How much to change the original image. 0 = no change, 1 = completely new image. 0.4-0.7 is typical.",
          )}

          {createParameterInput(
            "Mask Blur",
            parameters.mask_blur || 0,
            (value) => onChange({ ...parameters, mask_blur: value as number }),
            "number",
            0,
            64,
            1,
            undefined,
            "Blur radius for mask edges. Higher values create smoother transitions between masked and unmasked areas.",
          )}

          {createParameterInput(
            "Inpainting Fill",
            parameters.inpainting_fill || 0,
            (value) => onChange({ ...parameters, inpainting_fill: value as number }),
            "select",
            undefined,
            undefined,
            undefined,
            [
              { value: "0", label: "Fill" },
              { value: "1", label: "Original" },
              { value: "2", label: "Latent Noise" },
              { value: "3", label: "Latent Nothing" },
            ],
            "How to fill masked areas before inpainting. Fill = use surrounding pixels, Original = keep original content, Latent = use AI-generated content.",
          )}

          {createParameterInput(
            "Inpaint Full Res",
            parameters.inpaint_full_res || false,
            (value) => onChange({ ...parameters, inpaint_full_res: value as boolean }),
            "checkbox",
            undefined,
            undefined,
            undefined,
            undefined,
            "Inpaint at full resolution instead of downscaling. Better quality but slower and uses more VRAM.",
          )}

          {createParameterInput(
            "Inpaint Full Res Padding",
            parameters.inpaint_full_res_padding || 0,
            (value) => onChange({ ...parameters, inpaint_full_res_padding: value as number }),
            "number",
            0,
            256,
            1,
            undefined,
            "Padding around masked areas when using full resolution inpainting. Higher values include more context.",
          )}

          {createParameterInput(
            "Inpainting Mask Invert",
            parameters.inpainting_mask_invert || 0,
            (value) => onChange({ ...parameters, inpainting_mask_invert: value as number }),
            "select",
            undefined,
            undefined,
            undefined,
            [
              { value: "0", label: "Normal" },
              { value: "1", label: "Inverted" },
            ],
            "Invert the mask so white areas are preserved and black areas are modified.",
          )}
        </div>
      )}
    </div>
  );
};

export default ParameterPanel; 