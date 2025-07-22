import { router, Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import {
  XIcon,
  CreditCard,
  FolderTree,
  Star,
  HelpCircle,
  History,
  Activity,
  ChevronRightIcon,
} from 'lucide-react-native';
import * as Linking from 'expo-linking';

import { useSession } from '@/components/auth/ctx';
import { getWhatsappBotLinkWithMessage } from '../../lib/constants/chat';

import { CountrySelectorTrigger } from '@/components/settings/country-selector-trigger';
import { LanguageSelectorTrigger } from '@/components/settings/language-selector-trigger';
import { CurrencySelectorTrigger } from '@/components/settings/currency-selector-trigger';
import { LocaleSelectorTrigger } from '@/components/settings/locale-selector-trigger';
import { TimezoneSelectorTrigger } from '@/components/settings/timezone-selector-trigger';
import { LegalSelectorTrigger } from '@/components/settings/legal-selector-trigger';
import { SubscriptionStatusSimple } from '../../components/SubscriptionStatusSimple';
import { APP_VERSION } from '@/lib/constants/app';

export default function SettingsScreen() {
  const { session, signOut } = useSession();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#05060A' }}
      className="pt-6 px-5"
    >
      {/* Header */}
      <View className="mb-6 flex flex-row items-center gap-3 w-full mt-10">
        <Pressable
          className="rounded-full active:bg-[#1F2937] p-2 items-center justify-center"
          onPress={() => {
            const canGoBack = router.canGoBack();
            if (canGoBack) {
              router.back();
            } else {
              router.navigate('/');
            }
          }}
        >
          <XIcon className="h-5 w-5" color={'white'} />
        </Pressable>
        <Text
          className="text-left text-white text-3xl"
          style={{
            fontFamily: 'Nunito_700Bold',
          }}
        >
          ajustes
        </Text>
      </View>

      <ScrollView>
        {/* Features Section */}
        <View>
          <Text
            className="text-lg font-medium text-gray-500 px-1 mb-2"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            funciones
          </Text>
          <View className="rounded-xl bg-[rgba(38,38,38,0.3)] overflow-hidden">
            <View className="space-y-1">
              {/* Income */}
              <View className="flex flex-row items-center justify-between p-4 opacity-50">
                <View className="flex flex-row items-center">
                  <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                    <CreditCard color="#22C55E" size={20} />
                  </View>
                  <Text
                    className="text-lg text-white"
                    style={{
                      fontFamily: 'Nunito_600SemiBold',
                    }}
                  >
                    habilitar ingresos (pronto)
                  </Text>
                </View>
              </View>

              {/* Categories */}
              <View className="flex flex-row items-center justify-between p-4 opacity-50">
                <View className="flex flex-row items-center">
                  <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                    <FolderTree color="#3B82F6" size={20} />
                  </View>
                  <Text
                    className="text-lg text-white"
                    style={{
                      fontFamily: 'Nunito_600SemiBold',
                    }}
                  >
                    categorías (pronto)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Region Section */}
        <View className="mt-8">
          <Text
            className="text-lg font-medium text-gray-500 px-1 mb-2"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            región
          </Text>
          <View className="rounded-xl bg-[rgba(38,38,38,0.3)] overflow-hidden">
            <View className="space-y-1">
              <CountrySelectorTrigger />
              <LanguageSelectorTrigger />
              <CurrencySelectorTrigger />
              <LocaleSelectorTrigger />
              <TimezoneSelectorTrigger />
            </View>
          </View>
        </View>

        {/* More Section */}
        <View className="mt-8">
          <Text
            className="text-lg font-medium text-gray-500 px-1 mb-2"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            más
          </Text>
          <View className="rounded-xl bg-[rgba(38,38,38,0.3)] overflow-hidden">
            <View className="space-y-1">
              {/* Premium */}
              {session?.user && (
                <SubscriptionStatusSimple user={session?.user} />
              )}

              {/* Review */}
              <Pressable
                onPress={() => {
                  Linking.openURL(
                    getWhatsappBotLinkWithMessage(
                      'Hola!! me gustaría dejar una reseña de la app'
                    )
                  );
                }}
                className="flex flex-row items-center justify-between p-4 active:bg-gray-800"
              >
                <View className="flex flex-row items-center">
                  <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                    <Star color="#F59E0B" size={20} />
                  </View>
                  <View>
                    <Text
                      className="text-lg text-white"
                      style={{
                        fontFamily: 'Nunito_600SemiBold',
                      }}
                    >
                      reseña
                    </Text>
                    <Text
                      className="text-sm text-gray-400"
                      style={{
                        fontFamily: 'Nunito_400Regular',
                      }}
                    >
                      envíanos comentarios en whatsapp
                    </Text>
                  </View>
                </View>
                <View>
                  <ChevronRightIcon color="white" size={20} />
                </View>
              </Pressable>

              {/* Help */}
              <Pressable
                onPress={() => {
                  Linking.openURL(
                    getWhatsappBotLinkWithMessage(
                      'Hola!! necesito ayuda con la app'
                    )
                  );
                }}
                className="flex flex-row items-center justify-between p-4 active:bg-gray-800"
              >
                <View className="flex flex-row items-center">
                  <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                    <HelpCircle color="#3B82F6" size={20} />
                  </View>
                  <View>
                    <Text
                      className="text-lg text-white"
                      style={{
                        fontFamily: 'Nunito_600SemiBold',
                      }}
                    >
                      ayuda
                    </Text>
                    <Text
                      className="text-sm text-gray-400"
                      style={{
                        fontFamily: 'Nunito_400Regular',
                      }}
                    >
                      tuviste algún problema?
                    </Text>
                  </View>
                </View>
                <View>
                  <ChevronRightIcon color="white" size={20} />
                </View>
              </Pressable>

              {/* Legal */}
              <LegalSelectorTrigger />

              {/* Changelog */}
              <View className="flex flex-row items-center justify-between p-4 opacity-50">
                <View className="flex flex-row items-center">
                  <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                    <History color="#A855F7" size={20} />
                  </View>
                  <View>
                    <Text
                      className="text-lg text-white"
                      style={{
                        fontFamily: 'Nunito_600SemiBold',
                      }}
                    >
                      changelog (pronto)
                    </Text>
                    <Text
                      className="text-sm text-gray-400"
                      style={{
                        fontFamily: 'Nunito_400Regular',
                      }}
                    >
                      descubre las novedades de la app
                    </Text>
                  </View>
                </View>
                <View>
                  <ChevronRightIcon color="white" size={20} />
                </View>
              </View>

              {/* Status */}
              <Pressable
                onPress={() => {
                  Linking.openURL('https://status.apolochat.com');
                }}
                className="flex flex-row items-center justify-between p-4 active:bg-gray-800"
              >
                <View className="flex flex-row items-center">
                  <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                    <Activity color="#22C55E" size={20} />
                  </View>
                  <View>
                    <Text
                      className="text-lg text-white"
                      style={{
                        fontFamily: 'Nunito_600SemiBold',
                      }}
                    >
                      estado
                    </Text>
                    <Text
                      className="text-sm text-gray-400"
                      style={{
                        fontFamily: 'Nunito_400Regular',
                      }}
                    >
                      todos los sistemas operativos
                    </Text>
                  </View>
                </View>
                <View>
                  <ChevronRightIcon color="white" size={20} />
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="justify-center mt-10 w-full items-center">
          <Pressable
            onPress={() => {
              signOut();
            }}
            className="bg-[#1F2937] px-4 h-10 rounded-2xl flex flex-row items-center justify-center"
          >
            <Text
              className="text-white"
              style={{
                fontFamily: 'Nunito_600SemiBold',
              }}
            >
              cerrar sesión
            </Text>
          </Pressable>
        </View>

        <View className="flex my-6 pb-10 justify-center items-center flex-col gap-2">
          <Text
            className="text-muted-foreground text-sm"
            style={{
              fontFamily: 'Nunito_400Regular',
            }}
          >
            v{APP_VERSION}
          </Text>
          <Text
            className="text-muted-foreground text-sm"
            style={{
              fontFamily: 'Nunito_400Regular',
            }}
          >
            síguenos en
          </Text>
          <View className="flex flex-row gap-3">
            <Link href="https://www.tiktok.com/@apolo.chat">
              <FontAwesome5 name="instagram" size={24} color="#9CA3AF" />
            </Link>
            <Link
              href="https://www.instagram.com/apolo.chat/"
              className="hover:text-gray-300 text-gray-400"
            >
              <FontAwesome5 name="tiktok" size={24} color="#9CA3AF" />
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
