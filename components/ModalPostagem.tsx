import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import { StyleSheet, Image, Dimensions, Text, View, ActivityIndicator } from "react-native";
import { Colors } from "react-native-paper";
import { Modal } from "./Modal";
const apiUrl = 'http://10.0.2.2:5000';
const apiUrlProd = 'http://ec2-18-228-223-188.sa-east-1.compute.amazonaws.com:8080';

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
      url: `${apiUrl}/api/Curtida/${idCurtida}/${acao}`,
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
      url: `${apiUrl}/api/Curtida/${idCurtida}`,
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
      url: `${apiUrl}/api/Curtida`,
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
    props.setLoading(true);
    axios({
      method: "GET",
      url: `${apiUrl}/api/curtida/${props.postagem?.id}/${props.usuario?.id}`,
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
      url: `${apiUrl}/api/curtida/${props.postagem?.id}/${props.usuario?.id}`,
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
          {props.loading && <ActivityIndicator size="large" style={styles.spinner} animating={true} color={Colors.blue800} />}

        <Modal.Container>

            <Modal.Header title={props.postagem?.titulo} setIsVisible={props.setIsVisible}/>

            {/*<Modal.Header title="Test" setIsVisible={props.setIsVisible}/>*/}
            <Modal.Body>

              <Image
                resizeMode={'cover'}
                style={styles.postImage}
                source={require('../assets/images/teste.png')}
              />
              <Text style={styles.postDescription}>
              {/*It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.*/}
              {props.postagem?.descricao}
              </Text>

              <View style={styles.postInfo}>
                <View style={styles.reactionsContainer}>
                  <View style={styles.likeContainer}>
                    <AntDesign name='like1' size={24} color={acaoCurtida === true ? '#006DCC' : '#000'} onPress={() => curtirOuDescurtir(true)}/>
                    <Text style={{fontSize: 18, marginLeft: 4}}>{props.postagem?.curtidas}</Text>
                  </View>

                  <View style={styles.likeContainer}>
                    <AntDesign name='dislike1' size={24} color={acaoCurtida === false ? '#006DCC' : '#000'} onPress={() => curtirOuDescurtir(false)}/>
                    <Text style={{fontSize: 18, marginLeft: 4}}>{props.postagem?.descurtidas}</Text>
                  </View>
                </View>

                <View style={styles.postTimeContainer}> 
                  <AntDesign name="clockcircleo" size={22} color="black" style={{ marginRight: 10}}/>
                  <Text style={{ fontWeight: '600', fontSize: 14}}>por {props.postagem?.usuario?.nome} há {obterTempoPost(props.postagem?.dataCadastro)}</Text>
                </View>
              </View>

            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal.Container>
        </Modal>
  );
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
    position: 'relative',
    //top: 255,
    zIndex: 1,
  }
});