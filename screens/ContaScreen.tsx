import * as React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Autocomplete from '../components/Autocomplete';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

const homePlace = {
  description: 'Home',
  geometry: { location: { lat: 48.8152937, lng: 2.4597668 } },
};
const workPlace = {
  description: 'Work',
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } },
};

const key = 'AIzaSyBdlrJedgf_qmWwMOTppGyuzzD3EAk3ZIg';

export default function ContaScreen() {
  return (
    <View style={styles.container}>
      <Autocomplete/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%'
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
