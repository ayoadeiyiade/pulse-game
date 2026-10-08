# PULSE — Rhythmic Timing Game

A single-tap hyper-focused rhythmic timing game built with React, TypeScript, HTML5 Canvas, and Web Audio API.

## Features
- **Variable Ratio Dopamine Engine**:
  - 70% Standard Hit (+100 pts)
  - 20% Super Hit (+500 pts)
  - 9% Jackpot Hit (+2,500 pts)
  - 1% Overdrive Mode (+5,000 pts with temporary 5-tap 10x multiplier)
- **Daily Challenge Mode**: Seeded daily target score, limited 3 attempts, and live UTC reset timer.
- **Zero-Friction Replay**: 150ms crimson fail flash with <0.2s instant retry.
- **Audio & Haptics Juice**: Dynamic pitch modulation synth (440Hz + 25Hz per streak) and mobile vibrations.
- **60/120 FPS Vector Canvas**: High DPI crisp rendering with radial particles, shockwaves, and screen shake.

## Quick Start
```bash
npm install
npm run dev
```
