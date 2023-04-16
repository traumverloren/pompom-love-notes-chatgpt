import { Configuration, OpenAIApi } from 'openai'
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

getCompletionFromOpenAI()
