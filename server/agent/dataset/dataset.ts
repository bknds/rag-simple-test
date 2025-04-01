import OpenAI from "openai/index.mjs";
import { InsertVectorProps } from "./controller";
import { getGlobalState } from "~/server/core/global";

export default class DataSet {
  constructor() {}

  private getTextVectorsByEmbeddings = async (
    text: string
  ): Promise<number[]> => {
    const openai = new OpenAI({
      baseURL: process.env.OLLMA_BASE_URL,
      apiKey: "ollma",
    });
    const response = await openai.embeddings.create({
      model: "since2006/bge-large-zh-v1.5:F16",
      input: text,
    });
    return response.data[0].embedding;
  };

  public insertVector = async (props: InsertVectorProps) => {
    const { input, dataId, datasetId, collectionId } = props;
    const vector = await this.getTextVectorsByEmbeddings(input);
    const milvuDB = getGlobalState().globalMilvusDB;
    milvuDB?.insert({
      dataId,
      datasetId,
      collectionId,
      vector,
    });
    // const { insertId } = await Vector.insert({
    //   ...props,
    //   vector: vectors[0],
    // });

    // return {
    //   tokens,
    //   insertId,
    // };
  };

  public embeddingRecall = async (props: {
    query: string;
    datasetId: string;
    collectionId: string;
  }): Promise<any> => {
    const { query, datasetId, collectionId } = props;
    const milvuDB = getGlobalState().globalMilvusDB;
    const results = await milvuDB?.recall({
      datasetId,
      collectionId,
      vector: await this.getTextVectorsByEmbeddings(query),
      limit: 5,
    });

    return results;
  };

  public reRankRecall = async ({
    query,
    documents,
  }: {
    query: string;
    documents: { id: string; text: string }[];
  }): Promise<any> => {
    const fetchResponse = await fetch(`http://localhost:11434/v1/rerank`, {
      method: "POST",
      headers: {
        Authorization: `Bearer kXy4PuZHx6`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "bge-rerank-v2-m3",
        query,
        documents: documents.map((doc) => doc.text),
      }),
    });
    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! status: ${fetchResponse.status}`);
    }

    const response = await fetchResponse.json();
    return response;
  };
}
