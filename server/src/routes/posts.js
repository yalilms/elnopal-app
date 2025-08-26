const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Rutas públicas
router.get('/', postController.getAllPosts);
router.get('/:slug', postController.getPostBySlug);

// Rutas protegidas (solo para administradores)
router.post('/', [auth, admin], postController.createPost);
router.put('/:id', [auth, admin], postController.updatePost);
router.delete('/:id', [auth, admin], postController.deletePost);

module.exports = router;
