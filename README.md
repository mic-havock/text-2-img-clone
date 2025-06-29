# Text-to-Image Clone

A modern web application that provides a user-friendly interface for generating AI images using Stable Diffusion WebUI. Built with React, Node.js, and integrated with Stable Diffusion models.

## 🚀 Features

- **Text-to-Image Generation**: Create images from text prompts using Stable Diffusion models
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Advanced Parameters**: Fine-tune generation settings including steps, CFG scale, samplers, and schedulers
- **Real-time Generation**: Live progress tracking and image display
- **Image Download**: Save generated images directly to your device
- **API Integration**: Seamless integration with Stable Diffusion WebUI API

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **AI Model**: Stable Diffusion WebUI with various models
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js 16+
- Python 3.10+
- Git
- Stable Diffusion WebUI (included in this repository)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd text-2-img-clone
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Start Stable Diffusion WebUI

```bash
cd stable-diffusion-webui
source venv/bin/activate  # On macOS/Linux
python launch.py --api --listen --port 7860 --skip-torch-cuda-test
```

### 4. Start the Application

```bash
# In a new terminal, start the Node.js server
npm start

# Or run in development mode
npm run dev
```

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📖 Usage

### Basic Image Generation

1. **Enter a Prompt**: Describe the image you want to generate
2. **Adjust Parameters** (optional): Click "Show Advanced" to modify generation settings
3. **Generate**: Click the "Generate Image" button
4. **Download**: Save your generated image using the download button

### Advanced Parameters

- **Steps**: Number of denoising steps (20-50 recommended)
- **CFG Scale**: How closely to follow the prompt (2.5-7.0 recommended)
- **Sampler**: Algorithm for image generation (DPM++ 2M SDE recommended)
- **Scheduler**: Noise scheduling method (Exponential/Karras recommended)
- **Dimensions**: Image width and height (512x512 default)
- **Upscale**: High-resolution upscaling factor
- **Denoising**: Strength of denoising (0.4 default)

### Recommended Settings for Stable Diffusion Models

- **Sampler**: DPM++ 2M SDE or DPM++ 3M SDE
- **Scheduler**: Exponential or Karras
- **Steps**: 30
- **CFG Scale**: 2.5-4.5
- **Dimensions**: 512x512 or 768x768

## 🏗️ Project Structure

```
text-2-img-clone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── App.tsx         # Main application component
│   ├── package.json
│   └── tailwind.config.js
├── stable-diffusion-webui/ # Stable Diffusion WebUI
├── server.js              # Express.js backend
├── package.json           # Backend dependencies
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
SD_API_URL=http://localhost:7860
SD_API_TIMEOUT=300000
```

### Stable Diffusion WebUI Settings

The application is configured to work with various Stable Diffusion models. Key settings:

- **API Mode**: Enabled with `--api` flag
- **Port**: 7860 (default)
- **Model**: Various .safetensors or .ckpt files

## 🎨 API Endpoints

### Generate Image

```
POST /api/generate
Content-Type: application/json

{
  "prompt": "your text prompt",
  "steps": 30,
  "cfg": 3.0,
  "sampler": "DPM++ 2M SDE",
  "scheduler": "Exponential",
  "width": 512,
  "height": 512,
  "upscale": 1.4,
  "denoising": 0.4
}
```

### Health Check

```
GET /api/health
```

## 🐛 Troubleshooting

### Common Issues

1. **Stable Diffusion WebUI not starting**

   - Ensure Python 3.10+ is installed
   - Check that all dependencies are installed in the virtual environment
   - Verify sufficient disk space for models

2. **Generation fails**

   - Check that WebUI is running on port 7860
   - Verify the model is properly loaded
   - Check server logs for detailed error messages

3. **Slow generation**
   - Reduce image dimensions
   - Lower the number of steps
   - Consider using a faster sampler

### Logs

- **Backend logs**: Check terminal where `npm start` is running
- **WebUI logs**: Check terminal where `python launch.py` is running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) - The underlying AI framework
- [Stable Diffusion](https://github.com/CompVis/stable-diffusion) - The AI model framework
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Open an issue on GitHub with detailed information about your problem

---

**Note**: This application requires significant computational resources and is designed to run on systems with adequate GPU/CPU capabilities.
