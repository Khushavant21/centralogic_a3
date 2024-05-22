import axios from 'axios';
import Weather from './userModel';
const weatherApiKey = '571780a8bamsh424eceae8074a65p19fc18jsn4b2121fc6b58';

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

  const response = await axios.get(url, {
    headers: {
      'X-Api-Key': "571780a8bamsh424eceae8074a65p19fc18jsn4b2121fc6b58",
      'accept': 'application/json'
    }
  });

  const data = response.data;
  if (data.length > 0) {
    return data[0] as GeoLocation;
  } else {
    throw new Error(`No coordinates found for ${city}, ${country}`);
  }
};

const getWeather = async (latitude: number, longitude: number): Promise<WeatherData> => {
  const options = {
    method: 'GET',
    url: 'https://weatherapi-com.p.rapidapi.com/current.json',
    params: { q: `${latitude},${longitude}` },
    headers: {
      'X-RapidAPI-Key': weatherApiKey,
      'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
    }
  };

  const response = await axios.request(options);
  return response.data as WeatherData;
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
    return Weather.sequelize.query(latestWeatherSubQuery, {
      model: Weather,
      mapToModel: true,
    });
  }
};
