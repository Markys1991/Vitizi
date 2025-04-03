const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');

// Модель подписчика
const subscriberSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  subscribedAt: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

class Broadcast {
  constructor(bot) {
    this.bot = bot;
  }

  // ... (остальные методы addSubscriber, removeSubscriber и т.д.)

  /**
   * ОТПРАВКА ТЕКСТОВОГО СООБЩЕНИЯ ВСЕМ ПОДПИСЧИКАМ
   * @param {string} message - ТУТ ВСТАВЛЯЕМ ТЕКСТ ДЛЯ РАССЫЛКИ
   * @param {object} options - Дополнительные параметры (клавиатура, форматирование)1
   */
  async sendToAll(message, options = {}) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      const subscribers = await Subscriber.find({});
      
      for (const subscriber of subscribers) {
        try {
          // Здесь происходит отправка сообщения
          await this.bot.telegram.sendMessage(
            subscriber.userId, 
            message, // <- Передаётся текст из параметра message
            options  // <- Опционально: кнопки, форматирование
          );
          results.success++;
        } catch (error) {
          // ... обработка ошибок
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Ошибка при получении списка подписчиков:', error);
    }
    return results;
  }

  /**
   * ОТПРАВКА МЕДИАФАЙЛА ВСЕМ ПОДПИСЧИКАМ
   * @param {string} type - Тип медиа: 'photo', 'video', 'document' и т.д.
   * @param {string} media - ТУТ ВСТАВЛЯЕМ FILE_ID МЕДИАФАЙЛА
   * @param {string} caption - ТУТ ВСТАВЛЯЕМ ПОДПИСЬ К МЕДИА (опционально)
   * @param {object} options - Дополнительные параметры
   */
  async sendMediaToAll(type, media, caption = '', options = {}) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      const subscribers = await Subscriber.find({});
      
      for (const subscriber of subscribers) {
        try {
          // Здесь происходит отправка медиа
          await this.bot.telegram.sendMediaGroup(subscriber.userId, [
            {
              type: type,     // 'photo', 'video' и т.д.
              media: media,   // <- file_id медиафайла
              caption: caption, // <- Текст под медиа
              ...options      // Доп. параметры
            }
          ]);
          results.success++;
        } catch (error) {
          // ... обработка ошибок
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Ошибка при получении списка подписчиков:', error);
    }
    return results;
  }
}

module.exports = Broadcast;