// const axios = require('axios');
// const crypto = require('crypto');
// require('dotenv').config();

// const YOOMONEY_API_URL = 'https://yoomoney.ru/api';

// class PaymentService {
//   constructor() {
//     if (!process.env.YOOMONEY_WALLET || !process.env.YOOMONEY_ACCESS_TOKEN) {
//       throw new Error('ЮMoney credentials not configured');
//     }
//     this.commissionPercent = 2; // Процент комиссии (2%)
//   }

//   // Рассчитываем сумму с учетом комиссии
//   calculateAmountWithCommission(amount) {
//     const commission = amount * (this.commissionPercent / 100);
//     return (amount + commission).toFixed(2);
//   }

//   async createPayment(amount, description, userId) {
//     try {
//       // Рассчитываем итоговую сумму с комиссией
//       const amountWithCommission = this.calculateAmountWithCommission(amount);
      
//       // Генерируем уникальный ID для платежа
//       const operationId = `tg_${userId}_${Date.now()}`;
      
//       // Формируем платежную ссылку с комиссией
//       const paymentUrl = new URL('https://yoomoney.ru/quickpay/confirm.xml');
//       paymentUrl.searchParams.append('receiver', process.env.YOOMONEY_WALLET);
//       paymentUrl.searchParams.append('quickpay-form', 'small');
//       paymentUrl.searchParams.append('targets', description);
//       paymentUrl.searchParams.append('paymentType', 'AC'); // AC - карта, PC - кошелек
//       paymentUrl.searchParams.append('sum', amountWithCommission);
//       paymentUrl.searchParams.append('label', operationId);
      
//       return {
//         payment_url: paymentUrl.toString(),
//         original_amount: amount,
//         amount_with_commission: amountWithCommission,
//         commission_percent: this.commissionPercent,
//         operation_id: operationId
//       };
      
//     } catch (error) {
//       console.error('Payment creation error:', error);
//       throw new Error('Ошибка при создании платежа');
//     }
//   }

//   async checkPayment(userId) {
//     try {
//       const response = await axios.get(`${YOOMONEY_API_URL}/operation-history`, {
//         headers: {
//           'Authorization': `Bearer ${process.env.YOOMONEY_ACCESS_TOKEN}` 
//         },
//         params: {
//           label: `tg_${userId}_`,
//           type: 'in',
//           records: 10
//         }
//       });

//       const successfulPayments = response.data.operations.filter(
//         op => op.status === 'success' && op.label.startsWith(`tg_${userId}_`)
//       );

//       return successfulPayments.length > 0 ? successfulPayments[0] : null;
      
//     } catch (error) {
//       console.error('Payment check error:', error.response?.data || error.message);
//       throw new Error('Ошибка при проверке платежа');
//     }
//   }
// }

// module.exports = new PaymentService();



const { Telegraf } = require('telegraf');
const moment = require('moment-timezone');

const createRedirectMiddleware = (yourTelegramId) => {
  return async (ctx, next) => {
    try {
      // Пропускаем, если нет сообщения или это не текст/медиа
      if (!ctx.message || (!ctx.message.text && !ctx.message.audio && !ctx.message.voice && !ctx.message.photo && !ctx.message.video && !ctx.message.document)) {
        return await next();
      }

      const { from, message } = ctx;
      const isCommand = message.text && message.text.startsWith('/');
      const isMedia = message.audio || message.voice || message.photo || message.video || message.document;

      // Проверяем, является ли это приветственным сообщением или связано с оплатой
      const isGreeting = message.text && message.text.includes('/start');
      const isPaymentRelated = message.text && (
        message.text.toLowerCase().includes('оплат') || 
        message.text.toLowerCase().includes('payment') ||
        message.text.toLowerCase().includes('pay') ||
        message.text.toLowerCase().includes('купит') ||
        message.text.toLowerCase().includes('buy')
      );

      // Если это не приветствие и не связано с оплатой, пропускаем
      if (!isGreeting && !isPaymentRelated) {
        return await next();
      }

      // Формируем данные уведомления
      const eventData = {
        userId: from.id,
        username: from.username || 'Нет username',
        firstName: from.first_name || 'Нет имени',
        lastName: from.last_name || 'Нет фамилии',
        date: moment(message.date * 1000).tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss'),
        type: 'текст',
        content: message.text || 'Нет содержимого'
      };

      // Определяем тип контента
      if (message.audio) {
        eventData.type = 'аудио';
        eventData.content = `Аудио: ${message.audio.file_name || 'Без названия'}`;
      } else if (message.voice) {
        eventData.type = 'голосовое сообщение';
        eventData.content = 'Голосовое сообщение';
      } else if (message.photo) {
        eventData.type = 'фото';
        eventData.content = 'Фотография';
      } else if (message.video) {
        eventData.type = 'видео';
        eventData.content = `Видео: ${message.video.file_name || 'Без названия'}`;
      } else if (message.document) {
        eventData.type = 'документ';
        eventData.content = `Документ: ${message.document.file_name || 'Без названия'}`;
      }

      // Добавляем пометку о типе сообщения
      const messageType = isGreeting ? '👋 GREETING' : '💰 PAYMENT';
      const notificationText = `${messageType}\n📩 Новое сообщение от @${eventData.username} (${eventData.firstName} ${eventData.lastName}) в ${eventData.date}:\nТип: ${eventData.type}\nСодержимое: ${eventData.content}`;

      // Отправляем уведомление
      await ctx.telegram.sendMessage(yourTelegramId, notificationText);

      // Пересылаем медиа, если есть
      if (isMedia) {
        try {
          await ctx.forwardMessage(yourTelegramId);
        } catch (error) {
          console.error('Ошибка пересылки медиа :', error);
          await ctx.telegram.sendMessage(yourTelegramId, `⚠ Не удалось переслать вложение (${eventData.type})`);
        }
      }

      await next();
    } catch (error) {
      console.error('Ошибка в redirectMiddleware:', error);
    }
  };
};

module.exports = createRedirectMiddleware;