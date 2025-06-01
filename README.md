# Spotify Tempo Track Analyzer

A modern web application that analyzes your Spotify listening patterns, tracks, and provides insights into your music preferences. Built with React, TypeScript, and Node.js.

## Features

- 🔐 Secure Spotify OAuth2 authentication
- 📊 Track listening statistics and patterns
- 🎵 View your top tracks and artists
- ⏱️ Analyze tempo and genre preferences
- 📱 Responsive design with modern UI
- 🔄 Real-time data updates

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- React Query
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Spotify Web API
- Express Session
- CORS

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Spotify Developer Account
- Git

## Environment Setup

1. Create a Spotify Developer Application:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new application
   - Add `http://localhost:8888/auth/callback` to Redirect URIs
   - Copy your Client ID and Client Secret

2. Clone the repository:
   ```bash
   git clone https://github.com/vinay1506/spotify-tempo-track-analyzer.git
   cd spotify-tempo-track-analyzer
   ```

3. Set up environment variables:
   - Create `.env` file in the backend directory:
     ```
     # Spotify API Credentials
     SPOTIFY_CLIENT_ID=your_client_id_here
     SPOTIFY_CLIENT_SECRET=your_client_secret_here
     SPOTIFY_REDIRECT_URI=http://localhost:8888/auth/callback

     # Server Configuration
     PORT=8888
     FRONTEND_URL=http://localhost:3000
     SESSION_SECRET=your_session_secret_here

     # Environment
     NODE_ENV=development
     ```

## Installation

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

## Development

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

3. Start the production server:
   ```bash
   cd backend
   npm start
   ```

## Project Structure

```
spotify-tempo-track-analyzer/
├── backend/               # Backend server
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── types/        # TypeScript types
│   │   └── server.ts     # Server entry point
│   └── package.json
├── src/                  # Frontend source
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   ├── types/           # TypeScript types
│   └── App.tsx          # App entry point
├── public/              # Static files
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Shadcn UI](https://ui.shadcn.com)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
