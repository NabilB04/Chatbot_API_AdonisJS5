import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Messages extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('conversation_id').references('id').inTable('conversations').onDelete('CASCADE')
      table.enum('sender_type', ['user', 'bot']).notNullable()
      table.text('message').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.index('conversation_id')
      table.index('sender_type')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
