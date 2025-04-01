// 服务端全局参数对象
import { MilvusController } from "../agent/dataset/milvus";
type TypeGlobalState = {
  globalMilvusDB: MilvusController | null;
};

const globalState: TypeGlobalState = {
  globalMilvusDB: null,
};

export const setGlobalMilvusDB = (
  milvusDB: MilvusController
): MilvusController => {
  globalState.globalMilvusDB = milvusDB;
  return globalState.globalMilvusDB;
};

export const getGlobalState = (): TypeGlobalState => {
  return globalState;
};

export const throwError = (
  statusCode: number = 500,
  message: string = "Internal Server Error"
): never => {
  throw createError({ statusCode, message });
};
