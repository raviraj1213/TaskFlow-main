const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

router.get('/', userController.getAllUsers);
router.get('/list', userController.getUserList);

router.get('/:id', userController.getUserById);

router.post('/', adminOnly, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('role').optional().isIn(['user', 'admin'])
], validate, userController.createUser);

router.put('/:id', adminOnly, [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('role').optional().isIn(['user', 'admin'])
], validate, userController.updateUser);

router.delete('/:id', adminOnly, userController.deleteUser);

module.exports = router;