<script lang="ts" setup>
import * as XLSX from "xlsx";
import { MessagePlugin } from "tdesign-vue-next";

defineOptions({ name: "UploadQA" });

const emit = defineEmits<{
  confirm: [qaDataList: IQAData[], done: () => void];
}>();

const loading = ref(false);
const files = ref<any>([]);

const formatFileSize = (size: number) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let humanReadableSize = size;

  while (humanReadableSize >= 1024 && unitIndex < units.length - 1) {
    humanReadableSize /= 1024;
    unitIndex++;
  }
  return humanReadableSize.toFixed(2) + " " + units[unitIndex];
};

const file2Excel = async (file: File): Promise<IQAData[]> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const headers = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        })[0] as string[];

        const isValidHeader = (headers: string[]) => {
          const requiredHeaders = ["question", "answer"];
          return requiredHeaders.every((header) => headers.includes(header));
        };

        if (!isValidHeader(headers)) {
          return reject({
            message: `格式错误，请按照模板文件进行填写`,
          });
        }

        // 使用 XLSX.utils.sheet_to_json 方法将第一行作为键解析工作表
        const jsonData = XLSX.utils
          .sheet_to_json(worksheet, { header: 1 })
          .map((row: any, index: number) => {
            // 对于第一行或标题行不需要进行处理
            if (index === 0) return null;
            // 创建一个对象数组，以第二行到最后一行为值
            const obj: any = {};
            row.forEach((value: string, colIndex: number) => {
              obj[
                workbook.Sheets[firstSheetName][
                  XLSX.utils.encode_cell({ r: 0, c: colIndex })
                ].v
              ] = value;
            });
            return obj;
          })
          .filter((item) => item !== null);

        resolve(jsonData);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });
};

const confirmHandle = async () => {
  if (!files.value[0]?.raw) return;
  try {
    loading.value = true;
    const res = await file2Excel(files.value[0].raw);
    emit("confirm", res, () => {
      loading.value = false;
    });
    files.value = [];
  } catch (error: any) {
    MessagePlugin.error({
      content: error.message || "文件解析失败，请重试",
      duration: 2000,
    });
  }
};

const downloadTemplateExcel = () => {
  // 创建一个新的工作簿
  const workbook = XLSX.utils.book_new();
  // 创建一个新的工作表
  const worksheet = XLSX.utils.json_to_sheet([
    {
      question: "快捷回复标题",
      answer: "快捷回复内容",
    },
  ]);

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // 生成 Excel 并触发下载
  XLSX.writeFile(workbook, "问答对模板.xlsx");
};
</script>

<template>
  <t-upload v-model="files" :auto-upload="false" theme="custom" :abridge-name="[10, 8]" draggable accept=".xlsx,.xls">
    <template #dragContent="params">
      <div class="file-box" v-if="files && files.length">
        <div class="file-name">{{ files[0].name }}</div>
        <div class="file-size">{{ formatFileSize(files[0].size) }}</div>
        <t-button size="small" style="margin-top: 36px">更换文件</t-button>
      </div>
      <div class="placeholder-box" v-else>
        <div v-if="params && params.dragActive">释放鼠标</div>
        <div v-else class="placeholder">
          <div class="tip">
            拖拽文件至此，或
            <div class="link">点击选择文件</div>
          </div>
          <div class="tip">支持.xlsx、.xls文件</div>
          <div class="sub-tip">
            如果文件乱码，请尝试将文件转成 UTF-8 编码格式
          </div>
          <div class="link" @click.stop="downloadTemplateExcel">
            下载问答对模板文件
          </div>
        </div>
      </div>
    </template>
  </t-upload>
  <t-button size="large" style="margin-top: 36px;width:100%;" v-if="files && files.length"
    @click.stop="confirmHandle" :loading="loading">上传问答对</t-button>
</template>

<style scoped lang="scss">
.file-box {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 70vh;

  .file-name {
    font-size: 14px;
    color: var(--text-color);
    margin-bottom: 5px;
  }

  .file-size {
    font-size: 12px;
    color: var(--text-color-2);
  }
}

.placeholder-box {
  height: 70vh;

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
  }

  .tip {
    display: inline-block;
    font-size: 13px;
    color: var(--text-color);
    margin-bottom: 5px;
  }

  .sub-tip {
    display: inline-block;
    font-size: 12px;
    color: var(--text-color-2);
  }

  .link {
    display: inline-block;
    color: var(--primary-color);
    font-size: 13px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

:deep(.t-upload__dragger) {
  width: auto;
  height: auto;
}

.tdesign-demo__panel-options-multiple {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tdesign-demo__panel-options-multiple .t-checkbox {
  display: flex;
  border-radius: 3px;
  line-height: 22px;
  cursor: pointer;
  padding: 3px 8px;
  color: var(--td-text-color-primary);
  transition: background-color 0.2s linear;
  white-space: nowrap;
  word-wrap: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tdesign-demo__panel-options-multiple .t-checkbox:hover {
  background-color: var(--td-bg-color-container-hover);
}

.create-label {
  margin: 15px 0 5px;
  font-size: 12px;
  color: var(--text-color);
}
</style>
