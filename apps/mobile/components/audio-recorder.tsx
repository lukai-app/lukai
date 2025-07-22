import { View, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Mic, Check, Trash2, MessageCircle } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-root-toast';
import { useSession } from '@/components/auth/ctx';
import { env } from '@/env';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

interface AnalyzeTransactionResponse {
  amount: number;
  description: string;
  categoryKey: string;
  payment_method: string;
  currencyCode: string;
}

interface TransactionRequest {
  text: string;
  phone_number: string;
}

type RecordingState = 'default' | 'recording' | 'submit' | 'submitting';

const analyzeTransaction = async (
  data: TransactionRequest
): Promise<AnalyzeTransactionResponse> => {
  const response = await fetch(
    `${env.EXPO_PUBLIC_AGENT_URL}/api/v1/agent/analyze-transaction`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to process transaction');
  }

  return response.json();
};

interface AudioRecorderProps {
  className?: string;
}

export function AudioRecorder({ className }: AudioRecorderProps) {
  const { session } = useSession();
  const [state, setState] = useState<RecordingState>('default');
  const [transcript, setTranscript] = useState('');

  const { mutateAsync: processTransaction } = useMutation({
    mutationFn: analyzeTransaction,
    onError: (error: Error) => {
      Toast.show(error.message);
      handleCancel();
    },
    onSuccess: (data) => {
      Toast.show(
        `Transacción registrada: ${data.amount} ${data.currencyCode}\nCategory: ${data.categoryKey}`,
        {
          duration: 3000,
        }
      );
      setState('default');
      setTranscript('');
    },
  });

  useSpeechRecognitionEvent('start', () => setState('recording'));
  useSpeechRecognitionEvent('end', () => {
    if (state === 'recording') setState('submit');
  });
  useSpeechRecognitionEvent('result', (event) => {
    setTranscript(event.results[0]?.transcript || '');
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.log('error code:', event.error, 'error message:', event.message);
    handleCancel();
  });

  const handleStart = async () => {
    try {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Toast.show('Microphone permission is required');
        return;
      }

      await ExpoSpeechRecognitionModule.start({
        lang: 'es-ES',
        interimResults: true,
        continuous: false,
      });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      Toast.show('Failed to start recording');
    }
  };

  const handleStop = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const handleCancel = () => {
    if (state === 'recording') {
      ExpoSpeechRecognitionModule.stop();
    }
    setState('default');
    setTranscript('');
  };

  const handleSubmit = async () => {
    if (!transcript || !session?.user?.phone_number) {
      Toast.show('No transcript or phone number available');
      return;
    }

    setState('submitting');
    try {
      await processTransaction({
        text: transcript,
        phone_number: session.user.phone_number,
      });
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  };

  const renderButton = () => {
    const buttonStyles = [styles.mainButton];
    if (state === 'submit' || state === 'submitting') {
      buttonStyles.push(styles.submitButton as any);
    }

    return (
      <Pressable
        style={buttonStyles}
        onPress={() => {
          switch (state) {
            case 'default':
              handleStart();
              break;
            case 'recording':
              handleStop();
              break;
            case 'submit':
              handleSubmit();
              break;
          }
        }}
        disabled={state === 'submitting'}
      >
        {state === 'default' && <Mic color="white" size={24} />}
        {state === 'recording' && <Check color="white" size={24} />}
        {state === 'submit' && (
          <View style={styles.submitContent}>
            <MessageCircle color="white" size={24} />
            <Text style={styles.submitText}>Enviar</Text>
          </View>
        )}
        {state === 'submitting' && (
          <View style={styles.submitContent}>
            <MessageCircle color="white" size={24} />
            <Text style={styles.submitText}>Enviando...</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const showCancelButton = () => {
    return (
      (state === 'recording' || state === 'submit') &&
      !['submitting'].includes(state)
    );
  };

  return (
    <View className={cn('', className)}>
      {(state === 'recording' ||
        state === 'submit' ||
        state === 'submitting') && (
        <View className="bg-[#313131] p-3 rounded-lg mb-4 max-w-[80%]">
          <Text className="text-white">{transcript || 'Escuchando...'}</Text>
        </View>
      )}

      <View className="flex-row items-center gap-4">
        {showCancelButton() && (
          <Pressable
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={state === 'submitting'}
          >
            <Trash2 color="#FF4444" size={24} />
          </Pressable>
        )}
        {renderButton()}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  transcript: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#34C759',
    width: 'auto',
    paddingHorizontal: 20,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
