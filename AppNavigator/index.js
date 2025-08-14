// This file handles platform-specific imports for AppNavigator
import { Platform } from 'react-native';

// Import the appropriate navigator based on platform
let AppNavigator;
if (Platform.OS === 'web') {
  AppNavigator = require('../AppNavigator.web.tsx').default;
} else {
  AppNavigator = require('../AppNavigator.native.tsx').default;
}

export default AppNavigator;
