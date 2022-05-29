import { Collection, Field } from "@onichandame/type-rxdb";

import { Base } from "./base";

@Collection({
  name: `notes`,
  version: 0,
})
export class Note extends Base {
  @Field({ required: true })
  title!: string;
  @Field()
  content?: string;
}
