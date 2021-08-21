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
};

export type BottomTabParamList = {
  MapaScreen: {};
  NovaPostagemScreen: undefined;
  ContaScreen: undefined;
};

export type TabOneParamList = {
  MapaScreen: undefined;
};

export type TabTwoParamList = {
  ContaScreen: undefined;
};
