const { createClient } = require('redis');

const REDIS_CONFIG = {
  username: 'default',
  password: 'OYh0XsNK66Wlv3lcSrMrhkl2PrAFiYsf',
  socket: {
    host: 'redis-14213.c270.us-east-1-3.ec2.cloud.redislabs.com',
    port: 14213
  }
};

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  console.log('=== DIRECTORES API (Redis) ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);

  let client = null;
  
  try {
    client = createClient(REDIS_CONFIG);
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();
    console.log('✅ Conectado a Redis');

    // Extraer ID de la URL si existe
    const pathParts = event.path.split('/');
    const id = pathParts[pathParts.length - 1];
    const isSpecificId = id && id !== 'directores' && !id.includes('netlify');

    if (event.httpMethod === 'GET') {
      if (isSpecificId) {
        // Obtener un director específico con sus películas
        console.log(`Consultando director con ID: ${id}`);
        const directorData = await client.get(id);
        
        if (!directorData) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Director no encontrado' }),
          };
        }

        const director = JSON.parse(directorData);

        // Obtener películas del director
        const peliculasKeys = await client.keys('pelicula_*');
        const peliculas = [];
        for (const key of peliculasKeys) {
          const peliculaData = await client.get(key);
          const pelicula = JSON.parse(peliculaData);
          if (pelicula.director_id === id) {
            peliculas.push(pelicula);
          }
        }
        director.peliculas = peliculas;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: director
          }),
        };
      } else {
        // Obtener todos los directores
        console.log('Consultando todos los directores...');
        const keys = await client.keys('director_*');
        const directores = [];

        for (const key of keys) {
          const directorData = await client.get(key);
          directores.push(JSON.parse(directorData));
        }

        console.log(`Directores encontrados: ${directores.length}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            count: directores.length,
            data: directores
          }),
        };
      }
    }

    if (event.httpMethod === 'POST') {
      // Crear nuevo director
      console.log('Creando nuevo director...');
      const body = JSON.parse(event.body);
      
      // Validar datos usando el modelo
      const Director = require('../models/Director');
      const errors = Director.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      // Generar ID único
      const keys = await client.keys('director_*');
      const maxNum = keys.reduce((max, key) => {
        const num = parseInt(key.split('_')[1]);
        return num > max ? num : max;
      }, 0);
      const nuevoId = `director_${String(maxNum + 1).padStart(3, '0')}`;

      const nuevoDirector = {
        _id: nuevoId,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await client.set(nuevoId, JSON.stringify(nuevoDirector));
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Director creado exitosamente',
          data: nuevoDirector
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      // Actualizar director existente
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de director requerido para actualizar' }),
        };
      }

      console.log(`Actualizando director con ID: ${id}`);
      const body = JSON.parse(event.body);
      
      // Verificar si existe
      const directorExistente = await client.get(id);
      if (!directorExistente) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Director no encontrado' }),
        };
      }

      // Validar datos
      const Director = require('../models/Director');
      const errors = Director.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      const directorAnterior = JSON.parse(directorExistente);
      const directorActualizado = {
        ...directorAnterior,
        ...body,
        _id: id,
        updated_at: new Date().toISOString()
      };

      await client.set(id, JSON.stringify(directorActualizado));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Director actualizado exitosamente',
          data: directorActualizado
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Eliminar director
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de director requerido para eliminar' }),
        };
      }

      console.log(`Eliminando director con ID: ${id}`);
      
      // Verificar si hay películas asociadas
      const peliculasKeys = await client.keys('pelicula_*');
      let peliculasAsociadas = 0;
      for (const key of peliculasKeys) {
        const peliculaData = await client.get(key);
        const pelicula = JSON.parse(peliculaData);
        if (pelicula.director_id === id) {
          peliculasAsociadas++;
        }
      }
      
      if (peliculasAsociadas > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'No se puede eliminar el director porque tiene películas asociadas',
            peliculasAsociadas: peliculasAsociadas
          }),
        };
      }

      const resultado = await client.del(id);

      if (resultado === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Director no encontrado' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Director eliminado exitosamente'
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' }),
    };

  } catch (error) {
    console.error('❌ ERROR:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message
      }),
    };
  } finally {
    if (client) {
      await client.quit();
      console.log('🔐 Desconectado de Redis');
    }
  }
};
