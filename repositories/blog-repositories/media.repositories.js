const Media = require("../../model/blog-model/media.model");

const create = data => Media.create(data);
const createMany = data => Media.insertMany(data);
const findById = id => Media.findById(id);
const findActiveById = id => Media.findOne({ _id: id, isDeleted: false });
const findAll = ({ filter, sort, skip, limit }) => Media.find(filter).sort(sort).skip(skip).limit(limit).lean();
const count = filter => Media.countDocuments(filter);
const save = media => media.save();

module.exports = { create, createMany, findById, findActiveById, findAll, count, save };
