/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';
import ContaScreen from '../screens/ContaScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import MapaScreen from '../screens/NovaPostagemScreen';
import NovaPostagemScreen from '../screens/NovaPostagemScreen';
import NovoCadastroScreen from '../screens/NovoCadastroScreen';
import { RootStackParamList } from '../types';
import BottomTabNavigator from './BottomTabNavigator';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Root" component={BottomTabNavigator} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Screen name="NovaPostagemScreen" component={NovaPostagemScreen} 
      options={{ 
        headerShown: true, 
        headerTitle: 'Nova Postagem', 
        headerTitleAlign: 'center',
        headerTransparent: true
        }} />
      <Stack.Screen name="MapaScreen" component={MapaScreen} />
      <Stack.Screen name="ContaScreen" component={ContaScreen} />
      <Stack.Screen name="NovoCadastroScreen" component={NovoCadastroScreen} options={{ 
        headerShown: true, 
        headerTitle: 'Novo Cadastro', 
        headerTitleAlign: 'center',
        headerTransparent: true
        }} />
    </Stack.Navigator>
  );
}
