const axios = require('axios');

/**
 * Initiates a mobile money payment collection via Mynkwa API
 * @param {number} amount - Amount to collect in CFA francs (e.g., 1000)
 * @param {string} phoneNumber - Customer's phone number with country code (e.g., "237650000000")
 * @returns {Promise<Object>} Response from Mynkwa API
 * @throws {Error} If the API request fails
 */
async function initiatePayment(amount, phoneNumber) {
  try {
    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!phoneNumber || !/^237[0-9]{9}$/.test(phoneNumber)) {
      throw new Error('Invalid phone number format. Must start with 237 followed by 9 digits');
    }

    // API Configuration
    const MYNKWA_API_URL = 'https://api.pay.staging.mynkwa.com/collect';
    const MYNKWA_API_KEY = process.env.MYNKWA_API_KEY; // Get from environment variables

    if (!MYNKWA_API_KEY) {
      throw new Error('Mynkwa API key not configured');
    }

    // For testing purposes, simulate a successful payment
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        data: {
          transactionId: 'test_' + Date.now(),
          status: 'success',
          amount: amount,
          phoneNumber: phoneNumber
        }
      };
    }

    // Make the API request
    const response = await axios.post(
      MYNKWA_API_URL,
      {
        amount,
        phoneNumber
      },
      {
        headers: {
          'Authorization': `Bearer ${MYNKWA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data,
      transactionId: response.data.transactionId
    };

  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // API responded with error status
      throw new Error(`Payment failed: ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Unable to reach payment service');
    } else {
      // Other errors (including validation)
      throw error;
    }
  }
}

// Example usage:
/*
try {
  const result = await initiatePayment(1000, "237650000000");
  console.log('Payment initiated:', result);
} catch (error) {
  console.error('Payment error:', error.message);
}
*/

module.exports = {
  initiatePayment
}; 