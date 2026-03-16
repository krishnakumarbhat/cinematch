# CineMatch - Educational Netflix Clone (Mobile-First)

## Problem Statement
Build the mobile frontend for "CineMatch", an educational Netflix clone where users toggle between 10 distinct AI recommendation algorithms. Phase 1 focuses on the Hero section, Algorithm Selector, and Zustand state management.

## Architecture
- **Framework:** React Native + Expo (SDK 55)
- **Navigation:** Expo Router (tabs layout)
- **State Management:** Zustand
- **Styling:** React Native StyleSheet (dark cinematic theme)
- **Web Preview:** Expo static export served via `serve` on port 3000
- **Project Location:** `/app/cinematch_mobile`

## User Personas
- Students/learners exploring ML recommendation algorithms
- Movie enthusiasts interested in how recommendation engines work
- Developers learning about recommendation system architectures

## Core Requirements (Static)
1. Zustand store managing 10 algorithm states
2. Hero section with cinematic movie poster
3. Horizontally scrolling algorithm pill selector
4. Algorithm description/explanation box
5. Movie preview row with poster cards
6. Tab navigation (Home + Explore)

## What's Been Implemented (Phase 1 - Jan 2026)
- [x] Expo project initialized with tabs template (SDK 55)
- [x] Zustand store with 10 algorithms, mock data, loading states
- [x] Hero Section: full-width movie poster with gradient overlay, title, tagline, Play/More Info buttons, genre tags, rating badge
- [x] Algorithm Selector: 10 horizontally scrolling pills with tap-to-select
- [x] Algorithm description box updating dynamically on selection
- [x] Movie preview horizontal scroll row (8 AI-generated movie posters)
- [x] Explore tab: Algorithm Library listing all 10 algorithms
- [x] Dark cinematic theme (Netflix-inspired)
- [x] Custom generated movie poster artwork (8 unique posters)
- [x] Testing: 100% frontend tests passing

## Prioritized Backlog
### P0 (Next Phase)
- [ ] FlashList grid implementation for movie feed
- [ ] Entrance animations and loading skeleton improvements
- [ ] @shopify/flash-list integration for performance

### P1
- [ ] Real backend API integration (FastAPI + TMDB)
- [ ] NativeWind styling migration
- [ ] Search functionality
- [ ] Movie detail modal/screen

### P2
- [ ] User authentication
- [ ] Watch history tracking
- [ ] Algorithm comparison side-by-side view
- [ ] Educational deep-dive screens per algorithm

## Next Tasks
1. Await user approval for Phase 2 (FlashList grids + animations)
2. Implement @shopify/flash-list for movie grid performance
3. Add page transition and card entrance animations
4. Build Movie Detail modal screen
