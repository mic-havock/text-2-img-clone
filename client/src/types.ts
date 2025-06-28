export interface GenerationParameters {
  prompt: string;
  steps: number;
  cfg: number;
  sampler: string;
  scheduler: string;
  width: number;
  height: number;
  upscale: number;
  denoising: number;
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

export type SchedulerOption = "Exponential" | "Karras" | "Linear" | "Cosine" | "Cosine with restart" | "Polynomial" | "Constant" | "Constant with restart"; 