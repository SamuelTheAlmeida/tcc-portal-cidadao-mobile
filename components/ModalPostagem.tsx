import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { StyleSheet, Image, Dimensions, Text, View, ActivityIndicator, TextInput, Alert, TouchableOpacity } from "react-native";
import { Colors } from "react-native-paper";
import capitalizeFirstLetter, { Modal } from "./Modal";
import {API_URL} from '@env'
import { ScrollView } from "react-native-gesture-handler";
import { Controller, useForm } from "react-hook-form";
import Toast from "react-native-root-toast";

type ModalProps = {
  [x: string]: any;
};

interface Comentario {
  descricao: string;
}

function obterTempoPost(data: any) {
  const diferencaMinutos = ((new Date().getTime() - new Date(data).getTime()) / 1000 ) / 60;

  if (diferencaMinutos > 59) {
    const diferencaEmHoras = diferencaMinutos / 60;
    if (diferencaEmHoras > 23) {
      const diferencaEmDias = diferencaEmHoras / 24;
      return Math.round(diferencaEmDias).toString() + 'd';
    } else {
      return Math.round(diferencaEmHoras).toString() + 'h';
    }
  } else {
    return Math.round(diferencaMinutos).toString() + 'm';
  }
}

export const ModalPostagem = ({
  ...props
}: ModalProps) => {
  const [acaoCurtida, setAcaoCurtida] = useState(null);
  const [postResolvido, setPostResolvido] = useState(false);
  const [postExcluido, setPostExcluido] = useState(false);
  const { control, handleSubmit, setValue } = useForm<Comentario>({
    defaultValues: {
      descricao: '',
    },
  });

  useEffect(() => {
    if (props.isVisible) {
      setPostResolvido(false);
    }
      
  }, [props.isVisible]); // "[]" makes sure the effect will run only once.

  async function atualizarCurtida(idCurtida: number, acao: boolean): Promise<void> {
    axios({
      method: "PUT",
      url: `${API_URL}/api/Curtida/${idCurtida}/${acao}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then((response) => {
      //buscarLike();
    })
    .catch((error) => {
        console.log(error);
    });
  }

  async function removerCurtida(idCurtida: number): Promise<void> {
    axios({
      method: "DELETE",
      url: `${API_URL}/api/Curtida/${idCurtida}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then((response) => {
      //buscarLike();
    })
    .catch((error) => {
        console.log(error);
    });
  }

  async function inserirCurtida(acao: boolean, idUsuario: number, idPostagem: number) {
    axios({
      method: "POST",
      url: `${API_URL}/api/Curtida`,
      data: {
        acao: acao,
        pontos: 1,
        usuarioId: idUsuario,
        postagemId: idPostagem
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then((response) => {
      //buscarLike();
    })
    .catch((error) => {
        console.log(error);
    });
  }

  async function curtirOuDescurtir(acao: boolean) {
    if (props?.usuario?.perfil?.nome === 'Especial') {
      Alert.alert('Somente cidadãos podem curtir ou descurtir uma postagem!');
      return;
    }
    props.setLoading(true);
    axios({
      method: "GET",
      url: `${API_URL}/api/curtida/${props.postagem?.id}/${props.usuario?.id}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then((response) => {
      if (response.data && response.data.sucesso && response.data.dados) {
        const curtida = response.data.dados;
        setAcaoCurtida(curtida?.acao);
        if (curtida.acao === !acao) {
          atualizarCurtida(curtida.id, acao);
        } else if (curtida.acao === acao) {
          removerCurtida(curtida.id);
          setAcaoCurtida(null);
        } 
      } else {
        inserirCurtida(acao, props.usuario?.id, props.postagem?.id);
      }
    })
    .catch((error) => {
        console.log(error);
    })
    .finally(() => {
      props.setLoading(false);
      obterCurtida();
      props.atualizarPostagem();
    })
    
  }

  function obterCurtida() {
    props.setLoading(true);
    axios({
      method: "GET",
      url: `${API_URL}/api/curtida/${props.postagem?.id}/${props.usuario?.id}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      httpsAgent: {  
        rejectUnauthorized: false
      }
    }).then((response) => {
      if (response.data && response.data.sucesso && response.data.dados) {
        const curtida = response.data.dados;
        setAcaoCurtida(curtida?.acao);
      }
    })
    .catch((error) => {
        console.log(error);
    });
    props.setLoading(false);
  }

  const onSubmit = handleSubmit(async ({ descricao }) => {
    props.setLoading(true);
    if (!descricao || descricao === '') {
      props.setLoading(false);
      return;
    }
    let model = {
      descricao,
      dataCadastro: new Date(),
      usuarioId: props.usuario?.id,
      postagemId: props.postagem?.id
    };

    axios.post(API_URL + '/api/Comentario', model)
    .then(response => {
        const sucesso = response.status === 200 && response.data?.sucesso;
        if (sucesso) {
            Toast.show(response.data.mensagem.descricao, {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM
            });
        } else {
          if (response.data.mensagem?.descricao) {
            Alert.alert('Erro', response.data.mensagem.descricao);
          } else {
            Alert.alert('Erro', JSON.stringify(response.data));
          }
        }
    })
    .catch((err) => {
      console.log('falha ao inserir');
        //Alert.alert(err);
    })
    .finally(() => { props.setLoading(false); setValue('descricao', ''); props.obterComentarios(props.postagem?.id); });

  });

  function resolverPostagem() {
    if (postResolvido)
      return;

      axios.put(`${API_URL}/api/Postagem/${props.postagem?.id}/true`)
      .then(response => {
          const sucesso = response.status === 200 && response.data?.sucesso;
          if (sucesso) {
              Toast.show(response.data.mensagem.descricao, {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM
              });
              setPostResolvido(true);
          } else {
            if (response.data.mensagem?.descricao) {
              Alert.alert('Erro', response.data.mensagem.descricao);
            } else {
              Alert.alert('Erro', JSON.stringify(response.data));
            }
          }
      })
      .catch((err) => {
        console.log('falha ao resolver postagem');
          //Alert.alert(err);
      })
      .finally(() => { props.setLoading(false); });
  }

  function excluirPostagem() {
    if (postExcluido)
      return;

      Alert.alert(
        "Confirmação",
        "Tem certeza que deseja excluir a postagem?",
        [
          {
            text: "Voltar",
            onPress: () => null
          },
          {
            text: "Confirmar",
            onPress: () => httpExcluirPostagem(),
            style: "cancel",
          },
        ],
        {
          cancelable: true,
          onDismiss: () => null
        }
      );
  }

  function httpExcluirPostagem() {
    axios.put(`${API_URL}/api/Postagem/remover/${props.postagem?.id}/true`)
    .then(response => {
        const sucesso = response.status === 200 && response.data?.sucesso;
        if (sucesso) {
            Toast.show(response.data.mensagem.descricao, {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM
            });
            setPostExcluido(true);
        } else {
          if (response.data.mensagem?.descricao) {
            Alert.alert('Erro', response.data.mensagem.descricao);
          } else {
            Alert.alert('Erro', JSON.stringify(response.data));
          }
        }
    })
    .catch((err) => {
      console.log('falha ao resolver postagem');
        //Alert.alert(err);
    })
    .finally(() => { props.setLoading(false); });
  }

  return (
        <Modal isVisible={props.isVisible}>
          <Modal.Container>
              <Modal.Header title={props.postagem?.titulo} setIsVisible={props.setIsVisible}/>
              {props.loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}

              <ScrollView style={{maxHeight: 500}} persistentScrollbar={true}>
                <Modal.Body>
                  <Text style={{ fontSize: 12, textAlign: 'center'}}>Confiabilidade: {props.postagem?.confiabilidade}</Text>
                  {props.midia ? <Image
                    resizeMode={'cover'}
                    style={styles.postImage}
                    source={{uri: `data:image/gif;base64,${props.midia}`}}
                  />
                  :
                  <Image
                    resizeMode={'cover'}
                    style={styles.postImage}
                    source={require('../assets/images/placeholder.png')}
                  />}
                  <Text style={styles.postDescription}>
                {/* It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.*/}
                  {capitalizeFirstLetter(props.postagem?.descricao)}
                  </Text>

                  <View style={styles.postInfo}>
                    <View style={styles.reactionsContainer}>
                      <View style={styles.likeContainer}>
                        <AntDesign name='like1' size={24} color={acaoCurtida === true ? '#5B628F' : '#000'} onPress={() => curtirOuDescurtir(true)}/>
                        <Text style={{fontSize: 18, marginLeft: 4}}>{props.postagem?.curtidas}</Text>
                      </View>

                      <View style={styles.likeContainer}>
                        <AntDesign name='dislike1' size={24} color={acaoCurtida === false ? '#5B628F' : '#000'} onPress={() => curtirOuDescurtir(false)}/>
                        <Text style={{fontSize: 18, marginLeft: 4}}>{props.postagem?.descurtidas}</Text>
                      </View>
                    </View>

                    <View style={styles.postTimeContainer}> 
                      <AntDesign name="clockcircleo" size={22} color="black" style={{ marginRight: 10}}/>
                      <Text style={{ fontWeight: '600', fontSize: 14}}>por {props.postagem?.usuario?.nome} há {obterTempoPost(props.postagem?.dataCadastro)}</Text>
                    </View>
                  </View>
                  {props?.usuario?.perfil?.nome === 'Administrador' && <View>
                      <TouchableOpacity style={[styles.solveButton, { backgroundColor: (postResolvido ? '#E5E7F5' : '#3F51B5') }]} onPress={resolverPostagem}>
                        <View style={{flexDirection: 'row'}}>
                          <MaterialCommunityIcons name="progress-check" size={20} color="white" />
                          <Text style={{fontSize: 16, color: 'white', marginHorizontal: 5}}>Resolver Postagem</Text>
                        </View>

                      </TouchableOpacity>
                  </View>}

                  {props?.usuario?.perfil?.nome === 'Cidadao' && <View>
                      <TouchableOpacity style={[styles.solveButton, { backgroundColor: (postExcluido ? '#E5E7F5' : '#f70d1a') }]} onPress={excluirPostagem}>
                        <View style={{flexDirection: 'row'}}>
                          <AntDesign name="delete" size={20} color="white" />
                          <Text style={{fontSize: 16, color: 'white', marginHorizontal: 5}}>Excluir Postagem</Text>
                        </View>

                      </TouchableOpacity>
                  </View>}

                  <View
                    style={{
                      borderBottomColor: '#C4C4C4',
                      borderBottomWidth: 1,
                      marginTop: 10,
                      marginBottom: 10
                    }}
                  />

                  <View style={styles.commentsSection}>
                    <View style={styles.commentsSectionTitle}>
                      <Text style={{textAlign: 'center', fontWeight: 'bold'}}>Comentários</Text>
                    </View>

                    <View style={styles.addCommentSection}>
                      <View style={{alignItems: 'center', justifyContent: 'center', flex: 0.2}}>
                        <MaterialIcons name="account-circle" size={48} color="rgba(50, 50, 50, 0.35)" />
                      </View>

                      <View style={{flexDirection: 'column', flex: 0.7}}>
                        <View style={{marginBottom: 3}}>
                          <Text>{props.usuario?.nome} (eu)</Text>
                        </View>

                        <View style={{}}>
                          <Controller
                            control={control}
                            name="descricao"
                            render={({ field: { onBlur, onChange, value } }) => (
                              <TextInput
                              autoCapitalize="sentences"
                              autoCompleteType="off"
                              autoCorrect={true}
                              keyboardType="default"
                              onBlur={onBlur}
                              onChangeText={onChange}
                              onSubmitEditing={onSubmit}
                              value={value}
                              returnKeyType="send"
                              placeholder="Digite aqui seu comentário..." 
                              placeholderTextColor="rgba(0, 0, 0, 0.6)" 
                              style={styles.commentInput} 
                              textContentType="none"
                              />
                            )}
                            
                          />

                        </View>
                      </View>

                      <TouchableOpacity style={{flex: 0.1, alignItems: 'center', justifyContent: 'flex-end'}} onPress={onSubmit}>
                        <Ionicons name="send" size={28} color="#5B628F" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.commentListSection}>
                      {props.comentarios && props.comentarios.map((comentario: any, index: any) => {
                        return <Comentario comentario={comentario} key={index}></Comentario>
                      })}

                    </View>
                    
                  </View>

                </Modal.Body>
              </ScrollView>

              <Modal.Footer>
              </Modal.Footer>
          </Modal.Container>
        </Modal>
  );
};

interface ComentarioProps {
  key: any
  comentario: any
}

const Comentario = ( props: ComentarioProps ) => {
  const { comentario } = props // or props.[YOUR PROPS] to access your named props
  return ( 
  <View style={{flex: 1, flexDirection: 'row', marginBottom: 10}}>
    <View style={{alignItems: 'flex-start', justifyContent: 'center', flex: 0.2}}>
      <MaterialIcons name="account-circle" size={48} color="rgba(50, 50, 50, 0.35)" />
    </View>

    <View style={{flexDirection: 'column', flex: 0.8, alignItems: 'flex-start'}}>
      <View style={{marginBottom: 3}}>
        <Text>{comentario.nomeUsuario}</Text>
      </View>

    <View style={{}}>
        <Text style={{backgroundColor: 'rgba(0, 0, 0, 0.03)', padding: 7}}>
          {capitalizeFirstLetter(comentario.descricao)}
        </Text>
      </View>
    </View>
</View>);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    paddingTop: 10,
    textAlign: "center",
    fontSize: 24,
  },
  body: {
    justifyContent: "center",
    paddingHorizontal: 15,
    minHeight: 100,
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    flexDirection: "row",
  },
  postImage: {
    height: Dimensions.get('window').height / 5,
    width: '100%'
  },
  postDescription: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 13,
    textAlign: 'justify'
  },
  postInfo: {
    flexDirection: 'row'
  },
  reactionsContainer: {
    flexDirection: 'row',
    flex: 1
  },
  likeContainer: {
    //borderWidth: 1,
    flexDirection: 'row',
    flex: 1
  },
  postTimeContainer: {
    flexDirection: 'row',
    flex: 1.25,
    flexWrap: 'wrap'
  },
  spinner: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1,
  },
  commentsSection: {
    flexDirection: 'column'
  },
  commentsSectionTitle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  addCommentSection: {
    flexDirection: 'row'
  },
  commentListSection: {
    marginTop: 30,
    flexDirection: 'column',
    flexWrap: 'wrap'
  },
  commentInput: {
    backgroundColor: '#FFF',
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderRadius: 50,
    paddingLeft: 10,
    paddingRight: 10
  },
  solveButton: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: 5,
    paddingVertical: 7,
    marginVertical: 10
  }
});