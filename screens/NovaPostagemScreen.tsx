import axios from 'axios';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator, Text, TextInput, Platform, Image } from 'react-native';
import { Button, Colors } from 'react-native-paper';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Controller, useForm } from 'react-hook-form';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Toast from 'react-native-root-toast';
import DropDown from 'react-native-paper-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { Modal } from '../components/Modal';
import {API_URL} from '@env'

interface FormDataValue {
  uri: string;
  name: string;
  type: string;
}

interface FormData {
  append(name: string, value: string | Blob | FormDataValue | object, fileName?: string): void;
  delete(name: string): void;
  get(name: string): FormDataEntryValue | null;
  getAll(name: string): FormDataEntryValue[];
  has(name: string): boolean;
  set(name: string, value: string | Blob | FormDataValue, fileName?: string): void;
}

declare let FormData: {
  prototype: FormData;
  new (form?: HTMLFormElement): FormData;
};

interface FormData {
  entries(): IterableIterator<[string, string | File]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string | File>;
  [Symbol.iterator](): IterableIterator<string | File>;
}

interface Postagem {
  titulo: string;
  categoriaId: number; //mudar para CategoriaModel
  subcategoria: number; //mudar para EnumModel
  descricao: string;
  imagemUrl: string;
  latitude: number;
  longitude: number;
  bairro: string;
  usuarioId: number;
}


type novaPostagemScreenProp = StackNavigationProp<RootStackParamList, 'NovaPostagemScreen'>;
const NovaPostagemScreen=(props: any) => {
  const navigation = useNavigation<novaPostagemScreenProp>();
  const returnScreen = props?.route?.params?.returnScreen ?? 'MapaScreen';

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const key = 'AIzaSyBdlrJedgf_qmWwMOTppGyuzzD3EAk3ZIg';

  var googlePlacesAutocompleteRef = useRef<GooglePlacesAutocompleteRef>();
  const { control, handleSubmit } = useForm<Postagem>({
    defaultValues: {
      titulo: '',
      categoriaId: 0,
      subcategoria: 0,
      descricao: '',
      imagemUrl: '',
      latitude: 0,
      longitude: 0,
      bairro: '',
      usuarioId: 0
    },
  });
  const [showDropDownCategoria, setShowDropDownCategoria] = useState(true);
  const [showDropDownSubcategoria, setShowDropDownSubcategoria] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const subcategoriaList = [
    {
      label: "Reclamação",
      value: "1",
    },
    {
      label: "Elogio",
      value: "2",
    },
    {
      label: "Sugestão",
      value: "3",
    },
  ]

  function recallCurrentLocationFunction() {
    getCurrentLocation();
  }; 

  async function getCurrentLocation() {
    try {
        let locat = await Location.getCurrentPositionAsync({
            accuracy: 6
        });
        Geocoder.from(locat.coords.latitude, locat.coords.longitude)
        .then(json => {
          setLocation({
              lat: locat.coords.latitude,
              lng: locat.coords.longitude,
              bairro: json.results[0]?.address_components[2]?.long_name
          });
          googlePlacesAutocompleteRef.current.setAddressText(json.results[0].formatted_address);
        })
        .catch(error => Alert.alert(error.message));
    } catch (err) {
        console.log("Couldn't get locations. Error: " + err);
        recallCurrentLocationFunction();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      (async () => {
        obterCategorias();
      })();
    }, 0);

  }, []); // "[]" makes sure the effect will run only once.

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      recallCurrentLocationFunction();
    })();
  }, []); // "[]" makes sure the effect will run only once.

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  function obterCategorias() {
    axios.get(API_URL + '/api/Postagem/categorias')
    .then(response => {
        if (response.status == 200 && response.data) {
            const categoriasMap = response.data.dados.map((item: any, index: number) => {
              return {
                key: index,
                label: item.nome,
                value: item.id
              }
            });
            setCategorias(categoriasMap);
        }
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => setLoading(false));
  }

  async function takePicture() {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    const resultAny = result as any;
    if (!result.cancelled) {
      setImage(resultAny.uri);
    }
  };

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    const resultAny = result as any;
    if (!result.cancelled) {
      setImage(resultAny.uri);
    }
  };

  async function getImageBlob(uri: string): Promise<unknown> {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  
    // We're done with the blob, close and release it
    //blob.close();
    return blob;
  }

  const onSubmit = handleSubmit(async ({ titulo, categoriaId, subcategoria, descricao }) => {
    const tryGetImage = await getImageBlob(image.replace("file:///", "file:/"));

    setLoading(true);
    const userData = JSON.parse(await AsyncStorage.getItem('@PORTAL_CIDADAO_USER_DATA'));
    if (!titulo || !categoriaId || !subcategoria || !descricao || !location || !userData) {
      Alert.alert(
        'Erro',
        'Por favor, preencha todos os campos obrigatórios'
      )
      setLoading(false);
      return;
    }
    let model = {
      titulo,
      categoriaId: Number(categoriaId),
      subcategoria: {
        codigo: Number(subcategoria)
      },
      descricao,
      bairro: location.bairro,
      imagemUrl: '',
      latitude: location.lat,
      longitude: location.lng,
      usuarioId: userData.id
    };

    const data = new FormData();
    data.append('file', {
      uri: image,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    data.append('model', JSON.stringify(model));
    let sucesso = false;
    axios.post(API_URL + '/api/Postagem', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
        sucesso = response.status === 200;
        if (sucesso) {
            Toast.show(response.data.mensagem.descricao, {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM
            });
            const postInserido = {
              latitude: model.latitude,
              longitude: model.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            };
            navigation.navigate('MapaScreen', {
              postInserido: postInserido
            });
        } else {
          if (response.data.mensagem?.descricao) {
            Alert.alert(response.data.mensagem.descricao);
          } else {
            Alert.alert(JSON.stringify(response.data));
          }
        }
    })
    .catch((err) => {
      console.log(err);
        //Alert.alert(err);
    })
    .finally(() => { if (!sucesso) setLoading(false) });

  });
  
  return (
    <View style={styles.containerStyle}>
    {loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* <Text style={styles.logoText}>Nova Postagem</Text> */}
            <View style={styles.autocompleteView}>
                <GooglePlacesAutocomplete
                suppressDefaultStyles={true}
                  numberOfLines={2}
                  ref={googlePlacesAutocompleteRef}
                  placeholder='Local *'
                  textInputProps={{
                    multiline: true
                  }}
                  onPress={(data, details = null) => {
                    // 'details' is provided when fetchDetails = true
                    Geocoder.from(data.description).then((result) => {
                        let resultLocation = result.results[0].geometry.location;
                        setLocation({
                          lat: resultLocation.lat,
                          lng: resultLocation.lng,
                          bairro: result.results[0]?.address_components[2]?.long_name
                      });
                    })
                  }}
                  query={{
                    key: key,
                    language: 'pt',
                  }}
                  styles={{
                    row: {
                      backgroundColor: '#FFFFFF',
                      padding: 13,
                      height: 44,
                      flexDirection: 'row',
                    },
                    separator: {
                      height: 0.5,
                      backgroundColor: '#c8c7cc',
                    },
                    textInputContainer: {
                      backgroundColor: 'transparent',
                      margin: 0,
                      padding: 0
                    },
                    textInput: {
                      height: 60,
                      color: '#5d5d5d',
                      fontSize: 13,
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: '#eaeaea',
                      backgroundColor: '#fafafa',
                      paddingLeft: 10,
                      marginTop: 20,
                      marginBottom: 5,
                    },
                    predefinedPlacesDescription: {
                      color: '#1faadb',
                    },
                  }}
                />
                <Button 
                style={styles.clearButtonStyle}
                compact={true} 
                icon="close" 
                mode="outlined" 
                onPress={() => { googlePlacesAutocompleteRef.current.setAddressText(''); }}>
                    <Text>Limpar</Text>
                </Button>

                <Controller
                  control={control}
                  name="titulo"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      autoCapitalize="none"
                      autoCompleteType="off"
                      autoCorrect={true}
                      keyboardType="default"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      returnKeyType="next"
                      placeholder="Título *" 
                      placeholderTextColor="rgba(0, 0, 0, 0.6)" 
                      style={styles.formTextInput} 
                      textContentType="none"
                      value={value}
                    />
                  )}
                />
               <Controller
                  control={control}
                  name="categoriaId"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <View>
                      {categorias.length > 0 &&
                    <DropDown
                      label={"Categoria *"}
                      mode={"outlined"}
                      visible={showDropDownCategoria}
                      showDropDown={() => setShowDropDownCategoria(true)}
                      onDismiss={() => setShowDropDownCategoria(false)}
                      value={value}
                      setValue={onChange}
                      list={categorias}
                    />}
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="subcategoria"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <View>
                      <DropDown
                        label={"Subcategoria *"}
                        mode={"outlined"}
                        visible={showDropDownSubcategoria}
                        showDropDown={() => setShowDropDownSubcategoria(true)}
                        onDismiss={() => setShowDropDownSubcategoria(false)}
                        value={value}
                        setValue={onChange}
                        list={subcategoriaList}
                      />
                    </View>

                  )}
                />
                <Controller
                  control={control}
                  name="descricao"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      autoCapitalize="none"
                      autoCompleteType="off"
                      autoCorrect={true}
                      keyboardType="default"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      returnKeyType="next"
                      placeholder="Descrição *" 
                      placeholderTextColor="rgba(0, 0, 0, 0.6)"
                      style={styles.formMultilineInput} 
                      textContentType="none"
                      value={value.toString()}
                      multiline={true}
                      numberOfLines={4}
                    />
                  )}
                />

                <Button 
                style={styles.mediaButtonStyle}
                compact={true} 
                icon="attachment" 
                mode="contained" 
                onPress={() => setMediaModalVisible(true)}>
                    <Text>Inserir Mídia</Text>
                </Button>
                {/*<Image style={styles.imageReduced} source={{ uri: image }} />*/}

                <Modal isVisible={mediaModalVisible}>
                  <Modal.Container>
                    <Modal.Header title="Inserir mídia" setIsVisible={undefined}/>
                    <Modal.Body>
                      <Image style={styles.image} source={{ uri: image }} />
                      <View style={styles.modalMediaButtonsContainer}>
                          <Button 
                          style={styles.modalMediaButtonStyle}
                          compact={true} 
                          icon="camera" 
                          mode="contained" 
                          onPress={() => takePicture()}>
                              <Text>Câmera</Text>
                          </Button>

                          <Button 
                          style={styles.modalMediaButtonStyle}
                          compact={true} 
                          icon="image" 
                          mode="contained" 
                          onPress={() => pickImage()}>
                              <Text>Galeria</Text>
                          </Button>
                      </View>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button 
                          style={styles.modalMediaConfirmButton} 
                          icon="check" 
                          mode="contained" 
                          onPress={() => setMediaModalVisible(false)}
                          >
                              <Text>OK</Text>
                        </Button>
                    </Modal.Footer>
                  </Modal.Container>
                </Modal>

                <Button 
                style={styles.modalLeftButtonStyle} 
                icon="" 
                mode="contained" 
                onPress={onSubmit}
                >
                    <Text>Salvar</Text>
                </Button>
                <Button 
                color="#3897f1"
                style={styles.modalRightButtonStyle}
                onPress={() => navigation.navigate('Root')}>
                    <Text>Voltar</Text>
                </Button>
            </View>
          </View>
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
  logoText: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 15,
    marginBottom: 30,
    textAlign: 'center',
  },
  formTextInput: {
    height: 50,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'rgba(220, 220, 220, 0.1)',
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
    color: 'rgba(0, 0, 0, 0.6)'
  },
  formMultilineInput: {
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'rgba(220, 220, 220, 0.1)',
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    width: '100%',
    backgroundColor: 'white'
  },
  modalView: {
    width: '95%',
    display: 'flex',
    height: '95%',
    //backgroundColor: "white",
    padding: 20
  },
  autocompleteView: {
    flex: 1
  },
  modalLeftButtonStyle: {
    backgroundColor: '#3897f1',
    borderRadius: 5,
    height: 45,
    marginTop: 10
  },
  mediaButtonStyle: {
    borderRadius: 5,
    height: 45,
    marginTop: 10,
    marginBottom: 1
  },
  modalRightButtonStyle: {
    height: 45,
    marginTop: 10,
    backgroundColor: 'transparent',
    borderWidth: 0
  },
  clearButtonStyle: {
    zIndex: -1,
    height: 45,
    marginTop: 0,
    paddingTop: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    width: '100%',
    alignItems: 'flex-end'
  },
  modalMediaButtonStyle: {
    borderRadius: 5,
    height: '100%',
    flex: 1,
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 10,
    marginRight: 10
  },
  modalMediaButtonsContainer: {
     flexDirection: 'row', 
     alignSelf: 'flex-start'
  },
  modalMediaConfirmButton: {
    height: '100%',
    flexDirection: 'row', 
    alignSelf: 'center',
    justifyContent: 'center',
    width: '90%',
    borderRadius: 5,
    marginTop: 2,
    marginBottom: 2,
  },
  image: { width: '100%', height: 300, backgroundColor: '#eee', marginBottom: 10, marginTop: 10 },
  imageReduced: { width: '100%', height: 50, backgroundColor: '#eee', marginTop: 1, marginBottom: 5 }
});

export default NovaPostagemScreen; 