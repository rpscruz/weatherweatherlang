import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import MapGL, { GeolocateControl } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from "deck.gl";
import Geocoder from 'react-map-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import './App.css';


const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const OWM_TOKEN = process.env.REACT_APP_OWN_TOKEN;


const geolocateStyle = {
  float: 'left',
  margin: '50px',
  padding: '10px'
};

const delayInterval = 1000;
var lastCalled = new Date().getTime() - delayInterval;

class App extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
        data: 'Please click the button to get data',
        name: '',
        lat: 0,
        lon: 0,
        weather: '',
        temp: 30,
        sunrise: '',
        sunset: '',
        viewport: {
          width: 500,
          height: 500,
          latitude: 14.6,
          longitude: 120.99,
          zoom: 12
        },
          searchResultLayer: null,
          icon: process.env.PUBLIC_URL + '/assets/sunny.svg',
          alt: 'search the map to find out!'
      }

      this.updateState = this.updateState.bind(this);
      this.updateIcon = this.updateIcon.bind(this);
   };

  updateState(called) {
    var delay = new Date().getTime() - called;
    if (delay > delayInterval ) {
      console.log("[DEBUG] Delay sufficient.");
      console.log(new Date().getTime())
      let currentComponent = this;
      var lat = currentComponent.state.viewport.latitude;
      var lon = currentComponent.state.viewport.longitude;
      axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          lat: lat,
          lon: lon,
          appid: OWM_TOKEN
        }
      })
      .then(function (response) {
        console.log(response.data)
        currentComponent.setState({
          name: response.data.name,
          lat: response.data.coord.lat,
          lon: response.data.coord.lon,
          weather: response.data.weather[0].description,
          sunset: response.data.sys.sunset,
          sunrise: response.data.sys.sunrise,
          temp : (response.data.main.temp - 273.15).toFixed(2)

        });
        // console.log("[DEBUG] Weather was" + currentComponent.state.weather);
        currentComponent.updateIcon();
      })
      .catch(function (error) {
        console.log(error);
      });
      
    } else {
      // console.log("[DEBUG] Still waiting for: "+ delay/delayInterval);
    }
    
  };
   

  updateIcon() {
    var weather = this.state.weather;
    var sunrise = this.state.sunrise * 1000;
    var sunset = this.state.sunset * 1000;
    var newIcon, newAlt = null;

    switch(weather) {
      case "thunderstorm":
        newIcon = '/assets/thunderstorms.svg';
        newAlt = 'thunderstorms';
        break;
      case "overcast clouds":
        if (new Date().getTime() > sunrise && new Date().getTime() < sunset) {
          newIcon = '/assets/cloudy.svg';
        } else {
          newIcon = '/assets/cloudy-night.svg';
        }
        newAlt = 'cloudy';
        break;
      case "scattered clouds":
        if (new Date().getTime() > sunrise && new Date().getTime() < sunset)
          newIcon = '/assets/partly-sunny.svg';
        else 
          newIcon = '/assets/cloudy-night.svg';
        
        newAlt = 'significantly cloudy';
        break;
      case "broken clouds":
      case "few clouds":
        if (new Date().getTime() > sunrise && new Date().getTime() < sunset)
          newIcon = '/assets/partly-cloudy.svg';
        else
          newIcon = '/assets/partly-cloudy-night.svg';
        newAlt = 'a little cloudy';
        break;
      case "light rain":
        if (new Date().getTime() > sunrise && new Date().getTime() < sunset)
          newIcon = '/assets/sun-rain.svg';
        else
          newIcon = '/assets/rainy-night.svg';
        newAlt = 'a little rain';
        
        break;
      case "shower rain":
        if (new Date().getTime() > sunrise && new Date().getTime() < sunset)
          newIcon = '/assets/rainy.svg';
        else
          newIcon = '/assets/rainy-night.svg';
        newAlt = 'rain showers';
        break;
      case "moderate rain":
        if (new Date().getTime() > sunrise && new Date().getTime() < sunset)
          newIcon = '/assets/sun-rain.svg';
        else
          newIcon = '/assets/rainy-night.svg';
        newAlt = 'a little rain';
        break;
      case "clear sky":
        if (new Date().getTime() > sunrise && new Date().getTime() < sunset)
          newIcon = '/assets/sunny.svg'
        else
          newIcon = '/assets/clear-night.svg'
        newAlt = 'a clear sky';
        break;
      default:
        break;
    }
    this.setState({
      icon: newIcon,
      alt: newAlt
    });
    lastCalled = new Date().getTime();
  }

  mapRef = React.createRef();

  handleViewportChange = viewport => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });
    this.updateState(lastCalled);
  };

  handleGeocoderViewportChange = viewport => {
    const geocoderDefaultOverrides = { transitionDuration: 0};

    return this.handleViewportChange({
      ...viewport,
      ...geocoderDefaultOverrides
    });
  };

  handleOnResult = event => {
    // console.log([DEBUG] event.result);
    this.setState({
      searchResultLayer: new GeoJsonLayer({
        id: "search-result",
        data: event.result.geometry,
        getFillColor: [255, 0, 0, 128],
        getRadius: 1000,
        pointRadiusMinPixels: 10,
        pointRadiusMaxPixels: 10
      })
    });
  };

  onSelected = (viewport, item) => {
    this.setState({viewport});
    // console.log([DEBUG] 'Selected: ', item)
  }

  render() {
    var { viewport, searchResultLayer } = this.state;
    return (

      <body>
      <div 
        class = "container">
        <div class="sidebar">
          <div class="text">
            <h1> Kumusta na dyan? </h1>
            <h2>The weather here is: {this.state.alt} </h2>

            <p>Search the map to check out the weather at different parts of the Philippines!</p>
            <img 
              src={this.state.icon}
              alt={this.state.alt}
            /> 
          </div>
        </div>

        <div class="content">
          <MapGL
            ref={this.mapRef}
            {...viewport}
            width="100%"
            height="100%"
            onViewportChange={this.handleViewportChange}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          >
            <Geocoder
              mapRef={this.mapRef}
              onSelected={this.onSelected}
              onResult={this.handleOnResult}
              onViewportChange={this.handleGeocoderViewportChange}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              position="top-left"
              countries="ph"
            />
            <DeckGL {...viewport} 
              layers={[searchResultLayer]} 
            />
            
          </MapGL>
        </div>
      </div>
      </body>
    );
  }
}

ReactDOM.render(
  <h1>Hello, world Test!</h1>,
  document.getElementById('root')
);

export default App;