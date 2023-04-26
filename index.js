import { Configuration, OpenAIApi } from 'openai'
import { getPageRpi } from '@epaperjs/core'
import { Rpi7In5V2 } from '@epaperjs/rpi-7in5-v2'
import * as mqtt from 'mqtt'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

const client = mqtt.connect(process.env.MQTT_HOST, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASSWORD,
  clientId: process.env.CLIENT_ID,
  clean: false,
  reconnectPeriod: 1,
})

let msg = ''

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

async function handleTouch() {
  const generatedArt = await getCompletionFromOpenAI()
  client.publish('art', generatedArt)
}

async function getCompletionFromOpenAI() {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content:
            'I am sad, I do not want to talk, please do not send any conversation, just send me a unique ASCII artwork with 5 words maximum.',
        },
      ],
    })
    console.log(completion.data.choices[0].message.content)
    return completion.data.choices[0].message.content
  } catch (error) {
    if (error.response) {
      console.log(error.response.status)
      console.log(error.response.data)
    } else {
      console.log(error.message)
    }
  }
}

function getDisplay() {
  return new Rpi7In5V2()
}

async function refreshDisplay() {
  const displayDevice = getDisplay()
  displayDevice.connect()

  const browserPage = await getPageRpi(
    displayDevice.width,
    displayDevice.height
  )

  const url = 'http://localhost:3000'
  const imgOfUrl = await browserPage.screenshot(url, {
    delay: 2000,
  })
  console.log('Waking up display')
  console.log('msg: ', msg)
  displayDevice.wake()
  console.log(`Displaying ${url}`)
  await displayDevice.displayPng(imgOfUrl)
  displayDevice.sleep()
  console.log('Putting display into low power mode')
}

// MQTT pub/sub
// prints a received message
client.on('message', function (topic, message) {
  if (topic === 'art') {
    console.log('New art!')
    msg = String.fromCharCode.apply(null, message) // need to convert the byte array to string
    refreshDisplay()
  } else if (topic === process.env.TOUCH_TOPIC) {
    handleTouch()
  }
})

// reassurance that the connection worked
client.on('connect', () => {
  console.log('Connected!')
})

// prints an error message
client.on('error', (error) => {
  console.log('Error:', error)
})

// subscribe and publish to the same topic
client.subscribe('steph-touch')
client.subscribe('art')
client.publish('steph-touch')

// Local server
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.join(__dirname, '/ui')
const port = 3000

const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs', { async: true })

app.get('/', async (req, res) => {
  res.render(path.join(dir, 'index'), {
    chatbot_love_msg: msg,
  })
  console.log('Rendering index')
})

app.listen(port, function () {
  console.log('Listening on http://localhost:3000/')
})
