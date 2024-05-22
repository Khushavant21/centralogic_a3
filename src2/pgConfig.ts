import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('weather_data', 'postgres', 'khush@123', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
});

sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

sequelize.sync()
  .then(() => {
    console.log('Models synchronized with the database.');
  })
  .catch((err) => {
    console.error('Unable to synchronize models with the database:', err);
  });

export default sequelize;
