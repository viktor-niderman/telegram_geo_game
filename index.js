import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import locationsMixin from './locationsMixin.js'

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

let users = {};

bot.on('message', async (msg) => {
  const chatId = msg?.chat?.id
  if (!chatId) {
    return;
  }

  await steps[users[chatId]?.currentStep ?? 0](chatId, msg);
})

const steps = {
  0: async (chatId, msg) => {
    if (!users[chatId]) {
      // Самое самое первое сообщение
      const username = msg?.from?.username ?? 'человек';
      await bot.sendMessage(chatId, 'Добро пожаловать в игру, ' + username);
      users[chatId] = {
        username: username,
        currentStep: 0,
      }
      await getCurrentLocation(chatId, 'Давай для начала проверим, что GPS у тебя работает корректно');
    } else if (!users[chatId].location && msg.location) {
      // Если впервые прислал свою локацию
      users[chatId].location = {
        latitude: msg.location.latitude,
        longitude: msg.location.longitude
      }
      if (locationsMixin.isClose(locationsMixin.locations.dormitory, users[chatId].location, 200)) {
        await bot.sendMessage(chatId, 'О, так ты в общаге');
      }
      await bot.sendMessage(chatId, 'Отлично, теперь можно начинать');
      users[chatId].currentStep = 1;
      await getCurrentLocation(chatId, 'Теперь твоя задача дойти до клиты');
    } else {
      await getCurrentLocation(chatId);
    }
  },
  1: async (chatId, msg) => {
    if (msg.location) {
      if (locationsMixin.isClose(locationsMixin.locations.klita, users[chatId].location, 300)) {
        await bot.sendMessage(chatId, 'Молодец!!! На этом тестовая версия заканчивается');
      } else {
        await getCurrentLocation(chatId, 'Нет, ты еще далеко');
      }
    }
  }
}

const getCurrentLocation = async (chatId, text = null) => {
  await bot.sendMessage(chatId, text ?? 'Отправь мне свое местоположение', {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: 'Отправить геолокацию', request_location: true }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    }),
  })
}

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
