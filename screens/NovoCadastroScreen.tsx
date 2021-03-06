import axios from 'axios';
import * as React from 'react';
import { createRef, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import {Keyboard, Text, View, TextInput, TouchableWithoutFeedback, Alert, KeyboardAvoidingView} from 'react-native';
import { ActivityIndicator, Button, Colors } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-root-toast';
import { TextInputMask } from 'react-native-masked-text';
import {API_URL} from '@env'
import Spinner from 'react-native-loading-spinner-overlay';

interface FormData {
  nome: string;
  CPF: string;
  email: string;
  senha: string;
  perfilId: number;
}

type NovoCadastroScreenProp = StackNavigationProp<RootStackParamList, 'NovoCadastroScreen'>;
export default function NovoCadastroScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NovoCadastroScreenProp>();

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      nome: '',
      CPF: '',
      email: '',
      senha: ''
    },
  });

  var refCpfInput = createRef<any>();
  var refEmailInput = useRef<any>();
  var refSenhaInput = useRef<any>();

  const onSubmit = handleSubmit(({ nome, CPF, email, senha }) => {
    setLoading(true);
    if (!nome || !CPF || !email || !senha) {
      Alert.alert(
        'Erro',
        'Por favor, preencha todos os campos obrigatórios'
      )
      return;
    }
    let cleanCPF = CPF.replace(/\D/g,'');
    let model = {
      nome,
      CPF: cleanCPF,
      email,
      senha,
      perfilId: 2 // usuario padrão (cidadão)
    };

    axios.post(API_URL + '/api/usuario', model)
    .then(async response => {
        console.log(response.data);
        if (response.status == 200) {
          if (response.data?.sucesso) {
            const dados = response.data.dados;
            console.log(dados);
            Toast.show('Cadastro realizado com sucesso! Realize o login', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM
            });
            navigation.navigate('ContaScreen');
          } else {
            Alert.alert(response.data?.mensagem?.descricao);
          }
            
        } else {
          Alert.alert('Erro ao realizar cadastro no servidor.')
        }
    })
    .catch((err) => {
        Alert.alert(err.message);
        console.log(err);
    })
    .finally(() => setLoading(false));
  });

    return (
    <KeyboardAvoidingView 
    keyboardVerticalOffset={20}
    style={styles.containerView} 
    behavior="padding">
      <Spinner
        visible={loading}
        color={'#FFF'}
        textContent={'Carregando...'}
        textStyle={{ color: '#FFF', fontSize: 30, textShadowOffset: {width: 2, height: 2}, textShadowColor: 'black', textShadowRadius: 2 }}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.loginScreenContainer}>
          <View style={styles.loginFormView}>
            <Text style={styles.logoText}>Portal Cidadão</Text>

            <Controller
              control={control}
              name="nome"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  autoCapitalize="characters"
                  autoCompleteType="name"
                  autoCorrect={true}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  returnKeyType="next"
                  placeholder="Nome Completo *" 
                  placeholderTextColor="#c4c3cb" 
                  style={styles.loginFormTextInput} 
                  textContentType="name"
                  value={value}
                  maxLength={100}
                  onSubmitEditing={() => refCpfInput?.current._inputElement.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="CPF"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInputMask
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                keyboardType="number-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                returnKeyType="next"
                placeholder="CPF *" 
                placeholderTextColor="#c4c3cb" 
                style={styles.loginFormTextInput} 
                textContentType="none"
                value={value}
                type={'cpf'}
                maxLength={14}
                ref={refCpfInput}
                onSubmitEditing={() => refEmailInput?.current.focus()}
              />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoCompleteType="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  returnKeyType="next"
                  placeholder="E-mail *" 
                  placeholderTextColor="#c4c3cb" 
                  style={styles.loginFormTextInput} 
                  textContentType="username"
                  value={value}
                  onSubmitEditing={() => refSenhaInput?.current.focus()}
                  ref={refEmailInput}
                  maxLength={100}
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
                placeholder="Senha *" 
                placeholderTextColor="#c4c3cb" 
                style={styles.loginFormTextInput} 
                textContentType="password"
                value={value}
                ref={refSenhaInput}
                maxLength={32}
              />
            )}
            />
              <Button
                mode="contained"
                style={styles.loginButton}
                onPress={onSubmit}
              >Salvar dados</Button>
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
