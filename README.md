# CommuteEase

## Project Overview
**CommuteEase** is a modern cross-platform mobile and web application built with React Native and Expo Router designed to reduce commute stress. It features an integrated geospatial mapping system, interactive charging/fuel node discovery, vehicle preference routing, secure user authentication with Two-Factor Authentication (2FA), and real-time AI-powered commute insights via the Google Gemini API.

---

## Features
- **Cross-Platform Responsive Navigation**: Automatically switches between a mobile bottom tab bar layout and a desktop-style sidebar navigation panel with a custom terminal-inspired dark theme (`_layout.web.tsx`).
- **AI-Powered Route & Charging Insights**: Integrates with Google Gemini AI to analyze local spatial data and deliver contextual recommendations for electric vehicles (EV) and gas-powered vehicles (`ai+api.ts`).
- **Secure Authentication & 2FA**: Implements user signup/login workflows with password hashing (`bcrypt`), persistent session storage (`expo-secure-store` / browser storage), and TOTP-based Two-Factor Authentication via `speakeasy` and `qrcode` (`2fa-verify.tsx`, `setup+api.ts`, `verify+api.ts`).
- **OpenGIS Mapping & Native Integration**: Powered by `react-native-maps` on mobile platforms (`OpenGisMap.tsx`) paired with real-time route telemetry (`maps.tsx`).
- **Database-Backed User Preferences**: Relational data management using Prisma ORM with PostgreSQL (`schema.prisma`) to configure custom vehicle types, makes, and models (`preferences+api.ts`).

---

## Tech Stack
- **Frontend Framework**: React Native, Expo Router, TypeScript
- **Backend & API Routes**: Expo Server API Routes, Node.js
- **Database & ORM**: PostgreSQL, Prisma ORM (`schema.prisma`)
- **AI & Security**: Google Gemini 1.5 Flash API (`ai+api.ts`), `bcrypt`, `speakeasy` (TOTP 2FA)
- **Maps & GIS**: `react-native-maps`, `expo-location`
- **Storage**: `expo-secure-store`, Browser Local Storage

---

## Project Structure
- `app/_layout.tsx`: Root stack layout configuration.
- `app/_layout.web.tsx`: Responsive web desktop sidebar and mobile tab navigation layout.
- `app/(tabs)/`: Tab screen directory for primary views.
- `app/index.tsx`: Home dashboard screen with terminal GIS and authentication hooks.
- `app/maps.tsx`: Geospatial mapping and live telemetry dashboard.
- `app/settings.tsx`: Commuter profile and vehicle preference manager.
- `app/login.tsx` & `app/signup.tsx`: Authentication interfaces and account validation logic.
- `app/2fa-verify.tsx`: TOTP 2FA code confirmation screen.
- `app/api/`: Backend API endpoints (`ai`, `login`, `preferences`, `validation`, `setup`, `verify`).
- `components/OpenGisMap.tsx`: Native mobile and web map wrapper using `react-native-maps`.
- `lib/prisma.ts`: Prisma database client instance.
- `prisma/schema.prisma`: Relational database schema for users and vehicle metadata.

---
## Getting Started & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation Steps
1. Clone the repository and navigate to the project directory:
   ```bash
   cd CommuteEase
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
   ```
3. Start the development server using the local Expo CLI:
   ``` bash
   npx expo start
   ```
