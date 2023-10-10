// Librerias
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const app = express();

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
router.post('/AddDataUsuario', async (req, res) => {

  // Azure 

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { id, nombre, apellido, correo, clave, foto, telefono } = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO usuario (id_usuario, nombre_usuario, apellido_usuario, correo_usuario, clave_usuario, foto_usuario, telefono_usuario)
      VALUES (@id, @nombre, @apellido, @correo, @clave, @foto, @telefono)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
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


  // Local Database
  /*
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
    */
});

// Obtener datos
router.get('/GetDataUsuario', async (req, res) => {
   
    // AZURE

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


    // Local DataBase
    /*
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
    */
  
  });

router.put('/ChangeDataUsuario'), async (req, res) => {








}

router.delete('/DeleteDataUsuario'), async (req, res) => {







  
}




// Ruta Transaccion

//Insertar datos
router.post('/AddDataTransaccion', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { id, nombre, monto, estado, notas, fecha, tipo, tipo_pago, id_categoria, id_usuario } = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO usuario (id_transaccion, nombre_transaccion, monto_transaccion, estado_transaccion, notas_transaccion, fecha_transaccion, tipo_transaccion, id_tipo_pago, id_categoria, id_usuario)
      VALUES (@id, @nombre, @monto, @estado, @notas, @fecha, @tipo, @tipo_pago, @id_categoria, @id_usuario)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    request.input('id', sql.Numeric(18), id);
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


  // Local Database
  /*
    try {
      // Obtener datos del cuerpo de la solicitud
      const { id, nombre, monto, estado, notas, fecha, tipo_transaccion, id_tipo_pago, id_categoria, id_usuario } = req.body;
  
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
      const query = `INSERT INTO Transaccion (id_transaccion, nombre_transaccion, monto_transaccion, estado_transaccion, notas_transaccion, fecha_transaccion, tipo_transaccion, id_tipo_pago, id_categoria, id_usuario) VALUES (@campo1, @campo2, @campo3, @campo4, @campo5, @campo6, @campo7, @campo8, @campo9, @campo10)`;
      
      // Crear una solicitud de consulta
      const request = new sql.Request(pool);

      request.input('id', sql.Numeric(18), id);
      request.input('nombre', sql.VarChar(50), nombre);
      request.input('monto', sql.Numeric(18), monto);
      request.input('estado', sql.VarChar(50), estado);
      request.input('notas', sql.VarChar(50), notas);
      request.input('fecha', sql.VarChar(50), fecha);
      request.input('tipo_transaccion', sql.VarChar(50), tipo_transaccion);
      request.input('id_tipo_pago', sql.Numeric(18), id_tipo_pago);
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

// Obtener datos
router.get('/GetDataTransaccion', async (req, res) => {

  // AZURE

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

  

  // Local DataBase
  /*
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
    */
  });

  // Ruta Categoria Transacciones *************

//Insertar datos
router.post('/AddDataCategoriaTransaccion', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { id, nombre, id_subCategoria} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO usuario (id_categoria, nombre_categoria, id_subCategoria)
      VALUES (@id, @nombre, @id_subCategoria)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    request.input('id', sql.Numeric(18), id);
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


  // Local Database
  /*
    try {
      // Obtener datos del cuerpo de la solicitud
      const { campo1, campo2, campo3 } = req.body;
  
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
      const query = `INSERT INTO Categoria_transacciones (id_categoria, nombre_categoria, idSubCategoria) VALUES (@campo1, @campo2, @campo3)`;
      
      // Crear una solicitud de consulta
      const request = new sql.Request(pool);

      request.input('campo1', sql.Numeric(18), campo1);
      request.input('campo2', sql.VarChar(50), campo2);
      request.input('campo3', sql.Numeric(18), campo3);
  
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

// Obtener datos
router.get('/GetDataCategoriaTransaccion', async (req, res) => {
    try {
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
      const query = `SELECT * from Categoria_transacciones`;
  
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

// Ruta SubCategoria Transaccion *************

//Insertar datos
router.post('/AddDataSubCategoriaTransaccion', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { id, nombre, icon} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO usuario (id_subCategoria, nombre_subCategoria, icon_subCategoria)
      VALUES (@id, @nombre, @icon)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    request.input('id', sql.Numeric(18), id);
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

  // local Database
  /*
    try {
      // Obtener datos del cuerpo de la solicitud
      const { campo1, campo2, campo3 } = req.body;
  
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
      const query = `INSERT INTO SubCategoria_transacciones (id_subCategoria, nombre_subCategoria, icon_subCategoria) VALUES (@campo1, @campo2, @campo3)`;
      
      // Crear una solicitud de consulta
      const request = new sql.Request(pool);

      request.input('campo1', sql.Numeric(18), campo1);
      request.input('campo2', sql.VarChar(50), campo2);
      request.input('campo3', sql.VarChar(50), campo3);
  
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

// Obtener datos
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

  // local dataBase
  /*
    try {
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
      const query = `SELECT * from SubCategoria_transacciones`;
  
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
    */
  });

  // Ruta Tipo Pago Transaccion *****************

//Insertar datos
router.post('/AddDataTipoPagoTransaccion', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { id, nombre} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO usuario (id_tipo_pago, nombre_tipo_pago)
      VALUES (@id, @nombre)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    request.input('id', sql.Numeric(18), id);
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

  // local Database
  /*
    try {
      // Obtener datos del cuerpo de la solicitud
      const { campo1, campo2} = req.body;
  
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
      const query = `INSERT INTO Tipo_pago_transaccion (id_tipo_pago, nombre_tipo_pago) VALUES (@campo1, @campo2)`;
      
      // Crear una solicitud de consulta
      const request = new sql.Request(pool);

      request.input('campo1', sql.Numeric(18), campo1);
      request.input('campo2', sql.VarChar(50), campo2);
  
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

// Obtener datos
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


  // local Database
  /*
    try {
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
      const query = `SELECT * from Tipo_pago_transaccion`;
  
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
    */
  });

  // Ruta Negocio

//Insertar datos
router.post('/AddDataNegocio', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { id, nombre, foto, id_usuario} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO usuario (id_negocio, nombre_negocio, foto_negocio, id_usuario)
      VALUES (@id, @nombre, @foto, @id_usuario)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    request.input('id', sql.Numeric(18), id);
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


  // local Database
  /*
    try {
      // Obtener datos del cuerpo de la solicitud
      const { campo1, campo2, campo3, campo4} = req.body;
  
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
      const query = `INSERT INTO Negocio (id_negocio, nombre_negocio, foto_negocio, id_usuario) VALUES (@campo1, @campo2, @campo3, @campo4)`;
      
      // Crear una solicitud de consulta
      const request = new sql.Request(pool);

      request.input('campo1', sql.Numeric(18), campo1);
      request.input('campo2', sql.VarChar(50), campo2);
      request.input('campo3', sql.VarChar(50), campo3);
      request.input('campo4', sql.Numeric(18), campo4);
  
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

// Obtener datos
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


  // local Database
  /*
    try {
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
      const query = `SELECT * from Negocio`;
  
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
    */
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
      INSERT INTO usuario (id_producto, nombre_producto, precio_producto, costo_producto, stock_producto,unidadMedida_producto,fechaCreacion_producto, fechaModificacion_producto, img_producto, estado_producto, descripcion_producto, id_categoria_producto, id_negocio)
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



  // local Database
  /*
    try {
      // Obtener datos del cuerpo de la solicitud
      const { campo1, campo2, campo3, campo4, campo5, campo6, campo7, campo8, campo9, campo10, campo11, campo12 } = req.body;
  
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
      const query = `INSERT INTO Producto (id_producto, nombre_producto, precio_producto, costo_producto, stock_producto, unidadMedidaProducto, fechaCreacion_producto, img_producto, estado_producto, descripcion_producto, id_categoria_producto, id_negocio) VALUES (@campo1, @campo2, @campo3, @campo4, @campo5, @campo6, @campo7, @campo8, @campo9, @campo10, @campo11, @campo12)`;
      
      // Crear una solicitud de consulta
      const request = new sql.Request(pool);

      request.input('campo1', sql.Numeric(18), campo1);
      request.input('campo2', sql.VarChar(50), campo2);
      request.input('campo3', sql.Numeric(18), campo3);
      request.input('campo4', sql.Numeric(18), campo4);
      request.input('campo5', sql.Numeric(18), campo5);
      request.input('campo6', sql.VarChar(50), campo6);
      request.input('campo7', sql.VarChar(50), campo7);
      request.input('campo8', sql.VarChar(50), campo8);
      request.input('campo9', sql.VarChar(50), campo9);
      request.input('campo10', sql.VarChar(50), campo10);
      request.input('campo11', sql.Numeric(18), campo11);
      request.input('campo12', sql.Numeric(18), campo12);
  
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

// Obtener datos
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

  // local Database
  /*
    try {
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
      const query = `SELECT * from Producto`;
  
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
    */
  });

  // Ruta Categoria Producto ************************

//Insertar datos
router.post('/AddDataCategoriaProducto', async (req, res) => {

  // Azure

  try {
    // Obtén los datos del cuerpo de la solicitud POST
    const { id, nombre, icon} = req.body;

    // Crear una nueva conexión a SQL Server
    const pool = await sql.connect(configAzure);

    // Consulta SQL para insertar datos en la tabla
    const query = `
      INSERT INTO usuario (id_categoria, nombre_categoria, icon_categoria)
      VALUES (@id, @nombre, @icon)
    `;

    // Crear una solicitud de consulta
    const request = pool.request();
    request.input('id', sql.Numeric(18), id);
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

  // local Database
  /*
    try {
      // Obtener datos del cuerpo de la solicitud
      const { campo1, campo2, campo3} = req.body;
  
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para insertar datos en la tabla (reemplaza con tus columnas y nombres de tabla)
      const query = `INSERT INTO Categoria_producto (id_categoria, nombre_categoria, icon_categoria) VALUES (@campo1, @campo2, @campo3)`;
      
      // Crear una solicitud de consulta
      const request = new sql.Request(pool);

      request.input('campo1', sql.Numeric(18), campo1);
      request.input('campo2', sql.VarChar(50), campo2);
      request.input('campo3', sql.VarChar(50), campo3);
  
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

// Obtener datos
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

  // local Database
  /*
    try {
      // Crear una nueva conexión a SQL Server
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
  
      // Consulta SQL para obtener datos de usuario (reemplaza con tus columnas y nombres de tabla)
      const query = `SELECT * from Categoria_producto`;
  
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
    */
  });

// Rutas de ejemplo
router.get('/insertDataTest', (req, res) => {

    async function insertData() {

        const pool = new sql.ConnectionPool(config);
        try {
          await pool.connect();
          const request = new sql.Request(pool);

          await request.query("INSERT INTO usuario VALUES (10, 'User5', 'Generic','test_correo@gmail.com',1234,'img','99999999')");

          console.log('Datos insertados con éxito');
        } catch (err) {
          console.error('Error al ejecutar la consulta de inserción', err);
        } finally {
          // Siempre cierra la conexión, incluso si ocurrió un error
          await pool.close();
        }
    }
      
    insertData();

});


// Iniciar el servidor en un puerto específico
const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});