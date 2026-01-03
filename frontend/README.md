# Cloudflare AI Chat Frontend

A modern React + TypeScript chat interface for the Cloudflare AI Chat backend with memory.

## Features

- 💬 Real-time chat interface
- 🎨 Modern UI with TailwindCSS
- 🌓 Dark mode support
- ⚡ Built with Vite for fast development
- 📱 Responsive design
- 🔄 Loading states and error handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure API URL:
   - Create a `.env` file in the `frontend/` directory
   - Add `VITE_API_URL=your-api-url-here` if your backend URL is different
   - The default API URL is already configured and should work out of the box

3. Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

The output will be in the `dist/` directory.

## Deploy to Cloudflare Pages

### Option 1: Using Wrangler CLI

1. Install Wrangler (if not already installed):
```bash
npm install -g wrangler
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

### Option 2: Connect to GitHub

1. Push this code to a GitHub repository
2. Go to Cloudflare Dashboard → Pages
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy!

## Configuration

The app uses the following default API endpoint:
- `https://cf-ai-memchat-worker.aravindpillarisetty.workers.dev/api/chat`

To override this, create a `.env` file with:
```
VITE_API_URL=your-api-url-here
```

The user ID is hardcoded to `"aravind"` as specified in the requirements.

