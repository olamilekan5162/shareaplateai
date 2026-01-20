# 🍽️ ShareAplate AI

**AI-powered community food rescue platform**

---

## 🌍 Overview

**ShareAplate AI** is a full-stack web application that helps communities reduce food waste and fight hunger by intelligently matching surplus food from donors to people and organizations in need.

The platform uses **LLM-powered agents** to:

- Match food donations to the best nearby recipients
- Help users stay consistent with their social-impact goals
- Improve trust and safety in food sharing

This project is built for the **Social & Community Impact** track of the hackathon and aligns with the theme:

> _“Build AI-powered applications that help people actually achieve their 2026 goals.”_

---

## 🎯 Problem Statement

- Restaurants, grocery stores, and households throw away edible food daily.
- NGOs and shelters struggle to find food donations in real time.
- Existing systems are slow, manual, and poorly coordinated.
- People want to help, but lack tools that make social impact easy and consistent.

---

## 💡 Solution

ShareAplate AI provides a **community-driven food donation platform** where:

- **Donors** list surplus food before it expires
- **Recipients (NGOs / individuals)** discover and claim nearby food
- **Volunteers (optional)** help with pickups
- **AI agents** optimize matching, safety, and impact
- **Impact dashboards** show real, measurable social and environmental benefits

---

## 🧠 What Makes This an AI Project (Not Just a CRUD App)

This is **not** a chatbot and **not** a basic listing platform.

The intelligence lives in **backend AI agents** that:

- Make decisions
- Optimize outcomes
- Are evaluated and improved with real metrics

---

## 🤖 AI Agents

### 1️⃣ Food Matching Agent (Core Agent)

**Purpose:**
Ensure surplus food reaches the right recipient **before it expires**.

**What it does:**

- Analyzes:

  - Food type & quantity
  - Expiry time
  - Donor & recipient location
  - Dietary constraints

- Ranks the best recipient options
- Explains _why_ a match was recommended

**Outcome:**
Higher pickup success rate, less wasted food.

## 🧩 Application Features

### 👤 User Roles

- **Donors** (restaurants, stores, individuals)
- **Recipients** (NGOs, shelters, individuals)
- **Volunteers** (optional)

---

### 📋 Core Features

- User registration & authentication
- Food listing form (type, quantity, expiry, location)
- Browse & claim food donations
- AI-powered match recommendations
- Real-time listing updates
- Impact dashboard:

  - Food saved (kg)
  - Meals delivered (estimate)
  - CO₂ emissions reduced

---

## 🧪 Evaluation & Observability (Opik)

We use **Opik** to evaluate and improve our AI agents.

### What we track:

- Match success rate
- Time-to-pickup
- Expired vs successfully delivered food
- Agent decision consistency

### What this shows judges:

- Data-driven agent improvement
- Transparent evaluation
- Production-ready AI practices

---

## 🏗️ Technical Architecture

### Frontend

- **React**
- **Tailwind CSS**

### Backend / Infrastructure

- **Supabase**

  - Authentication
  - Database
  - Realtime updates

### AI & Agents

- LLM APIs (OpenAI / Gemini)
- Serverless API routes for agent logic

### Observability

- **Opik** (agent evaluation, experiment tracking)

### Deployment

- Vercel

---

## 🔄 Example Flow

1. Donor lists surplus food
2. Food Matching Agent evaluates best recipients
3. Recommendation is logged and evaluated in Opik
4. Recipient claims food
5. Impact metrics are updated in real time

---

## 🏆 Hackathon Alignment

### Track Fit: Social & Community Impact

- Fosters community connection
- Reduces food waste
- Supports vulnerable populations
- Creates measurable environmental impact

### Theme Fit: 2026 Goals

- Helps users build sustainable giving habits
- Encourages long-term social responsibility

### Bonus: Best Use of Opik

- Clear agent evaluation
- Experiment tracking
- Data-backed improvements

---

## 🚀 MVP Scope (Hackathon-Ready)

**Must-have:**

- Auth + dashboards
- Food listing & claiming
- One fully working AI agent
- Opik integration
- Impact metrics

**Nice-to-have:**

- Volunteer routing
- QR pickup verification
- Gamified badges

---

## 🧠 Key Idea to Remember

> **ShareAplate AI is a real product first — and an AI system second.**
> The web app enables usage, the agents create intelligence, and Opik proves it works.
