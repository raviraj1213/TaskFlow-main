const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const documentController = require('../controllers/documentController');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);

router.post('/', [
  body('title').notEmpty().withMessage('Title required')
], validate, taskController.createTask);

router.put('/:id', [
  body('title').optional().notEmpty()
], validate, taskController.updateTask);

router.delete('/:id', taskController.deleteTask);

router.get('/:id/documents', documentController.getTaskDocuments);
router.post('/:id/documents', upload.array('documents', 3), documentController.uploadDocuments);
router.delete('/documents/:id', documentController.deleteDocument);
router.get('/documents/:id/download', documentController.downloadDocument);

module.exports = router;