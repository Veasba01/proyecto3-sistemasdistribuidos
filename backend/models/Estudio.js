class Estudio {
  constructor(data) {
    this._id = data._id;
    this.nombre = data.nombre;
    this.fundacion = data.fundacion; // año de fundación
    this.pais = data.pais;
    this.imagen = data.imagen;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  // Validación de datos
  static validate(data) {
    const errors = [];
    
    if (!data.nombre || data.nombre.trim() === '') {
      errors.push('El nombre del estudio es requerido');
    }
    
    if (!data.fundacion || data.fundacion < 1800 || data.fundacion > new Date().getFullYear()) {
      errors.push('El año de fundación debe ser válido');
    }
    
    if (!data.pais || data.pais.trim() === '') {
      errors.push('El país es requerido');
    }
    
    return errors;
  }

  // Preparar datos para MongoDB
  toMongoDB() {
    const data = { ...this };
    if (!data._id) {
      delete data._id;
    }
    return data;
  }
}

module.exports = Estudio;
