// Librerias
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const app = express();

const WebpayPlus = require('transbank-sdk').WebpayPlus; // ES5

// Es necesario ejecutar dentro de una función async para utilizar await

// Config conexion Azure 
const odbc = require('odbc');

// Middleware
app.use(bodyParser.json());
app.use(cors());

const router = express.Router();
app.use(router); // usar variable router

// config conexion sql server (local Database)
const config = {
    server: 'DESKTOP-UA2KK29', // Puede ser una dirección IP o un nombre de host
    database: 'database_abyga',
    options: {
      encrypt: true, // Si estás utilizando una conexión segura (por ejemplo, en Azure), establece esto en true
      trustServerCertificate: true, // Permite certificados autofirmados
    
    },
    authentication: {
      type: 'default',
      options: {
        userName: 'admin',
        password: '3301',
      },
    },
};

// config conexion azure (Cloud Database)

const configAzure = {
  server: 'database-sql.database.windows.net',
  database: 'database_SQLSERVER',
  user: 'admin-abyga',
  password: 'Paildramon12',
  options: {
    encrypt: true, // Habilita la encriptación
    trustServerCertificate: false // No confíes en el certificado del servidor (puedes cambiar esto según tus necesidades de seguridad)
  }
};

// Configuracion cadena de conexión ODBC

const connectionString = 'Driver={ODBC Driver 18 for SQL Server};Server=tcp:database-sql.database.windows.net,1433;Database=database_SQLSERVER;Uid=admin-abyga;Pwd={Paildramon12};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;'


// Ruta Usuario

//Insertar datos

router.post('/PagarWebPay', async (req, res) => {
  try {
    // Recupera los datos necesarios del cuerpo de la solicitud
    const { buyOrder, sessionId, amount, returnUrl } = req.body;

    // Crea una nueva transacción de Webpay Plus
    const createResponse = await (new WebpayPlus.Transaction()).create(
      buyOrder, 
      sessionId, 
      amount, 
      returnUrl
    );

    res.status(200).json({
      token: createResponse.token,
      url: createResponse.url
    });
  } catch (error) {
    console.error('Error al procesar la transacción de Webpay:', error);
    // Maneja el error apropiadamente, por ejemplo, enviando una respuesta de error al cliente.
    res.status(500).json({ error: 'Error al procesar la transacción de Webpay' });
  }
});

router.post('/ConfirmarWebPay', async (req, res) => {

  try{

    let token = req.body.token_ws;
    const commitResponse = await (new WebpayPlus.Transaction()).commit(token);
    console.log(commitResponse)
    
    // Verifica si la transacción fue exitosa (response_code igual a 0)
    if (commitResponse.response_code === 0) {
    // La transacción fue exitosa
      console.log('Transaccion Exitosa');

      res.status(200).json(commitResponse);
    } else {
    // La transacción falló
    res.status(200).json(commitResponse);
      console.log('Error en la transaccion');
    }

    } catch (error) {

    console.error('Error al confirmar la transacción de Webpay:', error);
    // Maneja el error apropiadamente, por ejemplo, enviando una respuesta de error al cliente.
    res.status(500).json({ error: 'Error al confirmar la transacción de Webpay' });
  }

});

router.post('/AddDataUsuario', async (req, res) => {

  //local

  try {
    // Obtener datos del cuerpo de la solicitud
    const { id, nombre, apellido, correo, clave, foto, telefono } = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
    const query = `INSERT INTO usuario (id_usuario, nombre_usuario, apellido_usuario, correo_usuario, clave_usuario, foto_usuario, telefono_usuario) VALUES (@id, @nombre, @apellido, @correo, @clave, @foto, @telefono)`;
    
    // Crear una solicitud de consulta
    const request = new sql.Request(pool);
    request.input('id', sql.Numeric(18), id);
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('apellido', sql.VarChar(50), apellido);
    request.input('correo', sql.VarChar(50), correo);
    request.input('clave', sql.VarChar(50), clave);
    request.input('foto', sql.VarChar(50), foto);
    request.input('telefono', sql.VarChar(50), telefono);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }


  // Azure 
  /*
  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { nombre, apellido, correo, clave, foto, telefono } = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO Usuario (nombre_usuario, apellido_usuario, correo_usuario, clave_usuario, foto_usuario, telefono_usuario)
      VALUES (@nombre, @apellido, @correo, @clave, @foto, @telefono)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
  
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('apellido', sql.VarChar(50), apellido);
    request.input('correo', sql.VarChar(50), correo);
    request.input('clave', sql.VarChar(50), clave);
    request.input('foto', sql.VarChar(50), foto);
    request.input('telefono', sql.VarChar(50), telefono);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
  */

});

// Obtener datos de un usuario
router.get('/ObtenerUsuario/:id', async (req, res) => {

  //Local

  try {
    // Crear una nueva conexión a SQL Server
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
    const query = `SELECT * from usuario`;

    // Crear una solicitud de consulta
    const request = new sql.Request(pool);

    // Ejecutar la consulta
    const result = await request.query(query);

    // Cerrar la conexión
    await pool.close();

    // Devolver los datos obtenidos como respuesta JSON
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener datos de usuario', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }


  // Azure
  /*
  try {
    const { id } = req.params; // Obtén el ID del usuario desde los parámetros de la URL

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para obtener un usuario por su ID
    const query = `
      SELECT * FROM Usuario
      WHERE id_usuario = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    // Ejecutar la consulta
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Si se encuentra un usuario con el ID proporcionado, devuelve ese usuario
      const usuario = result.recordset[0];
      res.status(200).json(usuario);
    } else {
      // Si no se encuentra un usuario con el ID proporcionado, devuelve un mensaje de error
      res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Cerrar la conexión
    await pool.close();
  } catch (error) {
    console.error('Error al obtener el usuario de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
  */

});

// Obtener datos de todos los usuarios
router.get('/GetDataUsuarios', async (req, res) => {
  
  // Local 

  try {
    // Crear una nueva conexión a SQL Server
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
    const query = `SELECT * from usuario`;

    // Crear una solicitud de consulta
    const request = new sql.Request(pool);

    // Ejecutar la consulta
    const result = await request.query(query);

    // Cerrar la conexión
    await pool.close();

    // Devolver los datos obtenidos como respuesta JSON
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener datos de usuario', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

  // AZURE
  /*
    odbc.connect(connectionString, (err, connection) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
      }
    
      // Ejemplo: Ejecutar una consulta SQL
      connection.query('SELECT * FROM Usuario', (err, result) => {
        if (err) {
          console.error('Error al ejecutar la consulta:', err);
        } else {
          console.log('Resultado de la consulta:', result);
          res.status(200).json(result)
        }
    
        // Cierra la conexión
        connection.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
          }
        });
      });
    });
  */
  });

  // Actualizar data usuario
  router.put('/ActualizarDataUsuario/:id', async (req, res) => {

    try {
      const { nombre, apellido, correo, clave, foto, telefono } = req.body;
      const { id } = req.params; // Obtén el ID del usuario a actualizar desde los parámetros de la URL
  
      const pool = await sql.connect(configAzure);
      
      const query = `
        UPDATE Usuario
        SET nombre_usuario = @nombre, apellido_usuario = @apellido, correo_usuario = @correo, clave_usuario = @clave, foto_usuario = @foto, telefono_usuario = @telefono
        WHERE id_usuario = @id
      `;
  
      const request = pool.request();
    
      request.input('nombre', sql.VarChar(50), nombre);
      request.input('apellido', sql.VarChar(50), apellido);
      request.input('correo', sql.VarChar(50), correo);
      request.input('clave', sql.VarChar(50), clave);
      request.input('foto', sql.VarChar(50), foto);
      request.input('telefono', sql.VarChar(50), telefono);
      request.input('id', sql.Int, id);
  
      await request.query(query);
      await pool.close();
  
      res.status(200).json({ message: 'Datos actualizados con éxito' });
    } catch (error) {
      console.error('Error al actualizar datos en la base de datos', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
// Eliminar data usuario
router.delete('/EliminarDataUsuario/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID del usuario a eliminar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);
    
    const query = `
      DELETE FROM Usuario
      WHERE id_usuario = @id
    `;

    const request = pool.request();
  
    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar datos de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Ruta Transaccion

//Insertar datos
router.post('/AddDataTransaccion', async (req, res) => {

  //Local

  try {
    // Obtener datos del cuerpo de la solicitud
    const { campo1, campo2, campo3, campo4, campo5, campo6, campo7, campo8, campo9, campo10 } = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
    const query = `INSERT INTO Transaccion (id_transaccion, nombre_transaccion, monto_transaccion, estado_transaccion, notas_transaccion, fecha_transaccion, tipo_transaccion, id_tipo_pago, id_categoria, id_usuario) VALUES (@campo1, @campo2, @campo3, @campo4, @campo5, @campo6, @campo7, @campo8, @campo9, @campo10)`;
    
    // Crear una solicitud de consulta
    const request = new sql.Request(pool);

    request.input('campo1', sql.Numeric(18), campo1);
    request.input('campo2', sql.VarChar(50), campo2);
    request.input('campo3', sql.Numeric(18), campo3);
    request.input('campo4', sql.VarChar(50), campo4);
    request.input('campo5', sql.VarChar(50), campo5);
    request.input('campo6', sql.VarChar(50), campo6);
    request.input('campo7', sql.VarChar(50), campo7);
    request.input('campo8', sql.Numeric(18), campo8);
    request.input('campo9', sql.Numeric(18), campo9);
    request.input('campo10', sql.Numeric(18), campo10);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

  // Azure
  /*
  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const {nombre, monto, estado, notas, fecha, tipo, tipo_pago, id_categoria, id_usuario } = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO Transaccion (nombre_transaccion, monto_transaccion, estado_transaccion, notas_transaccion, fecha_transaccion, tipo_transaccion, id_tipo_pago, id_categoria, id_usuario)
      VALUES (@nombre, @monto, @estado, @notas, @fecha, @tipo, @tipo_pago, @id_categoria, @id_usuario)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('monto', sql.Numeric(18), monto);
    request.input('estado', sql.VarChar(50), estado);
    request.input('notas', sql.VarChar(50), notas);
    request.input('fecha', sql.VarChar(50), fecha);
    request.input('tipo', sql.VarChar(50), tipo);
    request.input('tipo_pago', sql.VarChar(50), tipo_pago);
    request.input('id_categoria', sql.Numeric(18), id_categoria);
    request.input('id_usuario', sql.Numeric(18), id_usuario);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
  */

});

// Obtener datos de todas las transacciones
router.get('/GetDataTransacciones', async (req, res) => {

  //Local

  try {
    // Crear una nueva conexión a SQL Server
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
    const query = `SELECT * from transaccion`;

    // Crear una solicitud de consulta
    const request = new sql.Request(pool);

    // Ejecutar la consulta
    const result = await request.query(query);

    // Cerrar la conexión
    await pool.close();

    // Devolver los datos obtenidos como respuesta JSON
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener datos de usuario', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

  // AZURE
  /*
  odbc.connect(connectionString, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
  
    // Ejemplo: Ejecutar una consulta SQL
    connection.query('SELECT * FROM Transaccion', (err, result) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
      } else {
        console.log('Resultado de la consulta:', result);
        res.status(200).json(result)
      }
  
      // Cierra la conexión
      connection.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      });
    });
  });
  */
});

// Obtener datos de 1 transaccion

router.get('/ObtenerTransaccion/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la transacción desde los parámetros de la URL

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para obtener una transacción por su ID
    const query = `
      SELECT * FROM Transaccion
      WHERE id_transaccion = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    // Ejecutar la consulta
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Si se encuentra una transacción con el ID proporcionado, devuelve esa transacción
      const transaccion = result.recordset[0];
      res.status(200).json(transaccion);
    } else {
      // Si no se encuentra una transacción con el ID proporcionado, devuelve un mensaje de error
      res.status(404).json({ message: 'Transacción no encontrada' });
    }

    // Cerrar la conexión
    await pool.close();
  } catch (error) {
    console.error('Error al obtener la transacción de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar data Transaccion

router.put('/ActualizarDataTransaccion/:id', async (req, res) => {
  try {
    const { nombre, monto, estado, notas, fecha, tipo, tipo_pago, id_categoria, id_usuario } = req.body;
    const { id } = req.params; // Obtén el ID de la transacción a actualizar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      UPDATE Transaccion
      SET nombre_transaccion = @nombre, monto_transaccion = @monto, estado_transaccion = @estado, notas_transaccion = @notas, fecha_transaccion = @fecha, tipo_transaccion = @tipo, id_tipo_pago = @tipo_pago, id_categoria = @id_categoria, id_usuario = @id_usuario
      WHERE id_transaccion = @id
    `;

    const request = pool.request();

    request.input('nombre', sql.VarChar(50), nombre);
    request.input('monto', sql.Numeric(18), monto);
    request.input('estado', sql.VarChar(50), estado);
    request.input('notas', sql.VarChar(50), notas);
    request.input('fecha', sql.VarChar(50), fecha);
    request.input('tipo', sql.VarChar(50), tipo);
    request.input('tipo_pago', sql.VarChar(50), tipo_pago);
    request.input('id_categoria', sql.Numeric(18), id_categoria);
    request.input('id_usuario', sql.Numeric(18), id_usuario);
    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de transacción actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar datos de transacción en la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar data transaccion
router.delete('/EliminarDataTransaccion/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la transacción a eliminar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      DELETE FROM Transaccion
      WHERE id_transaccion = @id
    `;

    const request = pool.request();

    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de transacción eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar datos de transacción de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

  // Ruta Categoria Transacciones *************

//Insertar datos
router.post('/AddDataCategoriaTransaccion', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const {nombre, id_subCategoria} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO Categoria_transaccion (nombre_categoria, id_subCategoria)
      VALUES (@nombre, @id_subCategoria)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('id_subCategoria', sql.Numeric(18), id_subCategoria);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

});

// Obtener datos de 1 categoria

router.get('/ObtenerCategoriaTransaccion/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la categoría de transacción desde los parámetros de la URL

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para obtener una categoría de transacción por su ID
    const query = `
      SELECT * FROM Categoria_transaccion
      WHERE id_categoria = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    // Ejecutar la consulta
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Si se encuentra una categoría de transacción con el ID proporcionado, devuelve esa categoría
      const categoriaTransaccion = result.recordset[0];
      res.status(200).json(categoriaTransaccion);
    } else {
      // Si no se encuentra una categoría de transacción con el ID proporcionado, devuelve un mensaje de error
      res.status(404).json({ message: 'Categoría de transacción no encontrada' });
    }

    // Cerrar la conexión
    await pool.close();
  } catch (error) {
    console.error('Error al obtener la categoría de transacción de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener datos de todas las categorias de transacciones
router.get('/GetDataCategoriaTransaccion', async (req, res) => {
    try {
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
      const query = `SELECT * from Categoria_transaccion`;
  
      // Crear una solicitud de consulta
      const request = new sql.Request(pool);
  
      // Ejecutar la consulta
      const result = await request.query(query);
  
      // Cerrar la conexión
      await pool.close();
  
      // Devolver los datos obtenidos como respuesta JSON
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener datos de usuario', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

// Actualizar Data Categoria Transaccion
router.put('/ActualizarDataCategoriaTransaccion/:id', async (req, res) => {
  try {
    const { nombre, id_subCategoria } = req.body;
    const { id } = req.params; // Obtén el ID de la categoría de transacción a actualizar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      UPDATE Categoria_transaccion
      SET nombre_categoria = @nombre, id_subCategoria = @id_subCategoria
      WHERE id_categoria = @id
    `;

    const request = pool.request();

    request.input('nombre', sql.VarChar(50), nombre);
    request.input('id_subCategoria', sql.Numeric(18), id_subCategoria);
    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de categoría de transacción actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar datos de categoría de transacción en la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar data Categoria Transaccion
router.delete('/EliminarDataCategoriaTransaccion/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la categoría de transacción a eliminar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      DELETE FROM Categoria_transaccion
      WHERE id_categoria = @id
    `;

    const request = pool.request();

    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de categoría de transacción eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar datos de categoría de transacción de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta SubCategoria Transaccion *************

//Insertar datos
router.post('/AddDataSubCategoriaTransaccion', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const {nombre, icon} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO SubCategoria_transaccion (nombre_subCategoria, icon_subCategoria)
      VALUES (@nombre, @icon)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
   
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('icon', sql.VarChar(50), icon);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

});

// Obtener 1 dato de SubCategoria Transaccion

router.get('/ObtenerSubCategoriaTransaccion/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la subcategoría de transacción desde los parámetros de la URL

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para obtener una subcategoría de transacción por su ID
    const query = `
      SELECT * FROM SubCategoria_transaccion
      WHERE id_subCategoria = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    // Ejecutar la consulta
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Si se encuentra una subcategoría de transacción con el ID proporcionado, devuelve esa subcategoría
      const subCategoriaTransaccion = result.recordset[0];
      res.status(200).json(subCategoriaTransaccion);
    } else {
      // Si no se encuentra una subcategoría de transacción con el ID proporcionado, devuelve un mensaje de error
      res.status(404).json({ message: 'Subcategoría de transacción no encontrada' });
    }

    // Cerrar la conexión
    await pool.close();
  } catch (error) {
    console.error('Error al obtener la subcategoría de transacción de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Obtener todos los datos de SubCategoria Transaccion
router.get('/GetDataSubCategoriaTransaccion', async (req, res) => {


  //Azure

  odbc.connect(connectionString, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
  
    // Ejemplo: Ejecutar una consulta SQL
    connection.query('SELECT * FROM SubCategoria_transaccion', (err, result) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
      } else {
        console.log('Resultado de la consulta:', result);
        res.status(200).json(result)
      }
  
      // Cierra la conexión
      connection.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      });
    });
  });

});

// Actualizar data Subcategoria Transaccion
router.put('/ActualizarDataSubCategoriaTransaccion/:id', async (req, res) => {
  try {
    const { nombre, icon } = req.body;
    const { id } = req.params; // Obtén el ID de la subcategoría de transacción a actualizar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      UPDATE SubCategoria_transaccion
      SET nombre_subCategoria = @nombre, icon_subCategoria = @icon
      WHERE id_subCategoria = @id
    `;

    const request = pool.request();

    request.input('nombre', sql.VarChar(50), nombre);
    request.input('icon', sql.VarChar(50), icon);
    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de subcategoría de transacción actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar datos de subcategoría de transacción en la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Eliminar data Subcategoria transaccion
router.delete('/EliminarDataSubCategoriaTransaccion/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la subcategoría de transacción a eliminar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      DELETE FROM SubCategoria_transaccion
      WHERE id_subCategoria = @id
    `;

    const request = pool.request();

    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de subcategoría de transacción eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar datos de subcategoría de transacción de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

  // Ruta Tipo Pago Transaccion *****************

//Insertar datos
router.post('/AddDataTipoPagoTransaccion', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const {nombre} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO TipoPago_transaccion (nombre_tipo_pago)
      VALUES (@nombre)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    
    request.input('nombre', sql.VarChar(50), nombre);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

});

// Obtener 1 dato de tipo pago
router.get('/ObtenerTipoPagoTransaccion/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID del tipo de pago de transacción desde los parámetros de la URL

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para obtener un tipo de pago de transacción por su ID
    const query = `
      SELECT * FROM TipoPago_transaccion
      WHERE id_tipo_pago = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    // Ejecutar la consulta
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Si se encuentra un tipo de pago de transacción con el ID proporcionado, devuelve ese tipo de pago
      const tipoPagoTransaccion = result.recordset[0];
      res.status(200).json(tipoPagoTransaccion);
    } else {
      // Si no se encuentra un tipo de pago de transacción con el ID proporcionado, devuelve un mensaje de error
      res.status(404).json({ message: 'Tipo de pago de transacción no encontrado' });
    }

    // Cerrar la conexión
    await pool.close();
  } catch (error) {
    console.error('Error al obtener el tipo de pago de transacción de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los datos tipo pago
router.get('/GetDataTipoPagoTransaccion', async (req, res) => {

  // Azure

  odbc.connect(connectionString, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
  
    // Ejemplo: Ejecutar una consulta SQL
    connection.query('SELECT * FROM TipoPago_transaccion', (err, result) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
      } else {
        console.log('Resultado de la consulta:', result);
        res.status(200).json(result)
      }
  
      // Cierra la conexión
      connection.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      });
    });
  });

});

// Actualizar data tipo pago transaccion
router.put('/ActualizarDataTipoPagoTransaccion/:id', async (req, res) => {
  try {
    const { nombre } = req.body;
    const { id } = req.params; // Obtén el ID del tipo de pago de transacción a actualizar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      UPDATE TipoPago_transaccion
      SET nombre_tipo_pago = @nombre
      WHERE id_tipo_pago = @id
    `;

    const request = pool.request();

    request.input('nombre', sql.VarChar(50), nombre);
    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de tipo de pago de transacción actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar datos de tipo de pago de transacción en la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar data tipo pago transaccion
router.delete('/EliminarDataTipoPagoTransaccion/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID del tipo de pago de transacción a eliminar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      DELETE FROM TipoPago_transaccion
      WHERE id_tipo_pago = @id
    `;

    const request = pool.request();

    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de tipo de pago de transacción eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar datos de tipo de pago de transacción de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

  // Ruta Negocio

//Insertar datos
router.post('/AddDataNegocio', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const {nombre, foto, id_usuario} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO Negocio (nombre_negocio, foto_negocio, id_usuario)
      VALUES (@nombre, @foto, @id_usuario)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('foto', sql.VarChar(50), foto);
    request.input('id_usuario', sql.Numeric(18), id_usuario);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

});

// Obtener 1 negocio

router.get('/ObtenerNegocio/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID del negocio desde los parámetros de la URL

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para obtener un negocio por su ID
    const query = `
      SELECT * FROM Negocio
      WHERE id_negocio = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    // Ejecutar la consulta
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Si se encuentra un negocio con el ID proporcionado, devuelve ese negocio
      const negocio = result.recordset[0];
      res.status(200).json(negocio);
    } else {
      // Si no se encuentra un negocio con el ID proporcionado, devuelve un mensaje de error
      res.status(404).json({ message: 'Negocio no encontrado' });
    }

    // Cerrar la conexión
    await pool.close();
  } catch (error) {
    console.error('Error al obtener el negocio de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los negocios
router.get('/GetDataNegocio', async (req, res) => {

  // Azure

  odbc.connect(connectionString, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
  
    // Ejemplo: Ejecutar una consulta SQL
    connection.query('SELECT * FROM Negocio', (err, result) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
      } else {
        console.log('Resultado de la consulta:', result);
        res.status(200).json(result)
      }
  
      // Cierra la conexión
      connection.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      });
    });
  });

});

// Actualizar data negocio
router.put('/ActualizarDataNegocio/:id', async (req, res) => {
  try {
    const { nombre, foto, id_usuario } = req.body;
    const { id } = req.params; // Obtén el ID del negocio a actualizar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      UPDATE Negocio
      SET nombre_negocio = @nombre, foto_negocio = @foto, id_usuario = @id_usuario
      WHERE id_negocio = @id
    `;

    const request = pool.request();

    request.input('nombre', sql.VarChar(50), nombre);
    request.input('foto', sql.VarChar(50), foto);
    request.input('id_usuario', sql.Numeric(18), id_usuario);
    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de negocio actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar datos de negocio en la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar data negocio
router.delete('/EliminarDataNegocio/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID del negocio a eliminar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      DELETE FROM Negocio
      WHERE id_negocio = @id
    `;

    const request = pool.request();

    request.input('id', sql.Int, id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de negocio eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar datos de negocio de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

  // Ruta Producto **********************************

//Insertar datos
router.post('/AddDataProducto', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { id, nombre, precio, costo, stock, unidadMedida, fechaCreacion, fechModificacion, img, estado, decripcion, id_categoria, id_negocio} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO Producto (id_producto, nombre_producto, precio_producto, costo_producto, stock_producto,unidadMedida_producto,fechaCreacion_producto, fechaModificacion_producto, img_producto, estado_producto, descripcion_producto, id_categoria_producto, id_negocio)
      VALUES (@id, @nombre, @precio, @costo, @stock, @unidadMedida, @fechaCreacion, @fechaModificacion, @img, @estado, @descripcion, @id_categoria, @id_negocio)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    request.input('id', sql.Numeric(18), id);
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('precio', sql.Numeric(50), precio);
    request.input('costo', sql.Numeric(18), costo);
    request.input('stock', sql.Numeric(18), stock);
    request.input('unidadMedida', sql.VarChar(50), unidadMedida);
    request.input('fechaCreacion', sql.VarChar(50), fechaCreacion);
    request.input('fechaModificacion', sql.VarChar(50), fechaModificacion);
    request.input('img', sql.VarChar(50), img);
    request.input('estado', sql.VarChar(50), estado);
    request.input('descripcion', sql.VarChar(50), descripcion);
    request.input('id_categoria', sql.Numeric(18), id_categoria);
    request.input('id_negocio', sql.Numeric(18), id_negocio);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

});

// Obtener 1 producto

router.get('/ObtenerProducto/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID del producto desde los parámetros de la URL

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para obtener un producto por su ID
    const query = `
      SELECT * FROM Producto
      WHERE id_producto = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    // Ejecutar la consulta
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Si se encuentra un producto con el ID proporcionado, devuelve ese producto
      const producto = result.recordset[0];
      res.status(200).json(producto);
    } else {
      // Si no se encuentra un producto con el ID proporcionado, devuelve un mensaje de error
      res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Cerrar la conexión
    await pool.close();
  } catch (error) {
    console.error('Error al obtener el producto de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los productos
router.get('/GetDataProducto', async (req, res) => {

  // Azure

  odbc.connect(connectionString, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
  
    // Ejemplo: Ejecutar una consulta SQL
    connection.query('SELECT * FROM Producto', (err, result) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
      } else {
        console.log('Resultado de la consulta:', result);
        res.status(200).json(result)
      }
  
      // Cierra la conexión
      connection.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      });
    });
  });

});

// Actualizar data producto
router.put('/ActualizarDataProducto/:id', async (req, res) => {
  try {
    const { id, nombre, precio, costo, stock, unidadMedida, fechaCreacion, fechaModificacion, img, estado, descripcion, id_categoria, id_negocio } = req.body;
    const { id: productoId } = req.params; // Obtén el ID del producto a actualizar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      UPDATE Producto
      SET id_producto = @id, nombre_producto = @nombre, precio_producto = @precio, costo_producto = @costo, stock_producto = @stock, unidadMedida_producto = @unidadMedida, fechaCreacion_producto = @fechaCreacion, fechaModificacion_producto = @fechaModificacion, img_producto = @img, estado_producto = @estado, descripcion_producto = @descripcion, id_categoria_producto = @id_categoria, id_negocio = @id_negocio
      WHERE id_producto = @productoId
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('precio', sql.Numeric(50), precio);
    request.input('costo', sql.Numeric(18), costo);
    request.input('stock', sql.Numeric(18), stock);
    request.input('unidadMedida', sql.VarChar(50), unidadMedida);
    request.input('fechaCreacion', sql.VarChar(50), fechaCreacion);
    request.input('fechaModificacion', sql.VarChar(50), fechaModificacion);
    request.input('img', sql.VarChar(50), img);
    request.input('estado', sql.VarChar(50), estado);
    request.input('descripcion', sql.VarChar(50), descripcion);
    request.input('id_categoria', sql.Numeric(18), id_categoria);
    request.input('id_negocio', sql.Numeric(18), id_negocio);
    request.input('productoId', sql.Numeric(18), productoId);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de producto actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar datos de producto en la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar data producto
router.delete('/EliminarDataProducto/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID del producto a eliminar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      DELETE FROM Producto
      WHERE id_producto = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de producto eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar datos de producto de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

  // Ruta Categoria Producto ************************

//Insertar datos
router.post('/AddDataCategoriaProducto', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const {nombre, icon} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO Categoria_producto (nombre_categoria, icon_categoria)
      VALUES (@id, @nombre, @icon)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
   
    request.input('nombre', sql.VarChar(50), nombre);
    request.input('icon', sql.VarChar(50), icon);

    // Ejecutar la consulta
    await request.query(query);

    // Cerrar la conexión
    await pool.close();

    res.status(200).json({ message: 'Datos agregados con éxito' });
  } catch (error) {
    console.error('Error al agregar datos a la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

});

// Obtener 1 categoria de producto

router.get('/ObtenerCategoriaProducto/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la categoría de producto desde los parámetros de la URL

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para obtener una categoría de producto por su ID
    const query = `
      SELECT * FROM Categoria_producto
      WHERE id_categoria = @id
    `;

    const request = pool.request();
    request.input('id', sql.Numeric(18), id);

    // Ejecutar la consulta
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Si se encuentra una categoría de producto con el ID proporcionado, devuelve esa categoría de producto
      const categoriaProducto = result.recordset[0];
      res.status(200).json(categoriaProducto);
    } else {
      // Si no se encuentra una categoría de producto con el ID proporcionado, devuelve un mensaje de error
      res.status(404).json({ message: 'Categoría de producto no encontrada' });
    }

    // Cerrar la conexión
    await pool.close();
  } catch (error) {
    console.error('Error al obtener la categoría de producto de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todas categorias de productos
router.get('/GetDataCategoriaProducto', async (req, res) => {

  // Azure

  odbc.connect(connectionString, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
  
    // Ejemplo: Ejecutar una consulta SQL
    connection.query('SELECT * FROM Categoria_producto', (err, result) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
      } else {
        console.log('Resultado de la consulta:', result);
        res.status(200).json(result)
      }
  
      // Cierra la conexión
      connection.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      });
    });
  });

});

// Actualizar data categoria producto
router.put('/ActualizarDataCategoriaProducto/:id', async (req, res) => {
  try {
    const { nombre, icon } = req.body;
    const { id } = req.params; // Obtén el ID de la categoría de producto a actualizar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      UPDATE Categoria_producto
      SET nombre_categoria = @nombre, icon_categoria = @icon
      WHERE id_categoria = @id
    `;

    const request = pool.request();

    request.input('nombre', sql.VarChar(50), nombre);
    request.input('icon', sql.VarChar(50), icon);
    request.input('id', sql.Numeric(18), id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de categoría de producto actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar datos de categoría de producto en la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar data categoria producto
router.delete('/EliminarDataCategoriaProducto/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la categoría de producto a eliminar desde los parámetros de la URL

    const pool = await sql.connect(configAzure);

    const query = `
      DELETE FROM Categoria_producto
      WHERE id_categoria = @id
    `;

    const request = pool.request();

    request.input('id', sql.Numeric(18), id);

    await request.query(query);
    await pool.close();

    res.status(200).json({ message: 'Datos de categoría de producto eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar datos de categoría de producto de la base de datos', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar el servidor en un puerto específico
const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});