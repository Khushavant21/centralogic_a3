import express, { Request, Response } from 'express';
import sequelize from './pgConfig';
import { saveWeatherData, getWeatherData } from './service';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/SaveWeatherMapping', async (req: Request, res: Response) => {
  const cities = req.body;
  try {
    await saveWeatherData(cities);
    res.status(200).send('Weather data saved successfully.');
  } catch (error) {
    console.error('Error occurred while saving weather data:', error);
    res.status(500).send('An error occurred while saving weather data.');
  }
});

app.get('/api/weatherDashboard', async (req: Request, res: Response) => {
  const { city } = req.query;
  try {
    const weatherData = await getWeatherData(city as string);
    res.status(200).json(weatherData);
  } catch (error) {
    console.error('Error occurred while fetching weather data:', error);
    res.status(500).send('An error occurred while fetching weather data.');
  }
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Unable to connect to the database:', error.message);
});
