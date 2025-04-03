require('dotenv').config();
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Ошибка: BOT_TOKEN не найден в переменных окружения!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Установка вебхука
const setupWebhook = async () => {
  try {
    await bot.telegram.setWebhook('https://botshop77.netlify.app/.netlify/functions/main');
    console.log("Webhook успешно установлен!");
  } catch (err) {
    console.error("Ошибка при установке вебхука:", err);
    process.exit(1);
  }
};

// Обработчик вебхука
const handleWebhook = async (event) => {
  try {
    if (!event.body) {
      console.warn("Тело запроса пустое!");
      return { statusCode: 400, body: JSON.stringify({ message: "Empty request body" }) };
    }

    const body = JSON.parse(event.body);
    console.log("Успешно распарсено тело запроса:", JSON.stringify(body, null, 2));

    await bot.handleUpdate(body);
    console.log("Обновление успешно обработано!");

    return { statusCode: 200, body: JSON.stringify({ message: "Webhook processed successfully" }) };
  } catch (error) {
    console.error("Ошибка при обработке webhook:", error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Error handling webhook' }) };
  }
};

module.exports = { bot, handleWebhook, setupWebhook };