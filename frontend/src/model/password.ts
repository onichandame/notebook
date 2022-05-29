import { Collection, Field } from "@onichandame/type-rxdb";

import { Base } from "./base";

@Collection({ name: `passwords`, version: 0 })
export class Password extends Base {
  @Field({ required: true })
  title!: string;
  @Field({ required: true })
  password!: string;
  @Field()
  icon?: string;
  @Field()
  url?: string;
  @Field()
  username?: string;
}
