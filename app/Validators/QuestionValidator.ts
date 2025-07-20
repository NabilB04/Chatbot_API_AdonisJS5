import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class QuestionValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    question: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(1000)
    ]),
    additional_context: schema.string.optional({ trim: true }, [
      rules.maxLength(2000)
    ]),
    session_id: schema.string.optional({ trim: true }, [
      rules.maxLength(100)
    ])
  })

  public messages = {
    'question.required': 'Question is required',
    'question.maxLength': 'Question must not exceed 1000 characters',
    'additional_context.maxLength': 'Additional context must not exceed 2000 characters',
    'session_id.maxLength': 'Session ID must not exceed 100 characters'
  }
}
