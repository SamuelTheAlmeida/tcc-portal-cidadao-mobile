import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator, Text, ScrollView } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Button, Checkbox, Colors, Dialog, Portal } from 'react-native-paper';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageURISource } from 'react-native';

interface BairroFiltro {
  bairro: string;
  count: number;
  checked: boolean;
}
type mapaScreenProp = StackNavigationProp<RootStackParamList, 'MapaScreen'>;

const MapaScreen=(props:any) => {
  const navigation = useNavigation<mapaScreenProp>();
  const postInserido = props?.route?.params?.postInserido;
  const [mapRegion, setMapRegion] = useState(null);
  const initialRegion = {
    latitude: -25.412127,
    longitude: -49.226749,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  };
  
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gotLocation, setGotLocation] = useState(false);
  const [text, setText] = React.useState('');
  const [location, setLocation] = useState(null);

  const key = 'AIzaSyBdlrJedgf_qmWwMOTppGyuzzD3EAk3ZIg';
  const [filterModal, setModalFilter] = React.useState(false);
  const [bairros, setBairros] = React.useState(new Array<BairroFiltro>());
  const bairrosRef = React.useRef([]);
  bairrosRef.current = bairros;

  const showDialog = () => setModalFilter(true);
  const hideDialog = () => setModalFilter(false);

  function onRegionChange(region: Region) {
    const newState = Object.assign({}, mapRegion);
    newState.latitude = region.latitude;
    newState.longitude = region.longitude;
    setMapRegion(newState);
  }

  function toggleBairroChecked(index: number) {
    const newArray = [...bairros];
    newArray[index].checked = !bairros[index].checked;
    setBairros(newArray);
  }

  // Initialize the module (needs to be done only once)
  Geocoder.init(key, {language : "pt"});

  useEffect(() => {
    if (postInserido)
      setMapRegion(postInserido);
  }, [postInserido])

  useEffect(() => {
    atualizarMapa();
    const interval = setInterval(() => atualizarMapa(), 5000);
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      recallCurrentLocationFunction();
    })();

      return () => {
        clearInterval(interval);
      };
  }, []); // "[]" makes sure the effect will run only once.

  async function getCurrentLocation() {
      try {
          let locat = await Location.getCurrentPositionAsync({
              accuracy: 6
          });
          setLocation(locat);
          setMapRegion({
              latitude: locat.coords.latitude,
              longitude: locat.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
          })
          setGotLocation(true);
          Geocoder.from(locat.coords.latitude, locat.coords.longitude)
          .then(json => {
            setText(json.results[0].formatted_address);
          })
          .catch(error => Alert.alert(error.message));
      } catch (err) {
          console.log("Couldn't get locations. Error: " + err);
          recallCurrentLocationFunction();
      }
  };

  function recallCurrentLocationFunction() {
      getCurrentLocation();
  };

  function obterIconeMarker(post: any): ImageURISource {
    switch (post.subcategoria.codigo) {
      case 1:
        return require('../assets/images/red-dot.v1.png');
      case 2:
        return require('../assets/images/yellow-dot.v1.png');
      case 3:
        return require('../assets/images/green-dot.v1.png');
    }
  }

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
        const bairrosSelecionados = bairrosRef.current.filter(x => x.checked);
        const nomesBairros = bairrosSelecionados.map((item) => { return item.bairro });
        let posts = [];
        if (bairrosSelecionados.length > 0) {
          posts = response.data.dados.filter((x: { bairro: string; }) => nomesBairros.includes(x.bairro));
        } else {
          posts = response.data.dados;
        }

        const arrayBairros = [...bairrosRef.current];
        arrayBairros.forEach((item) => item.count = 0);
        response.data.dados.map(
          (item: any) => { 
            if (arrayBairros.filter(x => x.bairro == item.bairro).length > 0) {
              const index = arrayBairros.findIndex(x => x.bairro == item.bairro);
              arrayBairros[index].count++;
            } else {
              const isAlreadyChecked = nomesBairros.includes(item.bairro);
              arrayBairros.push({
                bairro: item.bairro,
                count: 1,
                checked: isAlreadyChecked
              });
            }
          }
        );
        setBairros(arrayBairros);
        setPosts(posts);
      })
      .catch((error) => {
        Alert.alert(error);
      })
      .finally(() => setLoading(false));
  }

  function criarPostagem() {
    AsyncStorage.getItem('@PORTAL_CIDADAO_USER_TOKEN')
    .then(async (token) => {
      const userData = await AsyncStorage.getItem('@PORTAL_CIDADAO_USER_DATA');
      if (token && userData) {
          navigation.navigate('NovaPostagemScreen');
      } else {
        Alert.alert(
          'Aviso',
          'Para criar uma postagem é necessário estar logado em sua conta!',
          [
            {
              text: "Voltar",
              onPress: () => navigation.navigate('MapaScreen'),
              style: "default",
            },
            {
              text: "Ir para login",
              onPress: () => navigation.navigate('ContaScreen', {
                returnScreen: 'NovaPostagemSreen'
              }),
              style: "default",
            }
          ],
          { cancelable: true },
          );
      }
    })
    .catch(error => Alert.alert(error.message));
  }
  
  return (
    <View style={styles.containerStyle}>
    <Button 
    style={styles.botaoFiltrarStyle}
    compact={true} 
    icon="filter"
    mode="contained" 
    onPress={showDialog}>
        Filtros
    </Button>
    <Portal>
      <Dialog visible={filterModal} onDismiss={hideDialog} style={styles.dialogStyle}>
        <Dialog.Title>Filtros</Dialog.Title>
        <Dialog.Content style={{height: '70%'}}>
          <Dialog.ScrollArea style={{height: '70%'}}>
            <ScrollView contentContainerStyle={{paddingHorizontal: 1}}>
              <Text style={{fontSize: 14}}>Bairros</Text>
              {bairros && bairros.map((item,index) => {
                  return (
                        <Checkbox.Item
                        labelStyle={{ fontSize: 12}}
                        key={index}
                        color='rgba(91, 98, 143, 0.75)'
                        label={`${item.bairro} (${item.count})`}
                        status={item.checked === true ? 'checked' : 'unchecked'}
                        onPress={() => toggleBairroChecked(index)}
                      />
                  );
              })}
            </ScrollView>
          </Dialog.ScrollArea>

        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => { hideDialog(); atualizarMapa(); } }>Ok</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
    {false && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}
    <MapView
      showsPointsOfInterest = {false}
      customMapStyle = {customMapStyles}
      style={{
        width: '100%',
        height: '93%'
      }}
      initialRegion={mapRegion}
      onRegionChange={(region) => onRegionChange(region)}
      >

      {posts && posts.map((post: any, index: any) => {
          return (<Marker
          key={index}
          coordinate={{
            latitude: post.latitude,
            longitude: post.longitude
          }}
          title={`${post.titulo}`}
          description={`${post.descricao}`}
          image={obterIconeMarker(post)}
        >

        </Marker>)
      })}
      </MapView>
      <View>
        <Button
          onPress={criarPostagem}
          mode="contained"
          color="#3f51b5"
          accessibilityLabel="Criar postagem"
        >
          Criar Postagem
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
  dialogStyle: {
    height: '70%'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalStyle: {
    width: '100%'
  },
  textInput: {
    width: 250,
    backgroundColor: '#FFFCFC',
    fontSize: 13
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
  botaoFiltrarStyle: {
    flex: 1,
    flexDirection:'row',
    position:'absolute',
    top: 30,
    right: 10,
    alignSelf: "center",
    justifyContent: "space-between",
    //backgroundColor: "transparent",
    backgroundColor: 'rgba(91, 98, 143, 0.75)',
    borderWidth: 0.5,
    borderRadius: 20,
    zIndex: 9999
  }
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

export default MapaScreen;