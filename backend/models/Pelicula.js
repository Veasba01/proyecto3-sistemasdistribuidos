class Pelicula {
  constructor(data) {
    this._id = data._id;
    this.titulo = data.titulo;
    this.año = data.año;
    this.duracion = data.duracion; // en minutos
    this.genero = data.genero;
    this.sinopsis = data.sinopsis;
    this.imagen = data.imagen;
    this.estudio_id = data.estudio_id;
    this.director_id = data.director_id;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  // Validación de datos
  static validate(data) {
    const errors = [];
    
    if (!data.titulo || data.titulo.trim() === '') {
      errors.push('El título es requerido');
    }
    
    if (!data.año || data.año < 1900 || data.año > new Date().getFullYear() + 5) {
      errors.push('El año debe ser válido');
    }
    
    if (!data.duracion || data.duracion <= 0) {
      errors.push('La duración debe ser mayor a 0 minutos');
    }
    
    if (!data.genero || data.genero.trim() === '') {
      errors.push('El género es requerido');
    }
    
    if (!data.sinopsis || data.sinopsis.trim() === '') {
      errors.push('La sinopsis es requerida');
    }
    
    if (!data.estudio_id) {
      errors.push('El ID del estudio es requerido');
    }
    
    if (!data.director_id) {
      errors.push('El ID del director es requerido');
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

module.exports = Pelicula;
