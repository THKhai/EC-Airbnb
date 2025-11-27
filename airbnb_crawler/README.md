# Airbnb Crawler

A Python library for scraping Airbnb listings, reviews, pricing, and availability data.

## Installation

1. **Activate the virtual environment:**

```bash
# Git Bash on Windows
source ../.venv/Scripts/activate

# Or CMD
../.venv\Scripts\activate.bat

# Or PowerShell
../.venv\Scripts\Activate.ps1
```

2. **Install dependencies:**

```bash
pip install curl-cffi
```

## Quick Start

Run the example script to see how the crawler works:

```bash
python example.py
```

This will search for Airbnb listings in a sample location and save the results to `search_results.json`.

## Usage

### 1. Search for Listings

```python
from pyairbnb import search_first_page

results = search_first_page(
    check_in="2025-12-01",
    check_out="2025-12-05",
    ne_lat=40.7589,    # Northeast corner
    ne_long=-73.9851,
    sw_lat=40.7489,    # Southwest corner
    sw_long=-73.9951,
    zoom_value=15,
    price_min=50,
    price_max=300,
    currency="USD",
    language="en"
)
```

### 2. Get Listing Details

```python
from pyairbnb import get_details

details = get_details(
    room_url="https://www.airbnb.com/rooms/12345678",
    check_in="2025-12-01",
    check_out="2025-12-05",
    adults=2,
    currency="USD",
    language="en"
)
```

### 3. Get Reviews

```python
from pyairbnb import get_reviews

reviews = get_reviews(
    room_url="https://www.airbnb.com/rooms/12345678",
    language="en"
)
```

### 4. Search from URL

```python
from pyairbnb import search_all_from_url

results = search_all_from_url(
    url="https://www.airbnb.com/s/New-York--NY/homes?...",
    currency="USD",
    language="en"
)
```

## Available Functions

- `search_first_page()` - Search first page of results
- `search_all()` - Search all pages (multiple API calls)
- `search_all_from_url()` - Search using existing Airbnb URL
- `get_details()` - Get complete listing details including calendar, reviews, and price
- `get_reviews()` - Get all reviews for a listing
- `get_calendar()` - Get availability calendar for a listing
- `experience_search()` - Search for Airbnb experiences

## Parameters

### Geographic Search Parameters

- `ne_lat`, `ne_long` - Northeast corner coordinates
- `sw_lat`, `sw_long` - Southwest corner coordinates
- `zoom_value` - Map zoom level (higher = more focused area)

### Filter Parameters

- `check_in`, `check_out` - Date strings (YYYY-MM-DD)
- `price_min`, `price_max` - Price range
- `adults` - Number of guests
- `amenities` - List of amenity IDs
- `place_type` - Type of place (entire home, private room, etc.)

### General Parameters

- `currency` - Currency code (USD, EUR, etc.)
- `language` - Language code (en, es, fr, etc.)
- `proxy_url` - Optional proxy URL for requests

## Notes

- The crawler automatically fetches API keys when needed
- Rate limiting may apply - be respectful of Airbnb's servers
- Use smaller geographic areas for faster results
- `search_all()` will make multiple API calls to fetch all pages

## Example Output

Search results include:
- Listing ID and URL
- Title and description
- Price information
- Location coordinates
- Host information
- Ratings and reviews count
- Amenities
- Photos

Full listing details include:
- All search result fields
- Complete review data
- Calendar availability
- Host profile details
- Pricing breakdown

## Files

- `example.py` - Example usage script
- `pyairbnb/` - Main library code
  - `search.py` - Search functionality
  - `details.py` - Listing details
  - `reviews.py` - Review data
  - `price.py` - Pricing information
  - `calendar.py` - Availability calendar
  - `start.py` - Main entry points

## Tips

1. Start with `search_first_page()` to test - it's faster
2. Use `search_all()` only when you need complete results
3. Save results to JSON files for later analysis
4. Adjust zoom level and coordinates for different areas
5. Check the example.py file for more usage patterns