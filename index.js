import { Configuration, OpenAIApi } from 'openai'
import { getPageRpi } from '@epaperjs/core'
import { Rpi7In5V2 } from '@epaperjs/rpi-7in5-v2'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

async function getCompletionFromOpenAI() {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Answer me with a ASCII art of a dog' },
      ],
    })
    console.log(completion.data.choices[0].message.content)
  } catch (error) {
    if (error.response) {
      console.log(error.response.status)
      console.log(error.response.data)
    } else {
      console.log(error.message)
    }
  }
}

// getCompletionFromOpenAI()

const displayDevice = Rpi7In5V2
displayDevice.connect()

async function refreshDisplay() {
  const browserPage = await getPageRpi(
    displayDevice.width,
    displayDevice.height
  )

  const url = 'http://localhost:80'
  const imgOfUrl = await browserPage.screenshot(url, {
    delay: 1000,
  })
  console.log('Waking up display')
  displayDevice.wake()
  console.log(`Displaying ${url}`)
  await displayDevice.displayPng(imgOfUrl)
  displayDevice.sleep()
  console.log('Putting display into low power mode')
}

refreshDisplay()

// Local server
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.join(__dirname, '/ui')
const host = 'localhost'
const port = 3000

const app = express()

app.use(express.static(dir))

app.listen(3000, function () {
  console.log('Listening on http://localhost:3000/')
})
