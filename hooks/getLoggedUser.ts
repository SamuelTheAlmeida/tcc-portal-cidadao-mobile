import AsyncStorage from "@react-native-async-storage/async-storage";

export default function getLoggedUser(): any {
  AsyncStorage.getItem('@PORTAL_CIDADAO_USER_TOKEN')
  .then(async (token) => {
      AsyncStorage.getItem('@PORTAL_CIDADAO_USER_DATA').then
      (async (userData) => {
      if (token && userData) {
          return (JSON.parse(userData));
      } else {
          return (null);
      }
      })
  })
  .catch((err) => console.log(err));
}
