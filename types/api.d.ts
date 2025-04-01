/// 所有 java服务端的 api 接口的响应数据都应该准守该格式
interface APIResponseDataInterface<T> {
  code: string
  count: number
  data: T
  desc: string
  timestamp: number
}
