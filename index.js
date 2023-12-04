import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import locationsMixin from './locationsMixin.js'

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

let users = {};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text
  const getCurrentLocation = async () => {
    await bot.sendMessage(chatId, 'Отправь мне свое местоположение', {
      reply_markup: JSON.stringify({
        keyboard: [
          [{ text: 'Отправить геолокацию', request_location: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      }),
    })
  }

  if (!users[chatId]) {
    // Если пользователь самый первый раз в игре
    const username = msg?.from?.username ?? 'человек';
    await bot.sendMessage(chatId, 'Добро пожаловать в игру, ' + username);
    await bot.sendMessage(chatId, 'Давай для начала проверим, что GPS у тебя работает корректно');
    users[chatId] = {
      username: username,
    }
  }
  if (!users[chatId].location && msg.location) {
    // Если впервые прислал свою локацию
    users[chatId].location = {
      latitude: msg.location.latitude,
      longitude: msg.location.longitude
    }
    if (locationsMixin.isClose(locationsMixin.locations.dormitory, users[chatId].location, 200)) {
      await bot.sendMessage(chatId, 'О, так ты в общаге');
    }
    await bot.sendMessage(chatId, 'Отлично, теперь можно начинать');
  }
  if (!users[chatId].location) {
    // Если еще не присылал ни разу локацию
    await getCurrentLocation();
    return;
  }
})




// bot.on('callback_query', function onCallbackQuery (callbackQuery) {
//   const action = callbackQuery.data
//   const msg = callbackQuery.message
//   const opts = {
//     chat_id: msg.chat.id,
//     message_id: msg.message_id,
//   }
//
//   if (action === 'update_info') {
//     const opts = {
//       reply_markup: JSON.stringify({
//         keyboard: [
//           [{ text: 'Location', request_location: true }],
//           [{ text: 'Contact', request_contact: true }],
//         ],
//         resize_keyboard: true,
//         one_time_keyboard: true,
//       }),
//     }
//     bot.sendMessage(msg.chat.id, 'Contact and Location request', opts);
//     bot.deleteMessage(opts)
//     return;
//   }
//   if (action === 'edit') {
//     text = 'Edited Text'
//   }
//
//   bot.editMessageText(text, opts)
// })
//
//
