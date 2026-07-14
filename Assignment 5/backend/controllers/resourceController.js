const mongoose = require('mongoose');
const Resource = require('../models/Resource');

// Validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/resources – list all (newest first)
const getAllResources = async (req, res, next) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    next(err);
  }
};

// GET /api/resources/:id – get single resource
const getResourceById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (err) {
    next(err);
  }
};

// POST /api/resources – create resource
const createResource = async (req, res, next) => {
  try {
    const resource = new Resource(req.body);
    const saved = await resource.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// PUT /api/resources/:id – update resource
const updateResource = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/resources/:id – delete resource
const deleteResource = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
};
