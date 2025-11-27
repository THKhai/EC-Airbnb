"""
Example script demonstrating how to use the pyairbnb crawler.
This script shows various ways to search and retrieve Airbnb data.
"""

import json
from pyairbnb import (
    search_first_page,
    search_all,
    get_details,
    get_reviews,
    get_calendar,
    search_all_from_url
)

def example_1_search_first_page():
    """
    Example 1: Search for listings in a specific area (first page only)
    This searches for listings in New York City area
    """
    print("\n" + "="*60)
    print("EXAMPLE 1: Search First Page")
    print("="*60)

    results = search_first_page(
        check_in="2025-12-01",
        check_out="2025-12-05",
        ne_lat=40.7589,    # Northeast corner of search area
        ne_long=-73.9851,
        sw_lat=40.7489,    # Southwest corner of search area
        sw_long=-73.9951,
        zoom_value=15,
        price_min=50,
        price_max=300,
        currency="USD",
        language="en"
    )

    print(f"Found {len(results)} listings")
    if results:
        print(f"\nFirst listing example:")
        print(json.dumps(results[0], indent=2))

    return results


def example_2_search_all():
    """
    Example 2: Search ALL pages in a specific area
    Warning: This will make multiple API calls and take longer
    """
    print("\n" + "="*60)
    print("EXAMPLE 2: Search All Pages (Limited area to avoid too many results)")
    print("="*60)

    results = search_all(
        check_in="2025-12-01",
        check_out="2025-12-05",
        ne_lat=40.7589,
        ne_long=-73.9851,
        sw_lat=40.7489,
        sw_long=-73.9951,
        zoom_value=15,
        price_min=100,
        price_max=200,
        currency="USD",
        language="en"
    )

    print(f"Found {len(results)} total listings across all pages")
    return results


def example_3_get_listing_details():
    """
    Example 3: Get detailed information for a specific listing
    Replace the room_url with an actual Airbnb listing URL
    """
    print("\n" + "="*60)
    print("EXAMPLE 3: Get Listing Details")
    print("="*60)

    # Replace this with a real Airbnb room URL
    room_url = "https://www.airbnb.com/rooms/12345678"

    print(f"Fetching details for: {room_url}")
    print("Note: Replace with a valid room URL to test")

    try:
        details = get_details(
            room_url=room_url,
            check_in="2025-12-01",
            check_out="2025-12-05",
            adults=2,
            currency="USD",
            language="en"
        )

        print("\nListing Details:")
        print(f"- Name: {details.get('name', 'N/A')}")
        print(f"- Host: {details.get('host', {}).get('name', 'N/A')}")
        print(f"- Price: {details.get('price', 'N/A')}")
        print(f"- Reviews: {len(details.get('reviews', []))} reviews")

        # Save full details to file
        with open('listing_details.json', 'w', encoding='utf-8') as f:
            json.dump(details, f, indent=2, ensure_ascii=False)
        print("\nFull details saved to: listing_details.json")

        return details
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure to use a valid Airbnb room URL")
        return None


def example_4_get_reviews():
    """
    Example 4: Get reviews for a specific listing
    """
    print("\n" + "="*60)
    print("EXAMPLE 4: Get Reviews")
    print("="*60)

    # Replace with a real Airbnb room URL
    room_url = "https://www.airbnb.com/rooms/12345678"

    print(f"Fetching reviews for: {room_url}")
    print("Note: Replace with a valid room URL to test")

    try:
        reviews = get_reviews(
            room_url=room_url,
            language="en"
        )

        print(f"\nFound {len(reviews.get('reviews', []))} reviews")
        if reviews.get('reviews'):
            first_review = reviews['reviews'][0]
            print(f"\nFirst review example:")
            print(f"- Rating: {first_review.get('rating', 'N/A')}")
            print(f"- Comment: {first_review.get('comments', 'N/A')[:100]}...")

        return reviews
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure to use a valid Airbnb room URL")
        return None


def example_5_search_from_url():
    """
    Example 5: Search using an existing Airbnb search URL
    This is useful when you have an Airbnb search URL with filters already applied
    """
    print("\n" + "="*60)
    print("EXAMPLE 5: Search From URL")
    print("="*60)

    # Example Airbnb search URL (replace with a real one)
    airbnb_url = (
        "https://www.airbnb.com/s/New-York--NY/homes?"
        "checkin=2025-12-01&checkout=2025-12-05"
        "&ne_lat=40.7589&ne_lng=-73.9851"
        "&sw_lat=40.7489&sw_lng=-73.9951"
        "&zoom=15&price_min=50&price_max=300"
    )

    print(f"Searching from URL...")
    print("Note: Replace with a valid Airbnb search URL to test")

    try:
        results = search_all_from_url(
            url=airbnb_url,
            currency="USD",
            language="en"
        )

        print(f"Found {len(results)} listings")
        return results
    except Exception as e:
        print(f"Error: {e}")
        return None


def example_6_get_calendar():
    """
    Example 6: Get calendar availability for a listing
    """
    print("\n" + "="*60)
    print("EXAMPLE 6: Get Calendar Availability")
    print("="*60)

    # You need an API key and room ID
    room_id = "12345678"  # Replace with actual room ID

    print(f"Fetching calendar for room: {room_id}")
    print("Note: This requires a valid API key and room ID")

    try:
        # API key is automatically fetched if not provided
        calendar = get_calendar(
            room_id=room_id
        )

        print("\nCalendar data retrieved successfully")
        print(json.dumps(calendar, indent=2))
        return calendar
    except Exception as e:
        print(f"Error: {e}")
        return None


def main():
    """
    Main function to run examples
    Uncomment the examples you want to test
    """
    print("Airbnb Crawler - Example Usage")
    print("="*60)

    # Example 1: Quick search (first page only)
    # This is a good starting point - it's fast and simple
    try:
        results = example_1_search_first_page()

        # Save results to file for inspection
        if results:
            with open('search_results.json', 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print("\nSearch results saved to: search_results.json")
    except Exception as e:
        print(f"Error in example 1: {e}")

    # Example 2: Search all pages (commented out to avoid long runtime)
    # Uncomment to test searching multiple pages
    # example_2_search_all()

    # Example 3: Get detailed listing information
    # Uncomment and provide a real room URL to test
    # example_3_get_listing_details()

    # Example 4: Get reviews for a listing
    # Uncomment and provide a real room URL to test
    # example_4_get_reviews()

    # Example 5: Search from existing Airbnb URL
    # Uncomment and provide a real search URL to test
    # example_5_search_from_url()

    # Example 6: Get calendar availability
    # Uncomment and provide a real room ID to test
    # example_6_get_calendar()

    print("\n" + "="*60)
    print("Examples completed!")
    print("Uncomment other examples in main() to test more features")
    print("="*60)


if __name__ == "__main__":
    main()