"use strict";

const repository = require("../../repositories/blog-repositories/page.repositories");
const { PAGE_MESSAGES, HOME_BREADCRUMB } = require("../../constants/blog-constants/page.const");
const {
    buildPageResponse,
    buildBreadcrumb,
    buildPagination
} = require("../../utilities/page");

const notFound = message => {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
};

exports.getHomePage = async (page, limit) => {
    const data = await repository.getHomePageData(page, limit);
    return buildPageResponse({
        page: "HOME",
        seo: data.seo,
        content: {
            featuredBlogs: data.featuredBlogs,
            publishedBlogs: data.publishedBlogs
        },
        breadcrumbs: [HOME_BREADCRUMB],
        extras: {
            pagination: buildPagination(page, limit, data.total)
        }
    });
};

exports.getAuthors = async (page, limit) => {
    const data = await repository.getAuthors(page, limit);
    return {
        authors: data.authors,
        pagination: buildPagination(page, limit, data.total)
    };
};

exports.getCategories = async (page, limit) => {
    const data = await repository.getCategories(page, limit);
    return {
        categories: data.categories,
        pagination: buildPagination(page, limit, data.total)
    };
};

exports.getBlogPage = async slug => {
    const data = await repository.getBlogPageData(slug);
    if (!data) throw notFound(PAGE_MESSAGES.BLOG_NOT_FOUND);
    return buildPageResponse({
        page: "BLOG",
        seo: data.seo,
        hero: data.blog.featuredImage,
        content: data.blog,
        related: data.relatedBlogs,
        breadcrumbs: buildBreadcrumb([
            HOME_BREADCRUMB,
            { title: "Blogs", slug: "blogs", url: "/blogs" },
            { title: data.blog.title, slug: data.blog.slug, url: `/blogs/${data.blog.slug}` }
        ]),
        extras: { reviews: data.reviews }
    });
};

exports.getCategoryPage = async (slug, page, limit) => {
    const data = await repository.getCategoryPageData(slug, page, limit);
    if (!data) throw notFound(PAGE_MESSAGES.CATEGORY_NOT_FOUND);
    return buildPageResponse({
        page: "CATEGORY",
        seo: data.seo,
        hero: data.category.bannerImage,
        content: data.category,
        breadcrumbs: buildBreadcrumb([
            HOME_BREADCRUMB,
            { title: data.category.categoryName, slug, url: `/categories/${slug}` }
        ]),
        extras: {
            blogs: data.blogs,
            pagination: buildPagination(page, limit, data.total)
        }
    });
};

exports.getTagPage = async (slug, page, limit) => {
    const data = await repository.getTagPageData(slug, page, limit);
    if (!data) throw notFound(PAGE_MESSAGES.TAG_NOT_FOUND);
    return buildPageResponse({
        page: "TAG",
        seo: data.seo,
        content: data.tag,
        breadcrumbs: buildBreadcrumb([
            HOME_BREADCRUMB,
            { title: data.tag.tagName, slug, url: `/tags/${slug}` }
        ]),
        extras: {
            blogs: data.blogs,
            pagination: buildPagination(page, limit, data.total)
        }
    });
};

exports.getAuthorPage = async (slug, page, limit) => {
    const data = await repository.getAuthorPageData(slug, page, limit);
    if (!data) throw notFound(PAGE_MESSAGES.AUTHOR_NOT_FOUND);
    return buildPageResponse({
        page: "AUTHOR",
        seo: data.seo,
        hero: data.author.coverImage,
        content: data.author,
        breadcrumbs: buildBreadcrumb([
            HOME_BREADCRUMB,
            { title: data.author.fullName, slug, url: `/authors/${slug}` }
        ]),
        extras: {
            blogs: data.blogs,
            pagination: buildPagination(page, limit, data.total)
        }
    });
};

exports.searchPage = async (keyword, page, limit) => {
    const data = await repository.searchPage(keyword, page, limit);
    return buildPageResponse({
        page: "SEARCH",
        content: { keyword, blogs: data.blogs },
        extras: { pagination: buildPagination(page, limit, data.total) }
    });
};
