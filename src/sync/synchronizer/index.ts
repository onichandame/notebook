import { ReturnCollectionType } from "@onichandame/type-rxdb";
import { isRxCollection } from "rxdb";

import { useDb } from "../../db";
import { Base } from "../../model/base";

export class Synchronizer {
  constructor(private db: NonNullable<ReturnType<typeof useDb>>) {}

  /** sync one document from remote peer */
  async sync(remote: Document) {
    const col: ReturnCollectionType<typeof Base> =
      this.db[remote.collection as keyof typeof this.db];
    if (isRxCollection(col)) {
      const local = await col.findOne(`id`).eq(remote.doc.id).exec();
      if (local) {
        if (remote.doc.updatedAt) {
          if (local.updatedAt) {
            if (compareDates(local.updatedAt, remote.doc.updatedAt)) return;
          }
        }
      }
      await col.atomicUpsert(remote.doc);
    }
  }

  /** yield all local documents */
  async *stream(): AsyncGenerator<Document> {
    for (const doc of await this.db.notes.find().exec()) {
      yield {
        doc,
        version: this.db.notes.schema.version,
        collection: `notes`,
      };
    }
    for (const doc of await this.db.passwords.find().exec()) {
      yield {
        doc,
        version: this.db.passwords.schema.version,
        collection: `passwords`,
      };
    }
  }
}

/** @returns true if {@link d1} is later than {@link d2}*/
function compareDates(d1: DateLike, d2: DateLike) {
  return new Date(d1).getTime() > new Date(d2).getTime();
}

type DateLike = Date | string | number;

type Document = {
  collection: string;
  version: number;
  doc: Base;
};
