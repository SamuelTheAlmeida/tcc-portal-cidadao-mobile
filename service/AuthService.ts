import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthService = {
    getLoggedUser: function(): any {
        console.log('asdjdassdau')
        AsyncStorage.getItem('@PORTAL_CIDADAO_USER_TOKEN')
        .then((token) => {
            AsyncStorage.getItem('@PORTAL_CIDADAO_USER_DATA').then
            ((userData) => {
            if (token && userData) {
                return JSON.parse(userData);
            } else {
                return null;
            }
            })
        })
        .catch((err) => console.log(err));
    }
}


export default AuthService;