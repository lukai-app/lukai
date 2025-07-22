import { SheetManager } from 'react-native-actions-sheet';
import { Pressable, View, Text } from 'react-native';
import { ChevronRight, FileText } from 'lucide-react-native';

export const LegalSelectorTrigger = () => {
  return (
    <Pressable
      className="flex flex-row items-center justify-between p-4"
      onPress={() => {
        SheetManager.show('legal-selector');
      }}
    >
      <View className="flex flex-row items-center">
        <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
          <FileText color="#9CA3AF" size={20} />
        </View>
        <View>
          <Text
            className="text-lg text-white"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            legal
          </Text>
          <Text
            className="text-sm text-gray-400"
            style={{
              fontFamily: 'Nunito_400Regular',
            }}
          >
            términos y privacidad
          </Text>
        </View>
      </View>
      <ChevronRight color="white" size={20} />
    </Pressable>
  );
};
