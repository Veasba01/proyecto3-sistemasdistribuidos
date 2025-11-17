const { createClient } = require('redis');
require('dotenv').config();

class Database {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      this.client = createClient({
        username: 'default',
        password: 'OYh0XsNK66Wlv3lcSrMrhkl2PrAFiYsf',
        socket: {
          host: 'redis-14213.c270.us-east-1-3.ec2.cloud.redislabs.com',
          port: 14213
        }
      });

      this.client.on('error', err => console.log('Redis Client Error', err));

      await this.client.connect();
      
      console.log('Conectado exitosamente a Redis');
      return this.client;
    } catch (error) {
      console.error('Error conectando a Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      console.log('Desconectado de Redis');
    }
  }

  getClient() {
    return this.client;
  }

  // Métodos para obtener datos por tipo
  async getPelicula(id) {
    const data = await this.client.get(`pelicula_${id}`);
    return data ? JSON.parse(data) : null;
  }

  async getAllPeliculas() {
    const keys = await this.client.keys('pelicula_*');
    const peliculas = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      peliculas.push(JSON.parse(data));
    }
    return peliculas;
  }

  async setPelicula(id, data) {
    await this.client.set(`pelicula_${id}`, JSON.stringify(data));
  }

  async deletePelicula(id) {
    await this.client.del(`pelicula_${id}`);
  }

  async getEstudio(id) {
    const data = await this.client.get(`estudio_${id}`);
    return data ? JSON.parse(data) : null;
  }

  async getAllEstudios() {
    const keys = await this.client.keys('estudio_*');
    const estudios = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      estudios.push(JSON.parse(data));
    }
    return estudios;
  }

  async setEstudio(id, data) {
    await this.client.set(`estudio_${id}`, JSON.stringify(data));
  }

  async deleteEstudio(id) {
    await this.client.del(`estudio_${id}`);
  }

  async getDirector(id) {
    const data = await this.client.get(`director_${id}`);
    return data ? JSON.parse(data) : null;
  }

  async getAllDirectores() {
    const keys = await this.client.keys('director_*');
    const directores = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      directores.push(JSON.parse(data));
    }
    return directores;
  }

  async setDirector(id, data) {
    await this.client.set(`director_${id}`, JSON.stringify(data));
  }

  async deleteDirector(id) {
    await this.client.del(`director_${id}`);
  }
}

module.exports = new Database();
