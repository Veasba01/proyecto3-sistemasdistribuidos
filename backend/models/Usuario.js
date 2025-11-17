class Usuario {
  constructor(username, password, email, nombre, role = 'user') {
    this._id = this.generarId();
    this.username = username;
    this.password = password; // Se almacenará hasheado
    this.email = email;
    this.nombre = nombre;
    this.role = role; // 'admin' o 'user'
    this.createdAt = new Date();
    this.lastLogin = null;
  }

  generarId() {
    return `usuario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      _id: this._id,
      username: this.username,
      email: this.email,
      nombre: this.nombre,
      role: this.role,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = Usuario;
