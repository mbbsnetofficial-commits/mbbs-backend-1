# Author following API

Base URL:

```text
https://api.mbbs.net/api/v1
```

Every endpoint requires the student access token:

```http
Authorization: Bearer STUDENT_ACCESS_TOKEN
```

## UI loading flow

### 1. Load the Authors screen

```http
GET /authors?page=1&limit=20
```

Optional filters:

```text
search=doctor
featured=true
```

Use `data.authors` to render the cards. Important fields:

```json
{
  "id": "66a59ced88c5dcf13d81f030",
  "fullName": "Dr. Sanjay Kumar",
  "designation": "Senior Medical Content Specialist",
  "bio": "Medical author specializing in NEET preparation.",
  "profileImage": "",
  "totalBlogs": 4,
  "followerCount": 125,
  "isFeatured": true,
  "isFollowing": false,
  "followedAt": null
}
```

Render the button as **Follow** when `isFollowing` is `false`, and
**Following** or **Unfollow** when it is `true`.

### 2. Follow an author

```http
POST /authors/AUTHOR_ID/follow
```

No request body is required. On success, replace the card's follow state with
the returned `data`:

```json
{
  "authorId": "66a59ced88c5dcf13d81f030",
  "isFollowing": true,
  "followerCount": 126,
  "followedAt": "2026-07-27T15:30:00.000Z"
}
```

The operation is idempotent. Repeated requests do not create duplicate
follows.

### 3. Unfollow an author

```http
DELETE /authors/AUTHOR_ID/follow
```

No request body is required. The response returns `isFollowing: false` and the
updated `followerCount`.

### 4. Load the Following screen

```http
GET /authors/following?page=1&limit=20
```

This returns only active authors followed by the logged-in student. The
response uses the same author-card structure and pagination as the Authors
screen.

### 5. Load an author profile

```http
GET /authors/AUTHOR_ID
```

This returns the full student-safe author card, including current follow state.

## Frontend request example

```js
const apiBaseUrl = "https://api.mbbs.net/api/v1";

async function setAuthorFollow(authorId, shouldFollow, accessToken) {
    const response = await fetch(
        `${apiBaseUrl}/authors/${authorId}/follow`,
        {
            method: shouldFollow ? "POST" : "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Follow request failed");
    return result.data;
}
```

Disable the button while this request is running to prevent rapid repeated
clicks. Restore the previous UI state if the request fails.

## Postman and Swagger

- Swagger UI: `https://api.mbbs.net/api-docs`
- Postman import: `https://api.mbbs.net/api-docs.json`

In Swagger, select **Authorize** and paste the student access token. In Postman,
set the collection's bearer token to the token returned by the login endpoint.
