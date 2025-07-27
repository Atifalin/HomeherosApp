// Platform-specific import for TabNavigator
import { Platform } from 'react-native';

// Import the platform-specific navigators
import TabNavigatorNative from './TabNavigator.native';
import TabNavigatorWeb from './TabNavigator.web';

// Export the appropriate navigator based on platform
export default Platform.OS === 'web' ? TabNavigatorWeb : TabNavigatorNative;
