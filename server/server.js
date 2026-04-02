require('dotenv').config();
const mysqlApp = require('./server-mysql.js');

mysqlApp.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 MySQL/Knex Server running on port ${process.env.PORT || 3000}`);
  console.log(`API endpoints: /api/products, /api/orders, /api/customers, /api/health`);
});

