const Contact = require('../models/Contact');
const emailService = require('../services/emailService');

// Crear un nuevo mensaje de contacto
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validaciones básicas
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: 'Faltan campos obligatorios: nombre, email y mensaje' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    // Crear el mensaje de contacto
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      subject: subject?.trim() || '',
      message: message.trim(),
      status: 'pending'
    });

    await contact.save();

    // Enviar correos
    try {
      const contactData = {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message
      };

      const emailResult = await emailService.sendContactEmails(contactData);
      
      if (emailResult.success) {
        // Marcar correos como enviados
        contact.confirmationEmailSent = true;
        contact.confirmationEmailSentAt = new Date();
        contact.notificationEmailSent = true;
        contact.notificationEmailSentAt = new Date();
        await contact.save();
      }
    } catch (emailError) {
      console.error('Error enviando correos de contacto:', emailError);
      // No fallar el contacto por error de correo
    }

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.',
      contact: {
        id: contact._id,
        name: contact.name,
        subject: contact.subject,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Error al crear mensaje de contacto:', error);
    res.status(500).json({ 
      message: 'Error al enviar el mensaje', 
      error: error.message 
    });
  }
};

// Obtener todos los mensajes de contacto (para administradores)
exports.getAllContacts = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      contacts
    });
  } catch (error) {
    console.error('Error al obtener mensajes de contacto:', error);
    res.status(500).json({ 
      message: 'Error al obtener mensajes', 
      error: error.message 
    });
  }
};

// Obtener un mensaje de contacto por ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('respondedBy', 'name email');
    
    if (!contact) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Error al obtener mensaje:', error);
    res.status(500).json({ 
      message: 'Error al obtener mensaje', 
      error: error.message 
    });
  }
};

// Marcar mensaje como respondido
exports.markAsResponded = async (req, res) => {
  try {
    const { responseMessage } = req.body;
    
    if (!responseMessage) {
      return res.status(400).json({ 
        message: 'Se requiere un mensaje de respuesta' 
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    await contact.markAsResponded(responseMessage, req.user ? req.user.id : null);

    res.json({
      success: true,
      message: 'Mensaje marcado como respondido',
      contact
    });
  } catch (error) {
    console.error('Error al marcar como respondido:', error);
    res.status(500).json({ 
      message: 'Error al actualizar mensaje', 
      error: error.message 
    });
  }
};

// Marcar mensaje como resuelto
exports.markAsResolved = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    await contact.markAsResolved(req.user ? req.user.id : null);

    res.json({
      success: true,
      message: 'Mensaje marcado como resuelto',
      contact
    });
  } catch (error) {
    console.error('Error al marcar como resuelto:', error);
    res.status(500).json({ 
      message: 'Error al actualizar mensaje', 
      error: error.message 
    });
  }
};

// Actualizar estado de un mensaje
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'responded', 'resolved'].includes(status)) {
      return res.status(400).json({ 
        message: 'Estado inválido. Debe ser: pending, responded o resolved' 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('respondedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    res.json({
      success: true,
      message: 'Estado del mensaje actualizado exitosamente',
      contact
    });
  } catch (error) {
    console.error('Error al actualizar mensaje:', error);
    res.status(500).json({ 
      message: 'Error al actualizar mensaje', 
      error: error.message 
    });
  }
};

// Eliminar un mensaje de contacto
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({ 
      message: 'Error al eliminar mensaje', 
      error: error.message 
    });
  }
};

// Obtener estadísticas de mensajes de contacto
exports.getContactStats = async (req, res) => {
  try {
    const statusStats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await Contact.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    const totalContacts = await Contact.countDocuments();

    res.json({
      success: true,
      stats: {
        total: totalContacts,
        byStatus: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas', 
      error: error.message 
    });
  }
}; 