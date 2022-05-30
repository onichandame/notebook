export const formatError = (e: unknown): string => {
  return Array.isArray(e)
    ? e.map((v) => formatError(v)).join(`; `)
    : (e as Error).message || JSON.stringify(e);
};
