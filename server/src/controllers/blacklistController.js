const Blacklist = require('../models/Blacklist');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Añadir cliente a la lista negra
exports.addToBlacklist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array() 
      });
    }

    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      reason,
      reservationId
    } = req.body;

    // Verificar si el cliente ya está en la lista negra
    const existingEntry = await Blacklist.findOne({
      $or: [
        { customerEmail },
        { customerPhone }
      ],
      isActive: true
    });

    if (existingEntry) {
      return res.status(400).json({
        message: 'El cliente ya se encuentra en la lista negra'
      });
    }

    // Obtener el ID del usuario que está haciendo la acción
    let addedById = 'admin';
    if (req.user && req.user.id) {
      addedById = req.user.id;
    } else if (req.user && req.user._id) {
      addedById = req.user._id;
    }

    // Crear nueva entrada en la lista negra
    const blacklistEntry = new Blacklist({
      customerId: customerId || new mongoose.Types.ObjectId().toString(),
      customerName,
      customerEmail,
      customerPhone,
      reason,
      addedBy: addedById,
      reservationId
    });
    
    try {
      await blacklistEntry.save();
    } catch (saveError) {
      if (saveError instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: Object.values(saveError.errors).map(err => err.message)
        });
      }
      throw saveError;
    }

    res.status(201).json({
      message: 'Cliente añadido a la lista negra exitosamente',
      blacklistEntry
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al añadir cliente a la lista negra'
    });
  }
};

// Verificar si un cliente está en la lista negra
exports.checkBlacklist = async (req, res) => {
  try {
    const { email, phone } = req.query;

    console.log('Verificando blacklist para:', { email, phone });

    if (!email && !phone) {
      return res.status(400).json({
        message: 'Se requiere email o teléfono para la verificación'
      });
    }

    const query = {
      isActive: true,
      expiresAt: { $gt: new Date() }
    };

    if (email && phone) {
      query.$or = [{ customerEmail: email }, { customerPhone: phone }];
    } else if (email) {
      query.customerEmail = email;
    } else {
      query.customerPhone = phone;
    }

    console.log('Query de búsqueda blacklist:', query);

    const blacklistEntry = await Blacklist.findOne(query);
    
    console.log('Resultado blacklist:', { isBlacklisted: !!blacklistEntry, entry: blacklistEntry });

    res.json({
      isBlacklisted: !!blacklistEntry,
      entry: blacklistEntry,
      message: blacklistEntry ? 'Cliente en lista negra' : 'Cliente no está en lista negra'
    });
  } catch (error) {
    console.error('Error al verificar lista negra:', error);
    res.status(500).json({
      message: 'Error al verificar lista negra',
      error: error.message
    });
  }
};

// Obtener todas las entradas de la lista negra
exports.getBlacklist = async (req, res) => {
  try {
    // Verificar autorización de manera más flexible
    let isAdmin = false;
    
    if (req.user) {
      // Verificar si req.user tiene roles como array
      if (Array.isArray(req.user.roles) && req.user.roles.includes('admin')) {
        isAdmin = true;
      } 
      // Verificar si req.user tiene roles como string
      else if (req.user.role === 'admin') {
        isAdmin = true;
      }
    }
    
    if (!isAdmin) {
      return res.status(403).json({
        message: 'No tienes permiso para acceder a esta información'
      });
    }
    
    let blacklist;
    try {
      blacklist = await Blacklist.find({ isActive: true })
        .sort({ addedAt: -1 });
    } catch (dbError) {
      throw new Error(`Error de base de datos: ${dbError.message}`);
    }
    
    res.json(blacklist);
  } catch (error) {
    // Determinar tipo de error para respuesta adecuada
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        message: 'Error en el formato de datos de la consulta'
      });
    }
    
    res.status(500).json({
      message: 'Error del servidor al obtener lista negra'
    });
  }
};

// Remover cliente de la lista negra
exports.removeFromBlacklist = async (req, res) => {
  try {
    const { id } = req.params;

    const blacklistEntry = await Blacklist.findById(id);

    if (!blacklistEntry) {
      return res.status(404).json({
        message: 'Entrada de lista negra no encontrada'
      });
    }

    blacklistEntry.isActive = false;
    await blacklistEntry.save();

    res.json({
      message: 'Cliente removido de la lista negra exitosamente',
      blacklistEntry
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al remover cliente de la lista negra'
    });
  }
}; 