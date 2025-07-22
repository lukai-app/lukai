import { View, Text, Pressable } from 'react-native';
import ActionSheet, {
  SheetProps,
  SheetManager,
} from 'react-native-actions-sheet';
import { FileText, Shield } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { WEB_URL } from '@/lib/constants/app';

export const LegalSelectorSheet: React.FC<
  SheetProps<'legal-selector'>
> = () => {
  return (
    <ActionSheet
      gestureEnabled={true}
      indicatorStyle={{
        width: 100,
        backgroundColor: '#9CA3AF',
        marginTop: 10,
      }}
      containerStyle={{
        backgroundColor: '#05060A',
      }}
    >
      <View className="bg-[#05060A] px-6">
        <Text
          className="text-center text-white text-3xl mb-6 mt-8"
          style={{
            fontFamily: 'Nunito_800ExtraBold',
          }}
        >
          legal
        </Text>

        <View className="flex flex-row justify-between mb-10">
          {/* Privacy option */}
          <Pressable
            className="flex flex-col items-center justify-center py-5 px-4 bg-gray-800 rounded-xl w-[48%]"
            onPress={() => {
              Linking.openURL(`${WEB_URL}/privacy.html`);
              SheetManager.hide('legal-selector');
            }}
          >
            <View className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 mb-3">
              <Shield color="#22C55E" size={24} />
            </View>
            <Text
              className="text-sm text-center text-white"
              style={{
                fontFamily: 'Nunito_600SemiBold',
              }}
            >
              política de privacidad
            </Text>
          </Pressable>

          {/* Legal Terms option */}
          <Pressable
            className="flex flex-col items-center justify-center py-5 px-4 bg-gray-800 rounded-xl w-[48%]"
            onPress={() => {
              Linking.openURL(`${WEB_URL}/terms.html`);
              SheetManager.hide('legal-selector');
            }}
          >
            <View className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 mb-3">
              <FileText color="#3B82F6" size={24} />
            </View>
            <Text
              className="text-sm text-center text-white"
              style={{
                fontFamily: 'Nunito_600SemiBold',
              }}
            >
              términos y condiciones
            </Text>
          </Pressable>
        </View>
      </View>
    </ActionSheet>
  );
};
