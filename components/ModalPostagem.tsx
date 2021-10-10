import { AntDesign } from "@expo/vector-icons";
import React, {  } from "react";
import { StyleSheet, Image, Dimensions, Text, View } from "react-native";
import { Modal } from "./Modal";

type ModalProps = {
  [x: string]: any;
};

export const ModalPostagem = ({
  ...props
}: ModalProps) => {
  return (
        <Modal isVisible={props.isVisible} >
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
              {props.postagem.descricao}
              </Text>

              <View style={styles.postInfo}>
                <View style={styles.reactionsContainer}>
                  <View style={styles.likeContainer}>
                    <AntDesign name='like1' size={24} color="#000" onPress={() => console.log('like test')}/>
                    <Text style={{fontSize: 18, marginLeft: 4}}>32</Text>
                  </View>

                  <View style={styles.likeContainer}>
                    <AntDesign name='dislike1' size={24} color="#000" onPress={() => console.log('dislike test')}/>
                    <Text style={{fontSize: 18, marginLeft: 4}}>4</Text>
                  </View>
                </View>

                <View style={styles.postTimeContainer}> 
                  <AntDesign name="clockcircleo" size={22} color="black" style={{ marginRight: 10}}/>
                  <Text style={{ fontWeight: '600', fontSize: 14}}>por João da Silva há 8h</Text>
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
  }
});