# Geoapify Enrichment APIs

This document provides a list of Geoapify APIs that can be used for data enrichment, along with brief descriptions and links to their official documentation.

Geoapify offers a variety of APIs that can enrich location data, providing more context and details about specific places or areas.

## Key Enrichment APIs

1.  **Place Details API**
    *   **Description**: Retrieves detailed information about a specific place (Point of Interest, building, address, etc.) using its `place_id`. This can include contact information, website, opening hours, images, and other attributes specific to the place type.
    *   **Use Cases**: Augmenting search results, displaying rich information on a map click, populating business directories.
    *   **Documentation**: [Geoapify Place Details API](https://apidocs.geoapify.com/docs/place-details)

2.  **Places API**
    *   **Description**: Searches for Points of Interest (POIs) based on categories, within a specified area (bounding box, radius, or complex geometry like an isoline). While primarily a search API, the results themselves are enrichments for a given area.
    *   **Use Cases**: Finding nearby amenities (restaurants, ATMs, gas stations), discovering points of interest in an area, category-based searches.
    *   **Documentation**: [Geoapify Places API](https://apidocs.geoapify.com/docs/places-api)

3.  **Boundaries API**
    *   **Description**: Provides information about administrative boundaries. It can retrieve the administrative areas a point belongs to (e.g., city, county, state, country for a given coordinate) or the sub-divisions of a given administrative area.
    *   **Use Cases**: Determining jurisdiction, enriching addresses with administrative details, data aggregation by region.
    *   **Documentation**: [Geoapify Boundaries API](https://apidocs.geoapify.com/docs/boundaries-api)

4.  **Reverse Geocoding API**
    *   **Description**: Converts geographic coordinates (latitude and longitude) into a human-readable address. This inherently enriches raw coordinates with address components.
    *   **Use Cases**: Identifying the address of a GPS location, labeling points on a map, location-aware services.
    *   **Documentation**: [Geoapify Reverse Geocoding API](https://apidocs.geoapify.com/docs/reverse-geocoding-api)

5.  **Postcode API**
    *   **Description**: Allows searching for postcodes by geographic coordinates or retrieving a list of postcodes within a defined area. It provides location metadata and geometry for postcodes.
    *   **Use Cases**: Validating or finding postcodes for an area, demographic analysis by postcode.
    *   **Documentation**: [Geoapify Postcode API](https://apidocs.geoapify.com/docs/postcode-api)

6.  **IP Geolocation API**
    *   **Description**: Determines the geographical location (city, country, coordinates) of an IP address. This can be used to enrich user data or tailor content based on location.
    *   **Use Cases**: Personalizing user experience, fraud detection, analytics.
    *   **Documentation**: [Geoapify IP Geolocation API](https://apidocs.geoapify.com/docs/ip-geolocation-api)

## Other Potentially Useful APIs for Enrichment Context

While not strictly "enrichment" in the same way as Place Details, these APIs provide contextual information that can be very valuable:

*   **Routing API**: Provides route information, including distance, time, and turn-by-turn instructions. This can enrich a pair of locations with travel context.
    *   **Documentation**: [Geoapify Routing API](https://apidocs.geoapify.com/docs/routing-api)
*   **Isoline API**: Calculates reachability areas (isochrones for time, isodistances for distance) from a point. This enriches a location with data about what's accessible from it.
    *   **Documentation**: [Geoapify Isoline API](https://apidocs.geoapify.com/docs/isoline-api)
*   **Map Tiles API / Static Maps API**: While for visual representation, displaying a map tile or static map image provides visual context and enrichment for a location.
    *   **Map Tiles Documentation**: [Geoapify Map Tiles API](https://apidocs.geoapify.com/docs/map-tiles/about-map-tiles-api)
    *   **Static Maps Documentation**: [Geoapify Static Maps API](https://apidocs.geoapify.com/docs/static-map/static-map-api)

## General Notes

*   Most Geoapify APIs return data in GeoJSON format, which is a standard for encoding geographic data structures.
*   An API key is required for all requests.
*   Refer to the specific API documentation for detailed request parameters, response schemas, and usage examples.

This list should serve as a good starting point for leveraging Geoapify for various data enrichment tasks within your platform. 