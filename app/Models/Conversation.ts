// app/Models/Conversation.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany} from '@ioc:Adonis/Lucid/Orm'
import type { HasMany, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Message from './Message'

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public sessionId: string

  @column()
  public lastMessageId: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message)
  public messages: HasMany<typeof Message>

  @belongsTo(() => Message, {
    foreignKey: 'lastMessageId'
  })
  public lastMessage: BelongsTo<typeof Message>
}
