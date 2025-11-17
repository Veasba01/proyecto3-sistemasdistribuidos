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

  console.log('=== PELÍCULAS API (Redis) ===');
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
    const isSpecificId = id && id !== 'peliculas' && !id.includes('netlify');

    if (event.httpMethod === 'GET') {
      if (isSpecificId) {
        // Obtener una película específica con información de estudio y director
        console.log(`Consultando película con ID: ${id}`);
        const peliculaData = await client.get(id);
        
        if (!peliculaData) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Película no encontrada' }),
          };
        }

        const pelicula = JSON.parse(peliculaData);

        // Obtener información del estudio
        let estudio = null;
        if (pelicula.estudio_id) {
          const estudioData = await client.get(pelicula.estudio_id);
          estudio = estudioData ? JSON.parse(estudioData) : null;
        }

        // Obtener información del director
        let director = null;
        if (pelicula.director_id) {
          const directorData = await client.get(pelicula.director_id);
          director = directorData ? JSON.parse(directorData) : null;
        }

        // Agregar información relacionada
        pelicula.estudio = estudio;
        pelicula.director = director;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: pelicula
          }),
        };
      } else {
        // Obtener todas las películas con información de estudio y director
        console.log('Consultando todas las películas...');
        const keys = await client.keys('pelicula_*');
        const peliculas = [];

        for (const key of keys) {
          const peliculaData = await client.get(key);
          const pelicula = JSON.parse(peliculaData);

          // Obtener información del estudio
          if (pelicula.estudio_id) {
            const estudioData = await client.get(pelicula.estudio_id);
            pelicula.estudio = estudioData ? JSON.parse(estudioData) : null;
          }

          // Obtener información del director
          if (pelicula.director_id) {
            const directorData = await client.get(pelicula.director_id);
            pelicula.director = directorData ? JSON.parse(directorData) : null;
          }

          peliculas.push(pelicula);
        }

        console.log(`Películas encontradas: ${peliculas.length}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            count: peliculas.length,
            data: peliculas
          }),
        };
      }
    }

    if (event.httpMethod === 'POST') {
      // Crear nueva película
      console.log('Creando nueva película...');
      const body = JSON.parse(event.body);
      
      // Validar datos usando el modelo
      const Pelicula = require('../models/Pelicula');
      const errors = Pelicula.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      // Generar ID único
      const keys = await client.keys('pelicula_*');
      const maxNum = keys.reduce((max, key) => {
        const num = parseInt(key.split('_')[1]);
        return num > max ? num : max;
      }, 0);
      const nuevaId = `pelicula_${String(maxNum + 1).padStart(3, '0')}`;

      const nuevaPelicula = {
        _id: nuevaId,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await client.set(nuevaId, JSON.stringify(nuevaPelicula));
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Película creada exitosamente',
          data: nuevaPelicula
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      // Actualizar película existente
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de película requerido para actualizar' }),
        };
      }

      console.log(`Actualizando película con ID: ${id}`);
      const body = JSON.parse(event.body);
      
      // Verificar si existe
      const peliculaExistente = await client.get(id);
      if (!peliculaExistente) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Película no encontrada' }),
        };
      }

      // Validar datos
      const Pelicula = require('../models/Pelicula');
      const errors = Pelicula.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      const peliculaAnterior = JSON.parse(peliculaExistente);
      const peliculaActualizada = {
        ...peliculaAnterior,
        ...body,
        _id: id,
        updated_at: new Date().toISOString()
      };

      await client.set(id, JSON.stringify(peliculaActualizada));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Película actualizada exitosamente',
          data: peliculaActualizada
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Eliminar película
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de película requerido para eliminar' }),
        };
      }

      console.log(`Eliminando película con ID: ${id}`);
      const resultado = await client.del(id);

      if (resultado === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Película no encontrada' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Película eliminada exitosamente'
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