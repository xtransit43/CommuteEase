# CommuteEase

## Project Overview
**CommuteEase** is a cross-platform mobile and web application built using React Native and Expo Router. Designed to ease the strain of long commutes, the app provides an integrated OpenGIS mapping system complete with live GPS tracking, nearby gas or EV charging station discovery via the Overpass API, and persistent user profile preferences.

---

## Features
* **Cross-Platform Responsive Navigation**: Automatically switches between a mobile bottom tab bar layout and a desktop-style sidebar navigation panel based on screen size.
* **Node.js API-Driven Account Management**: Powered by robust backend API routes (handling endpoints like `/api/login`, `/api/validate`, and `/api/user/preferences`), the system manages user registration, secure sign-in workflows, two-factor authentication (2FA) roadmap readiness, and custom commuter vehicle preferences.
* **OpenGIS Mapping & Native Integration**: Powered by `react-native-maps` on mobile platforms and OpenStreetMap embeds on the web, featuring real-time location tracking and turn-by-turn navigation hooks.
* **Vehicle Preference Routing**: Lets users configure whether they drive a gas-powered vehicle or an electric vehicle (EV), dynamically modifying station search queries (fuel vs. charging stations) through server preferences.
* **Secure Session Management**: Supports secure token caching and persistent session state using `expo-secure-store` and local storage.
* **Containerized Deployment**: Includes a multi-stage Dockerfile optimized for building and running the application server environment.

---

## Tech Stack
* **Framework & Routing**: React Native, Expo Router
* **Backend & API**: Node.js API routes, Prisma (database ORM integration)
* **Maps & GIS**: `react-native-maps`, `expo-location`, OpenStreetMap, Overpass API
* **Icons & Styling**: `@expo/vector-icons` (Ionicons, MaterialIcons)
* **Storage & Security**: `expo-secure-store`, Browser Local Storage
* **Deployment**: Docker

---

## Project Structure
* `app/_layout.tsx`: Mobile tab layout configuration.
* `app/_layout.web.tsx`: Responsive web desktop sidebar and bottom tab layout.
* `app/(tabs)/_layout.tsx`: Root stack layout configuration.
* `app/index.tsx`: Home dashboard screen with data streaming initialization.
* `app/about.tsx`: Mission statement and application details.
* `app/maps.tsx`: OpenGIS location tracking dashboard and station list.
* `app/settings.tsx`: Commuter preference configurations (Gas vs. EV) communicating with backend user preference endpoints.
* `app/login.tsx`: User sign-in interface interacting with authentication API routes.
* `app/signup.tsx`: Account registration and validation workflow.
* `components/OpenGisMap.tsx`: Native mobile map wrapper using `react-native-maps`.
* `Dockerfile`: Multi-stage build setup for Node.js production deployment.

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
3. Start the development server using the local Expo CLI:
   ``` bash
   npx expo start
   ```