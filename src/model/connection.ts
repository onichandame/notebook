export interface Connection<TData> {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  edges: Edge<TData>[];
}

interface Edge<TData> {
  cursor: string;
  node: TData;
}
