import { Platform } from 'react-native';
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
