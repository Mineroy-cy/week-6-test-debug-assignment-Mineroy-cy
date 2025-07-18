const Bug = require('../models/Bug');

// Get all bugs
exports.getBugs = async (req, res, next) => {
  try {
    const bugs = await Bug.find().sort({ createdAt: -1 });
    res.json(bugs);
  } catch (err) {
    next(err);
  }
};

// Get a single bug by ID
exports.getBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }
    res.json(bug);
  } catch (err) {
    next(err);
  }
};

// Create a new bug
exports.createBug = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const bug = new Bug({ title, description, status });
    await bug.save();
    res.status(201).json(bug);
  } catch (err) {
    next(err);
  }
};

// Update a bug
exports.updateBug = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    );
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }
    res.json(bug);
  } catch (err) {
    next(err);
  }
};

// Delete a bug
exports.deleteBug = async (req, res, next) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }
    res.json({ message: 'Bug deleted' });
  } catch (err) {
    next(err);
  }
};
