import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { v4 as uuidv4 } from 'uuid'
import Conversation from 'App/Models/Conversation'
import Message from 'App/Models/Message'
import ChatbotService from 'App/Services/ChatbotService'
import QuestionValidator from 'App/Validators/QuestionValidator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class QuestionsController {
  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(QuestionValidator)

    const trx = await Database.transaction()

    try {
      const sessionId = payload.session_id || uuidv4()
      // create
      let conversation = await Conversation.query({ client: trx })
        .where('session_id', sessionId)
        .first()

      if (!conversation) {
        conversation = await Conversation.create({
          sessionId
        }, { client: trx })
      }

      // save
      const userMessage = await Message.create({
        conversationId: conversation.id,
        senderType: 'user',
        message: payload.question
      }, { client: trx })

      // Get bot
      const botResponse = await ChatbotService.sendMessage(
        payload.question,
        payload.additional_context || '',
        sessionId
      )

      // Save bot
      const botMessage = await Message.create({
        conversationId: conversation.id,
        senderType: 'bot',
        message: botResponse.data?.message?.[0]?.text || 'No response from bot'
      }, { client: trx })

      // Update last message 
      conversation.lastMessageId = botMessage.id
      await conversation.save()

      await trx.commit()

      return response.status(200).json({
        success: true,
        data: {
          conversation_id: conversation.id,
          session_id: sessionId,
          user_message: userMessage.message,
          bot_response: botMessage.message,
          timestamp: botMessage.createdAt
        }
      })

    } catch (error) {
      await trx.rollback()
      console.error('Error processing question:', error)

      return response.status(500).json({
        success: false,
        message: 'Failed to process question',
        error: error.message
      })
    }
  }
}
