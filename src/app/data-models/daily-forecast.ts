export interface DailyForecast {
  date: string;
  index: number;
  temperature: {
    min: number;
    max: number;
  };
  threeHourPartitions: ThreeHourForecast[];
  weather: WeatherCondition;
}

export interface ThreeHourForecast {
  dt_txt: string;
  isDaylight: boolean;
  localTime: Date;
  main: {
    humidity: number;
    pressure: number;
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: WeatherCondition[];
  wind: {
    speed: number;
    deg: number;
  };
  rain: {
    '3h': number;
  };
}

export interface WeatherCondition {
  description: string;
  icon: string;
}
