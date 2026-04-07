import SmsListener from 'react-native-android-sms-listener';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Adjust for your backend IP

export const startSmsListener = () => {
  const subscription = SmsListener.addListener(message => {
    console.log('New SMS:', message);
    parseAndSendSms(message);
  });
  return subscription;
};

const parseAndSendSms = async (message) => {
  const { body, originatingAddress } = message;

  // Simple parsing logic - adjust based on your SMS format
  // Example: "You have spent Rs. 100 at Amazon on 01/04/2026"
  const amountMatch = body.match(/Rs\.?\s*(\d+(\.\d{2})?)/i);
  const merchantMatch = body.match(/at\s+([A-Za-z\s]+)/i);
  const dateMatch = body.match(/on\s+([\d\/]+)/);

  if (amountMatch && merchantMatch) {
    const amount = parseFloat(amountMatch[1]);
    const merchant = merchantMatch[1].trim();
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    const expenseData = {
      amount,
      category: 'Payment', // Default category
      description: `Payment at ${merchant}`,
      date,
      merchant,
    };

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/expenses`, expenseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Expense added from SMS');
    } catch (error) {
      console.error('Error sending expense to backend:', error);
    }
  }
};