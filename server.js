const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Stable Diffusion WebUI API configuration
const SD_API_URL = "http://localhost:7860";
const SD_API_TIMEOUT = 300000; // 5 minutes timeout

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, "client", "build")));

// Ensure directories exist
const uploadsDir = path.join(__dirname, "uploads");
const generatedDir = path.join(__dirname, "generated");

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(generatedDir);

/**
 * Check if Stable Diffusion WebUI is running
 * @returns {Promise<boolean>} True if WebUI is available
 */
async function checkSDWebUI() {
  try {
    const response = await axios.get(`${SD_API_URL}/sdapi/v1/progress`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.log("Stable Diffusion WebUI not available:", error.message);
    return false;
  }
}

/**
 * Generate image using Stable Diffusion via Stable Diffusion WebUI API
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Text prompt
 * @param {number} params.steps - Number of steps
 * @param {number} params.cfg_scale - CFG scale
 * @param {string} params.sampler - Sampler name
 * @param {string} params.scheduler - Scheduler name
 * @param {number} params.width - Image width
 * @param {number} params.height - Image height
 * @param {Array} params.init_images - Input images for img2img
 * @param {string} params.mask - Mask for inpainting
 * @param {number} params.denoising_strength - Denoising strength
 * @returns {Promise<Object>} Generation result
 */
async function generateImageWithSD(params) {
  try {
    // Check if WebUI is available
    const isWebUIAvailable = await checkSDWebUI();
    if (!isWebUIAvailable) {
      throw new Error(
        "Stable Diffusion WebUI is not running. Please start it first."
      );
    }

    // Determine if this is img2img or txt2img
    const isImg2Img = params.init_images && params.init_images.length > 0;
    const endpoint = isImg2Img ? "/sdapi/v1/img2img" : "/sdapi/v1/txt2img";

    // Prepare the API request payload
    const payload = {
      prompt: params.prompt,
      negative_prompt:
        params.negative_prompt ||
        "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
      steps: params.steps,
      cfg_scale: params.cfg_scale,
      width: params.width,
      height: params.height,
      sampler_name: params.sampler,
      scheduler: params.scheduler,
      restore_faces: params.restore_faces || false,
      tiling: params.tiling || false,
      enable_hr: params.enable_hr || false,
      hr_scale: params.hr_scale || 1.0,
      hr_upscaler: params.hr_upscaler || "Latent",
      hr_second_pass_steps:
        params.hr_second_pass_steps || Math.floor(params.steps * 0.5),
      hr_resize_x:
        params.hr_resize_x ||
        Math.floor(params.width * (params.hr_scale || 1.0)),
      hr_resize_y:
        params.hr_resize_y ||
        Math.floor(params.height * (params.hr_scale || 1.0)),
      denoising_strength: params.denoising_strength || 0.4,
      seed: params.seed,
      subseed: params.subseed,
      subseed_strength: params.subseed_strength,
      seed_resize_from_h: params.seed_resize_from_h,
      seed_resize_from_w: params.seed_resize_from_w,
      batch_size: params.batch_size || 1,
      n_iter: params.n_iter || 1,
      eta: params.eta,
      s_churn: params.s_churn,
      s_tmax: params.s_tmax,
      s_tmin: params.s_tmin,
      s_noise: params.s_noise,
      override_settings: params.override_settings,
      override_settings_restore_afterwards:
        params.override_settings_restore_afterwards,
      script_args: params.script_args,
      alwayson_scripts: params.alwayson_scripts,
    };

    // Add img2img specific parameters
    if (isImg2Img) {
      payload.init_images = params.init_images;
      if (params.mask) {
        payload.mask = params.mask;
        payload.mask_blur = params.mask_blur || 4;
        payload.inpainting_fill = params.inpainting_fill || 0;
        payload.inpaint_full_res = params.inpaint_full_res || false;
        payload.inpaint_full_res_padding = params.inpaint_full_res_padding || 0;
        payload.inpainting_mask_invert = params.inpainting_mask_invert || 0;
      }
    }

    console.log(
      `Sending ${
        isImg2Img ? "img2img" : "txt2img"
      } request to Stable Diffusion WebUI:`,
      payload
    );

    // Send the request to Stable Diffusion WebUI
    const response = await axios.post(`${SD_API_URL}${endpoint}`, payload, {
      timeout: SD_API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (
      response.data &&
      response.data.images &&
      response.data.images.length > 0
    ) {
      // Save the generated image
      const imageData = response.data.images[0];
      const imageBuffer = Buffer.from(imageData, "base64");
      const filename = `generated_${uuidv4()}.png`;
      const imagePath = path.join(generatedDir, filename);

      await fs.writeFile(imagePath, imageBuffer);

      return {
        success: true,
        imageUrl: `/generated/${filename}`,
        imagePath: imagePath,
        prompt: params.prompt,
        parameters: params,
        info: response.data.info || {},
      };
    } else {
      throw new Error("No image generated by Stable Diffusion WebUI");
    }
  } catch (error) {
    console.error("Error generating image:", error);

    // Handle specific NaN errors
    if (error.response?.data?.error === "NansException") {
      throw new Error(
        "NaN Error: This is usually caused by GPU precision issues. Try these solutions:\n" +
          "1. In Stable Diffusion WebUI Settings, enable 'Upcast cross attention layer to float32'\n" +
          "2. Restart WebUI with --no-half command line argument\n" +
          "3. Try a different model or reduce image resolution\n" +
          "4. Use --disable-nan-check to bypass this check (not recommended)"
      );
    }

    // Handle other API errors
    if (error.response?.data?.error) {
      throw new Error(
        `Stable Diffusion WebUI Error: ${error.response.data.error}`
      );
    }

    throw error;
  }
}

// Serve generated images
app.use("/generated", express.static(generatedDir));

// API endpoint for image generation
app.post("/api/generate", async (req, res) => {
  try {
    const {
      prompt,
      steps,
      cfg_scale,
      sampler,
      scheduler,
      width,
      height,
      negative_prompt,
      seed,
      subseed,
      subseed_strength,
      seed_resize_from_h,
      seed_resize_from_w,
      batch_size,
      n_iter,
      restore_faces,
      tiling,
      enable_hr,
      hr_scale,
      hr_upscaler,
      hr_second_pass_steps,
      hr_resize_x,
      hr_resize_y,
      denoising_strength,
      eta,
      s_churn,
      s_tmax,
      s_tmin,
      s_noise,
      override_settings,
      override_settings_restore_afterwards,
      script_args,
      alwayson_scripts,
      init_images,
      mask,
      mask_blur,
      inpainting_fill,
      inpaint_full_res,
      inpaint_full_res_padding,
      inpainting_mask_invert,
    } = req.body;

    // Validate required parameters
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Set default values for missing parameters
    const params = {
      prompt: prompt.trim(),
      steps: steps || 35,
      cfg_scale: cfg_scale || 4.0,
      sampler: sampler || "DPM++ 2M",
      scheduler: scheduler || "BETA",
      width: width || 512,
      height: height || 512,
      negative_prompt: negative_prompt || "",
      seed: seed,
      subseed: subseed,
      subseed_strength: subseed_strength || 0,
      seed_resize_from_h: seed_resize_from_h || 0,
      seed_resize_from_w: seed_resize_from_w || 0,
      batch_size: batch_size || 1,
      n_iter: n_iter || 1,
      restore_faces: restore_faces || false,
      tiling: tiling || false,
      enable_hr: enable_hr || false,
      hr_scale: hr_scale || 1.0,
      hr_upscaler: hr_upscaler || "",
      hr_second_pass_steps: hr_second_pass_steps || 0,
      hr_resize_x: hr_resize_x || 0,
      hr_resize_y: hr_resize_y || 0,
      denoising_strength: denoising_strength || 0.4,
      eta: eta || 0,
      s_churn: s_churn || 0,
      s_tmax: s_tmax || 0,
      s_tmin: s_tmin || 0,
      s_noise: s_noise || 0,
      override_settings: override_settings,
      override_settings_restore_afterwards:
        override_settings_restore_afterwards || false,
      script_args: script_args,
      alwayson_scripts: alwayson_scripts,
      init_images: init_images,
      mask: mask,
      mask_blur: mask_blur || 0,
      inpainting_fill: inpainting_fill || 0,
      inpaint_full_res: inpaint_full_res || false,
      inpaint_full_res_padding: inpaint_full_res_padding || 0,
      inpainting_mask_invert: inpainting_mask_invert || 0,
    };

    console.log("Generating image with parameters:", params);

    // Generate the image
    const result = await generateImageWithSD(params);

    res.json(result);
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate image",
      details: error.response?.data || error.stack,
    });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const isWebUIAvailable = await checkSDWebUI();
    res.json({
      status: "ok",
      sd_webui_available: isWebUIAvailable,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      sd_webui_available: false,
    });
  }
});

// Catch-all handler for React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Image generation: http://localhost:${PORT}/api/generate`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});
