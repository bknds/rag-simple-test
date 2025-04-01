import { defineEventHandler, getQuery } from "h3";
import { queryDatasets } from "~/server/agent/dataset/query-datasets";

export default defineEventHandler(async (event) => {
  const { query } = getQuery(event);
  if (!query) return { error: "请输入检索内容" };
  return await queryDatasets(query as string);
});
