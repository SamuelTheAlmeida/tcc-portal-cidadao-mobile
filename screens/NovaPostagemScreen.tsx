import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Text, TextInput } from 'react-native';
import { Button, Colors } from 'react-native-paper';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDown from "react-native-paper-dropdown";

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
export default function MapaScreen() {
const navigation = useNavigation<novaPostagemScreenProp>();

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
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
  const [showDropDownCategoria, setShowDropDownCategoria] = useState(false);
  const [showDropDownSubcategoria, setShowDropDownSubcategoria] = useState(false);
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

  const onSubmit = handleSubmit(async ({ titulo, categoriaId, subcategoria, descricao }) => {
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
    console.log(model);

    axios.post('http://ec2-18-228-223-188.sa-east-1.compute.amazonaws.com:8080/api/Postagem', model)
    .then(response => {
      console.log(response);
        if (response.status == 200) {
            Toast.show(response.data.mensagem.descricao, {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM
            });
            navigation.navigate('Root');
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
    /*marginLeft: 15,
    marginRight: 15,
*/
  },
  formSelectInput: {
    height: 50,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'rgba(220, 220, 220, 0.1)',
    //paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
    color: 'rgba(0, 0, 0, 0.6)' 
  },
  formSelectInputItem: {
    height: 50,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#000',
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

