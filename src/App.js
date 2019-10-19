import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import MapGL, { GeolocateControl } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from "deck.gl";
import Geocoder from 'react-map-gl-geocoder'

import 'mapbox-gl/dist/mapbox-gl.css'
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import './App.css';


const MAPBOX_TOKEN='pk.eyJ1IjoicnBzY3J1eiIsImEiOiJjanloOHFtMXQwOWNlM29tYmxiZmRheGMzIn0.Yi7GtAEpaiy_Bts3TWfgNg';


const geolocateStyle = {
  float: 'left',
  margin: '50px',
  padding: '10px'
};

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
         viewport: {
            width: 500,
            height: 500,
            latitude: 14.6,
            longitude: 120.99,
            zoom: 12
          },
          searchResultLayer: null
      }

      this.updateState = this.updateState.bind(this);
   };

   updateState() {
      let currentComponent = this;
      var lat = currentComponent.state.viewport.latitude;
      var lon = currentComponent.state.viewport.longitude;
      axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          lat: lat,
          lon: lon,
          appid: "4f71680207ab219c46cc73526379dee8"
        }
      })
      .then(function (response) {
        console.log(response.data)
        currentComponent.setState({
          name: response.data.name,
          lat: response.data.coord.lat,
          lon: response.data.coord.lon,
          weather: response.data.weather[0].main,
          temp : (response.data.main.temp - 273.15).toFixed(2)

        });
      })
      .catch(function (error) {
        console.log(error);
      }); 
      // this.setState({data: received})
   }

  mapRef = React.createRef();

  handleViewportChange = viewport => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });
    this.updateState()
  };

  handleGeocoderViewportChange = viewport => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };

    return this.handleViewportChange({
      ...viewport,
      ...geocoderDefaultOverrides
    });
  };

  handleOnResult = event => {
    console.log(event.result);
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
        console.log('Selected: ', item)
    }

   render() {
    var { viewport, searchResultLayer } = this.state;

      return (
        <div style={{ height: "75vh" }}>
          <span>
            <h1> Tuloy ba ang lakad? </h1>
            <h2> Do a raincheck for where you need to go </h2>
            <h4>{this.state.name}</h4>
            <h3>{this.state.viewport.latitude}, {this.state.viewport.longitude}</h3>
            <h4>{this.state.weather}</h4>
            <h3>{this.state.temp}</h3>
          </span>
          <span>
            <MapGL
              ref={this.mapRef}
              {...viewport}
              width="100%"
              height="100%"
              onViewportChange={this.handleViewportChange}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              mapStyle="mapbox://styles/rpscruz/ck1xlye4i0wgp1co9fuspf46o"
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
        </span>
      </div>
      );
   }
}

ReactDOM.render(
  <h1>Hello, world Test!</h1>,
  document.getElementById('root')
);

export default App;