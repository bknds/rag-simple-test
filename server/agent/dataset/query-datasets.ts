import DataSet from "~/server/agent/dataset/dataset";
import { QAData } from "~/server/mongo/models/qadata.model";

export const queryDatasets = async (query: string) => {
  const datasetObj = new DataSet();

  const datasetId = "test-datasetId";
  const collectionId = "test-collectionId";

  const { results } = await datasetObj.embeddingRecall({
    datasetId,
    collectionId,
    query: query as string,
  });

  const mongoResults = await Promise.all(
    results.map(async (recallData: any) => {
      const result = await QAData.findOne({
        dataId: recallData.dataId,
        datasetId: recallData.datasetId,
        collectionId: recallData.collectionId,
      }).lean();
      return {
        question: result?.question,
        answer: result?.answer,
        score: recallData.score,
      };
    })
  );
  return mongoResults;
};
