import { Collection, Field } from '@onichandame/type-rxdb'

@Collection({ name: `peers`, version: 0 })
export class Peer {
  @Field({ primaryKey: true, required: true, maxLength: 100 })
  id!: string
  @Field({ type: `array`, items: { type: `string` } })
  multiaddrs?: string[]
  @Field()
  lastConnectedAt?: Date
}
