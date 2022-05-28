import {
  DocumentType,
  Field,
  PreInsert,
  PreSave,
} from "@onichandame/type-rxdb";

import { createUuid } from "../util";

@PreInsert<Base>(function (input) {
  if (!input.id) {
    input.id = createUuid();
  }
  if (!input.createdAt) {
    input.createdAt = new Date();
  }
})
@PreSave<Base>(function (update) {
  if (!update.updatedAt) update.updatedAt = new Date();
})
export class Base {
  @Field({ primaryKey: true })
  id!: string;
  @Field()
  createdAt!: Date;
  @Field()
  updatedAt?: Date;
  @Field()
  deletedAt?: Date;

  async softDelete<T extends Base>(this: DocumentType<{ new (): T }> & T) {
    if (!this.deletedAt) {
      this.set(`deletedAt`, new Date());
      await this.save();
    }
  }
  async recover<T extends Base>(this: DocumentType<{ new (): T }> & T) {
    if (this.deletedAt) {
      this.set(`deletedAt`, undefined);
      await this.save();
    }
  }
}
