import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import blogData from '../../data/blogData';
import './BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const history = useHistory();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Encontrar el post actual por ID
    const currentPost = blogData.find(post => post.id === parseInt(id));
    
    if (currentPost) {
      setPost(currentPost);
      
      // Encontrar posts relacionados basados en categorías
      const related = blogData
        .filter(p => p.id !== currentPost.id)
        .filter(p => p.categories.some(cat => currentPost.categories.includes(cat)))
        .slice(0, 3);
      
      setRelatedPosts(related);
    }
    
    setLoading(false);
  }, [id]);
  
  if (loading) {
    return (
      <div className="blog-post-loading">
        <p>Cargando artículo...</p>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="blog-post-error">
        <h2>Artículo no encontrado</h2>
        <p>El artículo que buscas no existe o ha sido eliminado.</p>
        <button onClick={() => history.push('/blog')}>Volver al Blog</button>
      </div>
    );
  }
  
  return (
    <div className="blog-post-container">
      <Link to="/blog" className="back-to-blog">
        ← Volver al Blog
      </Link>
      
      <div className="blog-post-header">
        <div className="blog-post-categories">
          {post.categories.map(category => (
            <span key={category} className="category-tag">
              {category}
            </span>
          ))}
        </div>
        <h1>{post.title}</h1>
        <div className="blog-post-meta">
          <span className="blog-post-date">{post.date}</span>
          <span className="blog-post-author">Por {post.author}</span>
        </div>
      </div>
      
      <div className="blog-post-featured-image">
        <img src={post.imageUrl} alt={post.title} />
      </div>
      
      <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      
      {relatedPosts.length > 0 && (
        <div className="related-posts">
          <h3>Artículos relacionados</h3>
          <div className="related-posts-grid">
            {relatedPosts.map(relatedPost => (
              <Link to={`/blog/${relatedPost.id}`} className="related-post-card" key={relatedPost.id}>
                <div className="related-post-image">
                  <img src={relatedPost.imageUrl} alt={relatedPost.title} />
                </div>
                <h4>{relatedPost.title}</h4>
                <p className="related-post-date">{relatedPost.date}</p>
                <p className="related-post-excerpt">{relatedPost.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <div className="blog-post-share">
        <p>¿Te gustó este artículo? ¡Compártelo!</p>
        <div className="share-buttons">
          <button className="share-button facebook">Facebook</button>
          <button className="share-button twitter">Twitter</button>
          <button className="share-button whatsapp">WhatsApp</button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost; 