export type EmbeddingRecallItemType = {
  dataId: string;
  datasetId: string;
  collectionId: string;
  score: number;
};

export type DeleteDatasetVectorProps = (
  | { id: string }
  | { datasetIds: string[]; collectionIds?: string[] }
  | { idList: string[] }
) & {
  dataId: string;
};

export type DelDatasetVectorCtrlProps = DeleteDatasetVectorProps & {
  retry?: number;
};

export type InsertVectorControllerProps = {
  dataId: string;
  datasetId: string;
  collectionId: string;
  vector: number[];
  retry?: number;
};

export type InsertVectorProps = Omit<InsertVectorControllerProps, "vector"> & {
  input: string;
};

export type EmbeddingRecallProps = {
  datasetId: string;
  collectionId: string;
  vector: number[];
  limit: number;
  retry?: number;
};

export type EmbeddingRecallResponse = {
  results: EmbeddingRecallItemType[];
};
