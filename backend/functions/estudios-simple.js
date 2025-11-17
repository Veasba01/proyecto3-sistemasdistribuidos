exports.handler = async (event, context) => {
  console.log('=== ESTUDIOS SIMPLE API ===');
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
      const estudiosPrueba = [
        {
          _id: "1",
          nombre: "Pixar Animation Studios",
          fundacion: 1986,
          pais: "Estados Unidos",
          descripcion: "Estudio líder en animación por computadora, conocido por películas innovadoras"
        },
        {
          _id: "2", 
          nombre: "DreamWorks Animation",
          fundacion: 1994,
          pais: "Estados Unidos",
          descripcion: "Estudio famoso por Shrek, Madagascar y Cómo entrenar a tu dragón"
        },
        {
          _id: "3",
          nombre: "Studio Ghibli",
          fundacion: 1985,
          pais: "Japón",
          descripcion: "Legendario estudio japonés creador de obras maestras como Mi Vecino Totoro"
        },
        {
          _id: "4",
          nombre: "Walt Disney Animation Studios",
          fundacion: 1923,
          pais: "Estados Unidos",
          descripcion: "El estudio de animación más antiguo e icónico del mundo"
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(estudiosPrueba)
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'API de estudios funcionando (modo prueba)',
        method: event.httpMethod
      })
    };

  } catch (error) {
    console.error('Error en estudios API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error en estudios API',
        details: error.message
      })
    };
  }
};