import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import locationsMixin from './locationsMixin.js'

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true })

let users = {}

const doCurrentStep = async (chatId, msg) => {
  const currentStep = users[chatId]?.currentStep ?? 0
  await steps[currentStep](chatId, msg)
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  await doCurrentStep(chatId, msg)
})

const steps = {
  0: async (chatId, msg) => {
    if (!users[chatId]) {
      const username = msg?.from?.username ?? 'человек'
      await bot.sendMessage(chatId, 'Добро пожаловать в игру, ' + username)
      users[chatId] = {
        username: username,
        currentStep: 0,
      }
      await askLocation(chatId,
        'Давай для начала проверим, что GPS у тебя работает корректно')
      return
    }
    if (!users[chatId].testLocationPassed && msg.location) {
      users[chatId].testLocationPassed = true
      if (locationsMixin.isClose(locationsMixin.locations.dormitory,
        msg.location, 200)) {
        await bot.sendMessage(chatId, 'О, так ты в общаге')
      }
      await bot.sendMessage(chatId, 'Отлично, теперь можно начинать')
      await askLocation(chatId, 'Теперь твоя задача дойти до клиты')
      users[chatId].currentStep = 1
    } else {
      await askLocation(chatId)
    }
  },
  1: async (chatId, msg) => {
    if (!msg.location) {
      await askLocation(chatId, 'Пришли мне геолокацию когда ты будешь около клиты')
      return;
    }
    if (!locationsMixin.isClose(locationsMixin.locations.klita, msg.location,
      300)) {
      await askLocation(chatId, 'Нет, ты еще далеко')
    } else {
      await bot.sendMessage(chatId,
        'Молодец!!! На этом тестовая версия заканчивается')
    }

  },
}

const askLocation = async (chatId, text = null) => {
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
