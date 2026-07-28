# Public blog split APIs

All routes are public, require no access token, and are cached for five minutes.
The existing home URL remains available.

## Blogs

`GET /api/v1/pages/home?page=1&limit=10`

Returns:

- `data.content.featuredBlogs`: up to six featured, published, public blogs.
- `data.content.publishedBlogs`: all published public blogs for the requested page.
- `data.pagination`: pagination for `publishedBlogs`.
- `data.seo` and `data.breadcrumbs`: home-page metadata.

Categories, authors, and testimonials are no longer included in this response.
Featured blogs can also appear in `publishedBlogs`, because featured is a
presentation flag and those records are still published blogs.

## Authors

`GET /api/v1/pages/authors?page=1&limit=10`

Returns active, non-deleted authors in `data.authors`, with featured authors
first, plus `data.pagination`.

For one author and that author's published blogs, continue using:

`GET /api/v1/pages/author/:slug?page=1&limit=10`

## Categories

`GET /api/v1/pages/categories?page=1&limit=10`

Returns active, non-deleted categories in `data.categories`, plus
`data.pagination`.

For one category and its published blogs, continue using:

`GET /api/v1/pages/category/:slug?page=1&limit=10`

## Choosing an API

- Use `/pages/home` when the screen needs featured and published blog cards.
- Use `/pages/authors` when the screen needs an author directory.
- Use `/pages/categories` when the screen needs a category directory or menu.
- Use the existing slug detail APIs when the user opens one author or category.
