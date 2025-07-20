import axios from 'axios'

export default class ChatbotService {
  private static baseUrl = 'https://api.majadigidev.jatimprov.go.id/api/external/chatbot'

  public static async sendMessage(
    question: string,
    additionalContext: string = '',
    sessionId: string= ''
  ) {
    try {
      const response = await axios.post(`${this.baseUrl}/send-message`, {
        question,
        additional_context: additionalContext,
        session_id: sessionId
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })
      return response.data
    } catch (error) {
      console.error('Chatbot API Error:', error)
      throw new Error('Failed to get response from chatbot')
    }
  }
}
