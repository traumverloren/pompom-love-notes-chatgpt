import { Configuration, OpenAIApi } from 'openai'
import { getPageRpi } from '@epaperjs/core'
import { Rpi7In5V2 } from '@epaperjs/rpi-7in5-v2'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import ejs from 'ejs'
import dotenv from 'dotenv'
dotenv.config()

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

async function getCompletionFromOpenAI() {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Answer me with uwu cute recognizable ASCII art',
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
  displayDevice.wake()
  console.log(`Displaying ${url}`)
  await displayDevice.displayPng(imgOfUrl)
  displayDevice.sleep()
  console.log('Putting display into low power mode')
}

// Local server
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.join(__dirname, '/ui')
const port = 3000

const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs')

let ejsOptions = {
  async: true,
}

// The engine is using a callback method for async rendering
app.engine('ejs', async (path, data, cb) => {
  try {
    let html = await ejs.renderFile(path, data, ejsOptions)
    cb(null, html)
  } catch (e) {
    cb(e, '')
  }
})

// index page
app.route('/').get(async (req, res) => {
  return (
    await res.render(path.join(dir, 'index.ejs'), {
      chatbot_love_msg: await getCompletionFromOpenAI(),
    }),
    (err, html) => standardResponse(err, html, res)
  )
})

const standardResponse = (err, html, res) => {
  // If error, return 500 page
  if (err) {
    console.log(err)
    // Passing null to the error response to avoid infinite loops XP
    return res.status(500)
    // Otherwise return the html
  } else {
    return res.status(200).send(html)
  }
}

app.listen(port, function () {
  console.log('Listening on http://localhost:3000/')
})


refreshDisplay()
