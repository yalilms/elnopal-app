import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import blogData from '../../data/blogData';
import '../../styles/blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar los datos del blog
    setPosts(blogData);
    setFilteredPosts(blogData);
    
    // Extraer categorías únicas de todos los posts
    const allCategories = blogData.reduce((cats, post) => {
      post.categories.forEach(cat => {
        if (!cats.includes(cat)) {
          cats.push(cat);
        }
      });
      return cats;
    }, []);
    
    setCategories(allCategories.sort());
    setLoading(false);
  }, []);

  useEffect(() => {
    // Filtrar los posts según búsqueda y categoría
    let result = posts;
    
    if (searchTerm) {
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      result = result.filter(post => 
        post.categories.includes(selectedCategory)
      );
    }
    
    setFilteredPosts(result);
  }, [searchTerm, selectedCategory, posts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const formatDate = (dateString) => {
    return dateString; // Ya está en formato legible
  };
  
  // Encontrar posts destacados
  const featuredPosts = posts.filter(post => post.featured);
  
  if (loading) {
    return (
      <div className="blog-container">
        <div className="blog-loading">
          <p>Cargando artículos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog de El Nopal Granada</h1>
        <p>Descubre los secretos de nuestra cocina mexicana en Granada, eventos especiales y la historia de la auténtica gastronomía mexicana que traemos a España</p>
      </div>
      
      <div className="blog-filters">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar artículos..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="categories-filter">
          <button 
            className={`category-button ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            Todos
          </button>
          {categories.map(category => (
            <button 
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="no-results">
          <h3>No se encontraron artículos</h3>
          <p>Intenta con otra búsqueda o categoría</p>
        </div>
      ) : (
        <div className="blog-grid">
          {filteredPosts.map(post => (
            <div className="blog-card" key={post.id}>
              <div className="blog-card-image">
                <img src={post.imageUrl} alt={post.title} />
              </div>
              <div className="blog-card-content">
                <div className="blog-card-categories">
                  {post.categories.slice(0, 2).map(cat => (
                    <span className="category-tag small" key={cat} onClick={() => handleCategorySelect(cat)}>
                      {cat}
                    </span>
                  ))}
                  {post.categories.length > 2 && (
                    <span className="category-tag small">+{post.categories.length - 2}</span>
                  )}
                </div>
                <h2>{post.title}</h2>
                <p className="blog-card-meta">
                  <span>{formatDate(post.date)}</span> • <span>{post.author}</span>
                </p>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="read-more">
                  Leer más →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog; 