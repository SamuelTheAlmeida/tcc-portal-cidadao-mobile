import axios from 'axios';
import * as React from 'react';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import {Keyboard, Text, View, TextInput, TouchableWithoutFeedback, Alert, KeyboardAvoidingView} from 'react-native';
import { ActivityIndicator, Button, Colors } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-root-toast';
import JWT from 'expo-jwt';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormData {
  login: string;
  senha: string;
}

type ContaScreenProp = StackNavigationProp<RootStackParamList, 'ContaScreen'>;
export default function ContaScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ContaScreenProp>();

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      login: '',
      senha: '',
    },
  });

  const onSubmit = handleSubmit(({ login, senha }) => {
    setLoading(true);
    let model = {
      login,
      senha
    };

    axios.post('http://ec2-18-228-223-188.sa-east-1.compute.amazonaws.com:8080/api/usuario/login', model)
    .then(async response => {
        console.log(response.data.dados.token);
        if (response.status == 200) {
          if (response.data?.sucesso) {
            const dados = response.data.dados;
            console.log(JWT.decode(dados.token, 'c3ecf6c5baf0b269698c385e4a647f3e'));
            await AsyncStorage.setItem('@PORTAL_CIDADAO_USER_TOKEN', dados.token);
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

    return (
    <KeyboardAvoidingView 
    keyboardVerticalOffset={20}
    style={styles.containerView} 
    behavior="padding">
    {loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}

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
            onPress={onSubmit}
          >Login</Button>
          <Button
            style={styles.fbLoginButton}
            onPress={() => navigation.navigate('NovoCadastroScreen')}
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
  fbLoginButton: {
    height: 45,
    marginTop: 10,
    backgroundColor: 'transparent',
  }
});
