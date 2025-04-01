import { DataType, LoadState, MilvusClient } from "@zilliz/milvus2-sdk-node";
import {
  DelDatasetVectorCtrlProps,
  EmbeddingRecallProps,
  EmbeddingRecallResponse,
  InsertVectorControllerProps,
} from "./controller";
import { customAlphabet } from "nanoid";
import { delay } from "~/server/core/utils";

const DatasetVectorDbName = "kfc";
const DatasetVectorCollectionName = "kfc_vc";

export class MilvusController {
  client: MilvusClient | null = null;

  getClient = async () => {
    const MILVUS_ADDRESS = "127.0.0.1:19530";
    const MILVUS_TOKEN = "kfc:kXy4PuZHx6";
    const client = new MilvusClient({
      address: MILVUS_ADDRESS,
      token: MILVUS_TOKEN,
    });
    return client;
  };

  init = async () => {
    try {
      this.client = await this.getClient();
      const { db_names } = await this.client?.listDatabases();

      if (!db_names.includes(DatasetVectorDbName)) {
        await this.client.createDatabase({
          db_name: DatasetVectorDbName,
        });
      }

      await this.client.useDatabase({
        db_name: DatasetVectorDbName,
      });
    } catch (error) {}

    // const list = await this.client?.listCollections();
    // 检查指定数据集是否存在
    const hasCollectionResponse = await this.client?.hasCollection({
      collection_name: DatasetVectorCollectionName,
    });

    const hasCollection = hasCollectionResponse?.value;

    if (!hasCollection) {
      await this.client?.createCollection({
        collection_name: DatasetVectorCollectionName,
        description: "RAG测试项目向量数据集",
        enableDynamicField: true,
        fields: [
          {
            name: "id",
            description: "ID field",
            data_type: DataType.Int64,
            is_primary_key: true,
            autoID: false, // 禁用自动ID，在插入中自主设置ID
          },
          {
            name: "vector",
            description: "数据向量",
            data_type: DataType.FloatVector,
            dim: 1024,
          },
          {
            name: "dataId",
            description: "数据ID",
            data_type: DataType.VarChar,
            max_length: 64,
          },
          {
            name: "datasetId",
            description: "知识库ID",
            data_type: DataType.VarChar,
            max_length: 64,
          },
          {
            name: "collectionId",
            description: "数据集ID",
            data_type: DataType.VarChar,
            max_length: 64,
          },
          {
            name: "createTime",
            description: "创建时间",
            data_type: DataType.Int64,
          },
        ],
        index_params: [
          {
            field_name: "vector",
            index_name: "vector_HNSW",
            index_type: "HNSW",
            metric_type: "IP",
            params: { efConstruction: 32, M: 64 },
          },
          {
            field_name: "dataId",
            index_type: "Trie",
          },
          {
            field_name: "datasetId",
            index_type: "Trie",
          },
          {
            field_name: "collectionId",
            index_type: "Trie",
          },
          {
            field_name: "createTime",
            index_type: "STL_SORT",
          },
        ],
      });
    }

    const loadStateResponse = await this.client?.getLoadState({
      collection_name: DatasetVectorCollectionName,
    });

    const colLoadState = loadStateResponse?.state;

    if (
      colLoadState === LoadState.LoadStateNotExist ||
      colLoadState === LoadState.LoadStateNotLoad
    ) {
      await this.client?.loadCollectionSync({
        collection_name: DatasetVectorCollectionName,
      });
    }
  };

  insert = async (
    props: InsertVectorControllerProps
  ): Promise<{ insertId: string }> => {
    const { dataId, datasetId, collectionId, vector, retry = 3 } = props;
    if (!this.client) return { insertId: "" };

    const generateId = () => {
      const firstDigit = customAlphabet("12345678", 1)();
      const restDigits = customAlphabet("12345678", 15)();
      return Number(`${firstDigit}${restDigits}`);
    };
    const id = generateId();
    try {
      const result = await this.client.insert({
        collection_name: DatasetVectorCollectionName,
        fields_data: [
          {
            id,
            vector,
            dataId: String(dataId), // 数据ID
            datasetId: String(datasetId), // 知识库ID
            collectionId: String(collectionId), // 数据集ID
            createTime: Date.now(),
          },
        ],
      });

      await this.client.createIndex({
        collection_name: DatasetVectorCollectionName,
        field_name: "vector",
        metric_type: "L2",
      });

      const insertId = (() => {
        if ("int_id" in result.IDs) {
          return `${result?.IDs.int_id.data?.[0]}`;
        }
        return `${result?.IDs.str_id.data?.[0]}`;
      })();

      return {
        insertId: insertId,
      };
    } catch (error) {
      if (retry <= 0) {
        return Promise.reject(error);
      }
      await delay(500);
      return this.insert({
        ...props,
        retry: retry - 1,
      });
    }
  };
  delete = async (props: DelDatasetVectorCtrlProps): Promise<any> => {
    const { dataId, retry = 2 } = props;
    const dataIdWhere = `(dataId=="${String(dataId)}")`;
    const where = await (() => {
      if ("id" in props && props.id) return `(id==${props.id})`;

      if ("datasetIds" in props && props.datasetIds) {
        const datasetIdWhere = `(datasetId in [${props.datasetIds
          .map((id) => `"${String(id)}"`)
          .join(",")}])`;

        if ("collectionIds" in props && props.collectionIds) {
          return `${datasetIdWhere} and (collectionId in [${props.collectionIds
            .map((id) => `"${String(id)}"`)
            .join(",")}])`;
        }

        return `${datasetIdWhere}`;
      }

      if ("idList" in props && Array.isArray(props.idList)) {
        if (props.idList.length === 0) return;
        return `(id in [${props.idList.map((id) => String(id)).join(",")}])`;
      }
      return Promise.reject("deleteDatasetData: no where");
    })();

    if (!where) return;

    const concatWhere = `${dataIdWhere} and ${where}`;

    try {
      await this.client?.delete({
        collection_name: DatasetVectorCollectionName,
        filter: concatWhere,
      });
    } catch (error) {
      if (retry <= 0) {
        return Promise.reject(error);
      }
      await delay(500);
      return this.delete({
        ...props,
        retry: retry - 1,
      });
    }
  };
  recall = async (
    props: EmbeddingRecallProps
  ): Promise<EmbeddingRecallResponse> => {
    const { datasetId, collectionId, vector, limit, retry = 2 } = props;

    try {
      const { results } = await this.client!.search({
        collection_name: DatasetVectorCollectionName,
        data: vector,
        limit,
        filter: `(datasetId == "${datasetId}") and (collectionId == "${collectionId}")`,
        output_fields: ["dataId", "datasetId", "collectionId"],
      });

      return {
        results: results.map((result) => ({
          dataId: result.dataId,
          datasetId: result.datasetId,
          collectionId: result.collectionId,
          score: result.score,
        })),
      };
    } catch (error) {
      if (retry <= 0) {
        return Promise.reject(error);
      }
      return this.recall({
        ...props,
        retry: retry - 1,
      });
    }
  };

  getVectorCountByCollectionId = async (collectionId: string) => {
    const result = await this.client?.query({
      collection_name: DatasetVectorCollectionName,
      output_fields: ["count(*)"],
      filter: `collectionId == "${String(collectionId)}"`,
    });

    const total = result?.data?.[0]?.["count(*)"] as number;

    return total;
  };
  getVectorCountByDatasetId = async (datasetId: string) => {
    const result = await this.client?.query({
      collection_name: DatasetVectorCollectionName,
      output_fields: ["count(*)"],
      filter: `datasetId == "${String(datasetId)}"`,
    });

    const total = result?.data?.[0]?.["count(*)"] as number;

    return total;
  };

  getVectorDataByTime = async (start: Date, end: Date) => {
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end).getTime();

    const result = await this.client?.query({
      collection_name: DatasetVectorCollectionName,
      output_fields: ["id", "dataId", "datasetId"],
      filter: `(createTime >= ${startTimestamp}) and (createTime <= ${endTimestamp})`,
    });

    const rows = result?.data as {
      id: string;
      dataId: string;
      datasetId: string;
    }[];

    return rows.map((item) => ({
      id: String(item.id),
      dataId: item.dataId,
      datasetId: item.datasetId,
    }));
  };
}
