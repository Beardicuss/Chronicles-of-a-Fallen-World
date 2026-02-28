# Chronicles of a Fallen World: Book I

**Developed by:** Dante Berezinsky  
**Company:** Softcurse

## Project Overview

*Chronicles of a Fallen World: Book I* is a native cross-platform mobile application built using React Native and Expo. It features a rich, narrative-driven experience with dynamic 2D animations and an immersive world-building engine.

**Platform**: iOS & Android (Native), Web (Exportable)  
**Framework**: Expo Router + React Native  
**Engine**: Custom 2D Canvas Engine (WebView-based)

---

## 📖 Lore & World Building

*Chronicles of a Fallen World: Book I* is set in a desolate universe where the Great Balance has fractured. The narrative centers on **Dagon**, a champion struggling with the inherited power of the **Blight**.

- **The Prophecies of the Dying Light**: Ancient visions foretelling the cosmic unraveling and the rise of the Void.
- **The Blight Magic & Corruption System**: A deep, risk-reward mechanic where power comes at the cost of one's own essence.
- **The Path of Fates**: A branching skill tree where players must choose between stability and chaotic power.

For a full breakdown of the game's lore, visions, and mechanics, see the [**CODEX.md**](./CODEX.md).

---

## Getting Started

### Prerequisites

- **Node.js**: [Install Node.js](https://nodejs.org/)
- **Bun**: [Install Bun](https://bun.sh/)
- **Expo Go**: Download on [iOS](https://apps.apple.com/app/expo-go/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) to test on your device.

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Beardicuss/Chronicles-of-a-Fallen-World.git
   cd Chronicles-of-a-Fallen-World
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start the development server**:
   ```bash
   bun run start
   ```
   *Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).*

4. **Start Web Preview**:
   ```bash
   bun run start-web
   ```

---

## Technical Stack

- **React Native & Expo**: Core mobile framework.
- **Expo Router**: File-based routing for seamless navigation.
- **TypeScript**: Ensuring type safety across the codebase.
- **Custom Graphics Engine**: Optimized 2D rendering for narrative sequences.
- **Save System**: Robust 3-slot save management.

---

## Deployment

### iOS (App Store)
1. Install EAS CLI: `npm i -g @expo/eas-cli`
2. Build: `eas build --platform ios`
3. Submit: `eas submit --platform ios`

### Android (Google Play)
1. Build: `eas build --platform android`
2. Submit: `eas submit --platform android`

---

## License

© 2026 Softcurse. All rights reserved. Developed by Dante Berezinsky.
