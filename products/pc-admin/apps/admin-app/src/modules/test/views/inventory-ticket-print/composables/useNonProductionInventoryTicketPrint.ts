;
import { ref } from 'vue';
import { useI18n } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import { BtcMessage } from '@btc/shared-components';
import { service } from '@/services/eps';
import QRCode from 'qrcode';
import type { Ref } from 'vue';

/**
 * 非生产域盘点票打印相关的 composable
 */
export function useNonProductionInventoryTicketPrint(
  selectedDomain: Ref<any>,
  positionFilter: Ref<string>,
  materialCodeFilter: Ref<string>,
  ticketList: Ref<any[]>,
  crudRef: Ref<any>,
  printContentRef: Ref<HTMLElement | undefined>
) {
  const { t } = useI18n();
  const printTime = ref('');

  // 加载盘点票数据（通过 crud 刷新）
  const loadTicketData = async () => {
    // 如果没有选中域，不加载数据
    if (!selectedDomain.value) {
      return;
    }

    // 优先使用 crud.loadData，如果没有则使用 refresh
    if (crudRef.value?.crud?.loadData) {
      await crudRef.value.crud.loadData();
    } else if (crudRef.value?.refresh) {
      await crudRef.value.refresh();
    } else {
      // 如果 crud 还没有初始化，延迟重试
      setTimeout(() => {
        if (crudRef.value?.crud?.loadData) {
          crudRef.value.crud.loadData();
        } else if (crudRef.value?.refresh) {
          crudRef.value.refresh();
        }
      }, 100);
    }
  };

  // 打印数据（支持范围选择）
  const handlePrint = async (range?: { start: number; end: number }) => {
    if (!printContentRef.value) {
      BtcMessage.warning(t('inventory.ticket.print.content_unavailable'));
      return;
    }

    // 更新打印时间
    printTime.value = formatDateTime(new Date());

    try {
      // 先调用 checkTicket.save 服务保存打印记录
      const checkTicketSaveService = service.admin?.base?.checkTicket?.save;
      if (checkTicketSaveService) {
        try {
          // save 需要传递数组参数（根据 EPS 定义）
          // 传递当前表格中的数据列表
          const currentList = crudRef.value?.crud?.tableData?.value || ticketList.value;
          await checkTicketSaveService(currentList);
        } catch (error) {
          // 响应拦截器已显示错误消息，不需要在控制台打印
          // 保存失败不影响打印，继续执行
        }
      }

      // 加载所有数据用于打印（直接调用 info 服务，不进行分页）
      const checkTicketInfoService = service.admin?.base?.checkTicket?.info;
      if (!checkTicketInfoService) {
        BtcMessage.warning(t('inventory.ticket.print.service_unavailable'));
        return;
      }

      const requestParams: any = {
        keyword: {}
      };
      if (selectedDomain.value?.domainId) {
        requestParams.keyword.domainId = selectedDomain.value.domainId;
      }
      // 传递 position 参数到 keyword 对象中（必须传递，没有输入则为空串）
      requestParams.keyword.position = positionFilter.value?.trim() || '';

      // 直接调用 checkTicket.info 服务（EPS 生成的方法已经包含正确的路径和方法）
      const response = await checkTicketInfoService(requestParams);

      // 处理响应数据
      let list: any[] = [];
      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          list = response.data;
        } else if (Array.isArray(response)) {
          list = response;
        } else if (response.data && typeof response.data === 'object' && 'list' in response.data) {
          list = response.data.list || [];
        }
      }

      // 前端筛选：根据物料编码进行模糊匹配（后端不支持，需要在前端筛选）
      if (materialCodeFilter.value?.trim()) {
        const filterText = materialCodeFilter.value.trim().toLowerCase();
        list = list.filter((item: any) => {
          const partName = (item.partName || '').toLowerCase();
          return partName.includes(filterText);
        });
      }

      // 如果指定了范围，则只打印范围内的数据
      if (range && range.start && range.end) {
        const start = Math.max(0, range.start - 1); // 转换为数组索引（从0开始）
        const end = Math.min(list.length, range.end);
        list = list.slice(start, end);
      }

      // 创建隐藏的 iframe 用于打印预览（不打开新标签页）
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = 'none';
      printIframe.style.opacity = '0';
      printIframe.style.pointerEvents = 'none';
      document.body.appendChild(printIframe);

      const printWindow = printIframe.contentWindow;
      if (!printWindow) {
        BtcMessage.error(t('inventory.ticket.print.window_error'));
        document.body.removeChild(printIframe);
        return;
      }

      // 构建打印内容
      const content = buildPrintContent(list);

      // 存储二维码数据，用于后续生成
      const qrCodeData = list.map((item: any, index: number) => {
        const qrData = JSON.stringify({
          partName: item.partName || '',
          position: item.position || ''
        });
        const qrId = `qr-${item.partName || ''}-${item.position || ''}-${index}`;
        return { qrId, qrData };
      });

      // 构建打印 HTML
      const printHTML = buildPrintHTML(content);

      // 写入内容到 iframe
      const printDoc = printWindow.document || printIframe.contentDocument;
      if (!printDoc) {
        BtcMessage.error(t('inventory.ticket.print.window_error'));
        document.body.removeChild(printIframe);
        return;
      }
      printDoc.open();
      printDoc.write(printHTML);
      printDoc.close();

      // 标记是否已调用print接口，避免重复调用
      let printApiCalled = false;
      // 标记是否真正开始打印（beforeprint事件触发）
      let printStarted = false;
      // 记录beforeprint触发的时间戳
      let beforePrintTime = 0;
      // 最小打印时间（毫秒），如果beforeprint和afterprint之间的时间太短，可能是用户快速取消了
      const MIN_PRINT_TIME = 100;

      // 清理函数：移除事件监听器和 iframe
      let cleanup: (() => void) | null = null;

      // 监听打印开始事件
      const handleBeforePrint = () => {
        printStarted = true;
        beforePrintTime = Date.now();
      };

      // 监听打印完成事件，调用后端print接口
      // 只有在真正开始打印（beforeprint触发）后，才在afterprint时调用API
      const handleAfterPrint = async () => {
        // 如果没有开始打印（用户取消了），不调用API
        if (!printStarted) {
          if (cleanup) {
            cleanup();
          }
          return;
        }

        // 如果beforeprint和afterprint之间的时间太短（小于100ms），可能是用户快速取消了
        // 注意：这只是一个启发式检查，不能完全保证准确性
        const printDuration = Date.now() - beforePrintTime;
        if (printDuration < MIN_PRINT_TIME) {
          console.info('[NonProductionInventoryTicketPrint] Print dialog closed too quickly, likely cancelled');
          if (cleanup) {
            cleanup();
          }
          return;
        }

        if (printApiCalled) {
          if (cleanup) {
            cleanup();
          }
          return;
        }
        printApiCalled = true;

        try {
          // 调用后端print接口，传递和info完全一致的数据结构
          // EPS 服务会根据 API 定义自动处理 POST 请求，将数组作为 body 传递
          const checkTicketPrintService = service.admin?.base?.checkTicket?.print;
          if (checkTicketPrintService) {
            await checkTicketPrintService(list);
          } else {
            console.warn('[NonProductionInventoryTicketPrint] Print service not available, skipping API call');
          }
        } catch (error) {
          // 响应拦截器已显示错误消息，不需要在控制台打印
          // 打印API调用失败不影响用户，只记录错误
        } finally {
          // 延迟清理，确保事件处理完成
          if (cleanup) {
            setTimeout(cleanup, 100);
          }
        }
      };

      // 定义清理函数
      cleanup = () => {
        window.removeEventListener('beforeprint', handleBeforePrint);
        window.removeEventListener('afterprint', handleAfterPrint);
        printWindow.removeEventListener('beforeprint', handleBeforePrint);
        printWindow.removeEventListener('afterprint', handleAfterPrint);
        if (printIframe.parentNode) {
          document.body.removeChild(printIframe);
        }
      };

      // 在主窗口和打印窗口都监听beforeprint和afterprint事件
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
      printWindow.addEventListener('beforeprint', handleBeforePrint);
      printWindow.addEventListener('afterprint', handleAfterPrint);

      // 延迟生成二维码
      setTimeout(async () => {
        try {
          // 为每个二维码生成图片
          // 获取 iframe 的 document
          const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
          if (!iframeDoc) {
            // iframe 访问失败是技术错误，不是业务错误，不需要在控制台打印
            if (cleanup) {
              cleanup();
            }
            return;
          }

          for (const { qrId, qrData } of qrCodeData) {
            const canvasElement = iframeDoc.getElementById(qrId) as HTMLCanvasElement;
            if (canvasElement) {
              // 在生成二维码之前，先设置容器的样式，限定生成位置
              const parentDiv = canvasElement.parentElement;
              if (parentDiv) {
                parentDiv.style.setProperty('display', 'flex', 'important');
                parentDiv.style.setProperty('flex-direction', 'column', 'important');
                parentDiv.style.setProperty('align-items', 'center', 'important');
                parentDiv.style.setProperty('width', '100%', 'important');
                parentDiv.style.setProperty('height', '100%', 'important');
                parentDiv.style.setProperty('box-sizing', 'border-box', 'important');
                parentDiv.style.setProperty('justify-content', 'center', 'important');
                parentDiv.style.setProperty('padding-top', '0', 'important');
                parentDiv.style.setProperty('padding-bottom', '0', 'important');
                parentDiv.style.setProperty('height', '100%', 'important');
              }

              // 生成正方形二维码（使用 canvas）- 确保 width 和 height 一致，避免信息丢失
              const qrSize = 80; // 80px，约等于23mm
              // 先设置 canvas 尺寸和样式，再生成二维码（避免清除已绘制的内容）
              canvasElement.width = qrSize;
              canvasElement.height = qrSize;
              canvasElement.style.setProperty('display', 'block', 'important');
              canvasElement.style.setProperty('margin', '0', 'important');
              canvasElement.style.setProperty('width', '23mm', 'important');
              canvasElement.style.setProperty('height', '23mm', 'important');
              canvasElement.style.setProperty('margin-left', 'auto', 'important');
              canvasElement.style.setProperty('margin-right', 'auto', 'important');
              canvasElement.style.setProperty('margin-top', '4mm', 'important');
              canvasElement.style.setProperty('margin-bottom', '0', 'important');
              canvasElement.style.setProperty('padding', '0', 'important');

              await QRCode.toCanvas(canvasElement, qrData, {
                width: qrSize,
                margin: 0,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF'
                }
              });

              // 设置二维码标题的样式
              const titleDiv = canvasElement.nextElementSibling as HTMLElement;
              if (titleDiv) {
                titleDiv.style.setProperty('margin-top', '1mm', 'important');
                titleDiv.style.setProperty('margin-bottom', '0', 'important');
                titleDiv.style.setProperty('font-size', '14px', 'important');
                titleDiv.style.setProperty('text-align', 'center', 'important');
              }
            }
          }
          printWindow?.print(); // 执行打印
        } catch (error) {
          // 二维码生成失败是技术错误，不是业务错误，不需要在控制台打印
          BtcMessage.error('打印失败：二维码生成失败');
          // 清理事件监听器和 iframe
          if (cleanup) {
            cleanup();
          }
        }
      }, 500); // 延迟 0.5 秒，确保二维码生成完成
    } catch (error) {
      // 响应拦截器已显示错误消息，不需要在控制台打印
      BtcMessage.error(t('inventory.ticket.print.load_failed'));
    }
  };

  return {
    printContentRef,
    printTime,
    loadTicketData,
    handlePrint,
  };
}

/**
 * 构建非生产域打印内容
 */
function buildPrintContent(list: any[]): string {
  return list
    .map((item: any, index: number) => {
      // 构建二维码数据（JSON 格式）
      const qrId = `qr-${item.partName || ''}-${item.position || ''}-${index}`;
      const displayText = `${item.position || ''}-${item.partName || ''}`;

      // 非生产域样式
      return `
        <div class="parent">
          <!-- 第一个子元素，包含二维码 -->
          <div class="barcode">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
              <canvas id="${qrId}"></canvas>
              <div style="margin-top: 5px; font-size: 10px; text-align: center;">${displayText}</div>
            </div>
          </div>

          <!-- 第一行标题 -->
          <div class="child">
            <div class="t-child">
              <div class="t-title">
                <div>抽${displayText}</div>
              </div>
              <div class="t-line">
                <div>数</div>
                <div>量：</div>
                <div>___________________</div>
              </div>
            </div>
          </div>

          <!-- 其他行 -->
          <div class="child">
            <div class="t-child">
              <div class="t-title">
                <div>复${displayText}</div>
              </div>
              <div class="t-line">
                <div>数</div>
                <div>量：</div>
                <div>___________________</div>
              </div>
            </div>
          </div>

          <div class="child">
            <div class="t-child">
              <div class="t-title">
                <div>初${displayText}</div>
              </div>
              <div class="t-line">
                <div>数</div>
                <div>量：</div>
                <div>___________________</div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * 构建非生产域打印 HTML
 */
function buildPrintHTML(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>打印条码</title>
      <style>
        @media print {
          @page {
            margin: 0mm;
            size: auto;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 0;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
        }

        .parent {
          width: 70mm;
          height: 140mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          page-break-after: always; /* 每个父容器后分页 */
          box-sizing: border-box;
        }

        .child {
          width: 70mm;
          height: 35mm;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom: 0;
          box-sizing: border-box;
        }
        .child:last-child {
          border-bottom: none;
        }

        .barcode {
          width: 70mm;
          height: 35mm;
          display: flex;
          padding-top: 0;
          padding-bottom: 0;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          overflow: visible;
          margin: 0 auto;
        }
        .barcode canvas {
          width: 23mm !important;
          height: 23mm !important;
          max-width: 23mm !important;
          max-height: 23mm !important;
          aspect-ratio: 1 / 1;
          object-fit: contain;
          display: block;
          margin: 0 auto;
          margin-top: 4mm;
          margin-bottom: 0;
        }
        .barcode > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .barcode > div > div {
          font-size: 14px;
          margin-top: 1mm;
          margin-bottom: 0;
          line-height: 1.2;
        }

        /* 控制标题行的样式 */
        .t-title {
          display: flex;
          align-items: flex-start;
          text-align: center;
          justify-content: center;
          margin-top: 0;
          margin-bottom: 0;
          font-weight: bold;
          font-size: 18px;
        }

        /* 控制内容部分的样式 */
        .t-child {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          width: 100%;
          margin-top: 0;
          margin-bottom: 0;
          padding: 0;
        }

        /* 每一行的样式，水平排列 */
        .t-line {
          display: flex;
          flex-direction: row;
          margin-top: 6mm;
          margin-bottom: 0;
          text-align: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }

        /* 所有文字元素加粗 */
        .t-line > div {
          font-weight: bold;
          font-size: 16px;
        }

        .t-title > div {
          font-weight: bold;
          font-size: 18px;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}
