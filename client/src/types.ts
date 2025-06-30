export interface GenerationParameters {
  /** The main prompt describing what you want to generate. */
  prompt: string;
  /** Negative prompt: what you want to avoid in the image. */
  negative_prompt?: string;
  /** Number of denoising steps (higher = more detail, slower). */
  steps: number;
  /** Sampler algorithm (e.g., DPM++ 2M, Euler, etc.). */
  sampler: string;
  /** Scheduler type (e.g., Karras, Exponential, BETA, etc.). */
  scheduler?: string;
  /** Classifier-Free Guidance scale (higher = more like prompt, lower = more creative). */
  cfg_scale: number;
  /** Output image width in pixels. */
  width: number;
  /** Output image height in pixels. */
  height: number;
  /** Random seed for reproducibility. */
  seed?: number;
  /** Subseed for extra randomness. */
  subseed?: number;
  /** Strength of subseed mixing (0-1). */
  subseed_strength?: number;
  /** Seed resize from height (for legacy seed behavior). */
  seed_resize_from_h?: number;
  /** Seed resize from width (for legacy seed behavior). */
  seed_resize_from_w?: number;
  /** Number of images to generate per batch. */
  batch_size?: number;
  /** Number of batches to run. */
  n_iter?: number;
  /** Restore faces using GFPGAN/CodeFormer. */
  restore_faces?: boolean;
  /** Tile the image for seamless textures. */
  tiling?: boolean;
  /** Enable high-res fix (generates at low res, then upscales). */
  enable_hr?: boolean;
  /** High-res upscaling factor. */
  hr_scale?: number;
  /** High-res upscaler algorithm. */
  hr_upscaler?: string;
  /** Steps for the second pass in high-res fix. */
  hr_second_pass_steps?: number;
  /** High-res resize width. */
  hr_resize_x?: number;
  /** High-res resize height. */
  hr_resize_y?: number;
  /** Denoising strength (img2img, high-res fix). */
  denoising_strength?: number;
  /** Sampler eta (noise randomness, advanced). */
  eta?: number;
  /** s_churn (advanced sampler parameter). */
  s_churn?: number;
  /** s_tmax (advanced sampler parameter). */
  s_tmax?: number;
  /** s_tmin (advanced sampler parameter). */
  s_tmin?: number;
  /** s_noise (advanced sampler parameter). */
  s_noise?: number;
  /** Override settings (advanced, for custom webui options). */
  override_settings?: Record<string, unknown>;
  /** Restore override settings after generation. */
  override_settings_restore_afterwards?: boolean;
  /** Script arguments (for custom scripts/extensions). */
  script_args?: unknown[];
  /** Always-on scripts (for extensions). */
  alwayson_scripts?: Record<string, unknown>;
  /** For img2img: input images as base64 strings. */
  init_images?: string[];
  /** For img2img: mask image as base64 string. */
  mask?: string;
  /** For img2img: mask blur radius. */
  mask_blur?: number;
  /** For img2img: inpainting fill mode. */
  inpainting_fill?: number;
  /** For img2img: inpaint at full resolution. */
  inpaint_full_res?: boolean;
  /** For img2img: padding for full-res inpainting. */
  inpaint_full_res_padding?: number;
  /** For img2img: invert mask. */
  inpainting_mask_invert?: number;
}

export interface GenerationResult {
  success: boolean;
  imageUrl: string;
  imagePath: string;
  prompt: string;
  parameters: Partial<GenerationParameters>;
}

export interface GenerationError {
  error: string;
}

export type SamplerOption = "DPM++ 2M SDE" | "DPM++ 3M SDE" | "Euler" | "Euler a" | "LMS" | "Heun" | "DPM2" | "DPM2 a" | "DPM++ 2S a" | "DPM++ 2M" | "DPM++ SDE" | "DPM fast" | "DPM adaptive" | "LMS Karras" | "DPM2 Karras" | "DPM2 a Karras" | "DPM++ 2S a Karras" | "DPM++ 2M Karras" | "DPM++ SDE Karras" | "DDIM" | "PLMS";

export type SchedulerOption = "BETA" | "Exponential" | "Karras" | "Linear" | "Cosine" | "Cosine with restart" | "Polynomial" | "Constant" | "Constant with restart"; 