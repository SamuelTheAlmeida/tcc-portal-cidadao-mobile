/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import MapaScreen from '../screens/MapaScreen';
import ContaScreen from '../screens/ContaScreen';
import { BottomTabParamList, TabOneParamList, TabTwoParamList } from '../types';
import NovaPostagemScreen from '../screens/NovaPostagemScreen';
import NovoCadastroScreen from '../screens/NovoCadastroScreen';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName='ContaScreen'
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="MapaScreen"
        component={TabOneNavigator}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="ContaScreen"
        component={TabTwoNavigator}
        options={{
          tabBarLabel: 'Conta',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const TabOneStack = createStackNavigator<TabOneParamList>();

function TabOneNavigator() {
  return (
    <TabOneStack.Navigator screenOptions={{ 
      headerTitleAlign: 'center',
      headerTransparent: true
      }}>
      <TabOneStack.Screen
        name="MapaScreen"component={MapaScreen} options={{ 
          headerTitle: 'Portal Cidadão',
          headerShown: false 
        }}
      />
      <TabOneStack.Screen
        name="ContaScreen"
        component={ContaScreen}
        options={{ 
          headerTitle: 'Conta', 
          headerShown: false 
        }}
      />
      <TabOneStack.Screen name="NovaPostagemScreen" component={NovaPostagemScreen} options={{ 
        headerTitle: 'Nova Postagem' 
        }} 
      />
      <TabOneStack.Screen name="NovoCadastroScreen" component={NovoCadastroScreen} options={{ 
        headerTitle: 'Novo Cadastro' 
        }}/>
    </TabOneStack.Navigator>
  );
}

const TabTwoStack = createStackNavigator<TabTwoParamList>();

function TabTwoNavigator() {
  return (
    <TabTwoStack.Navigator screenOptions={{ 
      headerTitleAlign: 'center', 
      headerTransparent: true 
      }}>
      <TabTwoStack.Screen
        name="ContaScreen"
        component={ContaScreen}
        options={{ 
          headerTitle: 'Conta', 
          headerShown: false 
        }}
      />
      <TabTwoStack.Screen
        name="MapaScreen"component={MapaScreen} options={{ 
          headerTitle: 'Portal Cidadão',
          headerShown: false 
        }}
      />

      <TabTwoStack.Screen name="NovaPostagemScreen" component={NovaPostagemScreen} options={{ 
        headerTitle: 'Nova Postagem' 
        }} 
      />
      <TabTwoStack.Screen name="NovoCadastroScreen" component={NovoCadastroScreen} options={{ 
        headerTitle: 'Novo Cadastro' 
        }}/>
    </TabTwoStack.Navigator>
  );
}
