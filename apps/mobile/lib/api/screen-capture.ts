import { API_URL } from '@/lib/constants';

interface ScreenCaptureResponse {
  amount: number;
  description: string;
  category_raw: string;
  account_raw: string;
}

export async function processScreenCapture(
  base64Image: string
): Promise<ScreenCaptureResponse> {
  try {
    /* const response = await fetch(`${API_URL}/screen-capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process screen capture');
    }
 */
    // For MVP, return mock data
    return {
      amount: 12.5,
      description: 'Coffee at Starbucks',
      category_raw: 'food',
      account_raw: 'Yape',
    };
  } catch (error) {
    console.error('Error processing screen capture:', error);
    throw error;
  }
}
