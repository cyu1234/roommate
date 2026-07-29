# Roommate

Roommate is an AI-powered architectural visualization app. Upload a 2D floor plan and generate a photorealistic, top-down 3D render while preserving the plan's layout. Projects are saved to a user's workspace, so original plans and generated renders remain available for later viewing.

## Features

- Puter authentication for user sign-in and sign-out
- Drag-and-drop or file-picker image uploads (JPG, PNG, and WebP; maximum 10 MB)
- AI conversion of floor plans into 1024 × 1024 architectural renders
- Side-by-side draggable before/after image comparison
- Persistent project history, including source and rendered images
- Image export as a PNG download
- Responsive interface with processing and upload states

## Tech stack

- **React 19** and **TypeScript**
- **React Router 8** for routing and server-side rendering
- **Vite** and **Tailwind CSS**
- **Puter** for authentication, AI generation, file storage, hosting, and worker APIs
- **Gemini** image generation, accessed through Puter's `txt2img` API
- **Lucide React** icons and **react-compare-slider**
- **Docker** for production packaging

## How it works

1. A signed-in user uploads a floor-plan image.
2. The app creates a private project and saves the source image to Puter-hosted storage.
3. The visualizer sends the source image and a constrained architectural prompt to the Gemini image model through Puter.
4. The generated render is stored with the project and displayed alongside the original plan.
5. Users can revisit saved projects or download the generated render.

## Getting started

### Prerequisites

- Node.js 24 or later
- npm
- A configured Puter worker endpoint for project persistence

### Installation

```bash
git clone <your-repository-url>
cd roomvisualizer
npm install
```

Create a `.env` file in the project root:

```env
VITE_PUTER_WORKER_URL=https://your-worker-url
```

`VITE_PUTER_WORKER_URL` is required for saving and retrieving projects. Without it, the app can load but skips project-history requests.

### Run locally

```bash
npm run dev
```

Open the local URL shown in your terminal, normally `http://localhost:5173`.

### Quality checks

```bash
npm run typecheck
npm run build
```

## Production with Docker

Build and run the production image:

```bash
docker build -t roommate .
docker run -p 3000:3000 roommate
```

The container runs the React Router production server on port `3000`.

## Project structure

```text
app/
  routes/                # Home and project visualizer routes
  root.tsx               # Application shell and auth context
components/              # Upload UI, navigation, and shared controls
lib/
  ai.action.ts           # AI image-generation request and image conversion
  puter.action.ts        # Authentication and project API calls
  puter.hosting.ts       # Image storage and hosted URL creation
  constants.ts           # Runtime configuration and render prompt
```

## Notes

The AI render prompt instructs the model to preserve the floor plan's geometry, remove textual annotations, use a top-down orthographic view, and add realistic architectural materials and fixtures only where clearly indicated.
