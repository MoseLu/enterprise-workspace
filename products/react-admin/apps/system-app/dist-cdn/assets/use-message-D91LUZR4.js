import { B as BtcMessage } from "./vendor-CQyebC7G.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-Df5AdCU7.js";
function useMessage() {
  return {
    success: (message) => BtcMessage.success(message),
    error: (message) => BtcMessage.error(message),
    warning: (message) => BtcMessage.warning(message),
    info: (message) => BtcMessage.info(message)
  };
}
export {
  useMessage as u
};
