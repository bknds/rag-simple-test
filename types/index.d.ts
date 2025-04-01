export {};
declare module "sklearn";
declare global {
  interface IQAData {
    question: string;
    answer: string;
  }

  interface IChatMessage {
    _id?: string;
    chatId?: string;
    role: string;
    content: string;
    createAt?: string;
  }
}
