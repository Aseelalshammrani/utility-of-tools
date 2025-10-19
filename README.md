# Utility of Tools

This project provides a **Node.js API** with two main utilities:

1.  **URL Shortener Service** -- Convert long URLs into short, shareable
    links, with expiration dates and click tracking.
2.  **Image Utility Service** -- Resize and compress images efficiently
    using the [Sharp](https://www.npmjs.com/package/sharp) library.

------------------------------------------------------------------------

## 🚀 Features

### URL Shortener

-   Shorten any valid `http` or `https` URL.
-   Optionally define a **custom short path** (max 15 characters, no
    spaces).
-   Optional expiration date (`YYYY-MM-DD`) -- expired links return
    `410 Gone`.
-   Track and retrieve **click counts**.
-   Prevents duplicate custom paths (case-insensitive).

### Image Utility

-   **Resize images** by width and/or height.
-   **Compress images by quality** (scale 1--5).
-   **Compress images by target size (KB)** until desired size is
    reached.
-   Supports formats: **JPG, JPEG, PNG, WEBP, HEIC, HEIF**.
-   Maximum upload size: **50 MB**.

------------------------------------------------------------------------

## 🛠️ Tech Stack

-   **Node.js** with **Express.js**
-   **Microsoft SQL Server** (`mssql` package)
-   **Sharp** for image processing
-   **Multer** for file uploads
-   **UUID** for generating short codes
-   **Validator** for input validation
-   **dotenv** for environment variables

------------------------------------------------------------------------

## 📦 Installation

1.  Clone the repository:

    ``` bash
    git clone <your-repo-url>
    cd utility-of-tools
    ```

2.  Install dependencies:

    ``` bash
    npm install
    ```

3.  Create a `.env` file in the root directory:

    ``` env
    PORT=3000
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_SERVER=your_db_host
    DB_NAME=your_db_name
    DB_PORT=1433
    ```

4.  Start the server:

    ``` bash
    npm run dev   # For development with nodemon
    npm start     # For production
    ```

------------------------------------------------------------------------

## 📡 API Endpoints

### URL Shortener

#### 1. Create Short URL

``` http
POST /utility-of-tools/shorten
```

**Body (JSON):**

``` json
{
  "original_url": "https://example.com/long-link",
  "custom_path": "my-link",        // optional
  "expires_at": "2025-12-31"       // optional, format YYYY-MM-DD
}
```

**Response:**

``` json
{
  "short_url": "https://shorturl.devclan.io/my-link"
}
```

#### 2. Redirect to Original URL

``` http
GET /utility-of-tools/:short_url
```

Redirects to the original URL or returns an error if expired.

#### 3. Get Click Count

``` http
GET /utility-of-tools/:short_url/click-count
```

**Response:**

``` json
{
  "short_url": "my-link",
  "click_count": 42
}
```

------------------------------------------------------------------------

### Image Utility

#### 1. Resize Image

``` http
POST /utility-of-tools/resize
```

**Form-data:** - `image` → Upload image file\
- `width` (optional, integer)\
- `height` (optional, integer)

#### 2. Compress Image by Quality

``` http
POST /utility-of-tools/compress-quality
```

**Form-data:** - `image` → Upload image file\
- `quality` (1--5, default 3)

#### 3. Compress Image by Target Size

``` http
POST /utility-of-tools/compress-target-size
```

**Form-data:** - `image` → Upload image file\
- `targetSize` (in KB, positive integer)

------------------------------------------------------------------------

## 🗄️ Database Schema

Table: **url**

``` sql
CREATE TABLE url (
    id INT PRIMARY KEY IDENTITY(1,1),
    original_url NVARCHAR(MAX) NOT NULL,
    short_url NVARCHAR(50) UNIQUE NOT NULL,
    expires_at DATE NULL,
    click_count INT DEFAULT 0
);
```

------------------------------------------------------------------------

## 🧪 Testing

You can test the APIs using **Postman**: - For image routes: send
`multipart/form-data`. - For URL routes: send `application/json`.

------------------------------------------------------------------------

## 📖 License

This project is licensed under the **ISC License**.

