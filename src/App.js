import React from 'react';
import axios from 'axios';
import MapGL, {GeolocateControl } from 'react-map-gl'
import ReactMapGL from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css'

import './App.css';


// const TOKEN=config.REACT_APP_TOKEN
const TOKEN='pk.eyJ1IjoicnBzY3J1eiIsImEiOiJjanloOHFtMXQwOWNlM29tYmxiZmRheGMzIn0.Yi7GtAEpaiy_Bts3TWfgNg';

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
         viewport: {
            width: 400,
            height: 400,
            latitude: 14.6,
            longitude: 120.99,
            zoom: 12
          }

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
        console.log(response)
        currentComponent.setState({
          name: response.data.name,
          lat: response.data.coord.lat,
          lon: response.data.coord.lon,
          weather: response.data.weather[0].main
        })

        console.log(response.data.weather[0].main)
      })
      .catch(function (error) {
        console.log(error);
      }); 
      // this.setState({data: received})
   }




   render() {
      const viewport = ({
        width: "100%",
        height: 900,
        latitude: 0,
        longitude: 0,
        zoom: 2
      });

      const setViewPort = ({
        width: "100%",
        height: 900,
        latitude: 0,
        longitude: 0,
        zoom: 2
      });

      const _onViewportChange = viewport => setViewPort({...viewport, transitionDuration: 3000 })
      const transformRequest = (url, resourceType) => {
        if (resourceType === 'Tile' && url.match('yourTileSource.com')) {
            return {
                url: url,
                headers: { 'Authorization': 'Bearer ' + TOKEN }
            }
        }
    }



      return (
        
        <div>

            <button onClick = {this.updateState}>Get forecast</button>
            <h4>{this.state.name}</h4>

            <h3>{this.state.viewport.latitude}, {this.state.viewport.longitude}</h3>
            <h4>{this.state.weather}</h4>

            <MapGL
              {...this.state.viewport}
              latitude={this.state.viewport.latitude}
              longitude={this.state.viewport.longitude}
              mapboxApiAccessToken={TOKEN}
              onViewportChange={(viewport) => this.setState({viewport})}
            
            />
         </div>
      );
   }
}

export default App;