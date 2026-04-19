# MyFit-FitnessPlanner (Client)

A React + Vite application for personalized fitness planning, health tracking, and AI-powered coaching.

## Supabase Integration

This project is now integrated with Supabase for authentication and data persistence.

### Prerequisites
1.  Create a project at [Supabase](https://supabase.com).
2.  Go to **Project Settings > API** and copy your `URL` and `Anon Key`.
3.  Go to the **SQL Editor** in Supabase and run the schema found in `supabase_schema.sql` (if provided) or manually create the following tables:
    -   `profiles` (linked to `auth.users`)
    -   `health_logs` (user_id, type, data, created_at)
    -   `chat_logs` (user_id, data, created_at)

### Setup
1.  Create a `.env` file in this directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Features
-   **Universal Multilingual Support**: Plan generation in English, Hindi, and Marathi.
-   **AI Coach**: Interactive chat with Contextual awareness of your profile and health logs.
-   **Health Tracker**: Log medications and symptoms, synced with your cloud account.
-   **Premium Dark Mode**: Seamless UI experience with theme-aware components.
