exports.handler = async (event, context) => {
  console.log('=== TEST API ===');
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Test API funcionando correctamente',
        timestamp: new Date().toISOString(),
        method: event.httpMethod,
        path: event.path
      })
    };
  } catch (error) {
    console.error('Error en test API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error en test API',
        details: error.message
      })
    };
  }
};