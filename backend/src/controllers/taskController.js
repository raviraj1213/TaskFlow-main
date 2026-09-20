const { Task, User, Document } = require('../models');
const path = require('path');
const fs = require('fs');

exports.getAllTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, assignedTo, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const skip = (page - 1) * limit;

    const query = { isDeleted: { $ne: true } };

    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchCondition = { $or: [{ title: searchRegex }, { description: searchRegex }] };
      // Merge with existing $or (role-based) if present
      if (query.$or) {
        query.$and = [{ $or: query.$or }, searchCondition];
        delete query.$or;
      } else {
        Object.assign(query, searchCondition);
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'ASC' ? 1 : -1;

    const tasks = await Task.find(query)
      .populate('createdBy', 'email firstName lastName')
      .populate('assignedTo', 'email firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'email firstName lastName')
      .populate('assignedTo', 'email firstName lastName');

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' &&
        task.createdBy._id.toString() !== req.user._id.toString() &&
        task.assignedTo?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const documents = await Document.find({ task: task._id })
      .select('fileName fileSize mimeType createdAt');

    res.json({ task: { ...task.toObject(), Documents: documents } });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      assignedTo: assignedToId || null,
      createdBy: req.user._id
    });

    const createdTask = await Task.findById(task._id)
      .populate('createdBy', 'email firstName lastName')
      .populate('assignedTo', 'email firstName lastName');

    res.status(201).json({ task: createdTask });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is admin, creator, or assignee
    const createdById = task.createdBy.toString();
    const assignedToId = task.assignedTo ? task.assignedTo.toString() : null;
    const userId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isCreator = createdById === userId;
    const isAssignee = assignedToId === userId;

    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, status, priority, dueDate, assignedToId: newAssignedTo } = req.body;

    task.title = title || task.title;
    if (description !== undefined) task.description = description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    // Only admin can change assignedTo
    if (newAssignedTo !== undefined && isAdmin) {
      task.assignedTo = newAssignedTo || null;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('createdBy', 'email firstName lastName')
      .populate('assignedTo', 'email firstName lastName');

    const documents = await Document.find({ task: task._id })
      .select('fileName fileSize mimeType createdAt');

    res.json({ task: { ...updatedTask.toObject(), Documents: documents } });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete: set isDeleted to true instead of removing from DB
    task.isDeleted = true;
    await task.save();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};