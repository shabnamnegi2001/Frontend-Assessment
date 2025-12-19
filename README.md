# Identity Asset Dashboard

A comprehensive frontend-only dashboard application for managing digital identity assets including certificates, SSH keys, code signing keys, and audit logs.

## Live Demo

[View Live Demo](your-vercel-url-here)

## Features

### Core Modules

1. **Certificates Module** (`/certificates`)
   - View all SSL/TLS certificates with status indicators
   - Filter certificates by domain
   - Sort by expiry date
   - Pagination (10 items per page)
   - View detailed certificate information in modal
   - Edit certificate details via right-hand drawer
   - Status badges (Active/Expired/Expiring Soon)

2. **SSH Keys Module** (`/ssh-keys`)
   - List all SSH keys with trust level indicators
   - Debounced search by owner or fingerprint
   - Sort by trust level (High/Medium/Low)
   - Expandable rows showing associated servers
   - Smooth animations for row expansion
   - Color-coded trust level indicators

3. **Code Signing Keys Module** (`/code-signing`)
   - Toggle between grid and table view
   - Filter by protection level (HSM/Software)
   - Grid view with icon-based cards
   - Table view for detailed information
   - Protection level badges
   - View persists in localStorage

4. **Audit Logs Module** (`/audit-logs`)
   - Infinite scrolling (loads 15 items at a time)
   - Filter by action type
   - Date range filtering
   - Expandable rows with formatted JSON metadata
   - Auto-load more logs on scroll

### Cross-Cutting Features

- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Local Storage Caching**:
  - Data is cached for 5 minutes to improve performance
  - Immediate display of cached data while fresh data loads
  - User preferences (dark mode, view mode) persist across sessions
- **Responsive Design**: Works on desktop and tablet devices
- **Loading Skeletons**: Smooth skeleton loaders for all modules
- **Error Handling**: User-friendly error messages with retry functionality
- **Animations**: Smooth transitions for page navigation, modals, drawers, and row expansions

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Development

The development server runs on `http://localhost:5173` by default.

## Deployment

This project is optimized for Vercel deployment. Simply connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   └── layout/           # Layout components
├── data/                 # JSON data files
├── hooks/                # Custom React hooks
├── pages/                # Route pages
├── store/                # State management
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

## Key Features Implementation

- **Pagination**: Certificates module with 10 items per page
- **Infinite Scrolling**: Audit logs load more on scroll
- **Debounced Search**: 300ms delay for optimal performance
- **Local Storage**: 5-minute cache + persistent preferences
- **Responsive Design**: Mobile-first with breakpoints
- **Error Boundaries**: Graceful error handling with retry

## License

MIT
