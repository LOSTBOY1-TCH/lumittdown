const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
const path = require("path")
const axios = require("axios")

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        scriptSrcAttr: ["'unsafe-inline'"], // This allows inline event handlers
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'",
          "https://tikwm.com",
          "https://api.tiklydown.eu.org",
          "https://api.ssyoutube.com",
          "https://api-toxxic.zone.id",
        ],
        mediaSrc: ["'self'", "https:", "blob:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
)

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://luminattdown.zone.id"] 
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
)

// Other middleware
app.use(compression())
app.use(morgan("combined"))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Serve static files
app.use(
  express.static(path.join(__dirname), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : "0",
  }),
)

// Rate limiting storage
const rateLimit = {}
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 30 // 30 requests per minute

// Rate limiting middleware
app.use("/api/", (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress
  const now = Date.now()

  if (!rateLimit[clientIP]) {
    rateLimit[clientIP] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
  } else if (now > rateLimit[clientIP].resetTime) {
    rateLimit[clientIP] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
  } else if (rateLimit[clientIP].count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Too many requests",
      message: "Please wait before making more requests",
    })
  } else {
    rateLimit[clientIP].count++
  }

  next()
})

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    node_version: process.version,
  })
})

// TikTok video info endpoint
app.get("/api/video-info", async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({
        error: "URL parameter is required",
      })
    }

    // Validate TikTok URL
    const tiktokUrlPattern = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com|vt\.tiktok\.com)/
    if (!tiktokUrlPattern.test(url)) {
      return res.status(400).json({
        error: "Invalid TikTok URL",
      })
    }

    // Try multiple APIs for better reliability
    const apis = [
      {
        url: `https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`,
        parser: (data) => (data.code === 0 ? data.data : null),
      },
      {
        url: `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`,
        parser: (data) => (data.status ? data.data : null),
      },
    ]

    let videoData = null
    let lastError = null

    for (const api of apis) {
      try {
        const response = await axios.get(api.url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/json",
          },
          timeout: 15000,
        })

        if (response.status === 200 && response.data) {
          videoData = api.parser(response.data)
          if (videoData) break
        }
      } catch (error) {
        lastError = error
        console.error(`API ${api.url} failed:`, error.message)
      }
    }

    if (!videoData) {
      return res.status(404).json({
        error: "Video not found or unavailable",
        details: lastError?.message || "All APIs failed",
      })
    }

    // Return standardized response
    res.json({
      success: true,
      data: {
        title: videoData.title || "TikTok Video",
        author: videoData.author?.unique_id || videoData.author || "unknown",
        thumbnail: videoData.cover || videoData.thumbnail,
        duration: videoData.duration || 0,
        downloads: {
          hd: videoData.hdplay || videoData.play,
          sd: videoData.play || videoData.wmplay,
          watermark: videoData.wmplay || videoData.play,
          audio: videoData.music,
        },
      },
    })
  } catch (error) {
    console.error("Video info error:", error)
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    })
  }
})

// Proxy download endpoint to handle CORS issues
app.get("/api/download", async (req, res) => {
  try {
    const { url, filename } = req.query

    if (!url) {
      return res.status(400).json({
        error: "URL parameter is required",
      })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return res.status(400).json({
        error: "Invalid URL format",
      })
    }

    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 30000,
    })

    // Set appropriate headers
    const contentType = response.headers["content-type"] || "application/octet-stream"
    const contentLength = response.headers["content-length"]

    res.setHeader("Content-Type", contentType)
    res.setHeader("Content-Disposition", `attachment; filename="${filename || "download"}"`)
    res.setHeader("Access-Control-Allow-Origin", "*")

    if (contentLength) {
      res.setHeader("Content-Length", contentLength)
    }

    // Stream the file
    response.data.pipe(res)

    // Handle stream errors
    response.data.on("error", (error) => {
      console.error("Stream error:", error)
      if (!res.headersSent) {
        res.status(500).json({ error: "Download stream failed" })
      }
    })
  } catch (error) {
    console.error("Download error:", error)

    if (error.code === "ECONNABORTED") {
      return res.status(408).json({
        error: "Download timeout",
        message: "The download took too long to complete",
      })
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: "File not found",
        message: "The requested file could not be found",
      })
    }

    res.status(500).json({
      error: "Download failed",
      message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    })
  }
})

// Serve the main HTML file for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested resource was not found",
  })
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})

// Clean up rate limit storage periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimit).forEach((ip) => {
    if (now > rateLimit[ip].resetTime) {
      delete rateLimit[ip]
    }
  })
}, RATE_LIMIT_WINDOW)

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🔥 Lumina TikTok Downloader Server Started!
🌐 Server running on: http://localhost:${PORT}
🚀 Environment: ${process.env.NODE_ENV || "development"}
📦 Node.js version: ${process.version}
⚡ Ready to download TikTok videos!
    `)
})

// Handle server errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`)
    process.exit(1)
  } else {
    console.error("❌ Server error:", error)
  }
})

module.exports = app
