import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import 'nativewind';

export default function App() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-[#3B5323]">
        <SafeAreaView className="flex-1 items-center justify-center px-4">
          <Text className="text-white text-4xl font-bold text-center mb-4">
            Future home of the HomeHeros App
          </Text>
          <Text className="text-white text-xl text-center">
            Launching in Kelowna – September 2025
          </Text>
          <StatusBar style="light" />
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

