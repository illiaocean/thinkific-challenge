import { of } from 'rxjs';
import { DailyForecast } from 'src/app/data-models/daily-forecast';

import { WeatherLocation } from 'src/app/data-models/weather-location';
import { ApiConfig } from 'src/config/api.config';
import { OpenWeatherService } from './open-weather.service';

const getWeatherMockData = () => {
  return [
    {
      dt_txt: '2019-08-05 07:00:00',
      main: {
        temp_min: 290,
        temp_max: 293
      },
      weather: [
        {
          icon: '01d',
          description: 'sunny'
        }
      ]
    },
    {
      dt_txt: '2019-08-05 10:00:00',
      main: {
        temp_min: 288,
        temp_max: 290
      },
      weather: [
        {
          icon: '02d',
          description: 'scattered clouds'
        }
      ]
    },
    {
      dt_txt: '2019-08-05 13:00:00',
      main: {
        temp_min: 285,
        temp_max: 288
      },
      weather: [
        {
          icon: '02d',
          description: 'scattered clouds'
        }
      ]
    },
    {
      dt_txt: '2019-08-05 16:00:00',
      main: {
        temp_min: 281,
        temp_max: 285
      },
      weather: [
        {
          icon: '09d',
          description: 'showers'
        }
      ]
    },
    {
      dt_txt: '2019-08-05 19:00:00',
      main: {
        temp_min: 280,
        temp_max: 281
      },
      weather: [
        {
          icon: '09d',
          description: 'showers'
        }
      ]
    },
    {
      dt_txt: '2019-08-05 22:00:00',
      main: {
        temp_min: 280,
        temp_max: 281
      },
      weather: [
        {
          icon: '09n',
          description: 'showers'
        }
      ]
    },
    {
      dt_txt: '2019-08-06 01:00:00',
      main: {
        temp_min: 281,
        temp_max: 285
      },
      weather: [
        {
          icon: '10d',
          description: 'scattered cloud'
        }
      ]
    },
    {
      dt_txt: '2019-08-06 04:00:00',
      main: {
        temp_min: 285,
        temp_max: 290
      },
      weather: [
        {
          icon: '03d',
          description: 'clouds'
        }
      ]
    },
    {
      dt_txt: '2019-08-06 07:00:00',
      main: {
        temp_min: 290,
        temp_max: 294
      },
      weather: [
        {
          icon: '03d',
          description: 'clouds'
        }
      ]
    },
    {
      dt_txt: '2019-08-06 10:00:00',
      main: {
        temp_min: 294,
        temp_max: 299
      },
      weather: [
        {
          icon: '03d',
          description: 'clouds'
        }
      ]
    },
    {
      dt_txt: '2019-08-06 13:00:00',
      main: {
        temp_min: 290,
        temp_max: 294
      },
      weather: [
        {
          icon: '01n',
          description: 'clear sky'
        }
      ]
    },
    {
      dt_txt: '2019-08-06 16:00:00',
      main: {
        temp_min: 275,
        temp_max: 280
      },
      weather: [
        {
          icon: '01n',
          description: 'clear sky'
        }
      ]
    }
  ];
};

describe('OpenWeatherService', () => {
  let service: OpenWeatherService;
  const httpMock = jasmine.createSpyObj('HttpClient', ['get']);

  beforeEach(() => {
    service = new OpenWeatherService(httpMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('method: getUrl', () => {
    it('should construct URL with given endpoint and query params', () => {
      const url = OpenWeatherService.getUrl('endpoint', {
        param1: 'value1',
        param2: 'value2'
      });
      expect(url).toEqual(`${ApiConfig.OpenWeather.API}endpoint?APPID=${ApiConfig.OpenWeather.APP_ID}&param1=value1&param2=value2`);
    });
  });

  describe('method: getFiveDayForecast', () => {
    const testUrl = 'test-url';
    let location;
    let mockData;
    let mockResponse;

    beforeEach(() => {
      spyOn(OpenWeatherService, 'getUrl').and.returnValue(testUrl);
      location = {
        coords: {
          lat: 10,
          lon: 20
        }
      } as WeatherLocation;
      mockData = [];
    });

    it('should retrieve forecast from 2.5 endpoint', () => {
      mockResponse = {
        cod: '200',
        list: mockData
      };
      httpMock.get.and.returnValue(of(mockResponse));
      service.getFiveDayForecast(location).subscribe(() => {
        expect(OpenWeatherService.getUrl).toHaveBeenCalledWith('data/2.5/forecast', location.coords);
        expect(httpMock.get).toHaveBeenCalledWith(testUrl);
      }, (error) => {
        fail(error);
      });
    });

    it('should handle errors', () => {
      mockResponse = {
        cod: '500'
      };
      httpMock.get.and.returnValue(of(mockResponse));
      service.getFiveDayForecast(location).subscribe(() => {
        fail('Observable should not have succeeded.');
      }, (error) => {
        expect(error.toString().includes('Forecast request failed')).toBeTruthy();
      });
    });

    describe('data parsing', () => {
      beforeEach(() => {
        mockResponse = {
          cod: '200',
          list: getWeatherMockData()
        };
        httpMock.get.and.returnValue(of(mockResponse));
      });

      it('should group three hour partitions by days', () => {
        service.getFiveDayForecast(location).subscribe((days: DailyForecast[]) => {
          expect(days.length).toEqual(2);
          expect(days[0].date).toEqual('Mon Aug 05 2019');
          expect(days[0].index).toEqual(0);
          expect(days[1].date).toEqual('Tue Aug 06 2019');
          expect(days[1].index).toEqual(1);
        });
      });

      it('should set min and max temperature for each day', () => {
        service.getFiveDayForecast(location).subscribe((days: DailyForecast[]) => {
          expect(days[0].temperature.min).toEqual(280);
          expect(days[0].temperature.max).toEqual(293);
          expect(days[1].temperature.min).toEqual(275);
          expect(days[1].temperature.max).toEqual(299);
        });
      });

      xit('should set most popular weather condition for each day', () => {
        service.getFiveDayForecast(location).subscribe((days: DailyForecast[]) => {
          expect(days[0].weather.icon).toEqual('09d');
          expect(days[0].weather.description).toEqual('showers');
          expect(days[1].weather.icon).toEqual('03d');
          expect(days[1].weather.description).toEqual('clouds');
        });
      });

      it('should ensure that the first day has all 8 partitions', () => {
        mockResponse = {
          cod: '200',
          list: getWeatherMockData().slice((4))
        };
        httpMock.get.and.returnValue(of(mockResponse));
        service.getFiveDayForecast(location).subscribe((days: DailyForecast[]) => {
          expect(days[0].threeHourPartitions.length).toEqual(8);
        });
      });

      xit('should not alter partitions of the upcoming days', () => {
        service.getFiveDayForecast(location).subscribe((days: DailyForecast[]) => {
          expect(days[1].threeHourPartitions.length).toEqual(4);
          expect(days[1].threeHourPartitions[0].main.temp_min).toEqual(290);
        });
      });
    });
  });
});
