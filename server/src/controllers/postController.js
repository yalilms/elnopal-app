const Post = require('../models/Post');

// Obtener todos los posts (público)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ active: true })
      .sort({ created: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los posts del blog',
      error: error.message
    });
  }
};

// Obtener un post por su slug (público)
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ 
      slug: req.params.slug,
      active: true 
    }).select('-__v');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }
    
    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error al obtener post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el post',
      error: error.message
    });
  }
};

// Crear un nuevo post (solo admin)
exports.createPost = async (req, res) => {
  try {
    const { title, content, imageUrl, slug, tags } = req.body;
    
    // Validar datos
    if (!title || !content || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Título, contenido y slug son obligatorios'
      });
    }
    
    // Verificar si ya existe un post con ese slug
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un post con ese slug'
      });
    }
    
    // Crear post
    const post = new Post({
      title,
      content,
      imageUrl,
      slug,
      tags: tags || [],
      author: req.user ? req.user.name : 'Admin'
    });
    
    await post.save();
    
    res.status(201).json({
      success: true,
      message: 'Post creado correctamente',
      post
    });
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el post',
      error: error.message
    });
  }
};

// Actualizar un post (solo admin)
exports.updatePost = async (req, res) => {
  try {
    const { title, content, imageUrl, active, tags } = req.body;
    const { id } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }
    
    // Actualizar campos
    if (title) post.title = title;
    if (content) post.content = content;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (active !== undefined) post.active = active;
    if (tags) post.tags = tags;
    
    await post.save();
    
    res.json({
      success: true,
      message: 'Post actualizado correctamente',
      post
    });
  } catch (error) {
    console.error('Error al actualizar post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el post',
      error: error.message
    });
  }
};

// Eliminar un post (solo admin)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }
    
    await Post.deleteOne({ _id: id });
    
    res.json({
      success: true,
      message: 'Post eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el post',
      error: error.message
    });
  }
};
