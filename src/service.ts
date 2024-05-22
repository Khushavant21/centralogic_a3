import { get } from 'https';
import { IncomingMessage } from 'http';
import { Op, Sequelize } from 'sequelize';
import Weather from './userModel';
import sequelize from './pgConfig';


interface GeoLocation {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  current: {
    condition: {
      text: string;
    };
  };
}

const getCoordinates = async (city: string, country: string): Promise<GeoLocation> => {
  const url = `https://api.api-ninjas.com/v1/geocoding?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;

  return new Promise((resolve, reject) => {
    const req = get(url, { headers: { 'X-Api-Key': "571780a8bamsh424eceae8074a65p19fc18jsn4b2121fc6b58", 'accept': 'application/json' } }, (res: IncomingMessage) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData[0] as GeoLocation);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

const getWeather = async (latitude: number, longitude: number): Promise<WeatherData> => {
  const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${latitude},${longitude}`;

  return new Promise((resolve, reject) => {
    const req = get(url, {
      headers: {
        'X-RapidAPI-Key': weatherApiKey,
        'accept': 'application/json'
      }
    }, (res: IncomingMessage) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData as WeatherData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

export const saveWeatherData = async (cities: { city: string, country: string }[]) => {
  for (const { city, country } of cities) {
    try {
      const { latitude, longitude } = await getCoordinates(city, country);
      const weatherData = await getWeather(latitude, longitude);

      await Weather.create({
        city,
        country,
        weather: weatherData.current.condition.text,
        time: new Date(),
        longitude,
        latitude,
      });
    } catch (error) {
      console.error(`Failed to process ${city}, ${country}:`, error);
    }
  }
};

export const getWeatherData = async (city?: string) => {
  if (city) {
    return Weather.findAll({
      where: { city },
      order: [['time', 'DESC']],
    });
  } else {
    const latestWeatherSubQuery = `
      SELECT DISTINCT ON (city) id, city, country, weather, time
      FROM "Weathers"
      ORDER BY city, time DESC
    `;
    return sequelize.query(latestWeatherSubQuery, {
      model: Weather,
      mapToModel: true,
    });
  }
};
