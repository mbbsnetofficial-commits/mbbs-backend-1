# Blog comments API

Comments are separate from ratings/reviews. They are attached to a published
blog and designed for the comment section in the user UI.

## UI flow

1. The blog detail screen already knows the blog `slug`.
2. On screen load, call the public list endpoint and render `data.comments`.
3. If the student is logged in, show the comment form.
4. Send the normal backend access token when posting, editing, or deleting.
5. After a successful mutation, update the local comment list or load page 1
   again so the UI immediately reflects the change.
6. Show edit/delete controls only when the comment's `student_id` matches the
   logged-in user's `student_id`.

Render `comment` as plain text. Do not inject it as HTML.

## List comments

`GET /api/v1/pages/blog/:slug/comments?page=1&limit=10`

Authentication is not required.

Response data contains:

- `blog`: ID, slug, and title.
- `comments`: newest comments first.
- `pagination`: current page, total items, and next/previous state.

Each comment contains:

- `id`
- `student_id`
- `commenterName`
- `profilePicture`
- `comment`
- `isEdited`
- `createdAt`
- `updatedAt`

## Post a comment

`POST /api/v1/pages/blog/:slug/comments`

Requires:

`Authorization: Bearer <backendAccessToken>`

JSON body:

```json
{
  "comment": "This article was helpful."
}
```

The comment must contain 1–2000 characters. The backend gets the commenter name,
student ID, and profile picture from the authenticated student account.

## Edit an owned comment

`PATCH /api/v1/pages/blog/:slug/comments/:commentId`

Requires the backend access token and the same JSON body as creation. Students
can edit only their own comments.

## Delete an owned comment

`DELETE /api/v1/pages/blog/:slug/comments/:commentId`

Requires the backend access token. Students can delete only their own comments.
Deletion is soft, so the record remains recoverable in the database but is not
returned to the UI.

## Existing APIs

No existing blog, review, home, author, or category endpoint was removed or
changed. The blog `totalComments` value is incremented and decremented as
comments are created and deleted.
