import { DocumentType, Field, PreInsert } from "@onichandame/type-rxdb";

import { createUuid } from "../util";

@PreInsert<Base>(function (input) {
  if (!input.id) input.id = createUuid();
  if (!input.createdAt) input.createdAt = new Date();
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
      await this.atomicPatch(
        { updatedAt: new Date(), deletedAt: new Date() } as any,
      );
    }
  }
  async recover<T extends Base>(this: DocumentType<{ new (): T }> & T) {
    if (this.deletedAt) {
      await this.atomicPatch(
        { updatedAt: new Date(), deletedAt: undefined } as any,
      );
    }
  }
}
