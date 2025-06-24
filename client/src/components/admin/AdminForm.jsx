import React, { useState } from 'react';


const AdminForm = ({ title, onSubmit, initialData = {}, fields }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} es requerido`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="admin-form-container">
      <div className="admin-form-header">
        <h2 className="admin-form-title">{title}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {fields.map(field => (
          <div key={field.name} className="form-group">
            <label 
              htmlFor={field.name}
              className={field.required ? 'required' : ''}
            >
              {field.label}
            </label>
            
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={errors[field.name] ? 'is-invalid' : ''}
                required={field.required}
              >
                <option value="">Seleccionar...</option>
                {field.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={errors[field.name] ? 'is-invalid' : ''}
                required={field.required}
                rows={4}
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={errors[field.name] ? 'is-invalid' : ''}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}
            
            {errors[field.name] && (
              <div className="error-message">{errors[field.name]}</div>
            )}
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm; 