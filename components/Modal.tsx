import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import RNModal from "react-native-modal";

type ModalProps = {
  isVisible: boolean;
  children: React.ReactNode;
  [x: string]: any;
};

export const Modal = ({
  isVisible = false,
  children,
  ...props
}: ModalProps) => {
  return (
    <RNModal
      isVisible={isVisible}
      animationInTiming={1000}
      animationOutTiming={1000}
      backdropTransitionInTiming={800}
      backdropTransitionOutTiming={800}
      {...props}>
      {children}
    </RNModal>
  );
};

const ModalContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.container}>{children}</View>
);

const ModalHeader = ({ title, setIsVisible }: { title: string, setIsVisible: any }) => (
  <View style={styles.header}>
    <Ionicons name="md-arrow-back" size={32} color="black" style={styles.backButton} onPress={() => setIsVisible()}/>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const ModalBody = ({ children }: { children?: React.ReactNode }) => (
  <View style={styles.body}>{children}</View>
);

const ModalFooter = ({ children }: { children?: React.ReactNode }) => (
  <View style={styles.footer}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  header: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 20,
    flexDirection: 'row',
  },
  text: {
    paddingTop: 10,
    textAlign: "center",
    fontSize: 24,
  },
  backButton: {
    //borderWidth: 1,
    alignSelf: 'flex-start',
    textAlign: 'left',
    display: 'flex',
    flex: 1
  },
  title: {
    //borderWidth: 1,
    display: 'flex',
    flex: 5,
    textAlign: 'left',
    fontSize: 24,
    fontWeight: '600'
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
});

Modal.Header = ModalHeader;
Modal.Container = ModalContainer;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;