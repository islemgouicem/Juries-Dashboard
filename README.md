# Jury Portal

A judge/administrator evaluation portal built using React, TypeScript, Vite, and Supabase.

This application allows administrators to add new projects and judges, and provides a real-time, consolidated rankings view. Judges can log in to view pending projects and submit their evaluations.


## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   **Node.js** (version 18 or later is recommended)
*   **Git**
*   **A Supabase Project Instance** (URL and Keys required)

### 1. Installation

Clone the repository and install the necessary dependencies:

```bash
# Clone the repository
git clone https://github.com/SkillnTell/EUNOIA_jury_part.git
cd eunoia-jury-portal

# Install NPM dependencies
npm install```

### 2. Configuration: Environment Variables

This project uses **Vite** and relies on client-side environment variables, which must be prefixed with `VITE_`.

Create a file named `.env.local` in the root of your project directory (`/eunoia-jury-portal`) and populate it with your Supabase credentials:

**.env.local**
