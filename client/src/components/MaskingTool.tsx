import { Brush, Download, Eraser, RotateCcw, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface MaskingToolProps {
  imageUrl: string | null;
  onMaskChange: (maskDataUrl: string) => void;
  maskDataUrl: string | null;
}

/**
 * MaskingTool component for drawing masks on images for inpainting
 * Provides brush and eraser tools with adjustable brush size
 */
const MaskingTool: React.FC<MaskingToolProps> = ({ imageUrl, onMaskChange, maskDataUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Store image reference
        setCurrentImage(img);
        setImageLoaded(true);
        
        // Clear canvas and draw image
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          // If we have an existing mask, load it
          if (maskDataUrl) {
            const maskImg = new Image();
            maskImg.onload = () => {
              ctx.globalCompositeOperation = "source-over";
              ctx.drawImage(maskImg, 0, 0);
            };
            maskImg.src = maskDataUrl;
          }
        }
      };
      
      img.src = imageUrl;
    }
  }, [imageUrl, maskDataUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      ctx.globalCompositeOperation = tool === "brush" ? "source-over" : "destination-out";
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !imageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!imageLoaded) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    
    if (canvas && ctx) {
      ctx.closePath();
      // Export the mask
      const maskDataUrl = canvas.toDataURL("image/png");
      onMaskChange(maskDataUrl);
    }
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    
    if (canvas && ctx && currentImage) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(currentImage, 0, 0);
      onMaskChange(canvas.toDataURL("image/png"));
    }
  };

  const downloadMask = () => {
    if (maskDataUrl) {
      const link = document.createElement("a");
      link.download = "mask.png";
      link.href = maskDataUrl;
      link.click();
    }
  };

  const uploadMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          
          if (canvas && ctx && currentImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentImage, 0, 0);
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(img, 0, 0);
            onMaskChange(canvas.toDataURL("image/png"));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (!imageUrl) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Masking Tool</h3>
        <p className="text-gray-400">Upload an image first to use the masking tool.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Masking Tool</h3>
      
      {/* Tool Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTool("brush")}
            className={`p-2 rounded-lg ${tool === "brush" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            title="Brush Tool"
          >
            <Brush className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-lg ${tool === "eraser" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            title="Eraser Tool"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 min-w-0">
          <label className="text-sm text-gray-300 whitespace-nowrap">Brush Size:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray-300 w-8 text-center">{brushSize}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearMask}
            className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg"
            title="Clear Mask"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            onClick={downloadMask}
            className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg"
            title="Download Mask"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => document.getElementById("mask-upload")?.click()}
            className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg"
            title="Upload Mask"
          >
            <Upload className="h-4 w-4" />
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={uploadMask}
            className="hidden"
            id="mask-upload"
          />
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          <strong>Instructions:</strong> Use the brush tool to paint areas you want to modify (white areas). 
          Use the eraser to remove paint. The masked areas will be inpainted based on your prompt.
        </p>
      </div>
      
      {/* Canvas */}
      <div className="border border-gray-600 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair max-w-full h-auto"
          style={{ 
            background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjY0NjdGNjU4M0U1MTFFQjg3QURCRjI5N0U5QjA5QjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjY0NjdGNjY4M0U1MTFFQjg3QURCRjI5N0U5QjA5QjQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCNjQ2N0Y2MzgzRTUxMUVCODdBREJGMjk3RTlCMDlCNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCNjQ2N0Y2NDgzRTUxMUVCODdBREJGMjk3RTlCMDlCNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAEAAAAALAAAAAAoACgAAAIRhI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuCwAAOw==')",
            backgroundSize: "20px 20px"
          }}
        />
      </div>
    </div>
  );
};

export default MaskingTool; 