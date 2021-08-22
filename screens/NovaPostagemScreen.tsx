import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Text, TextInput } from 'react-native';
import { Button, Colors, Headline } from 'react-native-paper';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-root-toast';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EnumModel {
  codigo: string;
  nome: string;
  descricao: string;
}

interface CategoriaModel {
  id: number;
  nome: string;
  descricao: string;
}

interface Postagem {
  titulo: string;
  categoriaId: number; //mudar para CategoriaModel
  subcategoria: string; //mudar para EnumModel
  descricao: string;
  imagemUrl: string;
  latitude: number;
  longitude: number;
  bairro: string;
  usuarioId: number;
}

type novaPostagemScreenProp = StackNavigationProp<RootStackParamList, 'NovaPostagemScreen'>;
export default function MapaScreen() {
const navigation = useNavigation<novaPostagemScreenProp>();

  const [modalVisible, setModalVisible] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const key = 'AIzaSyBdlrJedgf_qmWwMOTppGyuzzD3EAk3ZIg';

  var googlePlacesAutocompleteRef = useRef<GooglePlacesAutocompleteRef>();
  const { control, handleSubmit } = useForm<Postagem>({
    defaultValues: {
      titulo: '',
      categoriaId: 0,
      subcategoria: '',
      descricao: '',
      imagemUrl: '',
      latitude: 0,
      longitude: 0,
      bairro: '',
      usuarioId: 0
    },
  });

  Geocoder.init(key, {language : "pt"});
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    await Location.getCurrentPositionAsync()
    .then((pos) => {
      if (pos) {
        Geocoder.from(pos.coords.latitude, pos.coords.longitude)
        .then(json => {
          googlePlacesAutocompleteRef.current.setAddressText(json.results[0].formatted_address);
        })
        .catch(error => console.warn(error));
      }
    });
  })

  useEffect(() => {
    setTimeout(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          return;
        }
  
        await Location.getCurrentPositionAsync()
        .then((pos) => {
          if (pos) {
            Geocoder.from(pos.coords.latitude, pos.coords.longitude)
            .then(json => {
              setLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                bairro: json.results[0]?.address_components[2]?.long_name
            });
              googlePlacesAutocompleteRef.current.setAddressText(json.results[0].formatted_address);
            })
            .catch(error => console.warn(error)); 
          }
        });

        obterCategorias();
  
      })();
    }, 0);

  }, []); // "[]" makes sure the effect will run only once.

  function obterCategorias() {
    axios.get('http://ec2-18-228-223-188.sa-east-1.compute.amazonaws.com:8080/api/Postagem/categorias')
    .then(response => {
        if (response.status == 200 && response.data) {
            setCategorias(response.data.dados);
        }
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => setLoading(false));
  }

  const onSubmit = handleSubmit(async ({ titulo, categoriaId, subcategoria, descricao }) => {
    setLoading(true);
    const userData = JSON.parse(await AsyncStorage.getItem('@PORTAL_CIDADAO_USER_DATA'));
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
    console.log(model);

    axios.post('http://ec2-18-228-223-188.sa-east-1.compute.amazonaws.com:8080/api/Postagem', model)
    .then(response => {
      console.log(response.data);
        if (response.status == 200) {
            Toast.show(response.data.mensagem.descricao, {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM
            });
            navigation.navigate('Root');
        }
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => setLoading(false));

  });
  
  return (
    <View style={styles.containerStyle}>
    {loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.logoText}>Nova Postagem</Text>
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
                            lng: resultLocation.lng
                        });
                    })
                    //console.log(data.coords.latitude);
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
                      marginTop: 5,
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
                onPress={() => { console.log('Pressed'); googlePlacesAutocompleteRef.current.setAddressText(''); }}>
                    Limpar
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
                      placeholderTextColor="#c4c3cb" 
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
                    <View style={styles.formSelectInput}>
                      <Picker
                        onValueChange={onChange}
                        selectedValue={value}
                        style={styles.formSelectInput}
                        itemStyle={styles.formSelectInput}
                      >
                        {categorias.map((item,index) => {
                            return (
                                <Picker.Item
                                    key={index} 
                                    style={styles.formSelectInputItem}
                                    label = {`${item.nome}`} 
                                    value={item.id}
                                />
                            );
                        })}
                      </Picker>
                    </View>

                  )}
                />
                <Controller
                  control={control}
                  name="subcategoria"
                  render={({ field: { onBlur, onChange, value } }) => (
                    /*<TextInput
                      autoCapitalize="none"
                      autoCompleteType="off"
                      autoCorrect={true}
                      keyboardType="default"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      returnKeyType="next"
                      placeholder="Subcategoria *" 
                      placeholderTextColor="#c4c3cb" 
                      style={styles.formTextInput} 
                      textContentType="none"
                      value={value.toString()}
                    />*/
                    <View style={styles.formSelectInput}>
                      <Picker
                      onValueChange={onChange}
                      selectedValue={1}
                      style={styles.formSelectInput}
                      itemStyle={styles.formSelectInput}
                      >
                        <Picker.Item
                            style={styles.formSelectInputItem}
                            label='Reclamação' 
                            value='1'
                        />
                        <Picker.Item
                            style={styles.formSelectInputItem}
                            label='Elogio' 
                            value='2'
                        />
                        <Picker.Item
                            style={styles.formSelectInputItem}
                            label='Sugestão' 
                            value='3'
                        />
                      </Picker>
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
                      placeholderTextColor="#c4c3cb" 
                      style={styles.formMultilineInput} 
                      textContentType="none"
                      value={value.toString()}
                      multiline={true}
                      numberOfLines={6}
                    />
                  )}
                />

                <Button 
                style={styles.modalLeftButtonStyle} 
                icon="" 
                mode="contained" 
                onPress={onSubmit}
                >
                    Salvar
                    </Button>
                <Button 
                color="#3897f1"
                style={styles.modalRightButtonStyle}
                onPress={() => navigation.navigate('Root')}>
                    Voltar
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
    height: 43,
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#fafafa',
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
    color: 'black'
    /*marginLeft: 15,
    marginRight: 15,
*/
  },
  formSelectInput: {
    height: 43,
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#fafafa',
    //paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
    color: '#c4c3cb' 
  },
  formSelectInputItem: {
    height: 43,
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#fafafa',
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
    color: '#c4c3cb' 
  },
  formMultilineInput: {
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#fafafa',
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
  }
});

