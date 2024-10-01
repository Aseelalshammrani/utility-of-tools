URL Shortener API
A simple API to shorten long URLs. The API allows you to create custom short URLs, set expiration dates, and track click counts.
How to Use the API in Postman

1. Create a Short URL
Send a POST request to the /shorten endpoint.
Endpoint:
POST /shorten
Request Body:
{
    "original_url": "https://example.com",
    "custom_path": "mycustompath",
    "expires_at": "2024-12-31"
}
- original_url (required): The long URL you want to shorten.
- custom_path (optional): Custom path for the short URL (max 15 characters).
- expires_at (optional): Expiration date in the format YYYY-MM-DD.
Response:
{
    "short_url": "http://localhost:3000/mycustompath",
    "qr_code": "data:image/png;base64,..." 
}

2. Redirect to the Original URL
Use the generated short URL to be redirected to the original URL.
Example:
GET http://localhost:3000/mycustompath

3. URL Expiration
If an expiration date is provided and the URL is accessed after it has expired, you will receive an error message.

4. Get Click Count for a Short URL
Send a GET request to the /:short_url/click-count endpoint to retrieve the click count for a specific short URL.
Endpoint:
GET /:short_url/click-count
Response:
{
    "short_url": "mycustompath",
    "click_count": 5
}


