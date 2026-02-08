# ShareAPlate AI 🍽️

**An AI-powered food rescue platform connecting donors with recipients to reduce food waste and fight hunger.**

ShareAPlate AI uses intelligent matching algorithms to connect food donors (restaurants, grocery stores, individuals) with recipients (NGOs, shelters, community kitchens) in real-time, ensuring surplus food reaches those who need it most.

---

## 🌟 Features

### For Donors

- **Post Food Listings**: Share surplus food with details like quantity, expiry date, dietary tags, and location
- **AI-Powered Matching**: Automatic recipient recommendations based on proximity, urgency, and dietary compatibility
- **Claims Management**: Approve, reject, or mark claims as completed
- **Goal Tracking**: Set and monitor donation goals (e.g., "Donate 5 times per week")
- **Impact Coach**: Receive AI-generated motivational insights based on your activity

### For Recipients

- **Browse Available Food**: Search and filter listings by category, location, and dietary preferences
- **Smart Recommendations**: AI suggests the best matches based on your location and needs
- **Claim Food**: Request food items with real-time status updates
- **Goal Setting**: Track claims and meal service goals
- **Notifications**: Get instant alerts for new matches and claim updates

### AI & Intelligence

- **Gemini-Powered Matching**: Uses Google's Gemini 2.5 Flash for intelligent food-recipient pairing
- **Opik Observability**: Full LLM tracing and evaluation for transparency and optimization
- **Context-Aware Coaching**: Personalized motivational messages based on user stats and goals
- **Proximity Prioritization**: Location-based scoring ensures fast pickup times

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern UI with hooks and concurrent features
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **React Hot Toast** - Beautiful notifications
- **React Icons** - Icon library

### Backend

- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Express.js** - AI server for Gemini integration
- **Google Gemini AI** - LLM for matching, coaching, and content generation
- **Opik** - LLM observability and tracing platform

### AI & Observability

- **opik-gemini** - Gemini SDK wrapper for automatic tracing
- **Opik Dashboard** - Monitor prompts, responses, and performance metrics
- **Custom Metadata** - Track business metrics (user_id, location, match_score, etc.)

---

## 📁 Project Structure

```
ShareAPlateAi/
├── src/                      # Frontend React application
│   ├── components/           # Reusable UI components
│   ├── pages/                # Dashboard pages (Donor, Recipient, etc.)
│   ├── hooks/                # Custom React hooks (useAuth, useListings, etc.)
│   ├── lib/                  # Supabase client and utilities
│   └── index.css             # Global styles
├── ai_server/                # AI backend server
│   ├── routes/               # API endpoints
│   │   ├── matching.js       # Food matching logic
│   │   ├── coach.js          # Impact Coach messages
│   │   ├── goals.js          # Goal management
│   │   └── outcomes.js       # Metrics tracking
│   ├── utils/                # Email notifications, etc.
│   └── server.js             # Express server entry point
├── DATABASE_SCHEMA_COMPLETE.sql  # Full database schema
└── package.json              # Frontend dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Google AI Studio API key ([aistudio.google.com](https://aistudio.google.com))
- Opik account ([comet.com/opik](https://www.comet.com/site/products/opik/))

### 1. Clone the Repository

```bash
git clone https://github.com/olamilekan5162/shareaplateai.git
cd shareaplateai
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# AI Server
cd ai_server
npm install
cd ..
```

### 3. Set Up Environment Variables

**Frontend (`.env.local`):**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_SERVER_URL=http://localhost:3001
```

**AI Server (`ai_server/.env`):**

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE=your_opik_workspace
```

### 4. Set Up Database

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of DATABASE_SCHEMA_COMPLETE.sql
# Paste into Supabase SQL Editor and run
```

### 5. Run the Application

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: AI Server
cd ai_server
npm start
```

Visit `http://localhost:5173` to see the app!

---

## 🔍 Opik Integration

ShareAPlate AI uses **Opik** to trace and evaluate all AI interactions, providing full observability into:

### What We Track

- **Food Matching**: Every recommendation generated, including prompt, response, and metadata
- **Impact Coach**: Motivational message generation with user context
- **Goal Progress**: AI-driven insights and suggestions

### Viewing Traces

1. Log in to your Opik dashboard
2. Navigate to the "ShareAPlate AI" project
3. View traces, filter by metadata, and analyze performance

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy the `dist` folder
```

### AI Server (Render/Railway)

- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- Set environment variables in the hosting dashboard

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Opik** for LLM observability
- **Supabase** for backend infrastructure
- The open-source community for amazing tools

---

**Built with ❤️ to reduce food waste and fight hunger.**
