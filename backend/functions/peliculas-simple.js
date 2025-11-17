exports.handler = async (event, context) => {
  console.log('=== PELÍCULAS SIMPLE API ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Datos de prueba sin MongoDB
      const peliculasPrueba = [
        {
          _id: "1",
          titulo: "Toy Story",
          anio: 1995,
          duracion: 81,
          genero: "Aventura",
          director: { nombre: "John Lasseter" },
          estudio: { nombre: "Pixar" },
          sinopsis: "La historia de los juguetes que cobran vida",
          imagenUrl: ""
        },
        {
          _id: "2", 
          titulo: "Shrek",
          anio: 2001,
          duracion: 90,
          genero: "Comedia",
          director: { nombre: "Andrew Adamson" },
          estudio: { nombre: "DreamWorks" },
          sinopsis: "Un ogro verde en una aventura épica",
          imagenUrl: ""
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(peliculasPrueba)
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'API de películas funcionando (modo prueba)',
        method: event.httpMethod
      })
    };

  } catch (error) {
    console.error('Error en películas API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error en películas API',
        details: error.message
      })
    };
  }
};