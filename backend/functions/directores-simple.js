exports.handler = async (event, context) => {
  console.log('=== DIRECTORES SIMPLE API ===');
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
      const directoresPrueba = [
        {
          _id: "1",
          nombre: "John Lasseter",
          fechaNacimiento: "1957-01-12",
          nacionalidad: "Estadounidense",
          biografia: "Pionero en animación por computadora y cofundador de Pixar"
        },
        {
          _id: "2", 
          nombre: "Hayao Miyazaki",
          fechaNacimiento: "1941-01-05",
          nacionalidad: "Japonés",
          biografia: "Maestro de la animación japonesa y cofundador de Studio Ghibli"
        },
        {
          _id: "3",
          nombre: "Andrew Adamson",
          fechaNacimiento: "1966-12-01",
          nacionalidad: "Neozelandés",
          biografia: "Director conocido por Shrek y Las Crónicas de Narnia"
        },
        {
          _id: "4",
          nombre: "Brad Bird",
          fechaNacimiento: "1957-09-24",
          nacionalidad: "Estadounidense",
          biografia: "Director de Los Increíbles y Ratatouille en Pixar"
        },
        {
          _id: "5",
          nombre: "Pete Docter",
          fechaNacimiento: "1968-10-09",
          nacionalidad: "Estadounidense",
          biografia: "Director de Monsters Inc., Up e Intensamente"
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(directoresPrueba)
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'API de directores funcionando (modo prueba)',
        method: event.httpMethod
      })
    };

  } catch (error) {
    console.error('Error en directores API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error en directores API',
        details: error.message
      })
    };
  }
};