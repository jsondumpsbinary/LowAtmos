# LowAtmos 🎵

**A simple dark mode web application that discovers music based on weather and mood.**

## 📋 Project Overview

LowAtmos is a vanilla JavaScript web app that combines real-time weather data, AI-powered genre prediction, and music discovery. Built with vanilla JS, HTML5, and CSS3—no frameworks, no dependencies.

## 🛠 Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **APIs:**
  - **Open-Meteo API** - Real-time weather (free, no API key needed)
  - **Hugging Face API** - Genre prediction using AI
  - **iTunes Search API** - Music discovery (free, no API key needed)

## 🎨 Design

**Color Palette:** Midnight Slate Theme
- Background: `#121212`
- Cards: `#2d3748`
- Accent: Teal (`#5a8a94`)
- Text: Off-white (`#e2e8f0`)

**Features:** Fully responsive, dark mode only, minimal animations

## 🚀 Getting Started

### 1. Clone & Open
```bash
git clone <repository-url>
cd lowatmos
open index.html
```

### 2. Configure API Key

Get your **Hugging Face token** (required):
1. Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new access token
3. Open `config.js` and paste it:
```javascript
const CONFIG = {
  HF_TOKEN: "your_token_here",
};
```

**Note:** Weather and Music APIs are **free with no keys needed**!

### 3. Run
Simply open `index.html` in your browser or use a local server:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## 📝 How It Works

### Data Flow
```
User Input (City + Mood)
    ↓
Open-Meteo API (fetch weather)
    ↓
Hugging Face AI (predict genre)
    ↓
iTunes Search API (find songs)
    ↓
Display with playable previews
```

## 📁 Project Structure

```
lowatmos/
├── index.html       # Main UI
├── app.js          # All logic (weather, AI, music, UI)
├── style.css       # Styling
├── config.js       # API configuration (not committed)
└── README.md       # This file
```

## 🎵 Features

- **Weather Integration** - Real-time conditions for your city
- **AI Genre Prediction** - Mood + weather → perfect genre
- **iTunes Music Search** - 10 song previews with album art
- **Playable Previews** - Listen before liking
- **Mobile Responsive** - Works on all devices
- **No Dependencies** - Pure vanilla JavaScript

## 🔧 API Details

### Open-Meteo Weather
- Free, no authentication
- Returns: Temperature, weather type, description
- Endpoints: Geocoding + Current weather

### Hugging Face AI
- Uses Llama-3.2 model for genre prediction
- Credentials: Bearer token in `config.js`
- Input: Mood + weather description
- Output: Music genre

### iTunes Search
- Free, no authentication
- Returns: Track info, artist, preview URL, artwork
- Used for music discovery by genre

## 📝 Code Structure

**app.js** is organized into sections:
1. **Configuration** - Import API keys
2. **DOM Elements** - All HTML references
3. **Event Listeners** - User interactions
4. **Main Handler** - Orchestrates everything
5. **API Functions** - Weather, AI, Music
6. **Display Functions** - Render results
7. **UI Helpers** - Loading, errors, etc.

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "API keys not configured" | Add HF_TOKEN to `config.js` |
| No songs found | Try a different city or mood |
| Slow performance | Check your internet connection |
| Preview not playing | Some songs may not have previews |

## 📄 License

Open source. Feel free to use and modify!
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





