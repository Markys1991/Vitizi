const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const YOOMONEY_API_URL = 'https://yoomoney.ru/api';

class PaymentService {
  constructor() {
    if (!process.env.YOOMONEY_WALLET || !process.env.YOOMONEY_ACCESS_TOKEN) {
      throw new Error('ЮMoney credentials not configured');
    }
    this.commissionPercent = 2; // Процент комиссии (2%)
  }

  // Рассчитываем сумму с учетом комиссии
  calculateAmountWithCommission(amount) {
    const commission = amount * (this.commissionPercent / 100);
    return (amount + commission).toFixed(2);
  }

  async createPayment(amount, description, userId) {
    try {
      // Рассчитываем итоговую сумму с комиссией
      const amountWithCommission = this.calculateAmountWithCommission(amount);
      
      // Генерируем уникальный ID для платежа
      const operationId = `tg_${userId}_${Date.now()}`;
      
      // Формируем платежную ссылку с комиссией
      const paymentUrl = new URL('https://yoomoney.ru/quickpay/confirm.xml');
      paymentUrl.searchParams.append('receiver', process.env.YOOMONEY_WALLET);
      paymentUrl.searchParams.append('quickpay-form', 'small');
      paymentUrl.searchParams.append('targets', description);
      paymentUrl.searchParams.append('paymentType', 'AC'); // AC - карта, PC - кошелек
      paymentUrl.searchParams.append('sum', amountWithCommission);
      paymentUrl.searchParams.append('label', operationId);
      
      return {
        payment_url: paymentUrl.toString(),
        original_amount: amount,
        amount_with_commission: amountWithCommission,
        commission_percent: this.commissionPercent,
        operation_id: operationId
      };
      
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new Error('Ошибка при создании платежа');
    }
  }

  async checkPayment(userId) {
    try {
      const response = await axios.get(`${YOOMONEY_API_URL}/operation-history`, {
        headers: {
          'Authorization': `Bearer ${process.env.YOOMONEY_ACCESS_TOKEN}` 
        },
        params: {
          label: `tg_${userId}_`,
          type: 'in',
          records: 10
        }
      });

      const successfulPayments = response.data.operations.filter(
        op => op.status === 'success' && op.label.startsWith(`tg_${userId}_`)
      );

      return successfulPayments.length > 0 ? successfulPayments[0] : null;
      
    } catch (error) {
      console.error('Payment check error:', error.response?.data || error.message);
      throw new Error('Ошибка при проверке платежа');
    }
  }
}

module.exports = new PaymentService();