import { MilvusController } from "../agent/dataset/milvus";
import { setGlobalMilvusDB } from "../core/global";

export default defineNitroPlugin(async (nitroApp) => {
  try {
    const globalMilvusDB = setGlobalMilvusDB(new MilvusController());
    await globalMilvusDB.init();
    console.log("Milvus向量库连接成功");
  } catch (error) {
    console.log("Milvus向量库连接失败");
  }
});
