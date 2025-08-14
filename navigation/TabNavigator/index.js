// This file handles platform-specific imports for TabNavigator
import { Platform } from 'react-native';

// Import the appropriate navigator based on platform
let TabNavigator;
if (Platform.OS === 'web') {
  TabNavigator = require('../TabNavigator.web.tsx').default;
} else {
  TabNavigator = require('../TabNavigator.native.tsx').default;
}

export default TabNavigator;
