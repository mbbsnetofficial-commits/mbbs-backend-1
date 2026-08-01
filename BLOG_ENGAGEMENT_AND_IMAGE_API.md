# Student blog engagement and admin image upload

Production API:

```text
https://api.mbbs.net/api/v1
```

## Student portal

All student endpoints require:

```http
Authorization: Bearer STUDENT_ACCESS_TOKEN
```

### Load published blogs

```http
GET /blogs?page=1&limit=20
```

Optional filters:

```text
search=neet
author=AUTHOR_OBJECT_ID
category=CATEGORY_OBJECT_ID
tag=TAG_OBJECT_ID
```

Each blog contains:

```json
{
  "id": "66a59ced88c5dcf13d81f030",
  "title": "How to Prepare for NEET",
  "featuredImage": {
    "url": "https://res.cloudinary.com/...",
    "alt": "Student preparing for NEET",
    "caption": ""
  },
  "totalLikes": 42,
  "isLiked": false,
  "likedAt": null,
  "isSaved": true,
  "savedAt": "2026-07-27T16:00:00.000Z"
}
```

Use `isLiked` to render an outlined or filled heart. Use `isSaved` to render an
outlined or filled bookmark.

### Like and unlike

```http
POST /blogs/BLOG_ID/like
DELETE /blogs/BLOG_ID/like
```

No body is required. Replace the card's `isLiked` and `totalLikes` values with
the values returned in `data`.

### Save and unsave

```http
POST /blogs/BLOG_ID/save
DELETE /blogs/BLOG_ID/save
```

No body is required. Replace the card's `isSaved` value with the value returned
in `data`.

### Saved blogs screen

```http
GET /blogs/saved?page=1&limit=20
```

This is the data source for the student portal's **Bookmarks** or **Saved
blogs** menu. It returns only published, public blogs that the logged-in
student saved.

### Frontend example

```js
const apiBaseUrl = "https://api.mbbs.net/api/v1";

async function updateBlogAction(blogId, action, enabled, token) {
    const response = await fetch(
        `${apiBaseUrl}/blogs/${blogId}/${action}`,
        {
            method: enabled ? "POST" : "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Blog action failed");
    return result.data;
}

// Like:
// updateBlogAction(blog.id, "like", true, token)
//
// Save:
// updateBlogAction(blog.id, "save", true, token)
```

Disable the clicked button while the request is in progress. Follow the
server-returned state rather than incrementing counts repeatedly on the client.
Like/save operations are idempotent, so repeated requests do not create
duplicates.

## Admin featured-image upload

This flow lets an admin select an image from their computer. The backend
uploads it to Cloudinary through the existing protected media library and
attaches the resulting HTTPS URL to the blog.

### Step 1: Create the normal blog draft

```http
POST /admin/blogs
Authorization: Bearer ADMIN_ACCESS_TOKEN
Content-Type: application/json
```

Use the returned blog `id`.

### Step 2: Select and attach the featured image

```http
POST /admin/blogs/BLOG_ID/featured-image
Authorization: Bearer ADMIN_ACCESS_TOKEN
Content-Type: multipart/form-data
```

Form-data fields:

| Key | Type | Required | Purpose |
| --- | --- | --- | --- |
| `file` | File | Yes | Image selected from the admin device |
| `altText` | Text | No | Accessible description; blog title is the fallback |
| `caption` | Text | No | Optional image caption |
| `displayName` | Text | No | Media-library display name |
| `folder` | Text | No | Defaults to the configured blog media folder |

In a browser, do not manually set the multipart `Content-Type`; `FormData`
adds the required boundary:

```js
async function attachFeaturedImage(blogId, file, adminToken, altText = "") {
    const form = new FormData();
    form.append("file", file);
    form.append("altText", altText);

    const response = await fetch(
        `https://api.mbbs.net/api/v1/admin/blogs/${blogId}/featured-image`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${adminToken}` },
            body: form
        }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Image upload failed");
    return result.data.blog;
}
```

### Step 3: Publish

After the upload response contains the expected `featuredImage.url`, publish:

```http
POST /admin/blogs/BLOG_ID/publish
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

Only supported image MIME types and the existing image-size limit are allowed.
Production image files are not written permanently to the Dokploy container,
so they remain available across container redeployments.

## Testing

- Swagger UI: `https://api.mbbs.net/api-docs`
- Postman import: `https://api.mbbs.net/api-docs.json`

Swagger has separate authorization controls for student and admin tokens.
