import { defineEventHandler, readBody } from "h3";
import { QAData } from "~/server/mongo/models/qadata.model";
import { nanoid } from "nanoid";
import DataSet from "~/server/agent/dataset/dataset";

// **知识库上传 API**
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { qaDataList } = body;

  const datasetId = "test-datasetId";
  const collectionId = "test-collectionId";

  const processedData = qaDataList.map((item: IQAData) => ({
    dataId: nanoid(15),
    datasetId,
    collectionId,
    question: item.question,
    answer: item.answer,
  }));
  await QAData.insertMany(processedData);
  const datasetObj = new DataSet();
  const result = await Promise.all(
    processedData
      .map((item: (typeof processedData)[0]) => ({
        dataId: item.dataId,
        datasetId,
        collectionId,
        input: item.question,
      }))
      .map(datasetObj.insertVector)
  );
  return result;
});
