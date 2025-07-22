import { View } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Parece que estás perdido' }} />
      <View className="flex bg-[#25292e] justify-center items-center">
        <Link href="/" className="text-[#fff] font-xl underline">
          Regresar a la pagina principal
        </Link>
      </View>
    </>
  );
}
