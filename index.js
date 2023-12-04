import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import locationsMixin from './locationsMixin.js'

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true })

let users = {}

class User {
  constructor (id) {
    this.id = id
    this.currentStep = 0
    this.testLocationPassed = false
  }

  askLocation = async (text) => {
    await bot.sendMessage(this.id, text ?? 'Отправь мне свое местоположение', {
      reply_markup: JSON.stringify({
        keyboard: [
          [{ text: 'Отправить геолокацию', request_location: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      }),
    })
  }
  sendMessage = async (text) => {
    await bot.sendMessage(this.id, text)
  }
}

const doCurrentStep = async (user, msg) => {
  await steps[user.currentStep ?? 0](user, msg)
}

const createNewUser = async (chatId) => {
  const user = users[chatId] = new User(chatId)
  await user.sendMessage('Добро пожаловать в игру')
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  if (!users[chatId]) {
    await createNewUser(msg.chat.id)
  }
  const user = users[chatId]
  await doCurrentStep(user, msg)
})

const steps = {
  0: async (user, msg) => {
    if (!user.testLocationPassed || !msg.location) {
      await user.askLocation(
        'Давай для начала проверим, что GPS у тебя работает корректно')
      return
    }
    user.testLocationPassed = true
    if (locationsMixin.isClose(locationsMixin.locations.dormitory,
      msg.location, 200)) {
      await user.sendMessage('О, так ты в общаге')
    }
    await user.sendMessage('Отлично, теперь можно начинать')
    await user.askLocation('Теперь твоя задача дойти до клиты')
    user.currentStep = 1
  },
  1: async (user, msg) => {
    if (!msg.location) {
      await user.askLocation(
        'Пришли мне геолокацию когда ты будешь около клиты')
      return
    }
    if (!locationsMixin.isClose(locationsMixin.locations.klita, msg.location,
      300)) {
      await user.askLocation('Нет, ты еще далеко')
      return
    }
    await user.sendMessage('Молодец!!! На этом тестовая версия заканчивается')
  },
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
