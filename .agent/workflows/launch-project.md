---
description: How to launch the Vanely Tattoo project (Frontend & Backend)
---

To launch the project, you need to start both the backend API and the frontend application.

### 1. Start the Backend API

Open a terminal and run the following commands:

```bash
cd server
npm run dev
```

> [!NOTE]
> This uses `nodemon` to automatically restart the server when you make changes. If `nodemon` isn't installed, use `npm start`.

### 2. Start the Frontend

Open **another** terminal and run:

```bash
npm run dev
```

### Verification

- **Backend**: Should be running on `http://localhost:3000` (check your `.env` in the server folder).
- **Frontend**: Should be running on the port displayed in the terminal (usually `http://localhost:5173`).
