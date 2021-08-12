import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import RNFetchBlob from 'rn-fetch-blob';

interface Postagem {
  id: number;
  latitude?: number;
  longitude?: number;
}

export default function TabOneScreen() {
  const [posts, setPosts] = useState(null);
  const state = {
    markers: [{
      title: 'hello',
      coordinates: {
        latitude: -25.412127,
        longitude: -49.226749
      },
    },
    {
      title: 'hello',
      coordinates: {
        latitude: -25.4300759,
        longitude: -49.2717015
      },  
    }]
  }

  useEffect(() => {
    axios({
      method: "GET",
      url: "http://www.7timer.info/bin/astro.php?lon=113.2&lat=23.1&ac=0&unit=metric&output=json&tzshift=0",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    })
      .then((response) => {
        console.log(response.data);
        setPosts(response.data.dados);
      })
      .catch((error) => {
        console.log('teste:' + error);
      });
  }, []); // "[]" makes sure the effect will run only once.
  
  return (
   /*<View style={styles.container}>
      <Text style={styles.title}>Portal Cidadão</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="/screens/TabOneScreen.tsx" />
    </View>-->*/
    <MapView
      showsPointsOfInterest = {false}
      customMapStyle = {customMapStyles}
      style={{
        flex: 1
      }}
      initialRegion={{
        latitude: -25.412127,
        longitude: -49.226749,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }}>

      {state.markers.map((marker, index) => {
          return (<Marker
          key={index}
          coordinate={marker.coordinates}
          title={'hello'}
          description={'test'}
        >

        </Marker>)
      })}

      </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

const customMapStyles = [
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
    {
        visibility: "off"
    }
    ]
  },
  {
    featureType: "poi",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "transit",
    stylers: [
      {
        visibility: "off"
      }
    ]
  }
];
