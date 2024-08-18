module.exports = {
  client: 'sqlite3',
  connection: {
    filename: './my-database-file.sqlite'
  },
  useNullAsDefault: true,
  migrations: {
    directory: './migrations'
  }
};