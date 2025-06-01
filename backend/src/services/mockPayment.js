// Mock payment service for development
class MockPaymentService {
  constructor() {
    this.transactions = new Map();
  }

  async initiatePayment({ amount, phoneNumber, description, external_reference }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a transaction ID
    const transactionId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store transaction details
    this.transactions.set(transactionId, {
      amount,
      phoneNumber,
      description,
      external_reference,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    // Return mock response
    return {
      success: true,
      transaction_id: transactionId,
      status: 'pending',
      message: 'Payment initiated successfully'
    };
  }

  async checkStatus(transactionId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Simulate payment success after 5 seconds
    const elapsedTime = Date.now() - new Date(transaction.created_at).getTime();
    if (elapsedTime > 5000) {
      transaction.status = 'success';
    }

    return {
      transaction_id: transactionId,
      status: transaction.status,
      amount: transaction.amount,
      phone: transaction.phoneNumber
    };
  }
}

module.exports = new MockPaymentService(); 