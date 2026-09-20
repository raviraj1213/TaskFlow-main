const { Document, Task } = require('../models');
const path = require('path');
const fs = require('fs');

exports.uploadDocuments = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const existingDocs = await Document.countDocuments({ task: task._id });
    const newDocsCount = req.files ? req.files.length : 0;

    if (existingDocs + newDocsCount > 3) {
      if (req.files) {
        req.files.forEach(file => {
          const filePath = path.join(__dirname, '../../uploads', file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      return res.status(400).json({
        message: 'Maximum 3 documents allowed per task. Delete existing documents first.'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const documents = [];
    for (const file of req.files) {
      const doc = await Document.create({
        task: task._id,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype
      });
      documents.push(doc);
    }

    res.status(201).json({
      message: 'Documents uploaded successfully',
      documents
    });
  } catch (error) {
    next(error);
  }
};

exports.getTaskDocuments = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' &&
        task.createdBy.toString() !== req.user._id.toString() &&
        task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const documents = await Document.find({ task: task._id })
      .select('fileName fileSize mimeType createdAt');

    res.json({ documents });
  } catch (error) {
    next(error);
  }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const task = await Task.findById(document.task);
    if (req.user.role !== 'admin' &&
        task.createdBy.toString() !== req.user._id.toString() &&
        task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '../../uploads', path.basename(document.filePath));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, document.fileName);
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const task = await Task.findById(document.task);
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '../../uploads', path.basename(document.filePath));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};