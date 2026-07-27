const mongoose = require("mongoose");
const authorRepository = require("../repositories/blog-repositories/aurthor.repositories");
const followRepository = require("../repositories/authorFollow.repository");

const createError = (message, statusCode) =>
    Object.assign(new Error(message), { statusCode });

const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = query => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    return { page, limit, skip: (page - 1) * limit };
};

const getAuthorIds = authors => authors.map(author => String(author._id));

const getFollowMetadata = async (userId, authors) => {
    const authorIds = getAuthorIds(authors);
    const [userFollows, followerCounts] = await Promise.all([
        followRepository.findForUserAndAuthors(userId, authorIds),
        followRepository.countFollowersByAuthor(authorIds)
    ]);

    return {
        followedAtByAuthor: new Map(
            userFollows.map(follow => [String(follow.author_id), follow.followed_at])
        ),
        followerCountByAuthor: new Map(
            followerCounts.map(item => [String(item._id), item.followerCount])
        )
    };
};

const formatAuthorCard = (author, metadata) => {
    const authorId = String(author._id);
    const followedAt = metadata.followedAtByAuthor.get(authorId) || null;

    return {
        id: authorId,
        authorCode: author.authorCode,
        fullName: author.fullName,
        slug: author.slug,
        designation: author.designation,
        bio: author.bio,
        authorType: author.authorType,
        profileImage: author.profileImage,
        coverImage: author.coverImage,
        experience: author.experience,
        qualifications: author.qualifications,
        specializations: author.specializations,
        languages: author.languages,
        totalBlogs: author.totalBlogs,
        isFeatured: author.isFeatured,
        followerCount: metadata.followerCountByAuthor.get(authorId) || 0,
        isFollowing: Boolean(followedAt),
        followedAt
    };
};

const formatAuthors = async (userId, authors) => {
    const metadata = await getFollowMetadata(userId, authors);
    return authors.map(author => formatAuthorCard(author, metadata));
};

const findAvailableAuthor = async authorId => {
    if (!mongoose.isValidObjectId(authorId)) {
        throw createError("Invalid authorId.", 400);
    }
    const author = await authorRepository.findPublicById(authorId);
    if (!author) throw createError("Author not found or unavailable.", 404);
    return author;
};

exports.listAuthors = async (userId, query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    if (query.featured !== undefined) filter.isFeatured = query.featured;
    if (query.search) {
        const search = new RegExp(escapeRegex(query.search), "i");
        filter.$or = [
            { fullName: search },
            { designation: search },
            { specializations: search }
        ];
    }

    const [authors, total] = await Promise.all([
        authorRepository.findPublic({ filter, skip, limit }),
        authorRepository.countPublic(filter)
    ]);

    return {
        authors: await formatAuthors(userId, authors),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.listFollowing = async (userId, query) => {
    const { page, limit, skip } = getPagination(query);
    const follows = await followRepository.findAllForUser(userId);
    const followedAtById = new Map(
        follows.map(follow => [String(follow.author_id), follow.followed_at])
    );
    const filter = follows.length
        ? { _id: { $in: follows.map(follow => follow.author_id) } }
        : { _id: { $in: [] } };

    if (query.search) {
        const search = new RegExp(escapeRegex(query.search), "i");
        filter.$or = [
            { fullName: search },
            { designation: search },
            { specializations: search }
        ];
    }

    const [authors, total] = await Promise.all([
        authorRepository.findPublic({ filter, skip, limit }),
        authorRepository.countPublic(filter)
    ]);
    const metadata = await getFollowMetadata(userId, authors);
    followedAtById.forEach((value, key) => metadata.followedAtByAuthor.set(key, value));

    return {
        authors: authors.map(author => formatAuthorCard(author, metadata)),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.getAuthor = async (userId, authorId) => {
    const author = await findAvailableAuthor(authorId);
    const [formatted] = await formatAuthors(userId, [author]);
    return formatted;
};

exports.followAuthor = async ({ userId, studentId, authorId }) => {
    const author = await findAvailableAuthor(authorId);
    const follow = await followRepository.follow({ userId, studentId, authorId });
    const followerCount = await followRepository.countForAuthor(authorId);

    return {
        authorId: String(author._id),
        isFollowing: true,
        followerCount,
        followedAt: follow.followed_at
    };
};

exports.unfollowAuthor = async ({ userId, authorId }) => {
    const author = await findAvailableAuthor(authorId);
    await followRepository.unfollow({ userId, authorId });
    const followerCount = await followRepository.countForAuthor(authorId);

    return {
        authorId: String(author._id),
        isFollowing: false,
        followerCount,
        followedAt: null
    };
};
