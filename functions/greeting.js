const { Telegraf, Markup } = require('telegraf');
const User = require('./userModel'); // Модель пользователя
const moment = require('moment-timezone'); // Сохранение времени по Москве.

// //! Приветственное сообщение и меню \ 🔙 Назад
const greetingHandler = async (ctx) => {
    try {
        const { username, id: userId, first_name, last_name } = ctx.message.from;   // Получаем информацию о пользователе

        // Проверка, есть ли пользователь в базе
        let user = await User.findOne({ userId });
    
        if (!user) {
            // Если пользователя нет в базе, создаем новый документ
            user = new User({
              username: username || 'Без имени',
              userId,
              first_name: first_name || 'Без имени',
              last_name: last_name || 'Без имени',
              firstContactDate: moment().tz("Europe/Moscow").format(), // ISO-строка с московским временем
              // или moment().tz("Europe/Moscow").toDate() — если нужно сохранить как Date
          });
    
            // Сохраняем нового пользователя в базу
            await user.save();
            console.log(`Новый пользователь добавлен: ${username}`);
        }
    
        // Отправка приветственного сообщения
        //? Отправка фото с текстом и клавиатурой в одном сообщении
        await ctx.replyWithPhoto('https://t.me/DagEagleTour/36', {
             caption: 'Добро пожаловать в Bot Shop!\nЭто пример шаблонного бота в телеграмм.\n\nТут можно разместить приветственное сообщение и небольшое описание компании или информацию о том, что делает ваш бот.!👋',
            reply_markup: {
                keyboard: [
                    [{ text: '☰ В меню' }],
                ],
                resize_keyboard: true, //* Уменьшает клавиатуру под размер экрана
                one_time_keyboard: false, //* Клавиатура исчезает после первого выбора
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
        await ctx.reply('Ошибка сервера...');
    }
};

// //! Главное меню
const mainMenu = async (ctx) => {
    try {
      // Первое сообщение: фото с текстом и клавиатурой
      await ctx.replyWithPhoto('https://t.me/DagEagleTour/56', {
        caption:
          'Это основное меню бота.\n__________\n\n' +
          'Здесь можно разместить основные разделы для взаимодействия:' +
          '\n• Каталог\n• Режим работы\n• Доставка\n• Оплата\n• Галерея\n• О нас\n• Контакты\n\n\n' +
          '__________\n' +
          '@Bot_Shop_Dev\nПишите, если есть вопросы.',
        reply_markup: {
          keyboard: [
            [{ text: '🗂️Каталог' }],
            [{ text: '🎞️Галерея' }, { text: '🕘Режим работы' }],
            [{ text: 'О нас\nКонтакты' }, { text: '❓FAQ' }, { text: 'Оплата' }],
          ],
          resize_keyboard: true, //* Уменьшает клавиатуру под размер экрана
          // one_time_keyboard: true, //* Клавиатура исчезает после первого выбора
        },
      });

    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
      await ctx.reply('Приветственное фото временно недоступно, но это не помешает нам начать! 😊');
    }
  };

  // //! Каталог
const catalog = async (ctx) => {
    await ctx.reply(
      'Каталог товаров можно представить в виде сообщений с in-line кнопкой (Заказать, Купить, Забронировать), которая располагается под самим сообщенем с товаром.',
      Markup.keyboard([
        ['Как выглядит эта кнопка?'], // Первая строка с одной кнопкой
        ['☰ В меню'], // Вторая строка с одной кнопкой
      ])
        .resize() // Уменьшает клавиатуру под размер экрана
        .oneTime(), // Клавиатура исчезает после первого выбора
    );
  };

const catalog2 = async (ctx) => {
    try {
        //! Товар с фото
        await ctx.replyWithPhoto('https://t.me/DagEagleTour/38', {
            caption: 'Товар с фото и in-line кнопкой.\n---------\nОписание товара.\nЦена.',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback('Заказать (in-line кнопка)', 'inlineButton')]
            ]).reply_markup
        });

        await new Promise(resolve => setTimeout(resolve, 1000)); //! 1 секунда

        //! Товар с видео
        await ctx.replyWithVideo('https://t.me/DagEagleTour/37', {
            caption: 'Товар 2 с видео и in-line кнопкой.\n---------\nОписание товара.\nЦена.',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback('Забронировать (in-line кнопка)', 'inlineButton')]
            ]).reply_markup
        });

        await new Promise(resolve => setTimeout(resolve, 1000)); //! 1 секунда

        //! Товар ЛЕВ
        await ctx.replyWithPhoto('https://t.me/DagEagleTour/41', {
            caption: 'Пример:\n\nТигролев\n---------\nЭтот прекрасный, пушистый тигролев подарит вашему дому атмосферу спокойствия, умиротворения и защиты.  \n\nЦена - 12000₸\n',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback('Купить', 'inlineButton')]
            ]).reply_markup
        });

        await new Promise(resolve => setTimeout(resolve, 3000)); //! 1 секунда

        //! Товар ЛЕВ
        await ctx.reply(
            'Нажмите любую in-line кнопку для возвращения в меню.',
            {
              reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback('in-line кнопка "Нажать"', 'inlineButton')],
              ]).reply_markup,
            }
          );

    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
        await ctx.reply('Приветственное фото временно недоступно! Ошибка сервера');
    }
};

  // //! Заявка на заказ оформлена
const inlineButtons = async (ctx) => {
    await ctx.reply(
      'Заявка на заказ оформлена!',
      Markup.keyboard([
        ['☰ В меню'], // Вторая строка с одной кнопкой
      ])
        .resize() // Уменьшает клавиатуру под размер экрана
        .oneTime(), // Клавиатура исчезает после первого выбора
    );
  };

  // //!   🎞️Галерея
const galery = async (ctx) => {
    try {
        await ctx.reply(
            'В следующих сообщениях смотрите, как может быть представлен контент.\n' +
            'Чтобы продвигаться по блокам галереи медиасообщений,\n' +
            'жмите кнопку "Далее ➜"',
            Markup.keyboard([
                ['Далее ➜'],
                ['☰ В меню'],
            ])
            
            .resize() // Уменьшает клавиатуру под размер экрана
        );
    } catch (error) {
      console.error('Ошибка в функции galery:', error);
      await ctx.reply('Произошла ошибка сервера. Пожалуйста, попробуйте позже.');
    }
};
        
        
const galery2 = async (ctx) => {
    try {
      await ctx.replyWithPhoto(
        'https://t.me/DagEagleTour/48', 
        {
          caption: 'Вот медиаконтент в виде фотографии робота с прикреплённым сообщением, которое вы сейчас читаете.',
          reply_markup: Markup.keyboard([
              ['Далее ➜'],
              ['☰ В меню'],
          ])
          .resize()
        }
      );
    } catch (error) {
      console.error('Ошибка в функции galery2:', error);
      await ctx.reply('Произошла ошибка при отправке медиа. Пожалуйста, попробуйте позже.');
    }
  };
  

const galery3 = async (ctx) => {
    try {    
      await ctx.replyWithVideo('https://t.me/DagEagleTour/43', {
        caption: 'Здесь медиаконтент представлен видеороликом.',
        reply_markup: Markup.keyboard([
            ['Далее ➜'],
            ['☰ В меню'],
        ])
        .resize() 
      });
    } catch (error) {
      console.error('Ошибка в функции galery3:', error);
      await ctx.reply('Произошла ошибка при отправке медиа. Пожалуйста, попробуйте позже.');
    }
  };

const galery4 = async (ctx) => {
    try {
      // Отправка медиагруппы
      await ctx.replyWithMediaGroup([
        {
          type: 'photo',
          media: 'https://t.me/DagEagleTour/50',
          caption: 'Первое - фото.',
        },
        {
          type: 'photo',
          media: 'https://t.me/DagEagleTour/49',
          caption: 'Второе - фото.',
        },
        {
          type: 'photo',
          media: 'https://t.me/DagEagleTour/51',
          caption: 'Третье - фото.',
        },
        {
          type: 'video',
          media: 'https://t.me/DagEagleTour/43',
          caption: 'Четвертое - видео.',
        },
      ]);
  
      await ctx.reply(
        'Вот сообщение с прикрепленной медиагруппой (комбинация фото + видео файлы).\nМаксимальное количество медиафайлов: 10',
        Markup.keyboard([
            ['Далее ➜'],
            ['☰ В меню'],
        ])
          .resize()
      );
    } catch (error) {
      console.error('Ошибка в функции galery4:', error);
      await ctx.reply('Произошла ошибка при отправке медиа. Пожалуйста, попробуйте позже.');
    }
  };

const galery5 = async (ctx) => {
    try {
        await ctx.reply(
            'Кстати, мы так же можем сделать весь графический дизайн для вашего бота😏\nОсталось посмотреть последние виды сообщений с вложенными файлами.\nСмотрим?',
            {
              reply_markup: Markup.keyboard([
                  ['Далее ➜'],
                  ['☰ В меню'],
              ])
                .resize()
            }
          );
    } catch (error) {
      console.error('Ошибка при отправке galery5', error);
      await ctx.reply('Произошла ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  };

const galery6 = async (ctx) => {
    try {
      // Отправка медиагруппы с аудиофайлами
      await ctx.replyWithMediaGroup([
        {
          type: 'audio',
          media: 'https://t.me/DagEagleTour/46',
          caption: 'Первый аудио-файл.',
        },
        {
          type: 'audio',
          media: 'https://t.me/DagEagleTour/47',
          caption: 'Это сообщение с прикрепленными аудиофайлами. Здесь можно использовать аудио, записанные в телеграм или сохраненные mp3 файлы.',
        },
      ]);
  
      // Отправка текстового сообщения с кнопками
      await ctx.reply('Перейдём к последнему шагу?', {
        reply_markup: Markup.keyboard([
            ['Далее ➜'], // Кнопка "Далее"
            ['☰ В меню'], // Кнопка "В меню"
        ])
          .resize() // Уменьшает клавиатуру под размер экрана
          .oneTime(), // Клавиатура исчезает после первого выбора
      });
    } catch (error) {
      console.error('Ошибка при отправке аудио: galery6', error);
      await ctx.reply('Произошла ошибка при отправке аудио. Пожалуйста, попробуйте позже.');
    }
  };
  
const galery7 = async (ctx) => {
    try {
      // Отправка текстового документа по URL с удалением предыдущей клавиатуры
      await ctx.replyWithDocument(
        'https://t.me/DagEagleTour/54', // Ссылка на текстовый файл
        {
          caption:
            'Так же вы можете прикреплять к сообщениям документы (pdf, txt, doc, xls, ppt, zip, exe), опросы, статьи Telegraph (такие, как в разделе "FAQ") и видеосообщения-кружочки.',
          reply_markup: Markup.removeKeyboard(), // Удаляем клавиатуру
        }
      );
  
      // Отправка нового сообщения с кнопкой "☰ В меню"
      await ctx.reply('Для возврата нажмите "☰ В меню"', {
        reply_markup: Markup.keyboard([
          ['☰ В меню'], // Кнопка "В меню"
        ]).resize(), // Уменьшает клавиатуру под размер экрана
      });
    } catch (error) {
      console.error('Ошибка при отправке документа: galery7', error);
      await ctx.reply('Произошла ошибка при отправке документа. Пожалуйста, попробуйте позже.');
    }
  };

// //! График работы
const timetable = async (ctx) => {
    await ctx.reply('Режим работы:\n\nПн - с 10:00 до 00:00,\nВт - круглосуточно,\nСр - круглосуточно,\nЧт - круглосуточно,\nПт - с 00:00 до 22:00,\nСб - 10:00 - 22:00,\nВс - выходной.\n_________\nЭто один из вариантов того, как можно представить график работы в текстовом формате.\nНажми "Смотреть ещё", чтобы увидеть графический вариант того же графика.\n',
        Markup.keyboard([
            ['Смотреть ещё'],
            ['☰ В меню']
        ]).resize()
    );  
};

const timetable2 = async (ctx) => {
    await ctx.replyWithPhoto('https://t.me/DagEagleTour/39', {
    caption: 'Вот графический вариант представления графика работы, выбирайте, какой по вкусу вам.\n\nМы можем разработать для вас графический дизайн, который ещё больше выразит уникальность вашего продукта и привлечёт внимание.',
    reply_markup: {
        keyboard: [
            [{ text: '☰ В меню' }],
        ],
        resize_keyboard: true, //* Уменьшает клавиатуру под размер экрана
        one_time_keyboard: false, //* Клавиатура исчезает после первого выбора
    }
    });
};

// //! О нас
const aboutUs = async (ctx) => {
    await ctx.reply('Мы — Bot Shop, ваш надежный помощник в мире Telegram-ботов! 🤖\n' + 
                    'Наша миссия — создавать качественных и удобных ботов, которые решают любые задачи:\n\n' + 
                    '🚀 Автоматизация бизнеса\n\n🎯 Упрощение повседневных процессов\n\n' + 
                    '🎮 Развлечения и игры\n\n' + 
                    'Кроме того, мы разрабатываем уникальный графический дизайн для вашего бота, чтобы он был не только функциональным, но и стильным!\n\n' + 
                    'Почему выбирают нас?\n' +
                    '✅ Универсальные боты с широким набором функций\n'+
                    '✅ Простота в использовании и настройке\n'+
                    '✅ Индивидуальный дизайн под ваш бренд\n' +
                    '✅ Быстрая и надежная поддержка\n\n' +
                    'Свяжитесь с нами:\n' +
                    '📞 Поддержка: @Bot_Shop_Dev\n'+
                    '🌐 Сайт: [Bot Shop](https://avito.ru)',
        Markup.keyboard([
            ['☰ В меню']
        ]).resize()
    );  

    await new Promise(resolve => setTimeout(resolve, 2000)); // Задержка 2 секунды

    await ctx.reply('Ссылка для связи👇', {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'Написать нам',
              url: 'https://t.me/Bot_Shop_Dev'  // Замените на ваш username (например, https://t.me/durov)
            }]
          ]
        }
      });
};



// //! 🗓 FAQ
const faqHandler = async (ctx) => {
    await ctx.replyWithPhoto('https://t.me/DagEagleTour/35', {
    caption: '*❓ FAQ — Часто задаваемые вопросы* 🤔\n\nВ этом разделе вы найдете ответы на самые популярные вопросы о нашем магазине и ботов. Если вы не нашли ответа, свяжитесь с нашей поддержкой: @Bot_Shop_Dev',
    reply_markup: {
        keyboard: [
            [{ text: 'Смотреть FAQ' }],
            [{ text: '☰ В меню' }]
        ],
        resize_keyboard: true, //* Уменьшает клавиатуру под размер экрана
        one_time_keyboard: false, //* Клавиатура исчезает после первого выбора
    }
    });
};

const faqHandler2 = async (ctx) => {
    //? Markdown для кликабельной ссылки
    await ctx.replyWithMarkdown(
        'Можно оформить всё в статье, если информации очень много для сообщения.\n\n' +
        '[Читать статью](https://graph.org/FAQ--CHasto-zadavaemye-voprosy-03-18-2).', //* Markdown
        Markup.keyboard([
            ['☰ В меню']
        ]).resize()
    );
};

module.exports = { greetingHandler, mainMenu, catalog, catalog2, inlineButtons, galery, galery2, galery3, galery4, galery5, galery6, galery7, timetable, timetable2, aboutUs, faqHandler, faqHandler2 };