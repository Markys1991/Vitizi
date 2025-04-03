const { Telegraf, Markup, session } = require('telegraf');
require('dotenv').config();

const userStates = new Map(); // Глобальная карта состояний пользователей
const { bot, handleWebhook, setupWebhook } = require('./webhookHandler');
const { 
  greetingHandler, mainMenu, catalog, catalog2, 
  inlineButtons, galery, galery2, galery3, galery4, galery5, galery6, galery7,
  timetable, timetable2, aboutUs, faqHandler, faqHandler2 
} = require('./greeting');
const { payments } = require('./paymentsHandler');
const connectDB = require('./database');
const User = require('./userModel');
const createRedirectMiddleware = require('./redirectHandler');
const paymentService = require('./paymentsHandler');
// const PaymentService = require('./paymentsHandler');
// const paymentService = new PaymentService();

const YOUR_TELEGRAM_ID = process.env.YOUR_TELEGRAM_ID;

// Подключаем middleware для сессий
bot.use(session());


// Инициализация вебхука
setupWebhook();

// Подключение к базе данных
connectDB().then(() => {
  console.log('База данных готова к работе.');
}).catch(error => {
  console.error('Не удалось подключиться к базе данных:', error.message);
  process.exit(1);
});

// Текст сообщения вставляем ПЕРВЫМ параметром
// await broadcast.sendToAll("Привет! Это текст для рассылки всем подписчикам", {
  //   parse_mode: 'HTML' // опционально: форматирование
  // });
  
  
  // Регистрация команд
  bot.start(greetingHandler);
  // Подключаем middleware для редиректа (если нужно)
  bot.use(createRedirectMiddleware(YOUR_TELEGRAM_ID));
bot.hears('Оплата', async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Создаем платеж
    const payment = await paymentService.createPayment(
      '10.00', 
      `Оплата от @${ctx.from.username || userId}`,
      userId
    );

    // Убеждаемся, что session существует
    if (!ctx.session) ctx.session = {};
    ctx.session.paymentOperationId = payment.operation_id;

    // Отправляем пользователю ссылку на оплату
    await ctx.replyWithMarkdown(
      `📌 *Счёт на ${payment.amount} руб.*\n` +
      `[Оплатить](${payment.payment_url})`,
      Markup.inlineKeyboard([
        Markup.button.url('💳 Перейти к оплате', payment.payment_url),
        Markup.button.callback('✅ Я оплатил', 'check_payment')
      ])
    );
    
  } catch (error) {
    await ctx.reply(`❌ Ошибка: ${error.message}`);
    console.error('Ошибка оплаты:', error);
  }
});

bot.action('check_payment', async (ctx) => {
  try {
    await ctx.answerCbQuery('Проверяем оплату...');
    const payment = await paymentService.checkPayment(ctx.from.id);
    
    if (payment) {
      await ctx.reply(`✅ Платёж на ${payment.amount} руб. подтверждён!`);
    } else {
      await ctx.reply('❌ Платёж не найден. Попробуйте позже или свяжитесь с поддержкой.');
    }
    
  } catch (error) {
    await ctx.answerCbQuery('Ошибка при проверке');
    console.error('Ошибка проверки платежа:', error);
  }
});

setInterval(async () => {
  // Проверка незавершенных платежей
}, 300000);

bot.hears('☰ В меню', mainMenu);
bot.hears('🗂️Каталог', catalog);
bot.hears('Как выглядит эта кнопка?', catalog2);
bot.hears('❓FAQ', faqHandler);
bot.hears('Смотреть FAQ', faqHandler2);
bot.hears('🕘Режим работы', timetable);
bot.hears('Смотреть ещё', timetable2);
bot.hears('О нас\nКонтакты', aboutUs);
bot.hears('🎞️Галерея', async (ctx) => {
  const userId = ctx.message.from.id;
  userStates.set(userId, 1);
  await galery(ctx);
});

bot.action('inlineButton', inlineButtons);

bot.telegram.setMyCommands([
  { command: 'menu', description: '☰ В меню' },
  { command: 'contact', description: '🧞 Контакты' },
  { command: 'faq', description: '❓ Частые вопросы' }
]);

bot.command('menu', (ctx) => mainMenu(ctx));
bot.command('contact', (ctx) => aboutUs(ctx));
bot.command('faq', (ctx) => faqHandler(ctx));

bot.on('text', async (ctx) => {
  try {
    const text = ctx.message.text.trim().toLowerCase();
    console.log('Получено сообщение:', text);
    const userId = ctx.message.from.id;

    if (/привет|здравствуй|меню/i.test(text)) {
      await greetingHandler(ctx);
    } else if (/дат|цен/i.test(text)) {
      await datesPriceHandler(ctx);
    } else if (/каталог|тур/i.test(text)) {
      await catalogHandler(ctx);
    } else if (/вопрос|спросить/i.test(text)) {
      await faqHandler(ctx);
    } else if (text === 'далее ➜') {
      let galleryStep = userStates.get(userId) || 0;

      const gallerySteps = [galery2, galery3, galery4, galery5, galery6, galery7];
      if (galleryStep < gallerySteps.length) {
        await gallerySteps[galleryStep](ctx);
        userStates.set(userId, galleryStep + 1);
      } else {
        userStates.set(userId, 0);
      }
    } else {
      await ctx.reply('Ваше сообщение получено! Мы скоро свяжемся с вами. 😊');
    }
  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
  }
});

exports.handler = handleWebhook;
