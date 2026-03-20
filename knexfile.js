// knexfile.js
module.exports = {
  development: {
      client: 'mysql2',
          connection: {
                host: '127.0.0.1',      // Usually localhost on shared hosting
                      user: 'royalvol_todysec',   // Created in cPanel/Control Panel
                            password: '1Youcannotchange!.!.',
                                  database: 'royalvol_tody',
                                      },
                                          pool: { min: 0, max: 7 }  // Shared hosting often limits connections
                                            }
                                            };
                                            