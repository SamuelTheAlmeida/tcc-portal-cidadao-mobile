import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { StyleSheet, Image, Dimensions, Text, View, ActivityIndicator, TextInput } from "react-native";
import { Colors } from "react-native-paper";
import capitalizeFirstLetter, { Modal } from "./Modal";
import {API_URL} from '@env'
import { ScrollView } from "react-native-gesture-handler";

type ModalProps = {
  [x: string]: any;
};

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
    console.log('props', props);
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
    console.log('props', props);
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

  return (
        <Modal isVisible={props.isVisible} >

        <Modal.Container>

            <Modal.Header title={props.postagem?.titulo} setIsVisible={props.setIsVisible}/>
            {props.loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}

            <ScrollView style={{maxHeight: 500}} persistentScrollbar={true}>
              <Modal.Body>
                <Image
                  resizeMode={'cover'}
                  style={styles.postImage}
                  source={require('../assets/images/teste.png')}
                />
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
                        <TextInput
                          autoCapitalize="sentences"
                          autoCompleteType="off"
                          autoCorrect={true}
                          keyboardType="default"
                          returnKeyType="send"
                          placeholder="Digite aqui seu comentário..." 
                          placeholderTextColor="rgba(0, 0, 0, 0.6)" 
                          style={styles.commentInput} 
                          textContentType="none"
                        />
                      </View>
                    </View>

                    <View style={{flex: 0.1, alignItems: 'center', justifyContent: 'flex-end'}}>
                      <Ionicons name="send" size={28} color="#5B628F" />
                    </View>
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
        <Text>{comentario.usuarioId.toString()}</Text>
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
    flex: 1.25
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
  }
});