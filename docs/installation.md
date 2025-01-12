# Installation Guide

This guide will walk you through the process of setting up the Order Management System locally.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

## Step-by-Step Installation

1. **Clone the Repository**
```bash
git clone <your-repo-url>
cd order-management-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
Copy the example environment file and update it with your settings:
```bash
cp .env.example .env
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Build for Production**
```bash
npm run build
```

## Troubleshooting

Common issues and their solutions:

### Port Already in Use
If port 5173 is already in use, you can:
- Kill the process using that port
- Or modify the port in vite.config.ts

### Build Errors
- Ensure all dependencies are installed
- Clear the npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`