const mongoose = require('mongoose');
require('dotenv').config();

// Схема для пользователя
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    default: null, // null для отсутствующих данных
  },
  userId: {
    type: Number, // ID пользователя Telegram
    default: null, // null, если ID недоступен
  },
  first_name: {
    type: String,
    default: null, // null для отсутствующих данных
  },
  last_name: {
    type: String,
    default: null, // null для отсутствующих данных
  },
  phone_number: {
    type: Number,
    default: null, // null для отсутствующих данных
  },
  firstContactDate: {
    type: Date,
    default: Date.now, // Дата первого обращения всегда записывается
  },
  //! galleryStep: {
  //   type: Number,
  //   default: 1, // Начальный шаг галереи
  // },
});

// Модель пользователя
const User = mongoose.model('User', userSchema);

module.exports = User;