# 🔥 Lumina TikTok Downloader

A beautiful, fast, and secure TikTok video downloader with a stunning red neon theme.

## ✨ Features

- 🎥 **HD Video Downloads** - Download TikTok videos in original quality
- 🚫 **No Watermarks** - Remove TikTok watermarks for clean videos
- 🎵 **Audio Extraction** - Convert TikTok videos to MP3 audio files
- 🔒 **Secure & Private** - No data stored, completely client-side processing
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Lightning Fast** - Optimized for speed and performance
- 🎨 **Beautiful UI** - Stunning red neon gradient design

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/LOSTBOY1-TCH/lumittdown.git
   cd lumittdown
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the server**
   \`\`\`bash
   npm start
   \`\`\`

4. **Open your browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

### Development Mode

For development with auto-restart:

\`\`\`bash
npm run dev
\`\`\`

## 📁 Project Structure

\`\`\`
lumittdown/
├── server.js          # Express server with API endpoints
├── index.html         # Main frontend application
├── package.json       # Dependencies and scripts
├── tt.png            # App icon
└── README.md         # This file
\`\`\`

## 🛠️ API Endpoints

### GET /api/health
Health check endpoint
\`\`\`json
{
  "status": "OK",
  "timestamp": "2025-01-19T17:53:57.000Z",
  "uptime": 123.456,
  "version": "1.0.0"
}
\`\`\`

### GET /api/video-info?url={tiktok_url}
Get TikTok video information
\`\`\`json
{
  "success": true,
  "data": {
    "title": "Video Title",
    "author": "username",
    "thumbnail": "https://...",
    "duration": 30,
    "downloads": {
      "hd": "https://...",
      "sd": "https://...",
      "watermark": "https://...",
      "audio": "https://..."
    }
  }
}
\`\`\`

### GET /api/download?url={file_url}&filename={filename}
Proxy download endpoint to handle CORS

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 30 requests per minute per IP
- **Input Validation** - URL validation and sanitization

## 🚀 Deployment

### Local Production

\`\`\`bash
NODE_ENV=production npm start
\`\`\`

### Docker (Optional)

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Vercel/Netlify

The app is ready for deployment on Vercel, Netlify, or any Node.js hosting platform.

## 🎨 Customization

### Changing the Theme

Edit the CSS variables in `index.html`:

\`\`\`css
:root {
  --primary-color: #ff0844;
  --secondary-color: #ffb199;
  --accent-color: #ff0064;
}
\`\`\`

### Adding New Features

1. Add API endpoints in `server.js`
2. Update frontend JavaScript in `index.html`
3. Test thoroughly before deployment

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- 📧 Email: lbtechdev1@gmail.com
- 💬 Telegram: [@THEREALLOSTBOY](https://t.me/THEREALLOSTBOY)
- 📱 WhatsApp: [+233549551004](https://wa.me/233549551004)

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect TikTok's terms of service and content creators' rights. Only download videos you have permission to download.

---

Made by **LostBoy Tech** © 2025
