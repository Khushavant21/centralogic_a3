"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherData = exports.saveWeatherData = void 0;
const https_1 = require("https");
const userModel_1 = __importDefault(require("./userModel"));
const pgConfig_1 = __importDefault(require("./pgConfig"));
const geoCodingApiKey = 'YOUR_GEOCODING_API_KEY';
const weatherApiKey = 'YOUR_WEATHER_API_KEY';
const getCoordinates = (city, country) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.api-ninjas.com/v1/geocoding?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
    return new Promise((resolve, reject) => {
        const req = (0, https_1.get)(url, { headers: { 'X-Api-Key': geoCodingApiKey, 'accept': 'application/json' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData[0]);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
        req.end();
    });
});
const getWeather = (latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${latitude},${longitude}`;
    return new Promise((resolve, reject) => {
        const req = (0, https_1.get)(url, {
            headers: {
                'X-RapidAPI-Key': weatherApiKey,
                'accept': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
        req.end();
    });
});
const saveWeatherData = (cities) => __awaiter(void 0, void 0, void 0, function* () {
    for (const { city, country } of cities) {
        try {
            const { latitude, longitude } = yield getCoordinates(city, country);
            const weatherData = yield getWeather(latitude, longitude);
            yield userModel_1.default.create({
                city,
                country,
                weather: weatherData.current.condition.text,
                time: new Date(),
                longitude,
                latitude,
            });
        }
        catch (error) {
            console.error(`Failed to process ${city}, ${country}:`, error);
        }
    }
});
exports.saveWeatherData = saveWeatherData;
const getWeatherData = (city) => __awaiter(void 0, void 0, void 0, function* () {
    if (city) {
        return userModel_1.default.findAll({
            where: { city },
            order: [['time', 'DESC']],
        });
    }
    else {
        const latestWeatherSubQuery = `
      SELECT DISTINCT ON (city) id, city, country, weather, time
      FROM "Weathers"
      ORDER BY city, time DESC
    `;
        return pgConfig_1.default.query(latestWeatherSubQuery, {
            model: userModel_1.default,
            mapToModel: true,
        });
    }
});
exports.getWeatherData = getWeatherData;
//# sourceMappingURL=service.js.map