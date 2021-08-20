import axios from 'axios';
import * as React from 'react';
import { createRef, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Colors, Headline, Portal, TextInput } from 'react-native-paper';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { TextInput as RNTextInput } from 'react-native';
import { LocationAccuracy } from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { NavigationContainer, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

interface Postagem {
  id: number;
  latitude?: number;
  longitude?: number;
}
type mapaScreenProp = StackNavigationProp<RootStackParamList, 'MapaScreen'>;

export default function MapaScreen() {
  const navigation = useNavigation<mapaScreenProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'MapaScreen'>>();

  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = React.useState('');
  const [location, setLocation] = useState(null);
  const [time, setTime] = useState(Date.now());
  const [selection, setSelection] = useState({
    start: 0,
    end: 0
  });
  const key = 'AIzaSyBdlrJedgf_qmWwMOTppGyuzzD3EAk3ZIg';
  var textInput = createRef<RNTextInput>();

  // Initialize the module (needs to be done only once)
  Geocoder.init(key, {language : "pt"});


  useEffect(() => {
    const interval = setInterval(() => atualizarMapa(), 5000);
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      await Location.getLastKnownPositionAsync()
      .then((pos) => {
        //console.log(pos);
        setLocation(pos);
      });
      //console.log(location);
      if (location) {
        Geocoder.from(location.coords.latitude, location.coords.longitude)
        .then(json => {
          //console.log(json.results[0].formatted_address);
          setText(json.results[0].formatted_address);
        })
        .catch(error => console.warn(error));
      }

    })();

      return () => {
        clearInterval(interval);
      };
  }, []); // "[]" makes sure the effect will run only once.

  function atualizarMapa() {
    setLoading(true);
    axios({
      method: "GET",
      url: "http://ec2-18-228-223-188.sa-east-1.compute.amazonaws.com:8080/api/Postagem",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    })
      .then((response) => {
        //console.log(response.data);
        setPosts(response.data.dados);
      })
      .catch((error) => {
        console.log('erro:' + error);
      })
      .finally(() => setLoading(false));
  }
  
  function salvarPostagem() {
    let model = {
      subcategoria: { codigo: 1, nome: 'Reclamacao', descricao: 'Reclamacao'},
      categoriaId: 1,
      titulo: 'teste',
      descricao: 'teste teste',
      imagemUrl: 'string',
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      bairro: 'teste',
      resolvido: false
    };

    /*axios.post('https://reqres.in/api/articles', article)
    .then(response => this.setState({ articleId: response.data.id }));*/
  }
  
  return (
    <View style={styles.containerStyle}>
    {loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}
    <MapView
      showsPointsOfInterest = {false}
      customMapStyle = {customMapStyles}
      style={{
        width: '100%',
        height: '93%'
      }}
      initialRegion={{
        latitude: -25.412127,
        longitude: -49.226749,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }}>

      {posts && posts.map((post: any, index: any) => {
          return (<Marker
          key={index}
          coordinate={{
            latitude: post.latitude,
            longitude: post.longitude
          }}
          title={'hello'}
          description={'test'}
        >

        </Marker>)
      })}
      </MapView>
      <View>
        <Button
          onPress={() => navigation.navigate('NovaPostagemScreen')}
          mode="contained"
          color="#3f51b5"
          accessibilityLabel="Criar postagem"
        >
          Criar Postagem {route.params}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spinner: {
    position: 'absolute',
    top: 255,
    zIndex: 1,
  },
  containerStyle: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  modalStyle: {
    width: '100%'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    width: '100%'
  },
  modalView: {
    /*margin: 2,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,*/
    width: '95%',
    display: 'flex',
    height: '40%',
    backgroundColor: "white",
    padding: 20
  },
  autocompleteView: {
    paddingTop: 30,
    paddingBottom: 30,
    height: '35%',
    zIndex: 1000,
    elevation: 1000
  },
  textInput: {
    //height: 40,
    //flex: 1,
    //marginVertical: 70,
    width: 250,
    backgroundColor: '#FFFCFC',
    fontSize: 13
    //paddingVertical: 20
  },
  buttonsView: {
    display: 'flex',
    flexDirection: "row",
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 5,
    marginLeft: 0,
    marginRight: 0
  },
  modalLeftButtonStyle: {
    marginRight: 10
  },
  modalRightButtonStyle: {
    marginLeft: 10 
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
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
