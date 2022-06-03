import type { DateLike } from '../type'

/** @returns true if {@link d1} is later than {@link d2}*/
export const compareDates = (d1: DateLike, d2: DateLike) => {
  return new Date(d1).getTime() > new Date(d2).getTime()
}

export const parseFromDate = (d: DateLike) => {
  return new Date(d).getTime()
}

export const parseToDate = (d: DateLike) => {
  return new Date(d)
}
