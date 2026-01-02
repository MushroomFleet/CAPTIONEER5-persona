# CAPTIONEER

<div align="center">

![CAPTIONEER](https://img.shields.io/badge/CAPTIONEER-v1.0.0-ff6b35?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmNmIzNSIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01LTEwIDV6Ii8+PC9zdmc+)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Browser-orange?style=for-the-badge)
![OpenRouter](https://img.shields.io/badge/API-OpenRouter-blue?style=for-the-badge)

**Batch Image Captioning Tool for AI Training Datasets**

*Vision API captioning • Custom system prompts • Trigger words • 100% Local UI*

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Configuration](#configuration) • [FAQ](#faq)

</div>

---

## Overview

**CAPTIONEER** is a browser-based batch image captioning tool designed for preparing AI training datasets. It uses OpenRouter's Vision API to generate detailed captions for images and videos, with support for custom system prompts, trigger words, and classifiers.

### What It Does

| Function | Input | Output |
|----------|-------|--------|
| **Caption Images** | JPG, PNG, GIF, WebP, BMP | Text files with matching names |
| **Caption Videos** | MP4, WebM, MOV, AVI, MKV | Text files (from frame 15 extraction) |
| **Batch Export** | Multiple files | ZIP archive of all captions |

All processing UI runs locally in your browser. Only image data is sent to the OpenRouter API for captioning.

---

## Features

- 🖼️ **Batch Image Captioning** - Process hundreds of images automatically
- 🎬 **Video Support** - Extracts frame 15 from videos for captioning
- 📝 **Custom System Prompts** - Upload `.md` files to control captioning behavior
- 🔒 **Prompt Locking** - Save prompts to localStorage for reuse across sessions
- 🏷️ **Trigger Words** - Add custom prefixes (e.g., `sks`, `ohwx`) to all captions
- 📂 **Classifiers** - Add subject categories (e.g., `woman`, `man`, `style`)
- 📦 **ZIP Export** - Download all captions in a single archive
- ⚙️ **Model Selection** - Use any vision-capable model on OpenRouter
- 🎨 **Industrial UI** - Professional dark interface with real-time logging

---

## Installation

### Prerequisites

- **Python 3.x** (for the local server)
- **Modern Browser** (Chrome, Firefox, or Edge recommended)
- **OpenRouter API Key** (get one at [openrouter.ai](https://openrouter.ai))

### Quick Start

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/yourusername/CAPTIONEER.git
   cd CAPTIONEER
   ```

2. **Start the server**
   
   **Windows:**
   ```bash
   start-server.bat
   ```
   
   **Mac/Linux:**
   ```bash
   chmod +x start-server.sh
   ./start-server.sh
   ```
   
   **Or manually with Python:**
   ```bash
   python server.py
   ```

3. **Open in browser** (auto-opens, or navigate to):
   ```
   http://localhost:8000/captioneer.html
   ```

4. **Configure API Settings**
   - Click the **⚙️ Settings** button
   - Enter your OpenRouter API key
   - Choose your preferred model (default: `x-ai/grok-4-fast`)

---

## Why A Local Server?

While Captioneer could run from a `file://` URL for basic functionality, using the local Python server provides:

1. **CORS Headers** - Proper cross-origin handling for API requests
2. **Security Headers** - COOP/COEP headers for future WASM features
3. **Caching Control** - No stale files during development
4. **Professional Workflow** - Mirrors production deployment

---

## Usage

### Basic Workflow

1. **Upload System Prompt** (Optional)
   - Drop a `.md` or `.txt` file with your captioning instructions
   - Click **🔒 Lock Prompt** to save for future sessions
   - Or use the default: *"Write a detailed description of the image inside a single paragraph, with no feedback or commentary"*

2. **Select Images**
   - Click **📁 Select Folder** to choose a directory
   - Supports: JPG, PNG, GIF, WebP, BMP (images) and MP4, WebM, MOV, AVI, MKV (videos)

3. **Configure Prefixes** (Optional)
   - **Trigger Word**: Added before every caption (e.g., `sks`)
   - **Classifier**: Subject type after trigger (e.g., `woman`)

4. **Start Processing**
   - Click **▶ START CAPTIONING**
   - Monitor progress in the real-time log
   - Files are processed sequentially to avoid rate limits

5. **Download Results**
   - Click **📦 Download Captions ZIP** when complete
   - Extract and copy `.txt` files alongside your images

### Caption Output Format

```
[TRIGGER], [CLASSIFIER], [CAPTION_OUTPUT]
```

**Example:**
```
sks, woman, A young woman with long brown hair stands in a sunlit garden, wearing a flowing white dress. She gazes thoughtfully at a butterfly perched on her outstretched hand, surrounded by blooming roses and lavender.
```

### Output Structure

```
captions_2026-01-02.zip
├── image001.txt
├── image002.txt
├── photo_portrait.txt
├── video_clip.txt      (captioned from frame 15)
└── ...
```

---

## Configuration

### System Prompt Examples

**For LoRA Training (Detailed):**
```markdown
You are an expert image captioner for AI training datasets. 
Describe the image in a single detailed paragraph covering:
- Subject appearance (age, features, expression, pose)
- Clothing and accessories
- Environment and lighting
- Camera angle and composition
- Art style if applicable

Be specific and objective. No commentary or opinions.
```

**For Style Training (Concise):**
```markdown
Describe the artistic style and visual elements in one paragraph.
Focus on: color palette, brushwork, composition, lighting mood.
Do not describe subject matter in detail.
```

**For Product Photos:**
```markdown
Describe this product image for e-commerce.
Include: product type, color, material, key features, positioning.
Professional tone, no marketing language.
```

### Recommended Vision Models

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| `x-ai/grok-4-fast` | ⚡ Fast | Good | $ |
| `anthropic/claude-3.5-sonnet` | Medium | Excellent | $$ |
| `openai/gpt-4o` | Medium | Excellent | $$ |
| `google/gemini-pro-vision` | Fast | Good | $ |

Check [OpenRouter Models](https://openrouter.ai/models) for current availability and pricing.

### API Key Security

Your API key is:
- ✅ Stored only in your browser's localStorage
- ✅ Sent directly to OpenRouter (not through any proxy)
- ✅ Never logged or transmitted elsewhere
- ⚠️ Clear browser data to remove it completely

---

## File Structure

```
CAPTIONEER/
├── captioneer.html     # Main application (open in browser)
├── captioneer.jsx      # React component source
├── server.py           # Python server with CORS headers
├── start-server.bat    # Windows startup script
├── start-server.sh     # Mac/Linux startup script
└── README.md           # This file
```

---

## Technical Details

### Technologies Used

- **React 18** - UI framework (loaded via CDN)
- **JSZip** - ZIP archive generation
- **Canvas API** - Video frame extraction
- **OpenRouter API** - Vision model access

### Browser Requirements

| Feature | Requirement |
|---------|-------------|
| Image Captioning | Modern browser (ES2020+) |
| Video Frame Extraction | Canvas API support |
| File System Access | File input with `webkitdirectory` |

### Processing Specifications

- **Sequential Processing** - One image at a time (prevents rate limits)
- **Request Delay** - 500ms between API calls
- **Video Frames** - Extracts frame 15 (~0.5s at 30fps)
- **Max Tokens** - 1024 per caption response

---

## FAQ

### Why is my API key not working?

1. Ensure you have credits in your OpenRouter account
2. Check that the key starts with `sk-or-`
3. Verify the selected model supports vision/images
4. Check the browser console for specific error messages

### Can I use this offline?

The UI runs locally, but captioning requires internet access to reach the OpenRouter API. There is no offline captioning capability.

### Why use OpenRouter instead of direct API access?

OpenRouter provides:
- Access to multiple model providers with one API key
- Automatic fallbacks if a model is unavailable
- Unified billing across providers
- Often lower prices through aggregation

### How do I change the video frame extraction point?

Currently fixed at frame 15 (~0.5 seconds). Edit `extractFrame15FromVideo` in the source to change:
```javascript
const targetTime = 15 / fps; // Change 15 to desired frame number
```

### Can I process thousands of images?

Yes, but consider:
- API costs accumulate quickly
- Processing is sequential (slow for large batches)
- Set a reasonable pace with the built-in 500ms delay
- Monitor your OpenRouter usage dashboard

### Why sequential processing instead of parallel?

1. **Rate Limits** - Most APIs limit requests per minute
2. **Memory** - Parallel processing can exhaust browser memory
3. **Reliability** - Easier to track and retry failures
4. **Cost Control** - Prevents runaway API charges

---

## Troubleshooting

### "Failed to fetch" Error

- Check your internet connection
- Verify API key is correct
- Ensure the model name is valid
- Check if OpenRouter is experiencing issues

### Browser Blocks Downloads

- Allow multiple downloads when prompted
- Check your downloads folder
- Try a different browser

### Server Won't Start

- Ensure Python 3.x is installed: `python --version`
- Check if port 8000 is in use: try `python server.py 8001`
- On Mac/Linux, ensure script is executable: `chmod +x start-server.sh`

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [OpenRouter](https://openrouter.ai) - Multi-model API access
- [JSZip](https://stuk.github.io/jszip/) - ZIP file generation
- [React](https://reactjs.org/) - UI framework

---

<div align="center">

**[⬆ Back to Top](#captioneer)**

Made with ⚡ for the AI Training Community

</div>
