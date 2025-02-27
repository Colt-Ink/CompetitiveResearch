# Last Straw Farms - Market Research Application

This application helps Last Straw Farms, a cut flower farmer, develop market research for their flowers by identifying and managing potential clients, starting with florists within a 50-mile radius of the farm.

## Features

- **Client Database**: Comprehensive information about florists and other potential clients
- **Map Visualization**: Interactive maps showing client locations using Leaflet
- **Territory Management**: Group clients into territories for strategic planning
- **Route Planning**: Create optimized routes for client visits
- **Notes System**: Track interactions and important information about each client
- **Slack Integration**: Team collaboration and notifications through Slack

## Technology Stack

This application is built using the T3 Stack:
- **Next.js** with App Router for the frontend and API routes
- **TypeScript** for type safety
- **Tailwind CSS** with HeroUI components for styling
- **Prisma ORM** for database access
- **SQLite** for local data storage (with migration path to more robust databases)
- **Leaflet** for map visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository
2. Navigate to the LastStrawFarms directory
3. Install dependencies with `npm install`
4. Set up the database with `npx prisma migrate dev`
5. Start the development server with `npm run dev`

## Data Sources

The application uses the Google Maps API (via MCP) to fetch initial data about florists within a 50-mile radius of Last Straw Farms, located at 14385 SE Lusted Rd, Sandy, OR 97055.

## Slack Integration

The application integrates with Slack for team collaboration, allowing:
- Notifications about new clients added to the database
- Querying client data via Slack commands
- Syncing comments from Slack to client notes
- Rendering maps on request
