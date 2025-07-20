import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Conversation from 'App/Models/Conversation'

export default class ConversationsController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const sessionId = request.input('session_id')

      let query = Conversation.query()
        .preload('lastMessage')
        .orderBy('updated_at', 'desc')

      if (sessionId) {
        query = query.where('session_id', sessionId)
      }

      const conversations = await query.paginate(page, limit)

      return response.status(200).json({
        success: true,
        data: conversations
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch conversations',
        error: error.message
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const conversation = await Conversation.query()
        .where('id', params.id)
        .orWhere('session_id', params.id)
        .preload('messages', (query) => {
          query.orderBy('created_at', 'asc')
        })
        .firstOrFail()

      return response.status(200).json({
        success: true,
        data: conversation
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const conversation = await Conversation.query()
        .where('id', params.id)
        .orWhere('session_id', params.id)
        .firstOrFail()

      await conversation.delete()

      return response.status(200).json({
        success: true,
        message: 'Conversation deleted successfully'
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }
  }
}
