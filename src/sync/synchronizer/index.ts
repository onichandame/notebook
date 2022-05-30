import { ReturnCollectionType } from "@onichandame/type-rxdb";
import EventEmitter from "events";
import { isRxCollection } from "rxdb";

import { useDb } from "../../db";
import { Base } from "../../model/base";

/** Every synchronization request should instantiate one {@link Synchronizer} */
export class Synchronizer extends EventEmitter {
  private localCount = 0;
  private remoteCount = 0;
  private localProgress = 0;
  private remoteProgress = 0;
  constructor(private db: NonNullable<ReturnType<typeof useDb>>) {
    super();
  }

  on(ev: `progress`, fn: ProgressCallback): this;
  on(ev: string, fn: (..._: any[]) => void) {
    return super.on(ev, fn);
  }

  /** sync documents from remote peer to local */
  async sync(stream: AsyncIterable<Document>) {
    this.remoteCount = 0;
    this.remoteProgress = 0;
    for await (const remote of stream) {
      try {
        if (!this.remoteCount) this.remoteCount = remote.total;
        const col: ReturnCollectionType<typeof Base> =
          this.db[remote.collection as keyof typeof this.db];
        if (isRxCollection(col)) {
          let shouldSync = true;
          const local = await col.findOne(`id`).eq(remote.doc.id).exec();
          if (local) {
            if (remote.doc.updatedAt) {
              if (local.updatedAt) {
                if (compareDates(local.updatedAt, remote.doc.updatedAt)) {
                  shouldSync = false;
                }
              }
            }
          }
          if (shouldSync) await col.atomicUpsert(remote.doc);
        }
      } finally {
        this.remoteProgress++;
        this.emit(`progress`, this.progress / this.count);
      }
    }
  }

  /** yield all local documents */
  async *stream(): AsyncGenerator<Document> {
    this.localCount = 0;
    this.localProgress = 0;
    const collections: (keyof typeof this.db)[] = [`notes`, `passwords`];
    const that = this;
    async function* streamCollection(col: keyof typeof that.db) {
      const collection: ReturnCollectionType<typeof Base> = that.db[col];
      if (isRxCollection(collection)) {
        const docs = await collection.find().exec();
        that.localCount += docs.length;
        for (const doc of docs) {
          yield {
            total: docs.length,
            doc,
            version: that.db[col].schema.version,
            collection: `notes`,
          };
          that.localProgress++;
          that.emit(`progress`, that.progress / that.count);
        }
      }
    }
    for (const collection of collections) {
      for await (const doc of streamCollection(collection)) yield doc;
    }
  }

  private get count() {
    return this.localCount + this.remoteCount;
  }
  private get progress() {
    return this.localProgress + this.remoteProgress;
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
  total: number;
};
/** @param progress - percentage of processed documents in all documents */
type ProgressCallback = (progress: number) => void;
