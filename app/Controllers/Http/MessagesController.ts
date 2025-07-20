import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'

export default class MessagesController {
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const message = await Message.findOrFail(params.id)
      await message.delete()

      return response.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }
  }
}
