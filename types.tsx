/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: {};
  NotFound: undefined;
  ContaScreen: undefined;
  MapaScreen: {};
  NovaPostagemScreen: undefined;
  NovoCadastroScreen: undefined;
};

export type BottomTabParamList = {
  MapaScreen: {};
  NovaPostagemScreen: undefined;
  ContaScreen: undefined;
  NovoCadastroScreen: undefined;
};

export type TabOneParamList = {
  MapaScreen: undefined;
};

export type TabTwoParamList = {
  ContaScreen: undefined;
};
