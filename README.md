# LowAtmos 🎵

**A sophisticated dark mode web application that discovers music based on weather and mood.**

## 📋 Project Overview

LowAtmos is a professional-grade vanilla JavaScript web application that combines real-time weather data, AI-powered genre prediction, and music discovery. Built with strict requirements for vanilla JS, HTML5, and CSS3 to demonstrate pure DOM manipulation and API integration skills.

### Purpose
Connect environmental conditions (weather) and emotional state (mood) to personalized music recommendations using multiple APIs and machine learning models.

## 🛠 Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **APIs:**
  - **OpenWeatherMap API** - Real-time weather data
  - **Hugging Face API** - Zero-shot classification for genre prediction (Model: `facebook/bart-large-mnli`)
  - **Deezer API** - Music catalog and track information (via `allorigins` proxy for CORS)
- **Architecture:** Async/Await, Higher-Order Functions (.map(), .filter(), .sort())

## 🎨 Design

**Color Palette:** Midnight Slate Theme
- Primary Background: `#121212`
- Secondary Background: `#1a202c`
- Card Background: `#2d3748`
- Accent: Dusty Teal (`#5a8a94`) & Slate Blue (`#6b7183`)
- Text: Off-white (`#e2e8f0`)

**Typography:** System-ui sans-serif font for optimal readability

**No Frameworks:** Pure DOM manipulation—zero dependencies, no React or libraries.

## 🚀 Getting Started

### 1. Clone & Open
```bash
git clone <repository-url>
cd lowatmos
```

### 2. Obtain API Keys

**OpenWeather API Key:**
1. Visit [openweathermap.org/api](https://openweathermap.org/api)
2. Sign up for a free account
3. Copy your API key from the dashboard

**Hugging Face API Token:**
1. Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new access token (read access is sufficient)
3. Copy your token

**Deezer API:**
- No authentication required (uses `allorigins` proxy)

### 3. Configure Keys Locally

Open `app.js` and add your keys:
```javascript
const HF_TOKEN = "your_huggingface_token_here";
const WEATHER_KEY = "your_openweather_key_here";
```

⚠️ **Security:** Keep the keys as `"PASTE_YOUR_TOKEN_HERE"` and `"PASTE_YOUR_KEY_HERE"` when committing to GitHub to protect your accounts.

### 4. Run the Application

Simply open `index.html` in your web browser:
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Or use any local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📝 How It Works

### Data Flow
```
User Input (City + Mood)
    ↓
OpenWeather API (fetch weather conditions)
    ↓
Hugging Face AI (predict genre from mood + weather)
    ↓
Deezer API (find 10 songs of predicted genre)
    ↓
Display results with playable previews
```

### Core Features

**Input Section**
- City input field for weather lookup
- Mood dropdown (Happy, Calm, Energetic, Melancholic, Focused)
- "Discover Music" button to trigger the search

**AI Genre Prediction**
- Uses Hugging Face Zero-Shot Classification
- Combines mood and weather context to predict optimal music genre
- Model: `facebook/bart-large-mnli`

**Results Display**
- AI-suggested genre prominently displayed
- Responsive grid of song "Flexcards"
- Each card includes:
  - Album cover image
  - Song title and artist
  - HTML5 `<audio>` player with playback controls
  - Hover effects and smooth animations

**Higher-Order Functions**
- `.filter()` - Remove songs without previews or album art
- `.sort()` - Rank songs by popularity
- `.slice()` - Limit results to top 10
- `.map()` - Transform API data and render cards

## 📁 Project Structure

```
lowatmos/
├── index.html       # HTML5 semantic structure
├── style.css        # Sophisticated dark theme styling
├── app.js           # Vanilla JS with async/await
└── README.md        # This file
```

## 🔐 Security Best Practices

1. **API Keys:** Never commit real keys to GitHub. The `.js` file includes placeholder strings.
2. **CORS:** Deezer requests use `allorigins` proxy to bypass CORS restrictions in browser.
3. **Error Handling:** Comprehensive try-catch blocks for all API calls.

## ⚡ Performance

- **No dependencies:** Zero external libraries for faster load times
- **CSS Grid:** Responsive design adapts to all screen sizes
- **Lazy Rendering:** Song cards render only after all data is fetched
- **Smooth Animations:** CSS transitions for professional feel

## 🎯 Requirements Checklist

- ✅ Vanilla JS, HTML5, CSS3 only (no frameworks)
- ✅ Professional dark mode aesthetic (no neon colors)
- ✅ Midnight Slate color palette
- ✅ Three separate files (index.html, style.css, app.js)
- ✅ OpenWeather → Hugging Face → Deezer API chain
- ✅ Async/await implementation
- ✅ Higher-order functions (.map, .filter, .sort)
- ✅ No for loops (array methods only)
- ✅ Responsive Flexcard grid
- ✅ HTML5 audio controls
- ✅ Security warnings for API keys

## 🧪 Testing the Application

1. Enter a city name (e.g., "London", "Tokyo", "San Francisco")
2. Select a mood from the dropdown
3. Click "Discover Music"
4. Wait for the AI to process the request (~3-5 seconds)
5. Browse the 10 recommended songs
6. Play preview clips directly in the browser

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "API keys not configured" | Add your keys to `app.js` |
| "City not found" | Ensure spelling is correct (try major cities first) |
| "No songs found" | Try a different mood/city combination |
| Audio not playing | Check browser permissions; some browsers restrict playback |
| CORS errors | The app uses `allorigins` proxy—should work in all browsers |





