import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhoneNumber } from '@/components/auth/phone-number';
import { OTPVerification } from '@/components/auth/otp-verification';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [screen, setScreen] = useState<'phone' | 'code'>('phone');

  const handleTermsPress = () => {
    Linking.openURL('/terms.html');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('/privacy.html');
  };

  return (
    <LinearGradient
      colors={['#000000', '#34D399']}
      locations={[0, 1]}
      style={styles.container}
      start={{ x: 0.3, y: 0.6 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentWrapper}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo-white.png')}
                resizeMode="contain"
                style={styles.logo}
              />
            </View>

            <View style={styles.innerContent}>
              <Text style={styles.title}>
                Registra tus gastos desde WhatsApp.
              </Text>

              {screen === 'phone' ? (
                <PhoneNumber
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  setScreen={setScreen}
                />
              ) : screen === 'code' && phoneNumber ? (
                <OTPVerification phoneNumber={phoneNumber} />
              ) : null}

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  Al continuar, aceptas nuestros {'\n'}
                  <Text style={styles.linkText} onPress={handleTermsPress}>
                    Términos de uso
                  </Text>{' '}
                  y{' '}
                  <Text style={styles.linkText} onPress={handlePrivacyPress}>
                    Política de privacidad
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    padding: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    zIndex: 10,
  },
  logo: {
    height: 48,
    width: 150,
  },
  innerContent: {
    width: '100%',
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
    marginBottom: 40,
    alignSelf: 'flex-start',
  },
  termsContainer: {
    marginTop: 48,
    alignSelf: 'flex-start',
  },
  termsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  linkText: {
    color: '#34D399',
  },
  whatsappContainer: {
    marginVertical: 24,
    alignSelf: 'flex-start',
  },
  whatsappText: {
    fontSize: 12,
    color: '#a3a3a3',
  },
});
