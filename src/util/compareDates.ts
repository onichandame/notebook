/** @returns true if {@link d1} is later than {@link d2}*/
export const compareDates = (d1: DateLike, d2: DateLike) => {
  return new Date(d1).getTime() > new Date(d2).getTime();
};

type DateLike = Date | string | number;
