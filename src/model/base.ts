import {
  DocumentType,
  Field,
  Index,
  PreInsert,
  PreSave,
} from '@onichandame/type-rxdb'

import type { DateLike } from '../type'
import { createUuid, parseFromDate } from '../util'

@PreInsert<Base>(function (input) {
  if (!input.id) input.id = createUuid()
  if (!input.createdAt) input.createdAt = new Date()
  formatDates(input)
})
@PreSave<Base>(function (update) {
  formatDates(update)
})
export class Base {
  @Field({ primaryKey: true, maxLength: 100, required: true })
  id!: string
  @Index()
  @Field({
    required: true,
    type: `integer`,
    multipleOf: 1,
    minimum: 1654242514444,
    maximum: 64073922473778,
  })
  createdAt!: DateLike
  @Index()
  @Field({
    type: `integer`,
    multipleOf: 1,
    minimum: 1654242514444,
    maximum: 64073922473778,
  })
  updatedAt?: DateLike
  @Index()
  @Field({
    type: `integer`,
    multipleOf: 1,
    minimum: 1654242514444,
    maximum: 64073922473778,
  })
  deletedAt?: DateLike

  async softDelete<T extends Base>(this: DocumentType<{ new (): T }> & T) {
    if (!this.deletedAt) {
      return await this.atomicPatch({
        updatedAt: new Date(),
        deletedAt: new Date(),
      } as any)
    } else return this
  }
  async recover<T extends Base>(this: DocumentType<{ new (): T }> & T) {
    if (this.deletedAt) {
      return await this.atomicPatch({
        updatedAt: new Date(),
        deletedAt: undefined,
      } as any)
    } else return this
  }
}

function formatDates(doc: Base) {
  if (doc.createdAt) doc.createdAt = parseFromDate(doc.createdAt)
  if (doc.updatedAt) doc.updatedAt = parseFromDate(doc.updatedAt)
  if (doc.deletedAt) doc.deletedAt = parseFromDate(doc.deletedAt)
}
