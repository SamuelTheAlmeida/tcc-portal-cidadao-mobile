import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator, Text, ScrollView } from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { Button, Checkbox, Colors, Dialog, Portal } from 'react-native-paper';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageURISource } from 'react-native';
import { ModalPostagem } from '../components/ModalPostagem';
import {API_URL} from '@env'
import Spinner from 'react-native-loading-spinner-overlay';

interface BairroFiltro {
  bairro: string;
  count: number;
  checked: boolean;
}

interface CategoriaFiltro {
  categoria: string;
  count: number;
  checked: boolean;
}

interface ConfiabilidadeFiltro {
  confiabilidade: string;
  count: number;
  checked: boolean;
}

interface SubcategoriaFiltro {
  subcategoria: string;
  count: number;
  checked: boolean;
}

type mapaScreenProp = StackNavigationProp<RootStackParamList, 'MapaScreen'>;

const MapaScreen=(props:any) => {
  const navigation = useNavigation<mapaScreenProp>();
  const postInserido = props?.route?.params?.postInserido;
  const initialRegion = {
    latitude: -25.412127,
    longitude: -49.226749,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  };
  const [mapRegion, setMapRegion] = useState(null);
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gotLocation, setGotLocation] = useState(false);
  const [text, setText] = React.useState('');
  const [location, setLocation] = useState(null);
  const [modalPostagemVisible, setModalPostagemVisible] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [curtidaUsuario, setCurtidaUsuario] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [midiaPostagem, setMidiaPostagem] = useState(null);

  const key = 'AIzaSyBdlrJedgf_qmWwMOTppGyuzzD3EAk3ZIg';
  const [filterModal, setModalFilter] = React.useState(false);
  const [bairros, setBairros] = React.useState(new Array<BairroFiltro>());
  const bairrosRef = React.useRef([]);
  bairrosRef.current = bairros;

  const [categorias, setCategorias] = React.useState(new Array<CategoriaFiltro>());
  const categoriasRef = React.useRef([]);
  categoriasRef.current = categorias;

  const [confiabilidades, setConfiabilidades] = React.useState(new Array<ConfiabilidadeFiltro>());
  const confiabilidadesRef = React.useRef([]);
  confiabilidadesRef.current = confiabilidades;

  const [subcategorias, setSubcategorias] = React.useState(new Array<SubcategoriaFiltro>());
  const subcategoriasRef = React.useRef([]);
  subcategoriasRef.current = subcategorias;

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

  function toggleCategoriaChecked(index: number) {
    const newArray = [...categorias];
    newArray[index].checked = !categorias[index].checked;
    setCategorias(newArray);
  }

  function toggleConfiabilidadeChecked(index: number) {
    const newArray = [...confiabilidades];
    newArray[index].checked = !confiabilidades[index].checked;
    setConfiabilidades(newArray);
  }

  function toggleSubcategoriaChecked(index: number) {
    const newArray = [...subcategorias];
    newArray[index].checked = !subcategorias[index].checked;
    setSubcategorias(newArray);
  }

  // Initialize the module (needs to be done only once)
  Geocoder.init(key, {language : "pt"});

  useEffect(() => {
    /*if (postInserido) {
      console.log(postInserido);
      setMapRegion(postInserido);
    }*/
    const postInseridoStorage = AsyncStorage.getItem('postInserido')
    .then((result) => {
      if (result) {
        setMapRegion(JSON.parse(result));
        atualizarMapa();
        AsyncStorage.removeItem('postInserido');
      }
      else 
        console.log('sem post inserido');
    })
      
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('@PORTAL_CIDADAO_USER_DATA').then((user) => {
      const userData = JSON.parse(user);
      setUsuarioLogado(userData);
    })
    
    atualizarMapa();
    const interval = setInterval(() => atualizarMapa(), 3000);
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
            const pais = (json.results[0].address_components[5].long_name);
            if (pais.toUpperCase() !== 'BRAZIL' && pais.toUpperCase() !== 'BRASIL')
              throw new Error("invalid location, trying again...");

            setText(json.results[0].formatted_address);
          })
          .catch(error => Alert.alert('Error', error.message));
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
        return obterIconePostVermelho(post.confiabilidade);
      case 2:
        return obterIconePostAmarelo(post.confiabilidade);
      case 3:
        return obterIconePostVerde(post.confiabilidade);
    }
  }

  function obterIconePostVermelho(confiabilidade: string) {
    switch (confiabilidade) {
      case 'Alta':
        return require(`../assets/images/red-dot.g.png`);
      case 'Média':
        return require(`../assets/images/red-dot.m.png`);
      default:
          return require(`../assets/images/red-dot.p.png`);
    }
  }

  function obterIconePostAmarelo(confiabilidade: string) {
    switch (confiabilidade) {
      case 'Alta':
        return require(`../assets/images/yellow-dot.g.png`);
      case 'Média':
        return require(`../assets/images/yellow-dot.m.png`);
      default:
          return require(`../assets/images/yellow-dot.p.png`);
    }
  }

  function obterIconePostVerde(confiabilidade: string) {
    switch (confiabilidade) {
      case 'Alta':
        return require(`../assets/images/green-dot.g.png`);
      case 'Média':
        return require(`../assets/images/green-dot.m.png`);
      default:
          return require(`../assets/images/green-dot.p.png`);
    }
  }

  function atualizarMapa() {
    //console.log("trying to call " + API_URL + "/api/Postagem");
    axios({
      method: "GET",
      url: API_URL + "/api/Postagem",
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
        //console.log('bairros selecionados');
        //console.log(bairrosSelecionados);
        const nomesBairros = bairrosSelecionados.map((item) => { return item.bairro });
        //console.log('nomes bairros');
        //console.log(nomesBairros);
        var posts = [];
        if (bairrosSelecionados.length > 0) {
          posts = response.data.dados.filter((x: { bairro: string; }) => nomesBairros.includes(x.bairro));
        } else {
          posts = response.data.dados;
        }
        //console.log('posts');
        //console.log(posts);

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

        const categoriasSelecionadas = categoriasRef.current.filter(x => x.checked);
        const nomesCategorias = categoriasSelecionadas.map((item) => { return item.categoria });
        if (categoriasSelecionadas.length > 0) {
          posts = posts.filter((x: { categoria: { nome: any; }; }) => nomesCategorias.includes(x.categoria.nome) );
        } else {
          posts = posts;
        }

        const arrayCategorias = [...categoriasRef.current];
        arrayCategorias.forEach((item) => item.count = 0);
        response.data.dados.map(
          (item: any) => { 
            if (arrayCategorias.filter(x => x.categoria == item.categoria?.nome).length > 0) {
              const index = arrayCategorias.findIndex(x => x.categoria == item.categoria?.nome);
              arrayCategorias[index].count++;
            } else {
              const isAlreadyChecked = nomesCategorias.includes(item.categoria?.nome);
              arrayCategorias.push({
                categoria: item.categoria?.nome,
                count: 1,
                checked: isAlreadyChecked
              });
            }
          }
        );
        setCategorias(arrayCategorias);

        const confiabilidadesSelecionadas = confiabilidadesRef.current.filter(x => x.checked);
        const nomesConfiabilidades = confiabilidadesSelecionadas.map((item) => { return item.confiabilidade });
        if (confiabilidadesSelecionadas.length > 0) {
          posts = response.data.dados.filter((x: { confiabilidade: string; }) => nomesConfiabilidades.includes(x.confiabilidade));
        } else {
          posts = posts;
        }

        const arrayConfiabilidades = [...confiabilidadesRef.current];
        arrayConfiabilidades.forEach((item) => item.count = 0);
        response.data.dados.map(
          (item: any) => { 
            if (arrayConfiabilidades.filter(x => x.confiabilidade == item.confiabilidade).length > 0) {
              const index = arrayConfiabilidades.findIndex(x => x.confiabilidade == item.confiabilidade);
              arrayConfiabilidades[index].count++;
            } else {
              const isAlreadyChecked = nomesConfiabilidades.includes(item.confiabilidade);
              arrayConfiabilidades.push({
                confiabilidade: item.confiabilidade,
                count: 1,
                checked: isAlreadyChecked
              });
            }
          }
        );
        setConfiabilidades(arrayConfiabilidades);

        const subcategoriasSelecionadas = subcategoriasRef.current.filter(x => x.checked);
        const nomesSubcategorias = subcategoriasSelecionadas.map((item) => { return item.subcategoria });
        if (subcategoriasSelecionadas.length > 0) {
          posts = posts.filter((x: { subcategoria: { nome: any; }; }) => nomesSubcategorias.includes(x.subcategoria.nome) );
        } else {
          posts = posts;
        }

        const arraySubcategorias = [...subcategoriasRef.current];
        arraySubcategorias.forEach((item) => item.count = 0);
        response.data.dados.map(
          (item: any) => { 
            if (arraySubcategorias.filter(x => x.subcategoria == item.subcategoria?.nome).length > 0) {
              const index = arraySubcategorias.findIndex(x => x.subcategoria == item.subcategoria?.nome);
              arraySubcategorias[index].count++;
            } else {
              const isAlreadyChecked = nomesSubcategorias.includes(item.subcategoria?.nome);
              arraySubcategorias.push({
                subcategoria: item.subcategoria?.nome,
                count: 1,
                checked: isAlreadyChecked
              });
            }
          }
        );
        setSubcategorias(arraySubcategorias);

        setPosts(posts);
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
        Alert.alert('Tried to call ' + API_URL + "/api/Postagem");
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
    .catch(error => Alert.alert('Error', error.message));
  }

  async function markerOnCalloutPress(postSelecionado: any) {
    setLoading(true);
    setCurtidaUsuario(null);
    axios({
      method: "GET",
      url: API_URL + "/api/Postagem/" + postSelecionado.id,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then(async (response) => {
      const result = response.data.dados;
      await obterLike(result.id);
      setPostSelecionado(result);
      obterComentarios(postSelecionado.id);
      obterMidiaPostagem(result.imagemUrl);
      setModalPostagemVisible(true);
    })
    .catch((error) => {
        Alert.alert('Error', error.message);
    })
    .finally(() => setLoading(false));
  }

  async function atualizarPostagem() {
    setLoading(true);
    axios({
      method: "GET",
      url: API_URL + "/api/Postagem/" + postSelecionado.id,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then(async (response) => {
      const result = response.data.dados;
      await obterLike(result.id);
      setPostSelecionado(result);
    })
    .catch((error) => {
        Alert.alert('Error', error.message);
    })
    .finally(() => setLoading(false));
  }

  async function obterLike(idPostagem: number) {
    const userData = await AsyncStorage.getItem('@PORTAL_CIDADAO_USER_DATA');
    const user = userData ? JSON.parse(userData) : null;
    const idUser = user?.id;
    setUsuarioLogado(user);

    axios({
      method: "GET",
      url: `${API_URL}/api/Curtida/${idPostagem}/${idUser}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then((response) => {
      const result = response.data;
      if (result.dados) {
        console.log('MapaScreen - obterLike() - response com dados');
        setCurtidaUsuario({id: result.dados.id, acao: result.dados.acao});
        console.log('MapaScreen - obterLike() - setando curtida para ' + result.dados.acao);
      } else {
        console.log('MapaScreen - obterLike() - response sem dados - setando curtida para null');
        setCurtidaUsuario(null);
      }
    })
    .catch((error) => {
        Alert.alert(error.message);
        console.log(error);
    });
  }

  function obterComentarios(idPostagem: number) {
    setLoading(true);
    axios({
      method: "GET",
      url: `${API_URL}/api/comentario/${idPostagem}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then((response) => {
      if (response.data && response.data.sucesso && response.data.dados) {
        const comentarios = response.data.dados;
        setComentarios(comentarios);
      }
    })
    .catch((error) => {
        Alert.alert(error.message);
        console.log(error);
    });
    setLoading(false);
  }

  function obterMidiaPostagem(nomeArquivo: string) {
    setLoading(true);
    axios({
      method: "GET",
      url: `${API_URL}/api/arquivo/${nomeArquivo}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then((response) => {
      if (response.data && response.data.fileContents) {
        const midia = response.data.fileContents;
        setMidiaPostagem(midia);
      } else {
        setMidiaPostagem(null);
      }
    })
    .catch((error) => {
        console.log('foto da postagem não encontrada');
        setMidiaPostagem(null);
        //console.log(error);
    });
    setLoading(false);
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
            <Text style={{fontSize: 14}}>Confiabilidade</Text>
            {confiabilidades && confiabilidades.map((item,index) => {
                  return (
                        <Checkbox.Item
                        labelStyle={{ fontSize: 12}}
                        key={index}
                        color='rgba(91, 98, 143, 0.75)'
                        label={`${item.confiabilidade} (${item.count})`}
                        status={item.checked === true ? 'checked' : 'unchecked'}
                        onPress={() => toggleConfiabilidadeChecked(index)}
                      />
                  );
              })}


            <Text style={{fontSize: 14}}>Categorias</Text>
              {categorias && categorias.map((item,index) => {
                  return (
                        <Checkbox.Item
                        labelStyle={{ fontSize: 12}}
                        key={index}
                        color='rgba(91, 98, 143, 0.75)'
                        label={`${item.categoria} (${item.count})`}
                        status={item.checked === true ? 'checked' : 'unchecked'}
                        onPress={() => toggleCategoriaChecked(index)}
                      />
                  );
              })}

              <Text style={{fontSize: 14}}>Subcategorias</Text>
              {subcategorias && subcategorias.map((item,index) => {
                  return (
                        <Checkbox.Item
                        labelStyle={{ fontSize: 12}}
                        key={index}
                        color='rgba(91, 98, 143, 0.75)'
                        label={`${item.subcategoria} (${item.count})`}
                        status={item.checked === true ? 'checked' : 'unchecked'}
                        onPress={() => toggleSubcategoriaChecked(index)}
                      />
                  );
              })}

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
    {/*loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />*/}
    <Spinner
      visible={loading}
      color={'#FFF'}
      textContent={'Carregando...'}
      textStyle={{ color: '#FFF', fontSize: 30, textShadowOffset: {width: 2, height: 2}, textShadowColor: 'black', textShadowRadius: 2 }}
    />
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
          image={obterIconeMarker(post)}
          //onPress={markerOnPress}
          //onSelect={markerOnSelect}
          //onDeselect={markerOnDeselect}
          onCalloutPress={() => markerOnCalloutPress(post)}
          >
            <Callout>
              <View>
                <Text>Ver Postagem</Text>
              </View>
            </Callout>
        </Marker>)
      })}
      </MapView>
      {usuarioLogado?.perfil?.nome !== 'Especial' && <View>
        <Button
          onPress={criarPostagem}
          mode="contained"
          color="#3f51b5"
          accessibilityLabel="Criar postagem"
        >
          Criar Postagem
        </Button>
      </View>}
      <ModalPostagem 
        isVisible={modalPostagemVisible} 
        setIsVisible={setModalPostagemVisible}
        postagem={postSelecionado}
        atualizarPostagem={atualizarPostagem}
        usuario={usuarioLogado}
        setLoading={setLoading}
        loading={loading}
        comentarios={comentarios}
        midia={midiaPostagem}
        obterComentarios={obterComentarios}
        curtidaUsuario={curtidaUsuario}
        >

      </ModalPostagem>
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