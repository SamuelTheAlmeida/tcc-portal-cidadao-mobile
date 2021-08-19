import * as React from 'react';
import { createRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Button, Colors, Headline } from 'react-native-paper';
import Geocoder from 'react-native-geocoding';
import { TextInput as RNTextInput } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';

interface Postagem {
  id: number;
  latitude?: number;
  longitude?: number;
}

type novaPostagemScreenProp = StackNavigationProp<RootStackParamList, 'NovaPostagemScreen'>;
export default function MapaScreen() {
const navigation = useNavigation<novaPostagemScreenProp>();

  const [posts, setPosts] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = React.useState('');
  const [location, setLocation] = useState(null);
  const [selection, setSelection] = useState({
    start: 0,
    end: 0
  });
  const key = 'AIzaSyBdlrJedgf_qmWwMOTppGyuzzD3EAk3ZIg';

  const googlePlacesAutocompleteRef = createRef<GooglePlacesAutocompleteRef>();

  Geocoder.init(key, {language : "pt"});
  
  function salvarPostagem() {
    //navigation.navigate('Root', {test: 'aaaa'});

    setLoading(true);
    let model = {
      subcategoria: { codigo: 1, nome: 'Reclamacao', descricao: 'Reclamacao'},
      categoriaId: 1,
      titulo: 'teste',
      descricao: 'teste teste',
      imagemUrl: 'string',
      latitude: location.lat,
      longitude: location.lng,
      bairro: 'teste',
      resolvido: false
    };

    axios.post('http://ec2-18-228-223-188.sa-east-1.compute.amazonaws.com:8080/api/Postagem', model)
    .then(response => {
        console.log(response);
        if (response.status == 200) {
            navigation.navigate('Root');
        }
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => setLoading(false));

    
  }
  
  return (
    <View style={styles.containerStyle}>
    {loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Headline>Nova Postagem</Headline>
            <View style={styles.autocompleteView}>
              <GooglePlacesAutocomplete
                ref={googlePlacesAutocompleteRef}
                placeholder='Localização'
                onPress={(data, details = null) => {
                  // 'details' is provided when fetchDetails = true
                  Geocoder.from(data.description).then((result) => {
                      console.log(result.results[0].geometry.location.lat);
                      console.log(result.results[0].geometry.location.lng);
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
                  textInputContainer: {
                    backgroundColor: 'grey',
                  },
                  textInput: {
                    height: 38,
                    color: '#5d5d5d',
                    fontSize: 16,
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb',
                  },
                }}
              />
                <Button 
                style={{position: 'absolute', right: 0, top: 75, zIndex: -1}} 
                compact={true} 
                icon="close" 
                mode="outlined" 
                onPress={() => { console.log('Pressed'); googlePlacesAutocompleteRef.current.setAddressText(''); }}>
                    Limpar
                </Button>
            </View>
          </View>

          <View style={styles.buttonsView}>
                    <Button style={styles.modalLeftButtonStyle} icon="" mode="contained" onPress={() => { salvarPostagem(); } }>
                    Salvar
                    </Button>
                    <Button style={styles.modalRightButtonStyle} icon="" mode="outlined" onPress={() => setModalVisible(!modalVisible)}>
                        Voltar
                    </Button>
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
    width: '100%',
    backgroundColor: 'white'
  },
  modalView: {
    width: '95%',
    display: 'flex',
    height: '50%',
    //backgroundColor: "white",
    padding: 20
  },
  autocompleteView: {
    paddingTop: 30,
    paddingBottom: 30,
    height: '100%',
    width: '100%',
    zIndex: 1000,
    elevation: 1000
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
