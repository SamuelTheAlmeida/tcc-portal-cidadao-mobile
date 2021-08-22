import axios from 'axios';
import * as React from 'react';
import { createRef, useEffect, useState } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator, Text, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Checkbox, Colors, Dialog, Paragraph, Portal } from 'react-native-paper';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { TextInput as RNTextInput } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Postagem {
  id: number;
  latitude?: number;
  longitude?: number;
}

interface BairroFiltro {
  bairro: string;
  count: number;
  checked: boolean;
}
type mapaScreenProp = StackNavigationProp<RootStackParamList, 'MapaScreen'>;

export default function MapaScreen() {
  const navigation = useNavigation<mapaScreenProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'MapaScreen'>>();
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = React.useState('');
  const [location, setLocation] = useState(null);
  const key = 'AIzaSyBdlrJedgf_qmWwMOTppGyuzzD3EAk3ZIg';
  const [filterModal, setModalFilter] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [bairros, setBairros] = React.useState(new Array<BairroFiltro>());

  const showDialog = () => setModalFilter(true);
  const hideDialog = () => setModalFilter(false);

  function toggleBairroChecked(index: number) {
    const newArray = [...bairros];
    newArray[index].checked = !bairros[index].checked;
    setBairros(newArray);
  }

  // Initialize the module (needs to be done only once)
  Geocoder.init(key, {language : "pt"});


  useEffect(() => {
    const interval = setInterval(() => atualizarMapa(), 3000);
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      await Location.getLastKnownPositionAsync()
      .then((pos) => {
        setLocation(pos);
      });
      if (location) {
        Geocoder.from(location.coords.latitude, location.coords.longitude)
        .then(json => {
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
        const bairrosSelecionados = bairros.filter(x => x.checked);
        let posts = [];
        if (bairrosSelecionados.length > 0) {
          const nomesBairros = bairrosSelecionados.map((item) => { return item.bairro });
          posts = response.data.dados.filter((x: { bairro: string; }) => nomesBairros.includes(x.bairro));
        } else {
          posts = response.data.dados;
        }

        const arrayBairros = [...bairros];
        arrayBairros.forEach((item) => item.count = 0);
        response.data.dados.map(
          (item: any) => { 
            if (arrayBairros.filter(x => x.bairro == item.bairro).length > 0) {
              const index = arrayBairros.findIndex(x => x.bairro == item.bairro);
              arrayBairros[index].count++;
            } else {
              arrayBairros.push({
                bairro: item.bairro,
                count: 1,
                checked: false
              });
            }
          }
        );
        setBairros(arrayBairros);
        setPosts(posts);
      })
      .catch((error) => {
        console.log('erro:' + error);
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
              onPress: () => navigation.navigate('ContaScreen'),
              style: "default",
            }
          ],
          { cancelable: true },
          );
      }
    });
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
          <Button onPress={hideDialog}>Ok</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
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
          title={`${post.titulo}`}
          description={`${post.descricao}`}
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
    top: 10,
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
