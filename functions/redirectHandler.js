// const { Telegraf } = require('telegraf');
// const moment = require('moment-timezone');

// const createRedirectMiddleware = (yourTelegramId) => {
//   return async (ctx, next) => {
//     try {
//       // Пропускаем служебные updates (callback queries, edited messages и т. д.)
//       if (!ctx.message) return await next();

//       const { from, message } = ctx;
//       const isCommand = message.text && message.text.startsWith('/');
//       const isMedia = message.audio || message.voice || message.photo || message.video || message.document;

//       // Если это команда (но не /start), пропускаем
//       if (isCommand && !message.text.includes('/start')) {
//         return await next();
//       }

//       // Формируем данные для уведомления
//       const eventData = {
//         userId: from.id,
//         username: from.username || 'Нет username',
//         firstName: from.first_name || 'Нет имени',
//         lastName: from.last_name || 'Нет фамилии',
//         date: moment(message.date * 1000).tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss'),
//         type: 'text',
//         content: message.text || 'Нет содержимого'
//       };

//       // Определяем тип контента
//       if (message.audio) {
//         eventData.type = 'аудио';
//         eventData.content = `Аудио: ${message.audio.file_name || 'Без названия'}`;
//       } else if (message.voice) {
//         eventData.type = 'голосовое сообщение';
//         eventData.content = 'Голосовое сообщение';
//       } else if (message.photo) {
//         eventData.type = 'фото';
//         eventData.content = 'Фотография';
//       } else if (message.video) {
//         eventData.type = 'видео';
//         eventData.content = `Видео: ${message.video.file_name || 'Без названия'}`;
//       } else if (message.document) {
//         eventData.type = 'документ';
//         eventData.content = `Документ: ${message.document.file_name || 'Без названия'}`;
//       }

//       // Формируем текст уведомления
//       const notificationText = `📩 Новое сообщение от @${eventData.username} (${eventData.firstName} ${eventData.lastName}) в ${eventData.date}:\nТип: ${eventData.type}\nСодержимое: ${eventData.content}`;

//       // Отправляем уведомление
//       await ctx.telegram.sendMessage(yourTelegramId, notificationText);

//       // Если есть медиа, пересылаем его
//       if (isMedia) {
//         try {
//           await ctx.forwardMessage(yourTelegramId);
//         } catch (error) {
//           console.error('Ошибка пересылки медиа:', error);
//           await ctx.telegram.sendMessage(yourTelegramId, `⚠ Не удалось переслать вложение (${eventData.type})`);
//         }
//       }

//       await next();
//     } catch (error) {
//       console.error('Ошибка в redirectMiddleware:', error);
//     }
//   };
// };

// module.exports = createRedirectMiddleware;


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

      // Если это команда (кроме /start), пропускаем без уведомления
      if (isCommand && !message.text.includes('/start')) {
        return await next();
      }

      // Если это не текст и не медиа, пропускаем
      if (!message.text && !isMedia) {
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

      // Формируем текст уведомления
      const notificationText = `📩 Новое сообщение от @${eventData.username} (${eventData.firstName} ${eventData.lastName}) в ${eventData.date}:\nТип: ${eventData.type}\nСодержимое: ${eventData.content}`;

      // Отправляем уведомление
      await ctx.telegram.sendMessage(yourTelegramId, notificationText);

      // Пересылаем медиа, если есть
      if (isMedia) {
        try {
          await ctx.forwardMessage(yourTelegramId);
        } catch (error) {
          console.error('Ошибка пересылки медиа:', error);
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