import {
  DocumentType,
  Field,
  PreInsert,
  PreSave,
} from "@onichandame/type-rxdb";

import { createUuid } from "../util";

@PreInsert<Base>(function (input) {
  if (!input.id) input.id = createUuid();

  if (!input.createdAt) input.createdAt = new Date();
})
@PreSave<Base>(function (update, doc) {
  if (!update.updatedAt || update.updatedAt === doc.updatedAt) {
    update.updatedAt = new Date();
  }
})
export class Base {
  @Field({ primaryKey: true, maxLength: 100, required: true })
  id!: string;
  @Field({ required: true })
  createdAt!: Date;
  @Field()
  updatedAt?: Date;
  @Field()
  deletedAt?: Date;

  async softDelete<T extends Base>(this: DocumentType<{ new (): T }> & T) {
    if (!this.deletedAt) {
      await this.atomicPatch({ deletedAt: new Date() } as any);
    }
  }
  async recover<T extends Base>(this: DocumentType<{ new (): T }> & T) {
    if (this.deletedAt) {
      await this.atomicPatch({ deletedAt: undefined } as any);
    }
  }
}
