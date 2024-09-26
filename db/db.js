require('dotenv').config({ path:__dirname +'/../.env'});

const sql = require('mssql');


const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT,10),
    options: {
      encrypt: true,
      enableArithAbort:true,
      trustServerCertificate: true 
    }
};


sql.connect(config,error =>{
  if(error){
    console.error('Database connection failed: ',error)
    process.exit(1);
  }else{
    console.log('Connected to SQL Server')
  }
})


module.exports = sql
