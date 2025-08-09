import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserSlash, faTrashAlt, faEye, faEdit, faPlus, faSearch,
  faCalendarAlt, faPhone, faEnvelope, faExclamationTriangle, faSync,
  faBan, faUserPlus as faUserPlusAdd, faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBlacklist, addToBlacklist, removeFromBlacklist } from '../../services/reservationService';

const BlacklistManagement = () => {
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchBlacklist = useCallback(async () => {
    if (!isAdmin()) {
      setError('Acceso denegado. No tienes permiso para ver esta sección.');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await getBlacklist();
      setBlacklistedUsers(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar la lista negra';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const handleAddEntry = async (entryData) => {
    try {
      await addToBlacklist(entryData);
      toast.success('Entrada añadida a la lista negra correctamente.');
      setShowAddModal(false);
      fetchBlacklist(); // Recargar la lista
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al añadir a la lista negra';
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = async (user) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.email} de la lista negra?`)) {
      try {
        await removeFromBlacklist(user._id);
        toast.success('Usuario eliminado de la lista negra.');
        fetchBlacklist(); // Recargar la lista
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar de la lista negra';
        toast.error(errorMessage);
      }
    }
  };

  const filteredUsers = blacklistedUsers.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAdmin()) {
    return <div className="text-red-500 text-center p-4">Acceso denegado.</div>;
  }
  
  if (isLoading) {
    return <div className="text-center p-4">Cargando lista negra...</div>;
  }

  if (error && !blacklistedUsers.length) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-red-500">Gestión de Lista Negra</h2>
        {/* Aquí iría el resto de la UI: barra de búsqueda, botón de añadir, tabla, modales, etc. */}
    </div>
  );
};

// Un componente simple para el modal de añadir, para que el código sea autocontenido
const AddBlacklistModal = ({ onSave, onCancel }) => {
    // ... implementación del modal
    return null;
}

export default BlacklistManagement; 