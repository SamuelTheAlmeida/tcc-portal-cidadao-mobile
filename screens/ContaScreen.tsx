import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {Keyboard, Text, View, TextInput, TouchableWithoutFeedback, Alert, KeyboardAvoidingView} from 'react-native';
import { ActivityIndicator, Button, Colors } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getLoggedUser from '../hooks/getLoggedUser';
import {API_URL} from '@env'
import { MaterialIcons } from '@expo/vector-icons';

interface FormData {
  login: string;
  senha: string;
}

interface AlteracaoFormData {
  nome: string;
  email: string;
}

type ContaScreenProp = StackNavigationProp<RootStackParamList, 'ContaScreen'>;
const ContaScreen=(props: any) => {
  const returnScreen = props?.route?.params?.returnScreen ?? 'MapaScreen';
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [ready, setReady] = useState(false);
  const navigation = useNavigation<ContaScreenProp>();

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      login: '',
      senha: '',
    },
  });

  const { control: alteracaoControl, handleSubmit: alteracaoSubmit, setValue } = useForm<AlteracaoFormData>({
    defaultValues: {
      nome: '',
      email: ''
    },
  });

  useEffect(() => {
    AsyncStorage.getItem('@PORTAL_CIDADAO_USER_TOKEN')
    .then((token) => {
      AsyncStorage.getItem('@PORTAL_CIDADAO_USER_DATA').then
      ((userData) => {
        if (token && userData) {
          setUserData(JSON.parse(userData));
          //console.log('user already logged in');
        } else {
          setUserData(null);
          console.log('user not authenticated');
        }

        setReady(true);
      })

    })
    .catch((err) => console.log(err));
  }, []); // "[]" makes sure the effect will run only once.

  useEffect(() => {
    if (userData) {
      setValue('nome', userData.nome);
      setValue('email', userData.email);
    }
  }, [userData]);

  async function logout() {
    await AsyncStorage.removeItem('@PORTAL_CIDADAO_USER_TOKEN');
    await AsyncStorage.removeItem('@PORTAL_CIDADAO_USER_DATA');
    setUserData(null);
    Toast.show('Logout realizado com sucesso!', {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER
    });
  }

  const onSubmitUpdate = alteracaoSubmit(({ nome, email }) => {
    console.log(nome);
    console.log(email);
    
    setLoading(true);
    let model = {
      nome,
      email
    };

    console.log(userData);
    const usuarioId = userData.id;
    axios.patch(API_URL + '/api/usuario/' + usuarioId, model)
    .then(async response => {
        if (response.status == 200 && response.data?.sucesso) {
            Toast.show('Alteração realizada com sucesso!', {
              duration: Toast.durations.SHORT,
              position: Toast.positions.BOTTOM
            });
        } else {
          Alert.alert('Erro ao realizar alteração de dados no servidor.')
        }
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => setLoading(false));
  });

  const onSubmit = handleSubmit(({ login, senha }) => {
    setLoading(true);
    let model = {
      login,
      senha
    };

    axios.post(API_URL + '/api/usuario/login', model)
    .then(async response => {
        if (response.status == 200) {
          if (response.data?.sucesso) {
            const dados = response.data.dados;
            await AsyncStorage.setItem('@PORTAL_CIDADAO_USER_TOKEN', dados.token);
            await AsyncStorage.setItem('@PORTAL_CIDADAO_USER_DATA', JSON.stringify(dados));
            setUserData(dados);
            Toast.show('Login realizado com sucesso!', {
              duration: Toast.durations.SHORT,
              position: Toast.positions.CENTER
            });
            navigation.navigate('MapaScreen');
          } else {
            Alert.alert('Login ou senha inválidos');
          }
            
        } else {
          Alert.alert('Erro ao realizar login no servidor.')
        }
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => setLoading(false));
  });

    if (userData) {
      return (        
        <View style={styles.accountContainerView}>
          <View style={styles.userHeader}>
            <MaterialIcons name="account-circle" size={128} color="#5B628F" />
            <Text style={styles.userName}>{userData.nome}</Text>
            <Text style={styles.userRole}>{userData.perfil?.nome}</Text>
            <Button
                mode="outlined"
                style={styles.logoutButton}
                onPress={logout}
              >SAIR</Button>
          </View>
          <View style={styles.userFields}>
            <Text style={styles.userFieldLabel}>Nome</Text>
            <Controller
                control={alteracaoControl}
                name="nome"
                render={({ field: { onBlur, onChange, value }}) => (
                  <TextInput
                    autoCapitalize="words"
                    autoCompleteType="name"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={onSubmitUpdate}
                    returnKeyType="next"
                    placeholder="Seu Nome" 
                    placeholderTextColor="#c4c3cb" 
                    style={styles.userUpdatableField} 
                    textContentType="name"
                    value={value}
                  />
                )}
              />
              <Text style={styles.userFieldLabel}>Seu melhor email</Text>
              <Controller
                control={alteracaoControl}
                name="email"
                render={({ field: { onBlur, onChange, value }}) => (
                  <TextInput
                    autoCapitalize="none"
                    autoCompleteType="email"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={onSubmitUpdate}
                    returnKeyType="done"
                    placeholder="Email" 
                    placeholderTextColor="#c4c3cb" 
                    style={styles.userUpdatableField} 
                    textContentType="emailAddress"
                    value={value}
                  />
                )}
              />
              <Button
                mode="contained"
                style={styles.saveDataButton}
                onPress={onSubmitUpdate}
              >Salvar dados</Button>
              <Button
                mode="outlined"
                style={styles.resetPasswordButton}
                onPress={logout}
              >Redefinir senha</Button>
          </View>
        </View>
      )
    } else {
      if (ready) {
        return (
          <KeyboardAvoidingView 
          keyboardVerticalOffset={20}
          style={styles.containerView} 
          behavior="padding">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.loginScreenContainer}>
                <View style={styles.loginFormView}>
                <Text style={styles.logoText}>Portal Cidadão</Text>
        
                <Controller
                  control={control}
                  name="login"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      autoCapitalize="none"
                      autoCompleteType="email"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      returnKeyType="next"
                      placeholder="E-mail ou CPF" 
                      placeholderTextColor="#c4c3cb" 
                      style={styles.loginFormTextInput} 
                      textContentType="username"
                      value={value}
                    />
                  )}
                />
        
                <Controller
                control={control}
                name="senha"
                render={({ field: { onBlur, onChange, value }}) => (
                  <TextInput
                    autoCapitalize="none"
                    autoCompleteType="password"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={onSubmit}
                    returnKeyType="done"
                    secureTextEntry
                    placeholder="Senha" 
                    placeholderTextColor="#c4c3cb" 
                    style={styles.loginFormTextInput} 
                    textContentType="password"
                    value={value}
                  />
                )}
                />
                  <Button
                    style={styles.loginButton}
                    mode="contained"
                    onPress={onSubmit}
                  >Login</Button>
                  <Button
                    style={styles.fbLoginButton}
                    onPress={() => navigation.navigate('MapaScreen')}
                    color="#3897f1"
                  >Entrar como visitante</Button>
                  <Button
                    style={styles.fbLoginButton}
                    onPress={() => navigation.navigate('NovoCadastroScreen', { returnScreen: returnScreen })}
                    color="#3897f1"
                  >Novo Cadastro</Button> 
                  {/* <Button
                    style={styles.fbLoginButton}
                    onPress={() => console.log("pressed login FB!!")}
                    color="#3897f1"
                  >Login with Facebook</Button> */}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );        
      } else {
        return (<ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />)
      }
    }

}

const styles = StyleSheet.create({
  spinner: {
    position: 'absolute',
    top: 50,
    left: 175,
    zIndex: 1,
  },
  containerView: {
    flex: 1,
  },
  accountContainerView: {
    flex: 1,
    paddingVertical: 30
  },
  loginScreenContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "800",
    marginTop: 150,
    marginBottom: 30,
    textAlign: 'center',
  },
  userDataInfo: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: 'center',
    marginBottom: 50
  },
  loginFormView: {
    flex: 1
  },
  loginFormTextInput: {
    height: 43,
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#fafafa',
    paddingLeft: 10,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
  },
  loginButton: {
    backgroundColor: '#3897f1',
    borderRadius: 5,
    height: 45,
    marginTop: 10,
  },
  logoutButton: {
    borderRadius: 5,
    marginTop: 10,
    width: '100%'
  },
  saveDataButton: {
    backgroundColor: '#5B628F',
    borderRadius: 5,
    height: 45,
    marginTop: 10,
    width: '100%'
  },
  resetPasswordButton: {
    height: 45,
    marginTop: 10,
  },
  fbLoginButton: {
    height: 45,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  userHeader: {
    backgroundColor: '#E9F0FB',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 40
  },
  userRole: {
    fontSize: 18,
    fontWeight: '300'
  },
  userFields: {
    flex: 1,
    padding: 30
  },
  userFieldLabel: {
    fontSize: 12,
    paddingLeft: 10,
    color: '#222'
  },
  userUpdatableField: {
    height: 43,
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#fafafa',
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#555'
  },
});

export default ContaScreen;