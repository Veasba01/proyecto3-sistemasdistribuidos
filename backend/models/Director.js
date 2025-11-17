class Director {
  constructor(data) {
    this._id = data._id;
    this.nombre = data.nombre;
    this.nacionalidad = data.nacionalidad;
    this.nacimiento = data.nacimiento; // año de nacimiento
    this.imagen = data.imagen;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  // Validación de datos
  static validate(data) {
    const errors = [];
    
    if (!data.nombre || data.nombre.trim() === '') {
      errors.push('El nombre del director es requerido');
    }
    
    if (!data.nacionalidad || data.nacionalidad.trim() === '') {
      errors.push('La nacionalidad es requerida');
    }
    
    if (!data.nacimiento || data.nacimiento < 1900 || data.nacimiento > new Date().getFullYear()) {
      errors.push('El año de nacimiento debe ser válido');
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

module.exports = Director;
