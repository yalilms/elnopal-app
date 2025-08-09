import api from './api';

// ============= SERVICIO DE CONTACTO =============

// Enviar mensaje de contacto
export const sendContactMessage = async (contactData) => {
  try {
    console.log('Enviando mensaje de contacto:', contactData);
    
    const response = await api.post('/api/contact', {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || '',
      subject: contactData.subject || '',
      message: contactData.message
    });
    
    console.log('Mensaje enviado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje de contacto:', error);
    
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error(error.response.data.message || 'Datos del formulario inválidos');
      } else if (error.response.status === 500) {
        throw new Error('Error del servidor. Inténtalo de nuevo más tarde.');
      } else {
        throw new Error(error.response.data.message || 'Error al enviar el mensaje');
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      throw new Error(error.message || 'Error al procesar la solicitud');
    }
  }
}; 