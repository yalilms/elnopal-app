import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWheelchair, 
  faUtensils, 
  faWindowMaximize, 
  faUmbrella, 
  faBaby, 
  faSmoking 
} from '@fortawesome/free-solid-svg-icons';


const ReservationPreferenceForm = ({ preferences, onChange }) => {
  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    onChange({ ...preferences, [name]: checked });
  };

  return (
    <div className="preference-form">
      <h4>Preferencias de reserva</h4>
      <p className="preference-description">
        Selecciona tus preferencias para que podamos hacer tu experiencia más agradable.
        Haremos lo posible por acomodar tus solicitudes, sujeto a disponibilidad.
      </p>

      <div className="checkbox-group">
        <h5>Ubicación preferida</h5>
        <div className="checkbox-items">
          <div className="checkbox-item">
            <label>
              <input
                type="checkbox"
                name="windowSeat"
                checked={preferences.windowSeat || false}
                onChange={handlePreferenceChange}
              />
              <FontAwesomeIcon icon={faWindowMaximize} className="icon" />
              Mesa junto a ventana
            </label>
          </div>
          <div className="checkbox-item">
            <label>
              <input
                type="checkbox"
                name="terraceSeat"
                checked={preferences.terraceSeat || false}
                onChange={handlePreferenceChange}
              />
              <FontAwesomeIcon icon={faUmbrella} className="icon" />
              Terraza
            </label>
          </div>
          <div className="checkbox-item">
            <label>
              <input
                type="checkbox"
                name="privateRoom"
                checked={preferences.privateRoom || false}
                onChange={handlePreferenceChange}
              />
              <FontAwesomeIcon icon={faUtensils} className="icon" />
              Sala privada
            </label>
          </div>
        </div>
      </div>

      <div className="checkbox-group">
        <h5>Necesidades especiales</h5>
        <div className="checkbox-items">
          <div className="checkbox-item">
            <label>
              <input
                type="checkbox"
                name="wheelchairAccess"
                checked={preferences.wheelchairAccess || false}
                onChange={handlePreferenceChange}
              />
              <FontAwesomeIcon icon={faWheelchair} className="icon" />
              Acceso para silla de ruedas
            </label>
          </div>
          <div className="checkbox-item">
            <label>
              <input
                type="checkbox"
                name="highChair"
                checked={preferences.highChair || false}
                onChange={handlePreferenceChange}
              />
              <FontAwesomeIcon icon={faBaby} className="icon" />
              Silla para bebé
            </label>
          </div>
          <div className="checkbox-item">
            <label>
              <input
                type="checkbox"
                name="smokingArea"
                checked={preferences.smokingArea || false}
                onChange={handlePreferenceChange}
              />
              <FontAwesomeIcon icon={faSmoking} className="icon" />
              Área de fumadores
            </label>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="additionalRequests">Solicitudes adicionales</label>
        <textarea
          id="additionalRequests"
          name="additionalRequests"
          className="form-control"
          value={preferences.additionalRequests || ''}
          onChange={(e) => onChange({ ...preferences, additionalRequests: e.target.value })}
          placeholder="Cualquier otra solicitud especial (alergias, celebraciones, etc.)"
          rows="3"
        />
      </div>
    </div>
  );
};

export default ReservationPreferenceForm; 