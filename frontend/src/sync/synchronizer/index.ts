import { Base } from "../../model/base";

export abstract class Synchronizer<TDoc extends Base> {
  /** transforms a doc from remote peer and returns the doc to be saved locally */
  async sync(remote: TDoc, local: TDoc) {
    if (remote.updatedAt) {
      if (local.updatedAt) {
        if (compareDates(remote.updatedAt, local.updatedAt)) return remote;
      } else return remote;
    } else if (compareDates(remote.createdAt, local.createdAt)) return remote;
    else return local;
  }
}

type DateLike = Date | string | number;

/** @returns true if {@link d1} is later than {@link d2}*/
function compareDates(d1: DateLike, d2: DateLike) {
  return new Date(d1).getTime() > new Date(d2).getTime();
}
