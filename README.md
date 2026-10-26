# CommuteEase

## Project Overview
**CommuteEase** is a modern cross-platform mobile and web application built with React Native and Expo Router designed to reduce commute stress. It features an integrated OpenGIS mapping system, live GPS tracking, dynamic gas and EV charging station discovery via the Overpass API, vehicle preference routing, and an enterprise-grade **multi-cloud serverless backend** combining AWS Lambda and Azure Functions.

---

## Features
- **Cross-Platform Responsive Navigation**: Automatically switches between a mobile bottom tab bar layout and a desktop-style sidebar navigation panel based on screen size.
- **Multi-Cloud Serverless Architecture**:
  - **AWS Lambda & PostgreSQL (Prisma ORM)**: Securely manages backend database records, user authentication sessions, and customizable commuter vehicle preferences.
  - **Azure Functions (TypeScript / Node.js)**: High-performance serverless endpoints dedicated to geospatial logic, traffic delay calculations, and routing data.
- **OpenGIS Mapping & Native Integration**: Powered by `react-native-maps` on mobile platforms and OpenStreetMap embeds on the web, featuring real-time location tracking and turn-by-turn navigation hooks.
- **Vehicle Preference Routing**: Lets users configure whether they drive a gas-powered vehicle or an electric vehicle (EV), dynamically modifying station search queries (fuel vs. charging stations) through server preferences.
- **Secure Session Management**: Supports secure token caching and persistent session state using `expo-secure-store` and local storage.
- **Frontend Hosting**: Deployed globally via Netlify with runtime environment binding via Expo public variables (`EXPO_PUBLIC_`).

---

## Tech Stack
- **Frontend Framework**: React Native, Expo Router, Netlify
- **Cloud Backend 1 (User Data)**: AWS Lambda, AWS SAM, PostgreSQL, Prisma ORM
- **Cloud Backend 2 (Geospatial/Traffic)**: Azure Functions (Node.js/TypeScript)
- **Maps & GIS**: `react-native-maps`, `expo-location`, OpenStreetMap, Overpass API
- **Icons & Styling**: `@expo/vector-icons` (Ionicons, MaterialIcons)
- **Storage & Security**: `expo-secure-store`, Browser Local Storage

---

## Project Structure
- `app/_layout.tsx`: Mobile tab layout configuration.
- `app/_layout.web.tsx`: Responsive web desktop sidebar and bottom tab layout.
- `app/(tabs)/_layout.tsx`: Root stack layout configuration.
- `app/index.tsx`: Home dashboard screen with data streaming initialization.
- `app/about.tsx`: Mission statement and application details.
- `app/maps.tsx`: Geospatial mapping dashboard communicating with the Azure Functions backend.
- `app/settings.tsx`: Commuter preference configurations communicating with the AWS Lambda backend.
- `app/login.tsx`: User sign-in interface interacting with authentication workflows.
- `app/signup.tsx`: Account registration and validation workflow.
- `aws-lambda/get-preferences/`: AWS Lambda function code, Prisma schema (`schema.prisma`), and build configs.
- `azure-functions/get-geospatial/`: Azure Functions TypeScript handlers for geospatial and traffic data (`src/functions/geospatial.ts`).
- `components/OpenGisMap.tsx`: Native mobile map wrapper using `react-native-maps`.

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
3. Configure your local environment variables in a .env file or Netlify dashboard:
   ```bash
   EXPO_PUBLIC_AWS_PREFERENCES_URL=<your-aws-api-gateway-url>
   EXPO_PUBLIC_AZURE_GEOSPATIAL_URL=<your-azure-function-url>
   ```
4. Start the development server using the local Expo CLI:
   ``` bash
   npx expo start
   ```