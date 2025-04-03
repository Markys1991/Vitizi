require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;

// Проверка строки подключения
if (!uri || !uri.startsWith("mongodb+srv://")) {
  throw new Error("Ошибка: строка подключения MongoDB неверного формата!");
}

// Создаем клиента MongoClient с опциями для API
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    // Подключаем клиента к серверу MongoDB
    await client.connect();
    console.log("Подключение к MongoDB установлено...");

    // Отправляем команду ping для проверки соединения
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Инициализация Mongoose
    await mongoose.connect(uri); // Убираем useNewUrlParser и useUnifiedTopology
    console.log("Connected to MongoDB using Mongoose");

    return client; // Возвращаем клиент для последующего закрытия
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error.message);
    throw error; // Пробрасываем ошибку дальше
  }
}

module.exports = connectDB;