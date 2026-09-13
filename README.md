# 🚌 Bus Timing Web App

A lightweight, mobile-first web application for checking bus schedules and fares. Built with HTML5, vanilla JavaScript, and responsive design using Tailwind CSS.

## Features

✅ **Location-based Search**: Select departure and destination to find available buses  
✅ **Real-time Timings**: View departure, arrival, and stop timings  
✅ **Bus Details**: Display bus type, speciality class, and fare  
✅ **Stop Information**: See all intermediate stops with arrival/departure times  
✅ **Mobile-First Design**: Optimized for smartphones, tablets, and desktops  
✅ **No Backend Required**: Pure client-side application with JSON data storage  
✅ **Easy Deployment**: Deploy to Netlify, Vercel, or GitHub Pages in minutes  

## Project Structure

```
bus-timing-app/
├── index.html          # Main HTML file with UI structure
├── app.js              # JavaScript logic for search and filtering
├── data/
│   └── buses.json      # Bus routes, timings, and stop information
├── README.md           # This file
└── .gitignore          # Git ignore configuration
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Tailwind CSS (CDN)
- **Logic**: Vanilla JavaScript (ES6+)
- **Data**: JSON format
- **Styling**: Tailwind CSS v3 (CDN)
- **Deployment**: Static hosting (Netlify, Vercel, GitHub Pages)

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for version control and deployment)
- A GitHub account (for hosting on Netlify or Vercel)

### Local Setup

1. **Clone or Download the Project**
   ```bash
   git clone https://github.com/yourusername/bus-timing-app.git
   cd bus-timing-app
   ```

2. **Start a Local Server** (Required because of CORS policy for loading JSON)
   
   **Option A: Python (3.x)**
   ```bash
   python -m http.server 8000
   ```
   
   **Option B: Node.js (http-server)**
   ```bash
   npx http-server
   ```
   
   **Option C: VS Code Live Server Extension**
   - Install "Live Server" extension in VS Code
   - Right-click on `index.html` → "Open with Live Server"

3. **Open in Browser**
   - Navigate to `http://localhost:8000` (Python)
   - Or follow the URL shown by your server

4. **Test the App**
   - Select a departure location (e.g., "Central City")
   - Select a destination (e.g., "Beach Town")
   - Click "Search Buses"
   - View available buses with timings and fares

## Usage

### Adding Bus Routes

Edit `data/buses.json` to add new routes. Follow this structure:

```json
{
  "routes": [
    {
      "id": "route_001",
      "busName": "Express 101",
      "from": "City A",
      "to": "City B",
      "startTime": "06:00",
      "endTime": "09:30",
      "busType": "AC",
      "speciality": "Express",
      "stops": [
        {
          "id": 1,
          "name": "Stop Name",
          "arrivalTime": "06:00",
          "departureTime": "06:05"
        },
        {
          "id": 2,
          "name": "Stop Name",
          "arrivalTime": "07:00",
          "departureTime": null
        }
      ]
    }
  ]
}
```

**Fields Explanation:**
- `id`: Unique route identifier
- `busName`: Display name of the bus/operator
- `from` / `to`: Departure and destination cities
- `startTime` / `endTime`: Route departure and arrival times (HH:MM format)
- `busType`: AC or Non-AC
- `speciality`: Express, Standard, Premium Express, Luxury, etc.
- `stops`: Array of stops with arrival/departure times (last stop has `departureTime: null`)

### Customizing Fare Calculation

Default fare is calculated as: `Base ₹100 + ₹50 per stop`

To change this, edit the `calculateFare()` function in `app.js`:

```javascript
function calculateFare(route) {
    // Example: Simple base fare of 200
    return 200;
    
    // Or: Distance-based calculation
    // return 100 + (route.stops.length - 1) * 75;
}
```

## Deployment

### Option 1: Netlify (Recommended)

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/bus-timing-app.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository
   - Build settings: Leave default (no build command needed)
   - Deploy!

4. **Auto-Deployment**
   - Any push to `main` branch will auto-deploy
   - Your site will be live at: `your-app-name.netlify.app`

### Option 2: Vercel

1. **Push to GitHub** (same as above)

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Your site will be live at: `your-app-name.vercel.app`

### Option 3: GitHub Pages

1. **Push to GitHub** (same as above)

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Select `main` branch, `/root` folder
   - Save

3. **Site will be live at**: `https://yourusername.github.io/bus-timing-app`

## Customization

### Colors & Branding

Edit Tailwind classes in `index.html`:
- Primary color: `bg-blue-600` → Change to `bg-green-600`, `bg-purple-600`, etc.
- Update header background and buttons

### Add Your Bus Operator Logo

Add a logo to the header:
```html
<img src="path/to/logo.png" alt="Bus Company Logo" class="h-10 w-10">
```

### Modify App Title

In `index.html`, change:
```html
<h1 class="text-3xl font-bold">🚌 Bus Timing App</h1>
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

## Future Enhancements

- 📱 Progressive Web App (PWA) support with offline access
- ⭐ Favorite/saved routes with local storage
- 🔗 Share route links via WhatsApp, email, etc.
- 📊 Admin dashboard to add/edit bus routes
- 🗺️ Google Maps integration for stop locations
- 🎫 Booking integration with payment gateway
- 📍 Real-time GPS tracking
- 🌙 Dark mode support
- 🌍 Multi-language support

## Troubleshooting

### Issue: JSON file not loading (404 error)

**Solution**: Ensure you're running a local server (not opening `index.html` directly in browser). See "Local Setup" section.

### Issue: Dropdown shows no locations

**Solution**: Check that `data/buses.json` exists and is valid JSON. Open browser console (F12) to see errors.

### Issue: Search button is disabled

**Solution**: Select both "From" and "To" locations before clicking search.

## License

This project is open-source and available for personal and commercial use.

## Support

For issues, suggestions, or contributions, please open a GitHub issue or contact the maintainer.

---

**Happy Bus Hunting! 🚌✨**
