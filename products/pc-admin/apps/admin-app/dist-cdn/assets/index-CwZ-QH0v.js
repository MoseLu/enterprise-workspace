import { useI18n, useThemePlugin } from "@btc/shared-core";
import { BtcMessage, BtcTableButton, BtcFlex1, BtcCrud, BtcRow, BtcTable, BtcPagination, BtcViewGroup } from "@btc/shared-components";
import { r as ref, b as computed, a as defineComponent, e as createElementBlock, o as openBlock, x as createBlock, l as createVNode, h as createBaseVNode, m as unref, w as withCtx, t as toDisplayString, D as ElButton, R as ElInput, aL as withKeys, E as ElIcon, T as search_default, i as _export_sfc, G as watch, al as ElInputNumber, v as createTextVNode, at as ElDialog, k as onMounted, b0 as zhCn, b1 as English, aS as isRef, b2 as ElConfigProvider, I as nextTick } from "./index-CeQEKVXA.js";
import { service } from "@/services/eps";
import { formatDateTime } from "@btc/shared-utils";
import BtcSvg from "@btc-components/others/btc-svg/index.vue";
function useTicketService() {
  const { t } = useI18n();
  const loading = ref(false);
  const ticketList = ref([]);
  const selectedDomain = ref(null);
  const positionFilter = ref("");
  const materialCodeFilter = ref("");
  const pagination = ref({
    page: 1,
    size: 20,
    total: 0
  });
  const positionPlaceholder = computed(() => {
    const prefix = t("common.validation.required_prefix");
    const storageLocation = t("inventory.result.fields.storageLocation");
    return `${prefix}${storageLocation}`;
  });
  const materialCodePlaceholder = computed(() => {
    const materialCode = t("system.material.fields.materialCode");
    return t("inventory.ticket.print.material_code_placeholder", { materialCode });
  });
  const tableColumns = computed(() => [
    { type: "index", label: t("common.index"), width: 60 },
    { prop: "checkNo", label: t("system.inventory.base.fields.checkNo"), minWidth: 140, showOverflowTooltip: true },
    { prop: "partName", label: t("system.material.fields.materialCode"), minWidth: 140, showOverflowTooltip: true },
    { prop: "position", label: t("inventory.result.fields.storageLocation"), minWidth: 120, showOverflowTooltip: true }
  ]);
  const checkTicketService = service.admin?.base?.checkTicket;
  const ticketService = {
    // 包装 info 服务为 page 方法
    page: async (params) => {
      loading.value = true;
      try {
        const checkTicketInfoService = checkTicketService?.info;
        if (!checkTicketInfoService) {
          BtcMessage.warning(t("inventory.ticket.print.service_unavailable"));
          return { list: [], total: 0 };
        }
        const requestParams = {
          keyword: {}
        };
        if (selectedDomain.value?.domainId) {
          requestParams.keyword.domainId = selectedDomain.value.domainId;
        }
        requestParams.keyword.position = positionFilter.value?.trim() || "";
        const response = await checkTicketInfoService(requestParams);
        let list = [];
        if (response && typeof response === "object") {
          if ("data" in response && Array.isArray(response.data)) {
            list = response.data;
          } else if (Array.isArray(response)) {
            list = response;
          } else if (response.data && typeof response.data === "object" && "list" in response.data) {
            list = response.data.list || [];
          }
        }
        if (materialCodeFilter.value?.trim()) {
          const filterText = materialCodeFilter.value.trim().toLowerCase();
          list = list.filter((item) => {
            const partName = (item.partName || "").toLowerCase();
            return partName.includes(filterText);
          });
        }
        const page = params.page || pagination.value.page || 1;
        const size = params.size || pagination.value.size || 20;
        const total = list.length;
        const start = (page - 1) * size;
        const end = start + size;
        const paginatedList = list.slice(start, end);
        ticketList.value = paginatedList;
        pagination.value.total = total;
        return {
          list: paginatedList,
          total
          // 直接返回 total，而不是嵌套在 pagination 中
        };
      } catch (error) {
        console.error("[InventoryTicketPrint] Load data failed:", error);
        BtcMessage.error(t("inventory.ticket.print.load_failed"));
        return { list: [], total: 0 };
      } finally {
        loading.value = false;
      }
    },
    // 如果有其他方法，也可以展开
    ...checkTicketService || {}
  };
  const domainService = {
    list: async () => {
      try {
        const response = await service.logistics?.base?.position?.page?.({ page: 1, size: 1e3 });
        let data = response;
        if (response && typeof response === "object" && "data" in response) {
          data = response.data;
        }
        const positionList = data?.list || [];
        const domainMap = /* @__PURE__ */ new Map();
        positionList.forEach((item) => {
          const domainId = item.domainId;
          if (domainId && !domainMap.has(domainId)) {
            domainMap.set(domainId, {
              id: domainId,
              domainId,
              name: item.name || "",
              domainCode: domainId,
              value: domainId
            });
          }
        });
        return Array.from(domainMap.values());
      } catch (error) {
        console.error("[InventoryTicketPrint] Failed to load domains from position service:", error);
        return [];
      }
    }
  };
  return {
    loading,
    ticketList,
    selectedDomain,
    positionFilter,
    materialCodeFilter,
    pagination,
    positionPlaceholder,
    materialCodePlaceholder,
    tableColumns,
    ticketService,
    domainService
  };
}
var browser = {};
var canPromise$1 = function() {
  return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
};
var qrcode = {};
var utils$1 = {};
let toSJISFunction;
const CODEWORDS_COUNT = [
  0,
  // Not used
  26,
  44,
  70,
  100,
  134,
  172,
  196,
  242,
  292,
  346,
  404,
  466,
  532,
  581,
  655,
  733,
  815,
  901,
  991,
  1085,
  1156,
  1258,
  1364,
  1474,
  1588,
  1706,
  1828,
  1921,
  2051,
  2185,
  2323,
  2465,
  2611,
  2761,
  2876,
  3034,
  3196,
  3362,
  3532,
  3706
];
utils$1.getSymbolSize = function getSymbolSize(version2) {
  if (!version2) throw new Error('"version" cannot be null or undefined');
  if (version2 < 1 || version2 > 40) throw new Error('"version" should be in range from 1 to 40');
  return version2 * 4 + 17;
};
utils$1.getSymbolTotalCodewords = function getSymbolTotalCodewords(version2) {
  return CODEWORDS_COUNT[version2];
};
utils$1.getBCHDigit = function(data) {
  let digit = 0;
  while (data !== 0) {
    digit++;
    data >>>= 1;
  }
  return digit;
};
utils$1.setToSJISFunction = function setToSJISFunction(f) {
  if (typeof f !== "function") {
    throw new Error('"toSJISFunc" is not a valid function.');
  }
  toSJISFunction = f;
};
utils$1.isKanjiModeEnabled = function() {
  return typeof toSJISFunction !== "undefined";
};
utils$1.toSJIS = function toSJIS(kanji2) {
  return toSJISFunction(kanji2);
};
var errorCorrectionLevel = {};
(function(exports$1) {
  exports$1.L = { bit: 1 };
  exports$1.M = { bit: 0 };
  exports$1.Q = { bit: 3 };
  exports$1.H = { bit: 2 };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "l":
      case "low":
        return exports$1.L;
      case "m":
      case "medium":
        return exports$1.M;
      case "q":
      case "quartile":
        return exports$1.Q;
      case "h":
      case "high":
        return exports$1.H;
      default:
        throw new Error("Unknown EC Level: " + string);
    }
  }
  exports$1.isValid = function isValid2(level) {
    return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
  };
  exports$1.from = function from(value, defaultValue) {
    if (exports$1.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e) {
      return defaultValue;
    }
  };
})(errorCorrectionLevel);
function BitBuffer$1() {
  this.buffer = [];
  this.length = 0;
}
BitBuffer$1.prototype = {
  get: function(index2) {
    const bufIndex = Math.floor(index2 / 8);
    return (this.buffer[bufIndex] >>> 7 - index2 % 8 & 1) === 1;
  },
  put: function(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit((num >>> length - i - 1 & 1) === 1);
    }
  },
  getLengthInBits: function() {
    return this.length;
  },
  putBit: function(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 128 >>> this.length % 8;
    }
    this.length++;
  }
};
var bitBuffer = BitBuffer$1;
function BitMatrix$1(size) {
  if (!size || size < 1) {
    throw new Error("BitMatrix size must be defined and greater than 0");
  }
  this.size = size;
  this.data = new Uint8Array(size * size);
  this.reservedBit = new Uint8Array(size * size);
}
BitMatrix$1.prototype.set = function(row, col, value, reserved) {
  const index2 = row * this.size + col;
  this.data[index2] = value;
  if (reserved) this.reservedBit[index2] = true;
};
BitMatrix$1.prototype.get = function(row, col) {
  return this.data[row * this.size + col];
};
BitMatrix$1.prototype.xor = function(row, col, value) {
  this.data[row * this.size + col] ^= value;
};
BitMatrix$1.prototype.isReserved = function(row, col) {
  return this.reservedBit[row * this.size + col];
};
var bitMatrix = BitMatrix$1;
var alignmentPattern = {};
(function(exports$1) {
  const getSymbolSize3 = utils$1.getSymbolSize;
  exports$1.getRowColCoords = function getRowColCoords(version2) {
    if (version2 === 1) return [];
    const posCount = Math.floor(version2 / 7) + 2;
    const size = getSymbolSize3(version2);
    const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
    const positions = [size - 7];
    for (let i = 1; i < posCount - 1; i++) {
      positions[i] = positions[i - 1] - intervals;
    }
    positions.push(6);
    return positions.reverse();
  };
  exports$1.getPositions = function getPositions2(version2) {
    const coords = [];
    const pos = exports$1.getRowColCoords(version2);
    const posLength = pos.length;
    for (let i = 0; i < posLength; i++) {
      for (let j = 0; j < posLength; j++) {
        if (i === 0 && j === 0 || // top-left
        i === 0 && j === posLength - 1 || // bottom-left
        i === posLength - 1 && j === 0) {
          continue;
        }
        coords.push([pos[i], pos[j]]);
      }
    }
    return coords;
  };
})(alignmentPattern);
var finderPattern = {};
const getSymbolSize2 = utils$1.getSymbolSize;
const FINDER_PATTERN_SIZE = 7;
finderPattern.getPositions = function getPositions(version2) {
  const size = getSymbolSize2(version2);
  return [
    // top-left
    [0, 0],
    // top-right
    [size - FINDER_PATTERN_SIZE, 0],
    // bottom-left
    [0, size - FINDER_PATTERN_SIZE]
  ];
};
var maskPattern = {};
(function(exports$1) {
  exports$1.Patterns = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };
  const PenaltyScores = {
    N1: 3,
    N2: 3,
    N3: 40,
    N4: 10
  };
  exports$1.isValid = function isValid2(mask) {
    return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
  };
  exports$1.from = function from(value) {
    return exports$1.isValid(value) ? parseInt(value, 10) : void 0;
  };
  exports$1.getPenaltyN1 = function getPenaltyN1(data) {
    const size = data.size;
    let points = 0;
    let sameCountCol = 0;
    let sameCountRow = 0;
    let lastCol = null;
    let lastRow = null;
    for (let row = 0; row < size; row++) {
      sameCountCol = sameCountRow = 0;
      lastCol = lastRow = null;
      for (let col = 0; col < size; col++) {
        let module = data.get(row, col);
        if (module === lastCol) {
          sameCountCol++;
        } else {
          if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
          lastCol = module;
          sameCountCol = 1;
        }
        module = data.get(col, row);
        if (module === lastRow) {
          sameCountRow++;
        } else {
          if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
          lastRow = module;
          sameCountRow = 1;
        }
      }
      if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
      if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
    }
    return points;
  };
  exports$1.getPenaltyN2 = function getPenaltyN2(data) {
    const size = data.size;
    let points = 0;
    for (let row = 0; row < size - 1; row++) {
      for (let col = 0; col < size - 1; col++) {
        const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
        if (last === 4 || last === 0) points++;
      }
    }
    return points * PenaltyScores.N2;
  };
  exports$1.getPenaltyN3 = function getPenaltyN3(data) {
    const size = data.size;
    let points = 0;
    let bitsCol = 0;
    let bitsRow = 0;
    for (let row = 0; row < size; row++) {
      bitsCol = bitsRow = 0;
      for (let col = 0; col < size; col++) {
        bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
        if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
        bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
        if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
      }
    }
    return points * PenaltyScores.N3;
  };
  exports$1.getPenaltyN4 = function getPenaltyN4(data) {
    let darkCount = 0;
    const modulesCount = data.data.length;
    for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
    const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
    return k * PenaltyScores.N4;
  };
  function getMaskAt(maskPattern2, i, j) {
    switch (maskPattern2) {
      case exports$1.Patterns.PATTERN000:
        return (i + j) % 2 === 0;
      case exports$1.Patterns.PATTERN001:
        return i % 2 === 0;
      case exports$1.Patterns.PATTERN010:
        return j % 3 === 0;
      case exports$1.Patterns.PATTERN011:
        return (i + j) % 3 === 0;
      case exports$1.Patterns.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case exports$1.Patterns.PATTERN101:
        return i * j % 2 + i * j % 3 === 0;
      case exports$1.Patterns.PATTERN110:
        return (i * j % 2 + i * j % 3) % 2 === 0;
      case exports$1.Patterns.PATTERN111:
        return (i * j % 3 + (i + j) % 2) % 2 === 0;
      default:
        throw new Error("bad maskPattern:" + maskPattern2);
    }
  }
  exports$1.applyMask = function applyMask(pattern, data) {
    const size = data.size;
    for (let col = 0; col < size; col++) {
      for (let row = 0; row < size; row++) {
        if (data.isReserved(row, col)) continue;
        data.xor(row, col, getMaskAt(pattern, row, col));
      }
    }
  };
  exports$1.getBestMask = function getBestMask(data, setupFormatFunc) {
    const numPatterns = Object.keys(exports$1.Patterns).length;
    let bestPattern = 0;
    let lowerPenalty = Infinity;
    for (let p = 0; p < numPatterns; p++) {
      setupFormatFunc(p);
      exports$1.applyMask(p, data);
      const penalty = exports$1.getPenaltyN1(data) + exports$1.getPenaltyN2(data) + exports$1.getPenaltyN3(data) + exports$1.getPenaltyN4(data);
      exports$1.applyMask(p, data);
      if (penalty < lowerPenalty) {
        lowerPenalty = penalty;
        bestPattern = p;
      }
    }
    return bestPattern;
  };
})(maskPattern);
var errorCorrectionCode = {};
const ECLevel$1 = errorCorrectionLevel;
const EC_BLOCKS_TABLE = [
  // L  M  Q  H
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  1,
  2,
  2,
  4,
  1,
  2,
  4,
  4,
  2,
  4,
  4,
  4,
  2,
  4,
  6,
  5,
  2,
  4,
  6,
  6,
  2,
  5,
  8,
  8,
  4,
  5,
  8,
  8,
  4,
  5,
  8,
  11,
  4,
  8,
  10,
  11,
  4,
  9,
  12,
  16,
  4,
  9,
  16,
  16,
  6,
  10,
  12,
  18,
  6,
  10,
  17,
  16,
  6,
  11,
  16,
  19,
  6,
  13,
  18,
  21,
  7,
  14,
  21,
  25,
  8,
  16,
  20,
  25,
  8,
  17,
  23,
  25,
  9,
  17,
  23,
  34,
  9,
  18,
  25,
  30,
  10,
  20,
  27,
  32,
  12,
  21,
  29,
  35,
  12,
  23,
  34,
  37,
  12,
  25,
  34,
  40,
  13,
  26,
  35,
  42,
  14,
  28,
  38,
  45,
  15,
  29,
  40,
  48,
  16,
  31,
  43,
  51,
  17,
  33,
  45,
  54,
  18,
  35,
  48,
  57,
  19,
  37,
  51,
  60,
  19,
  38,
  53,
  63,
  20,
  40,
  56,
  66,
  21,
  43,
  59,
  70,
  22,
  45,
  62,
  74,
  24,
  47,
  65,
  77,
  25,
  49,
  68,
  81
];
const EC_CODEWORDS_TABLE = [
  // L  M  Q  H
  7,
  10,
  13,
  17,
  10,
  16,
  22,
  28,
  15,
  26,
  36,
  44,
  20,
  36,
  52,
  64,
  26,
  48,
  72,
  88,
  36,
  64,
  96,
  112,
  40,
  72,
  108,
  130,
  48,
  88,
  132,
  156,
  60,
  110,
  160,
  192,
  72,
  130,
  192,
  224,
  80,
  150,
  224,
  264,
  96,
  176,
  260,
  308,
  104,
  198,
  288,
  352,
  120,
  216,
  320,
  384,
  132,
  240,
  360,
  432,
  144,
  280,
  408,
  480,
  168,
  308,
  448,
  532,
  180,
  338,
  504,
  588,
  196,
  364,
  546,
  650,
  224,
  416,
  600,
  700,
  224,
  442,
  644,
  750,
  252,
  476,
  690,
  816,
  270,
  504,
  750,
  900,
  300,
  560,
  810,
  960,
  312,
  588,
  870,
  1050,
  336,
  644,
  952,
  1110,
  360,
  700,
  1020,
  1200,
  390,
  728,
  1050,
  1260,
  420,
  784,
  1140,
  1350,
  450,
  812,
  1200,
  1440,
  480,
  868,
  1290,
  1530,
  510,
  924,
  1350,
  1620,
  540,
  980,
  1440,
  1710,
  570,
  1036,
  1530,
  1800,
  570,
  1064,
  1590,
  1890,
  600,
  1120,
  1680,
  1980,
  630,
  1204,
  1770,
  2100,
  660,
  1260,
  1860,
  2220,
  720,
  1316,
  1950,
  2310,
  750,
  1372,
  2040,
  2430
];
errorCorrectionCode.getBlocksCount = function getBlocksCount(version2, errorCorrectionLevel2) {
  switch (errorCorrectionLevel2) {
    case ECLevel$1.L:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 0];
    case ECLevel$1.M:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 1];
    case ECLevel$1.Q:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 2];
    case ECLevel$1.H:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 3];
    default:
      return void 0;
  }
};
errorCorrectionCode.getTotalCodewordsCount = function getTotalCodewordsCount(version2, errorCorrectionLevel2) {
  switch (errorCorrectionLevel2) {
    case ECLevel$1.L:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 0];
    case ECLevel$1.M:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 1];
    case ECLevel$1.Q:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 2];
    case ECLevel$1.H:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 3];
    default:
      return void 0;
  }
};
var polynomial = {};
var galoisField = {};
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);
(function initTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 285;
    }
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();
galoisField.log = function log(n) {
  if (n < 1) throw new Error("log(" + n + ")");
  return LOG_TABLE[n];
};
galoisField.exp = function exp(n) {
  return EXP_TABLE[n];
};
galoisField.mul = function mul(x, y) {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
};
(function(exports$1) {
  const GF = galoisField;
  exports$1.mul = function mul2(p1, p2) {
    const coeff = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        coeff[i + j] ^= GF.mul(p1[i], p2[j]);
      }
    }
    return coeff;
  };
  exports$1.mod = function mod(divident, divisor) {
    let result = new Uint8Array(divident);
    while (result.length - divisor.length >= 0) {
      const coeff = result[0];
      for (let i = 0; i < divisor.length; i++) {
        result[i] ^= GF.mul(divisor[i], coeff);
      }
      let offset = 0;
      while (offset < result.length && result[offset] === 0) offset++;
      result = result.slice(offset);
    }
    return result;
  };
  exports$1.generateECPolynomial = function generateECPolynomial(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      poly = exports$1.mul(poly, new Uint8Array([1, GF.exp(i)]));
    }
    return poly;
  };
})(polynomial);
const Polynomial = polynomial;
function ReedSolomonEncoder$1(degree) {
  this.genPoly = void 0;
  this.degree = degree;
  if (this.degree) this.initialize(this.degree);
}
ReedSolomonEncoder$1.prototype.initialize = function initialize(degree) {
  this.degree = degree;
  this.genPoly = Polynomial.generateECPolynomial(this.degree);
};
ReedSolomonEncoder$1.prototype.encode = function encode(data) {
  if (!this.genPoly) {
    throw new Error("Encoder not initialized");
  }
  const paddedData = new Uint8Array(data.length + this.degree);
  paddedData.set(data);
  const remainder = Polynomial.mod(paddedData, this.genPoly);
  const start = this.degree - remainder.length;
  if (start > 0) {
    const buff = new Uint8Array(this.degree);
    buff.set(remainder, start);
    return buff;
  }
  return remainder;
};
var reedSolomonEncoder = ReedSolomonEncoder$1;
var version = {};
var mode = {};
var versionCheck = {};
versionCheck.isValid = function isValid(version2) {
  return !isNaN(version2) && version2 >= 1 && version2 <= 40;
};
var regex = {};
const numeric = "[0-9]+";
const alphanumeric = "[A-Z $%*+\\-./:]+";
let kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
kanji = kanji.replace(/u/g, "\\u");
const byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
regex.KANJI = new RegExp(kanji, "g");
regex.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
regex.BYTE = new RegExp(byte, "g");
regex.NUMERIC = new RegExp(numeric, "g");
regex.ALPHANUMERIC = new RegExp(alphanumeric, "g");
const TEST_KANJI = new RegExp("^" + kanji + "$");
const TEST_NUMERIC = new RegExp("^" + numeric + "$");
const TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
regex.testKanji = function testKanji(str) {
  return TEST_KANJI.test(str);
};
regex.testNumeric = function testNumeric(str) {
  return TEST_NUMERIC.test(str);
};
regex.testAlphanumeric = function testAlphanumeric(str) {
  return TEST_ALPHANUMERIC.test(str);
};
(function(exports$1) {
  const VersionCheck = versionCheck;
  const Regex = regex;
  exports$1.NUMERIC = {
    id: "Numeric",
    bit: 1 << 0,
    ccBits: [10, 12, 14]
  };
  exports$1.ALPHANUMERIC = {
    id: "Alphanumeric",
    bit: 1 << 1,
    ccBits: [9, 11, 13]
  };
  exports$1.BYTE = {
    id: "Byte",
    bit: 1 << 2,
    ccBits: [8, 16, 16]
  };
  exports$1.KANJI = {
    id: "Kanji",
    bit: 1 << 3,
    ccBits: [8, 10, 12]
  };
  exports$1.MIXED = {
    bit: -1
  };
  exports$1.getCharCountIndicator = function getCharCountIndicator(mode2, version2) {
    if (!mode2.ccBits) throw new Error("Invalid mode: " + mode2);
    if (!VersionCheck.isValid(version2)) {
      throw new Error("Invalid version: " + version2);
    }
    if (version2 >= 1 && version2 < 10) return mode2.ccBits[0];
    else if (version2 < 27) return mode2.ccBits[1];
    return mode2.ccBits[2];
  };
  exports$1.getBestModeForData = function getBestModeForData(dataStr) {
    if (Regex.testNumeric(dataStr)) return exports$1.NUMERIC;
    else if (Regex.testAlphanumeric(dataStr)) return exports$1.ALPHANUMERIC;
    else if (Regex.testKanji(dataStr)) return exports$1.KANJI;
    else return exports$1.BYTE;
  };
  exports$1.toString = function toString(mode2) {
    if (mode2 && mode2.id) return mode2.id;
    throw new Error("Invalid mode");
  };
  exports$1.isValid = function isValid2(mode2) {
    return mode2 && mode2.bit && mode2.ccBits;
  };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "numeric":
        return exports$1.NUMERIC;
      case "alphanumeric":
        return exports$1.ALPHANUMERIC;
      case "kanji":
        return exports$1.KANJI;
      case "byte":
        return exports$1.BYTE;
      default:
        throw new Error("Unknown mode: " + string);
    }
  }
  exports$1.from = function from(value, defaultValue) {
    if (exports$1.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e) {
      return defaultValue;
    }
  };
})(mode);
(function(exports$1) {
  const Utils2 = utils$1;
  const ECCode2 = errorCorrectionCode;
  const ECLevel2 = errorCorrectionLevel;
  const Mode2 = mode;
  const VersionCheck = versionCheck;
  const G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
  const G18_BCH = Utils2.getBCHDigit(G18);
  function getBestVersionForDataLength(mode2, length, errorCorrectionLevel2) {
    for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
      if (length <= exports$1.getCapacity(currentVersion, errorCorrectionLevel2, mode2)) {
        return currentVersion;
      }
    }
    return void 0;
  }
  function getReservedBitsCount(mode2, version2) {
    return Mode2.getCharCountIndicator(mode2, version2) + 4;
  }
  function getTotalBitsFromDataArray(segments2, version2) {
    let totalBits = 0;
    segments2.forEach(function(data) {
      const reservedBits = getReservedBitsCount(data.mode, version2);
      totalBits += reservedBits + data.getBitsLength();
    });
    return totalBits;
  }
  function getBestVersionForMixedData(segments2, errorCorrectionLevel2) {
    for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
      const length = getTotalBitsFromDataArray(segments2, currentVersion);
      if (length <= exports$1.getCapacity(currentVersion, errorCorrectionLevel2, Mode2.MIXED)) {
        return currentVersion;
      }
    }
    return void 0;
  }
  exports$1.from = function from(value, defaultValue) {
    if (VersionCheck.isValid(value)) {
      return parseInt(value, 10);
    }
    return defaultValue;
  };
  exports$1.getCapacity = function getCapacity(version2, errorCorrectionLevel2, mode2) {
    if (!VersionCheck.isValid(version2)) {
      throw new Error("Invalid QR Code version");
    }
    if (typeof mode2 === "undefined") mode2 = Mode2.BYTE;
    const totalCodewords = Utils2.getSymbolTotalCodewords(version2);
    const ecTotalCodewords = ECCode2.getTotalCodewordsCount(version2, errorCorrectionLevel2);
    const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
    if (mode2 === Mode2.MIXED) return dataTotalCodewordsBits;
    const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode2, version2);
    switch (mode2) {
      case Mode2.NUMERIC:
        return Math.floor(usableBits / 10 * 3);
      case Mode2.ALPHANUMERIC:
        return Math.floor(usableBits / 11 * 2);
      case Mode2.KANJI:
        return Math.floor(usableBits / 13);
      case Mode2.BYTE:
      default:
        return Math.floor(usableBits / 8);
    }
  };
  exports$1.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel2) {
    let seg;
    const ecl = ECLevel2.from(errorCorrectionLevel2, ECLevel2.M);
    if (Array.isArray(data)) {
      if (data.length > 1) {
        return getBestVersionForMixedData(data, ecl);
      }
      if (data.length === 0) {
        return 1;
      }
      seg = data[0];
    } else {
      seg = data;
    }
    return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
  };
  exports$1.getEncodedBits = function getEncodedBits2(version2) {
    if (!VersionCheck.isValid(version2) || version2 < 7) {
      throw new Error("Invalid QR Code version");
    }
    let d = version2 << 12;
    while (Utils2.getBCHDigit(d) - G18_BCH >= 0) {
      d ^= G18 << Utils2.getBCHDigit(d) - G18_BCH;
    }
    return version2 << 12 | d;
  };
})(version);
var formatInfo = {};
const Utils$3 = utils$1;
const G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
const G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
const G15_BCH = Utils$3.getBCHDigit(G15);
formatInfo.getEncodedBits = function getEncodedBits(errorCorrectionLevel2, mask) {
  const data = errorCorrectionLevel2.bit << 3 | mask;
  let d = data << 10;
  while (Utils$3.getBCHDigit(d) - G15_BCH >= 0) {
    d ^= G15 << Utils$3.getBCHDigit(d) - G15_BCH;
  }
  return (data << 10 | d) ^ G15_MASK;
};
var segments = {};
const Mode$4 = mode;
function NumericData(data) {
  this.mode = Mode$4.NUMERIC;
  this.data = data.toString();
}
NumericData.getBitsLength = function getBitsLength(length) {
  return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
};
NumericData.prototype.getLength = function getLength() {
  return this.data.length;
};
NumericData.prototype.getBitsLength = function getBitsLength2() {
  return NumericData.getBitsLength(this.data.length);
};
NumericData.prototype.write = function write(bitBuffer2) {
  let i, group, value;
  for (i = 0; i + 3 <= this.data.length; i += 3) {
    group = this.data.substr(i, 3);
    value = parseInt(group, 10);
    bitBuffer2.put(value, 10);
  }
  const remainingNum = this.data.length - i;
  if (remainingNum > 0) {
    group = this.data.substr(i);
    value = parseInt(group, 10);
    bitBuffer2.put(value, remainingNum * 3 + 1);
  }
};
var numericData = NumericData;
const Mode$3 = mode;
const ALPHA_NUM_CHARS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  " ",
  "$",
  "%",
  "*",
  "+",
  "-",
  ".",
  "/",
  ":"
];
function AlphanumericData(data) {
  this.mode = Mode$3.ALPHANUMERIC;
  this.data = data;
}
AlphanumericData.getBitsLength = function getBitsLength3(length) {
  return 11 * Math.floor(length / 2) + 6 * (length % 2);
};
AlphanumericData.prototype.getLength = function getLength2() {
  return this.data.length;
};
AlphanumericData.prototype.getBitsLength = function getBitsLength4() {
  return AlphanumericData.getBitsLength(this.data.length);
};
AlphanumericData.prototype.write = function write2(bitBuffer2) {
  let i;
  for (i = 0; i + 2 <= this.data.length; i += 2) {
    let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
    value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
    bitBuffer2.put(value, 11);
  }
  if (this.data.length % 2) {
    bitBuffer2.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
  }
};
var alphanumericData = AlphanumericData;
const Mode$2 = mode;
function ByteData(data) {
  this.mode = Mode$2.BYTE;
  if (typeof data === "string") {
    this.data = new TextEncoder().encode(data);
  } else {
    this.data = new Uint8Array(data);
  }
}
ByteData.getBitsLength = function getBitsLength5(length) {
  return length * 8;
};
ByteData.prototype.getLength = function getLength3() {
  return this.data.length;
};
ByteData.prototype.getBitsLength = function getBitsLength6() {
  return ByteData.getBitsLength(this.data.length);
};
ByteData.prototype.write = function(bitBuffer2) {
  for (let i = 0, l = this.data.length; i < l; i++) {
    bitBuffer2.put(this.data[i], 8);
  }
};
var byteData = ByteData;
const Mode$1 = mode;
const Utils$2 = utils$1;
function KanjiData(data) {
  this.mode = Mode$1.KANJI;
  this.data = data;
}
KanjiData.getBitsLength = function getBitsLength7(length) {
  return length * 13;
};
KanjiData.prototype.getLength = function getLength4() {
  return this.data.length;
};
KanjiData.prototype.getBitsLength = function getBitsLength8() {
  return KanjiData.getBitsLength(this.data.length);
};
KanjiData.prototype.write = function(bitBuffer2) {
  let i;
  for (i = 0; i < this.data.length; i++) {
    let value = Utils$2.toSJIS(this.data[i]);
    if (value >= 33088 && value <= 40956) {
      value -= 33088;
    } else if (value >= 57408 && value <= 60351) {
      value -= 49472;
    } else {
      throw new Error(
        "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
      );
    }
    value = (value >>> 8 & 255) * 192 + (value & 255);
    bitBuffer2.put(value, 13);
  }
};
var kanjiData = KanjiData;
var dijkstra = { exports: {} };
(function(module) {
  var dijkstra2 = {
    single_source_shortest_paths: function(graph, s, d) {
      var predecessors = {};
      var costs = {};
      costs[s] = 0;
      var open = dijkstra2.PriorityQueue.make();
      open.push(s, 0);
      var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
      while (!open.empty()) {
        closest = open.pop();
        u = closest.value;
        cost_of_s_to_u = closest.cost;
        adjacent_nodes = graph[u] || {};
        for (v in adjacent_nodes) {
          if (adjacent_nodes.hasOwnProperty(v)) {
            cost_of_e = adjacent_nodes[v];
            cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
            cost_of_s_to_v = costs[v];
            first_visit = typeof costs[v] === "undefined";
            if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
              costs[v] = cost_of_s_to_u_plus_cost_of_e;
              open.push(v, cost_of_s_to_u_plus_cost_of_e);
              predecessors[v] = u;
            }
          }
        }
      }
      if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
        var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
        throw new Error(msg);
      }
      return predecessors;
    },
    extract_shortest_path_from_predecessor_list: function(predecessors, d) {
      var nodes = [];
      var u = d;
      while (u) {
        nodes.push(u);
        predecessors[u];
        u = predecessors[u];
      }
      nodes.reverse();
      return nodes;
    },
    find_path: function(graph, s, d) {
      var predecessors = dijkstra2.single_source_shortest_paths(graph, s, d);
      return dijkstra2.extract_shortest_path_from_predecessor_list(
        predecessors,
        d
      );
    },
    /**
     * A very naive priority queue implementation.
     */
    PriorityQueue: {
      make: function(opts) {
        var T = dijkstra2.PriorityQueue, t = {}, key;
        opts = opts || {};
        for (key in T) {
          if (T.hasOwnProperty(key)) {
            t[key] = T[key];
          }
        }
        t.queue = [];
        t.sorter = opts.sorter || T.default_sorter;
        return t;
      },
      default_sorter: function(a, b) {
        return a.cost - b.cost;
      },
      /**
       * Add a new item to the queue and ensure the highest priority element
       * is at the front of the queue.
       */
      push: function(value, cost) {
        var item = { value, cost };
        this.queue.push(item);
        this.queue.sort(this.sorter);
      },
      /**
       * Return the highest priority element in the queue.
       */
      pop: function() {
        return this.queue.shift();
      },
      empty: function() {
        return this.queue.length === 0;
      }
    }
  };
  {
    module.exports = dijkstra2;
  }
})(dijkstra);
var dijkstraExports = dijkstra.exports;
(function(exports$1) {
  const Mode2 = mode;
  const NumericData2 = numericData;
  const AlphanumericData2 = alphanumericData;
  const ByteData2 = byteData;
  const KanjiData2 = kanjiData;
  const Regex = regex;
  const Utils2 = utils$1;
  const dijkstra2 = dijkstraExports;
  function getStringByteLength(str) {
    return unescape(encodeURIComponent(str)).length;
  }
  function getSegments(regex2, mode2, str) {
    const segments2 = [];
    let result;
    while ((result = regex2.exec(str)) !== null) {
      segments2.push({
        data: result[0],
        index: result.index,
        mode: mode2,
        length: result[0].length
      });
    }
    return segments2;
  }
  function getSegmentsFromString(dataStr) {
    const numSegs = getSegments(Regex.NUMERIC, Mode2.NUMERIC, dataStr);
    const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode2.ALPHANUMERIC, dataStr);
    let byteSegs;
    let kanjiSegs;
    if (Utils2.isKanjiModeEnabled()) {
      byteSegs = getSegments(Regex.BYTE, Mode2.BYTE, dataStr);
      kanjiSegs = getSegments(Regex.KANJI, Mode2.KANJI, dataStr);
    } else {
      byteSegs = getSegments(Regex.BYTE_KANJI, Mode2.BYTE, dataStr);
      kanjiSegs = [];
    }
    const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
    return segs.sort(function(s1, s2) {
      return s1.index - s2.index;
    }).map(function(obj) {
      return {
        data: obj.data,
        mode: obj.mode,
        length: obj.length
      };
    });
  }
  function getSegmentBitsLength(length, mode2) {
    switch (mode2) {
      case Mode2.NUMERIC:
        return NumericData2.getBitsLength(length);
      case Mode2.ALPHANUMERIC:
        return AlphanumericData2.getBitsLength(length);
      case Mode2.KANJI:
        return KanjiData2.getBitsLength(length);
      case Mode2.BYTE:
        return ByteData2.getBitsLength(length);
    }
  }
  function mergeSegments(segs) {
    return segs.reduce(function(acc, curr) {
      const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
      if (prevSeg && prevSeg.mode === curr.mode) {
        acc[acc.length - 1].data += curr.data;
        return acc;
      }
      acc.push(curr);
      return acc;
    }, []);
  }
  function buildNodes(segs) {
    const nodes = [];
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      switch (seg.mode) {
        case Mode2.NUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.ALPHANUMERIC, length: seg.length },
            { data: seg.data, mode: Mode2.BYTE, length: seg.length }
          ]);
          break;
        case Mode2.ALPHANUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.BYTE, length: seg.length }
          ]);
          break;
        case Mode2.KANJI:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.BYTE, length: getStringByteLength(seg.data) }
          ]);
          break;
        case Mode2.BYTE:
          nodes.push([
            { data: seg.data, mode: Mode2.BYTE, length: getStringByteLength(seg.data) }
          ]);
      }
    }
    return nodes;
  }
  function buildGraph(nodes, version2) {
    const table = {};
    const graph = { start: {} };
    let prevNodeIds = ["start"];
    for (let i = 0; i < nodes.length; i++) {
      const nodeGroup = nodes[i];
      const currentNodeIds = [];
      for (let j = 0; j < nodeGroup.length; j++) {
        const node = nodeGroup[j];
        const key = "" + i + j;
        currentNodeIds.push(key);
        table[key] = { node, lastCount: 0 };
        graph[key] = {};
        for (let n = 0; n < prevNodeIds.length; n++) {
          const prevNodeId = prevNodeIds[n];
          if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
            graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
            table[prevNodeId].lastCount += node.length;
          } else {
            if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
            graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode2.getCharCountIndicator(node.mode, version2);
          }
        }
      }
      prevNodeIds = currentNodeIds;
    }
    for (let n = 0; n < prevNodeIds.length; n++) {
      graph[prevNodeIds[n]].end = 0;
    }
    return { map: graph, table };
  }
  function buildSingleSegment(data, modesHint) {
    let mode2;
    const bestMode = Mode2.getBestModeForData(data);
    mode2 = Mode2.from(modesHint, bestMode);
    if (mode2 !== Mode2.BYTE && mode2.bit < bestMode.bit) {
      throw new Error('"' + data + '" cannot be encoded with mode ' + Mode2.toString(mode2) + ".\n Suggested mode is: " + Mode2.toString(bestMode));
    }
    if (mode2 === Mode2.KANJI && !Utils2.isKanjiModeEnabled()) {
      mode2 = Mode2.BYTE;
    }
    switch (mode2) {
      case Mode2.NUMERIC:
        return new NumericData2(data);
      case Mode2.ALPHANUMERIC:
        return new AlphanumericData2(data);
      case Mode2.KANJI:
        return new KanjiData2(data);
      case Mode2.BYTE:
        return new ByteData2(data);
    }
  }
  exports$1.fromArray = function fromArray(array) {
    return array.reduce(function(acc, seg) {
      if (typeof seg === "string") {
        acc.push(buildSingleSegment(seg, null));
      } else if (seg.data) {
        acc.push(buildSingleSegment(seg.data, seg.mode));
      }
      return acc;
    }, []);
  };
  exports$1.fromString = function fromString(data, version2) {
    const segs = getSegmentsFromString(data, Utils2.isKanjiModeEnabled());
    const nodes = buildNodes(segs);
    const graph = buildGraph(nodes, version2);
    const path = dijkstra2.find_path(graph.map, "start", "end");
    const optimizedSegs = [];
    for (let i = 1; i < path.length - 1; i++) {
      optimizedSegs.push(graph.table[path[i]].node);
    }
    return exports$1.fromArray(mergeSegments(optimizedSegs));
  };
  exports$1.rawSplit = function rawSplit(data) {
    return exports$1.fromArray(
      getSegmentsFromString(data, Utils2.isKanjiModeEnabled())
    );
  };
})(segments);
const Utils$1 = utils$1;
const ECLevel = errorCorrectionLevel;
const BitBuffer = bitBuffer;
const BitMatrix = bitMatrix;
const AlignmentPattern = alignmentPattern;
const FinderPattern = finderPattern;
const MaskPattern = maskPattern;
const ECCode = errorCorrectionCode;
const ReedSolomonEncoder = reedSolomonEncoder;
const Version = version;
const FormatInfo = formatInfo;
const Mode = mode;
const Segments = segments;
function setupFinderPattern(matrix, version2) {
  const size = matrix.size;
  const pos = FinderPattern.getPositions(version2);
  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || size <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || size <= col + c) continue;
        if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}
function setupTimingPattern(matrix) {
  const size = matrix.size;
  for (let r = 8; r < size - 8; r++) {
    const value = r % 2 === 0;
    matrix.set(r, 6, value, true);
    matrix.set(6, r, value, true);
  }
}
function setupAlignmentPattern(matrix, version2) {
  const pos = AlignmentPattern.getPositions(version2);
  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}
function setupVersionInfo(matrix, version2) {
  const size = matrix.size;
  const bits = Version.getEncodedBits(version2);
  let row, col, mod;
  for (let i = 0; i < 18; i++) {
    row = Math.floor(i / 3);
    col = i % 3 + size - 8 - 3;
    mod = (bits >> i & 1) === 1;
    matrix.set(row, col, mod, true);
    matrix.set(col, row, mod, true);
  }
}
function setupFormatInfo(matrix, errorCorrectionLevel2, maskPattern2) {
  const size = matrix.size;
  const bits = FormatInfo.getEncodedBits(errorCorrectionLevel2, maskPattern2);
  let i, mod;
  for (i = 0; i < 15; i++) {
    mod = (bits >> i & 1) === 1;
    if (i < 6) {
      matrix.set(i, 8, mod, true);
    } else if (i < 8) {
      matrix.set(i + 1, 8, mod, true);
    } else {
      matrix.set(size - 15 + i, 8, mod, true);
    }
    if (i < 8) {
      matrix.set(8, size - i - 1, mod, true);
    } else if (i < 9) {
      matrix.set(8, 15 - i - 1 + 1, mod, true);
    } else {
      matrix.set(8, 15 - i - 1, mod, true);
    }
  }
  matrix.set(size - 8, 8, 1, true);
}
function setupData(matrix, data) {
  const size = matrix.size;
  let inc = -1;
  let row = size - 1;
  let bitIndex = 7;
  let byteIndex = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (!matrix.isReserved(row, col - c)) {
          let dark = false;
          if (byteIndex < data.length) {
            dark = (data[byteIndex] >>> bitIndex & 1) === 1;
          }
          matrix.set(row, col - c, dark);
          bitIndex--;
          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }
      row += inc;
      if (row < 0 || size <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
}
function createData(version2, errorCorrectionLevel2, segments2) {
  const buffer = new BitBuffer();
  segments2.forEach(function(data) {
    buffer.put(data.mode.bit, 4);
    buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version2));
    data.write(buffer);
  });
  const totalCodewords = Utils$1.getSymbolTotalCodewords(version2);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
  if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
    buffer.put(0, 4);
  }
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(0);
  }
  const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
  for (let i = 0; i < remainingByte; i++) {
    buffer.put(i % 2 ? 17 : 236, 8);
  }
  return createCodewords(buffer, version2, errorCorrectionLevel2);
}
function createCodewords(bitBuffer2, version2, errorCorrectionLevel2) {
  const totalCodewords = Utils$1.getSymbolTotalCodewords(version2);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
  const dataTotalCodewords = totalCodewords - ecTotalCodewords;
  const ecTotalBlocks = ECCode.getBlocksCount(version2, errorCorrectionLevel2);
  const blocksInGroup2 = totalCodewords % ecTotalBlocks;
  const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
  const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
  const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
  const rs = new ReedSolomonEncoder(ecCount);
  let offset = 0;
  const dcData = new Array(ecTotalBlocks);
  const ecData = new Array(ecTotalBlocks);
  let maxDataSize = 0;
  const buffer = new Uint8Array(bitBuffer2.buffer);
  for (let b = 0; b < ecTotalBlocks; b++) {
    const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
    dcData[b] = buffer.slice(offset, offset + dataSize);
    ecData[b] = rs.encode(dcData[b]);
    offset += dataSize;
    maxDataSize = Math.max(maxDataSize, dataSize);
  }
  const data = new Uint8Array(totalCodewords);
  let index2 = 0;
  let i, r;
  for (i = 0; i < maxDataSize; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      if (i < dcData[r].length) {
        data[index2++] = dcData[r][i];
      }
    }
  }
  for (i = 0; i < ecCount; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      data[index2++] = ecData[r][i];
    }
  }
  return data;
}
function createSymbol(data, version2, errorCorrectionLevel2, maskPattern2) {
  let segments2;
  if (Array.isArray(data)) {
    segments2 = Segments.fromArray(data);
  } else if (typeof data === "string") {
    let estimatedVersion = version2;
    if (!estimatedVersion) {
      const rawSegments = Segments.rawSplit(data);
      estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel2);
    }
    segments2 = Segments.fromString(data, estimatedVersion || 40);
  } else {
    throw new Error("Invalid data");
  }
  const bestVersion = Version.getBestVersionForData(segments2, errorCorrectionLevel2);
  if (!bestVersion) {
    throw new Error("The amount of data is too big to be stored in a QR Code");
  }
  if (!version2) {
    version2 = bestVersion;
  } else if (version2 < bestVersion) {
    throw new Error(
      "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
    );
  }
  const dataBits = createData(version2, errorCorrectionLevel2, segments2);
  const moduleCount = Utils$1.getSymbolSize(version2);
  const modules = new BitMatrix(moduleCount);
  setupFinderPattern(modules, version2);
  setupTimingPattern(modules);
  setupAlignmentPattern(modules, version2);
  setupFormatInfo(modules, errorCorrectionLevel2, 0);
  if (version2 >= 7) {
    setupVersionInfo(modules, version2);
  }
  setupData(modules, dataBits);
  if (isNaN(maskPattern2)) {
    maskPattern2 = MaskPattern.getBestMask(
      modules,
      setupFormatInfo.bind(null, modules, errorCorrectionLevel2)
    );
  }
  MaskPattern.applyMask(maskPattern2, modules);
  setupFormatInfo(modules, errorCorrectionLevel2, maskPattern2);
  return {
    modules,
    version: version2,
    errorCorrectionLevel: errorCorrectionLevel2,
    maskPattern: maskPattern2,
    segments: segments2
  };
}
qrcode.create = function create(data, options) {
  if (typeof data === "undefined" || data === "") {
    throw new Error("No input text");
  }
  let errorCorrectionLevel2 = ECLevel.M;
  let version2;
  let mask;
  if (typeof options !== "undefined") {
    errorCorrectionLevel2 = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
    version2 = Version.from(options.version);
    mask = MaskPattern.from(options.maskPattern);
    if (options.toSJISFunc) {
      Utils$1.setToSJISFunction(options.toSJISFunc);
    }
  }
  return createSymbol(data, version2, errorCorrectionLevel2, mask);
};
var canvas = {};
var utils = {};
(function(exports$1) {
  function hex2rgba(hex) {
    if (typeof hex === "number") {
      hex = hex.toString();
    }
    if (typeof hex !== "string") {
      throw new Error("Color should be defined as hex string");
    }
    let hexCode = hex.slice().replace("#", "").split("");
    if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
      throw new Error("Invalid hex color: " + hex);
    }
    if (hexCode.length === 3 || hexCode.length === 4) {
      hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
        return [c, c];
      }));
    }
    if (hexCode.length === 6) hexCode.push("F", "F");
    const hexValue = parseInt(hexCode.join(""), 16);
    return {
      r: hexValue >> 24 & 255,
      g: hexValue >> 16 & 255,
      b: hexValue >> 8 & 255,
      a: hexValue & 255,
      hex: "#" + hexCode.slice(0, 6).join("")
    };
  }
  exports$1.getOptions = function getOptions(options) {
    if (!options) options = {};
    if (!options.color) options.color = {};
    const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
    const width = options.width && options.width >= 21 ? options.width : void 0;
    const scale = options.scale || 4;
    return {
      width,
      scale: width ? 4 : scale,
      margin,
      color: {
        dark: hex2rgba(options.color.dark || "#000000ff"),
        light: hex2rgba(options.color.light || "#ffffffff")
      },
      type: options.type,
      rendererOpts: options.rendererOpts || {}
    };
  };
  exports$1.getScale = function getScale(qrSize, opts) {
    return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
  };
  exports$1.getImageWidth = function getImageWidth(qrSize, opts) {
    const scale = exports$1.getScale(qrSize, opts);
    return Math.floor((qrSize + opts.margin * 2) * scale);
  };
  exports$1.qrToImageData = function qrToImageData(imgData, qr, opts) {
    const size = qr.modules.size;
    const data = qr.modules.data;
    const scale = exports$1.getScale(size, opts);
    const symbolSize = Math.floor((size + opts.margin * 2) * scale);
    const scaledMargin = opts.margin * scale;
    const palette = [opts.color.light, opts.color.dark];
    for (let i = 0; i < symbolSize; i++) {
      for (let j = 0; j < symbolSize; j++) {
        let posDst = (i * symbolSize + j) * 4;
        let pxColor = opts.color.light;
        if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
          const iSrc = Math.floor((i - scaledMargin) / scale);
          const jSrc = Math.floor((j - scaledMargin) / scale);
          pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
        }
        imgData[posDst++] = pxColor.r;
        imgData[posDst++] = pxColor.g;
        imgData[posDst++] = pxColor.b;
        imgData[posDst] = pxColor.a;
      }
    }
  };
})(utils);
(function(exports$1) {
  const Utils2 = utils;
  function clearCanvas(ctx, canvas2, size) {
    ctx.clearRect(0, 0, canvas2.width, canvas2.height);
    if (!canvas2.style) canvas2.style = {};
    canvas2.height = size;
    canvas2.width = size;
    canvas2.style.height = size + "px";
    canvas2.style.width = size + "px";
  }
  function getCanvasElement() {
    try {
      return document.createElement("canvas");
    } catch (e) {
      throw new Error("You need to specify a canvas element");
    }
  }
  exports$1.render = function render2(qrData, canvas2, options) {
    let opts = options;
    let canvasEl = canvas2;
    if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
      opts = canvas2;
      canvas2 = void 0;
    }
    if (!canvas2) {
      canvasEl = getCanvasElement();
    }
    opts = Utils2.getOptions(opts);
    const size = Utils2.getImageWidth(qrData.modules.size, opts);
    const ctx = canvasEl.getContext("2d");
    const image = ctx.createImageData(size, size);
    Utils2.qrToImageData(image.data, qrData, opts);
    clearCanvas(ctx, canvasEl, size);
    ctx.putImageData(image, 0, 0);
    return canvasEl;
  };
  exports$1.renderToDataURL = function renderToDataURL(qrData, canvas2, options) {
    let opts = options;
    if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
      opts = canvas2;
      canvas2 = void 0;
    }
    if (!opts) opts = {};
    const canvasEl = exports$1.render(qrData, canvas2, opts);
    const type = opts.type || "image/png";
    const rendererOpts = opts.rendererOpts || {};
    return canvasEl.toDataURL(type, rendererOpts.quality);
  };
})(canvas);
var svgTag = {};
const Utils = utils;
function getColorAttrib(color, attrib) {
  const alpha = color.a / 255;
  const str = attrib + '="' + color.hex + '"';
  return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
}
function svgCmd(cmd, x, y) {
  let str = cmd + x;
  if (typeof y !== "undefined") str += " " + y;
  return str;
}
function qrToPath(data, size, margin) {
  let path = "";
  let moveBy = 0;
  let newRow = false;
  let lineLength = 0;
  for (let i = 0; i < data.length; i++) {
    const col = Math.floor(i % size);
    const row = Math.floor(i / size);
    if (!col && !newRow) newRow = true;
    if (data[i]) {
      lineLength++;
      if (!(i > 0 && col > 0 && data[i - 1])) {
        path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
        moveBy = 0;
        newRow = false;
      }
      if (!(col + 1 < size && data[i + 1])) {
        path += svgCmd("h", lineLength);
        lineLength = 0;
      }
    } else {
      moveBy++;
    }
  }
  return path;
}
svgTag.render = function render(qrData, options, cb) {
  const opts = Utils.getOptions(options);
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const qrcodesize = size + opts.margin * 2;
  const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
  const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
  const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
  const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
  const svgTag2 = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
  if (typeof cb === "function") {
    cb(null, svgTag2);
  }
  return svgTag2;
};
const canPromise = canPromise$1;
const QRCode = qrcode;
const CanvasRenderer = canvas;
const SvgRenderer = svgTag;
function renderCanvas(renderFunc, canvas2, text, opts, cb) {
  const args = [].slice.call(arguments, 1);
  const argsNum = args.length;
  const isLastArgCb = typeof args[argsNum - 1] === "function";
  if (!isLastArgCb && !canPromise()) {
    throw new Error("Callback required as last argument");
  }
  if (isLastArgCb) {
    if (argsNum < 2) {
      throw new Error("Too few arguments provided");
    }
    if (argsNum === 2) {
      cb = text;
      text = canvas2;
      canvas2 = opts = void 0;
    } else if (argsNum === 3) {
      if (canvas2.getContext && typeof cb === "undefined") {
        cb = opts;
        opts = void 0;
      } else {
        cb = opts;
        opts = text;
        text = canvas2;
        canvas2 = void 0;
      }
    }
  } else {
    if (argsNum < 1) {
      throw new Error("Too few arguments provided");
    }
    if (argsNum === 1) {
      text = canvas2;
      canvas2 = opts = void 0;
    } else if (argsNum === 2 && !canvas2.getContext) {
      opts = text;
      text = canvas2;
      canvas2 = void 0;
    }
    return new Promise(function(resolve, reject) {
      try {
        const data = QRCode.create(text, opts);
        resolve(renderFunc(data, canvas2, opts));
      } catch (e) {
        reject(e);
      }
    });
  }
  try {
    const data = QRCode.create(text, opts);
    cb(null, renderFunc(data, canvas2, opts));
  } catch (e) {
    cb(e);
  }
}
browser.create = QRCode.create;
browser.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
browser.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
browser.toString = renderCanvas.bind(null, function(data, _, opts) {
  return SvgRenderer.render(data, opts);
});
function useProductionInventoryTicketPrint(selectedDomain, positionFilter, materialCodeFilter, ticketList, crudRef, printContentRef) {
  const { t } = useI18n();
  const printTime = ref("");
  const loadTicketData = async () => {
    if (!selectedDomain.value) {
      return;
    }
    if (crudRef.value?.crud?.loadData) {
      await crudRef.value.crud.loadData();
    } else if (crudRef.value?.refresh) {
      await crudRef.value.refresh();
    } else {
      setTimeout(() => {
        if (crudRef.value?.crud?.loadData) {
          crudRef.value.crud.loadData();
        } else if (crudRef.value?.refresh) {
          crudRef.value.refresh();
        }
      }, 100);
    }
  };
  const handlePrint = async (range) => {
    if (!printContentRef.value) {
      BtcMessage.warning(t("inventory.ticket.print.content_unavailable"));
      return;
    }
    printTime.value = formatDateTime(/* @__PURE__ */ new Date());
    try {
      const checkTicketSaveService = service.admin?.base?.checkTicket?.save;
      if (checkTicketSaveService) {
        try {
          const currentList = crudRef.value?.crud?.tableData?.value || ticketList.value;
          await checkTicketSaveService(currentList);
        } catch (error) {
          console.error("[ProductionInventoryTicketPrint] Save print failed:", error);
        }
      }
      const checkTicketInfoService = service.admin?.base?.checkTicket?.info;
      if (!checkTicketInfoService) {
        BtcMessage.warning(t("inventory.ticket.print.service_unavailable"));
        return;
      }
      const requestParams = {
        keyword: {}
      };
      if (selectedDomain.value?.domainId) {
        requestParams.keyword.domainId = selectedDomain.value.domainId;
      }
      requestParams.keyword.position = positionFilter.value?.trim() || "";
      const response = await checkTicketInfoService(requestParams);
      let list = [];
      if (response && typeof response === "object") {
        if ("data" in response && Array.isArray(response.data)) {
          list = response.data;
        } else if (Array.isArray(response)) {
          list = response;
        } else if (response.data && typeof response.data === "object" && "list" in response.data) {
          list = response.data.list || [];
        }
      }
      if (materialCodeFilter.value?.trim()) {
        const filterText = materialCodeFilter.value.trim().toLowerCase();
        list = list.filter((item) => {
          const partName = (item.partName || "").toLowerCase();
          return partName.includes(filterText);
        });
      }
      if (range && range.start && range.end) {
        const start = Math.max(0, range.start - 1);
        const end = Math.min(list.length, range.end);
        list = list.slice(start, end);
      }
      const printIframe = document.createElement("iframe");
      printIframe.style.position = "fixed";
      printIframe.style.right = "0";
      printIframe.style.bottom = "0";
      printIframe.style.width = "0";
      printIframe.style.height = "0";
      printIframe.style.border = "none";
      printIframe.style.opacity = "0";
      printIframe.style.pointerEvents = "none";
      document.body.appendChild(printIframe);
      const printWindow = printIframe.contentWindow;
      if (!printWindow) {
        BtcMessage.error(t("inventory.ticket.print.window_error"));
        document.body.removeChild(printIframe);
        return;
      }
      const content = buildPrintContent$1(list);
      const qrCodeData = list.map((item, index2) => {
        const qrData = JSON.stringify({
          partName: item.partName || "",
          position: item.position || ""
        });
        const qrId = `qr-${item.partName || ""}-${item.position || ""}-${index2}`;
        return { qrId, qrData };
      });
      const printHTML = buildPrintHTML$1(content);
      const printDoc = printWindow.document || printIframe.contentDocument;
      if (!printDoc) {
        BtcMessage.error(t("inventory.ticket.print.window_error"));
        document.body.removeChild(printIframe);
        return;
      }
      printDoc.open();
      printDoc.write(printHTML);
      printDoc.close();
      let printApiCalled = false;
      let printStarted = false;
      let beforePrintTime = 0;
      const MIN_PRINT_TIME = 100;
      let cleanup = null;
      const handleBeforePrint = () => {
        printStarted = true;
        beforePrintTime = Date.now();
      };
      const handleAfterPrint = async () => {
        if (!printStarted) {
          if (cleanup) {
            cleanup();
          }
          return;
        }
        const printDuration = Date.now() - beforePrintTime;
        if (printDuration < MIN_PRINT_TIME) {
          console.log("[ProductionInventoryTicketPrint] Print dialog closed too quickly, likely cancelled");
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
          const checkTicketPrintService = service.admin?.base?.checkTicket?.print;
          if (checkTicketPrintService) {
            await checkTicketPrintService(list);
          } else {
            console.warn("[ProductionInventoryTicketPrint] Print service not available, skipping API call");
          }
        } catch (error) {
          console.error("[ProductionInventoryTicketPrint] Call print API failed:", error);
        } finally {
          if (cleanup) {
            setTimeout(cleanup, 100);
          }
        }
      };
      cleanup = () => {
        window.removeEventListener("beforeprint", handleBeforePrint);
        window.removeEventListener("afterprint", handleAfterPrint);
        printWindow.removeEventListener("beforeprint", handleBeforePrint);
        printWindow.removeEventListener("afterprint", handleAfterPrint);
        if (printIframe.parentNode) {
          document.body.removeChild(printIframe);
        }
      };
      window.addEventListener("beforeprint", handleBeforePrint);
      window.addEventListener("afterprint", handleAfterPrint);
      printWindow.addEventListener("beforeprint", handleBeforePrint);
      printWindow.addEventListener("afterprint", handleAfterPrint);
      setTimeout(async () => {
        try {
          const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
          if (!iframeDoc) {
            console.error("[ProductionInventoryTicketPrint] Cannot access iframe document");
            if (cleanup) {
              cleanup();
            }
            return;
          }
          for (const { qrId, qrData } of qrCodeData) {
            const canvasElement = iframeDoc.getElementById(qrId);
            if (canvasElement) {
              const parentDiv = canvasElement.parentElement;
              if (parentDiv) {
                parentDiv.style.setProperty("display", "flex", "important");
                parentDiv.style.setProperty("flex-direction", "column", "important");
                parentDiv.style.setProperty("align-items", "center", "important");
                parentDiv.style.setProperty("width", "100%", "important");
                parentDiv.style.setProperty("height", "100%", "important");
                parentDiv.style.setProperty("box-sizing", "border-box", "important");
                parentDiv.style.setProperty("justify-content", "center", "important");
                parentDiv.style.setProperty("padding-top", "0", "important");
                parentDiv.style.setProperty("padding-bottom", "0", "important");
                parentDiv.style.setProperty("height", "100%", "important");
              }
              const qrSize = 80;
              canvasElement.width = qrSize;
              canvasElement.height = qrSize;
              canvasElement.style.setProperty("display", "block", "important");
              canvasElement.style.setProperty("margin", "0", "important");
              canvasElement.style.setProperty("width", "21.2mm", "important");
              canvasElement.style.setProperty("height", "21.2mm", "important");
              canvasElement.style.setProperty("margin-left", "auto", "important");
              canvasElement.style.setProperty("margin-right", "auto", "important");
              canvasElement.style.setProperty("margin-top", "0", "important");
              canvasElement.style.setProperty("margin-bottom", "0", "important");
              canvasElement.style.setProperty("padding", "0", "important");
              await browser.toCanvas(canvasElement, qrData, {
                width: qrSize,
                margin: 0,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF"
                }
              });
              const titleDiv = canvasElement.nextElementSibling;
              if (titleDiv) {
                titleDiv.style.setProperty("margin-top", "5px", "important");
                titleDiv.style.setProperty("margin-bottom", "0", "important");
                titleDiv.style.setProperty("font-size", "10px", "important");
                titleDiv.style.setProperty("text-align", "center", "important");
              }
            }
          }
          printWindow?.print();
        } catch (error) {
          console.error("[ProductionInventoryTicketPrint] Failed to generate QR codes:", error);
          BtcMessage.error("打印失败：二维码生成失败");
          if (cleanup) {
            cleanup();
          }
        }
      }, 500);
    } catch (error) {
      console.error("[ProductionInventoryTicketPrint] Print failed:", error);
      BtcMessage.error(t("inventory.ticket.print.load_failed"));
    }
  };
  return {
    printContentRef,
    printTime,
    loadTicketData,
    handlePrint
  };
}
function buildPrintContent$1(list) {
  return list.map((item, index2) => {
    const qrId = `qr-${item.partName || ""}-${item.position || ""}-${index2}`;
    const displayText = `${item.position || ""}-${item.partName || ""}`;
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
                <div>抽盘${displayText}</div>
              </div>
              <div class="t-line">
                <div>机</div>
                <div>型：</div>
                <div>___________________</div>
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
                <div>复盘${displayText}</div>
              </div>
              <div class="t-line">
                <div>机</div>
                <div>型：</div>
                <div>___________________</div>
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
                <div>初盘${displayText}</div>
              </div>
              <div class="t-line">
                <div>机</div>
                <div>型：</div>
                <div>___________________</div>
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
  }).join("");
}
function buildPrintHTML$1(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>打印条码</title>
      <style>
        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 0;
            margin: 0;
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
          justify-content: flex-start;
          margin-top: 0;
          margin-bottom: 0;
          padding-top: 0;
          box-sizing: border-box;
          page-break-after: always; /* 每个票据后强制分页 */
          page-break-inside: avoid; /* 防止内容被分页分割 */
        }

        .child {
          width: 70mm;
          height: 35mm;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          flex-shrink: 0;
          page-break-inside: avoid; /* 防止内容被分页分割 */
        }
        .child:last-child {
          border-bottom: none;
        }

        .barcode {
          width: 70mm;
          height: 35mm;
          display: flex;
          padding-top: 5mm;
          padding-bottom: 0;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          overflow: visible;
          margin: 0 auto;
          page-break-inside: avoid; /* 防止二维码区域被分页分割 */
        }
        .barcode canvas {
          width: 21.2mm !important;
          height: 21.2mm !important;
          max-width: 21.2mm !important;
          max-height: 21.2mm !important;
          aspect-ratio: 1 / 1;
          object-fit: contain;
          display: block;
          margin: 0 auto;
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
          font-size: 9px;
          margin-top: 1px;
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
          font-size: 13px;
        }

        /* 控制内容部分的样式 */
        .t-child {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* 每一行的样式，水平排列 */
        .t-line {
          display: flex;
          flex-direction: row;
          margin-top: 3mm;
          margin-bottom: 0;
          text-align: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
        }

        /* 所有文字元素加粗 */
        .t-line > div {
          font-weight: bold;
          font-size: 12px;
        }

        .t-title > div {
          font-weight: bold;
          font-size: 13px;
        }
        .t-line:first-of-type {
          margin-top: 0;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}
function useNonProductionInventoryTicketPrint(selectedDomain, positionFilter, materialCodeFilter, ticketList, crudRef, printContentRef) {
  const { t } = useI18n();
  const printTime = ref("");
  const loadTicketData = async () => {
    if (!selectedDomain.value) {
      return;
    }
    if (crudRef.value?.crud?.loadData) {
      await crudRef.value.crud.loadData();
    } else if (crudRef.value?.refresh) {
      await crudRef.value.refresh();
    } else {
      setTimeout(() => {
        if (crudRef.value?.crud?.loadData) {
          crudRef.value.crud.loadData();
        } else if (crudRef.value?.refresh) {
          crudRef.value.refresh();
        }
      }, 100);
    }
  };
  const handlePrint = async (range) => {
    if (!printContentRef.value) {
      BtcMessage.warning(t("inventory.ticket.print.content_unavailable"));
      return;
    }
    printTime.value = formatDateTime(/* @__PURE__ */ new Date());
    try {
      const checkTicketSaveService = service.admin?.base?.checkTicket?.save;
      if (checkTicketSaveService) {
        try {
          const currentList = crudRef.value?.crud?.tableData?.value || ticketList.value;
          await checkTicketSaveService(currentList);
        } catch (error) {
          console.error("[NonProductionInventoryTicketPrint] Save print failed:", error);
        }
      }
      const checkTicketInfoService = service.admin?.base?.checkTicket?.info;
      if (!checkTicketInfoService) {
        BtcMessage.warning(t("inventory.ticket.print.service_unavailable"));
        return;
      }
      const requestParams = {
        keyword: {}
      };
      if (selectedDomain.value?.domainId) {
        requestParams.keyword.domainId = selectedDomain.value.domainId;
      }
      requestParams.keyword.position = positionFilter.value?.trim() || "";
      const response = await checkTicketInfoService(requestParams);
      let list = [];
      if (response && typeof response === "object") {
        if ("data" in response && Array.isArray(response.data)) {
          list = response.data;
        } else if (Array.isArray(response)) {
          list = response;
        } else if (response.data && typeof response.data === "object" && "list" in response.data) {
          list = response.data.list || [];
        }
      }
      if (materialCodeFilter.value?.trim()) {
        const filterText = materialCodeFilter.value.trim().toLowerCase();
        list = list.filter((item) => {
          const partName = (item.partName || "").toLowerCase();
          return partName.includes(filterText);
        });
      }
      if (range && range.start && range.end) {
        const start = Math.max(0, range.start - 1);
        const end = Math.min(list.length, range.end);
        list = list.slice(start, end);
      }
      const printIframe = document.createElement("iframe");
      printIframe.style.position = "fixed";
      printIframe.style.right = "0";
      printIframe.style.bottom = "0";
      printIframe.style.width = "0";
      printIframe.style.height = "0";
      printIframe.style.border = "none";
      printIframe.style.opacity = "0";
      printIframe.style.pointerEvents = "none";
      document.body.appendChild(printIframe);
      const printWindow = printIframe.contentWindow;
      if (!printWindow) {
        BtcMessage.error(t("inventory.ticket.print.window_error"));
        document.body.removeChild(printIframe);
        return;
      }
      const content = buildPrintContent(list);
      const qrCodeData = list.map((item, index2) => {
        const qrData = JSON.stringify({
          partName: item.partName || "",
          position: item.position || ""
        });
        const qrId = `qr-${item.partName || ""}-${item.position || ""}-${index2}`;
        return { qrId, qrData };
      });
      const printHTML = buildPrintHTML(content);
      const printDoc = printWindow.document || printIframe.contentDocument;
      if (!printDoc) {
        BtcMessage.error(t("inventory.ticket.print.window_error"));
        document.body.removeChild(printIframe);
        return;
      }
      printDoc.open();
      printDoc.write(printHTML);
      printDoc.close();
      let printApiCalled = false;
      let printStarted = false;
      let beforePrintTime = 0;
      const MIN_PRINT_TIME = 100;
      let cleanup = null;
      const handleBeforePrint = () => {
        printStarted = true;
        beforePrintTime = Date.now();
      };
      const handleAfterPrint = async () => {
        if (!printStarted) {
          if (cleanup) {
            cleanup();
          }
          return;
        }
        const printDuration = Date.now() - beforePrintTime;
        if (printDuration < MIN_PRINT_TIME) {
          console.log("[NonProductionInventoryTicketPrint] Print dialog closed too quickly, likely cancelled");
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
          const checkTicketPrintService = service.admin?.base?.checkTicket?.print;
          if (checkTicketPrintService) {
            await checkTicketPrintService(list);
          } else {
            console.warn("[NonProductionInventoryTicketPrint] Print service not available, skipping API call");
          }
        } catch (error) {
          console.error("[NonProductionInventoryTicketPrint] Call print API failed:", error);
        } finally {
          if (cleanup) {
            setTimeout(cleanup, 100);
          }
        }
      };
      cleanup = () => {
        window.removeEventListener("beforeprint", handleBeforePrint);
        window.removeEventListener("afterprint", handleAfterPrint);
        printWindow.removeEventListener("beforeprint", handleBeforePrint);
        printWindow.removeEventListener("afterprint", handleAfterPrint);
        if (printIframe.parentNode) {
          document.body.removeChild(printIframe);
        }
      };
      window.addEventListener("beforeprint", handleBeforePrint);
      window.addEventListener("afterprint", handleAfterPrint);
      printWindow.addEventListener("beforeprint", handleBeforePrint);
      printWindow.addEventListener("afterprint", handleAfterPrint);
      setTimeout(async () => {
        try {
          const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
          if (!iframeDoc) {
            console.error("[NonProductionInventoryTicketPrint] Cannot access iframe document");
            if (cleanup) {
              cleanup();
            }
            return;
          }
          for (const { qrId, qrData } of qrCodeData) {
            const canvasElement = iframeDoc.getElementById(qrId);
            if (canvasElement) {
              const parentDiv = canvasElement.parentElement;
              if (parentDiv) {
                parentDiv.style.setProperty("display", "flex", "important");
                parentDiv.style.setProperty("flex-direction", "column", "important");
                parentDiv.style.setProperty("align-items", "center", "important");
                parentDiv.style.setProperty("width", "100%", "important");
                parentDiv.style.setProperty("height", "100%", "important");
                parentDiv.style.setProperty("box-sizing", "border-box", "important");
                parentDiv.style.setProperty("justify-content", "center", "important");
                parentDiv.style.setProperty("padding-top", "0", "important");
                parentDiv.style.setProperty("padding-bottom", "0", "important");
                parentDiv.style.setProperty("height", "100%", "important");
              }
              const qrSize = 80;
              canvasElement.width = qrSize;
              canvasElement.height = qrSize;
              canvasElement.style.setProperty("display", "block", "important");
              canvasElement.style.setProperty("margin", "0", "important");
              canvasElement.style.setProperty("width", "23mm", "important");
              canvasElement.style.setProperty("height", "23mm", "important");
              canvasElement.style.setProperty("margin-left", "auto", "important");
              canvasElement.style.setProperty("margin-right", "auto", "important");
              canvasElement.style.setProperty("margin-top", "4mm", "important");
              canvasElement.style.setProperty("margin-bottom", "0", "important");
              canvasElement.style.setProperty("padding", "0", "important");
              await browser.toCanvas(canvasElement, qrData, {
                width: qrSize,
                margin: 0,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF"
                }
              });
              const titleDiv = canvasElement.nextElementSibling;
              if (titleDiv) {
                titleDiv.style.setProperty("margin-top", "1mm", "important");
                titleDiv.style.setProperty("margin-bottom", "0", "important");
                titleDiv.style.setProperty("font-size", "14px", "important");
                titleDiv.style.setProperty("text-align", "center", "important");
              }
            }
          }
          printWindow?.print();
        } catch (error) {
          console.error("[NonProductionInventoryTicketPrint] Failed to generate QR codes:", error);
          BtcMessage.error("打印失败：二维码生成失败");
          if (cleanup) {
            cleanup();
          }
        }
      }, 500);
    } catch (error) {
      console.error("[NonProductionInventoryTicketPrint] Print failed:", error);
      BtcMessage.error(t("inventory.ticket.print.load_failed"));
    }
  };
  return {
    printContentRef,
    printTime,
    loadTicketData,
    handlePrint
  };
}
function buildPrintContent(list) {
  return list.map((item, index2) => {
    const qrId = `qr-${item.partName || ""}-${item.position || ""}-${index2}`;
    const displayText = `${item.position || ""}-${item.partName || ""}`;
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
  }).join("");
}
function buildPrintHTML(content) {
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
const _hoisted_1$2 = { class: "toolbar" };
const _hoisted_2$2 = { class: "btc-crud-btn__text" };
const _hoisted_3$1 = { class: "material-code-filter" };
const _hoisted_4$1 = { class: "position-filter" };
const _hoisted_5 = { class: "btc-crud-btn__text" };
var _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcInventoryTicketPrintToolbar"
  },
  __name: "BtcInventoryTicketPrintToolbar",
  props: {
    positionFilter: { default: "" },
    positionPlaceholder: { default: "" },
    materialCodeFilter: { default: "" },
    materialCodePlaceholder: { default: "" },
    onRefresh: {},
    onPrint: {},
    onPositionSearch: {},
    onPositionClear: {},
    onMaterialCodeSearch: {},
    onMaterialCodeClear: {}
  },
  emits: ["update:positionFilter", "update:materialCodeFilter"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { t } = useI18n();
    const theme = useThemePlugin();
    const isMinimal = computed(() => theme.buttonStyle?.value === "minimal");
    const refreshButtonConfig = computed(() => ({
      icon: "refresh",
      tooltip: t("common.button.refresh"),
      ariaLabel: t("common.button.refresh"),
      type: "default",
      onClick: props.onRefresh
    }));
    const printButtonConfig = computed(() => ({
      icon: "print",
      tooltip: t("inventory.ticket.print.print"),
      ariaLabel: t("inventory.ticket.print.print"),
      type: "primary",
      onClick: props.onPrint
    }));
    const onRefresh = () => {
      props.onRefresh?.();
    };
    const onPrint = () => {
      props.onPrint?.();
    };
    const onPositionSearch = () => {
      props.onPositionSearch?.();
    };
    const onPositionClear = () => {
      props.onPositionClear?.();
    };
    const onMaterialCodeSearch = () => {
      props.onMaterialCodeSearch?.();
    };
    const onMaterialCodeClear = () => {
      props.onMaterialCodeClear?.();
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        isMinimal.value ? (openBlock(), createBlock(unref(BtcTableButton), {
          key: 0,
          class: "btc-crud-action-icon",
          config: refreshButtonConfig.value
        }, null, 8, ["config"])) : (openBlock(), createBlock(unref(ElButton), {
          key: 1,
          class: "btc-crud-btn",
          onClick: onRefresh
        }, {
          default: withCtx(() => [
            createVNode(BtcSvg, {
              class: "btc-crud-btn__icon",
              name: "refresh"
            }),
            createBaseVNode("span", _hoisted_2$2, toDisplayString(unref(t)("common.button.refresh")), 1)
          ]),
          _: 1
        })),
        createVNode(unref(BtcFlex1)),
        createBaseVNode("div", _hoisted_3$1, [
          createVNode(unref(ElInput), {
            "model-value": __props.materialCodeFilter,
            placeholder: __props.materialCodePlaceholder,
            clearable: "",
            size: "default",
            style: { "width": "200px" },
            "onUpdate:modelValue": _cache[0] || (_cache[0] = (val) => _ctx.$emit("update:materialCodeFilter", val)),
            onClear: onMaterialCodeClear,
            onKeyup: withKeys(onMaterialCodeSearch, ["enter"])
          }, {
            prefix: withCtx(() => [
              createVNode(unref(ElIcon), null, {
                default: withCtx(() => [
                  createVNode(unref(search_default))
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model-value", "placeholder"])
        ]),
        createBaseVNode("div", _hoisted_4$1, [
          createVNode(unref(ElInput), {
            "model-value": __props.positionFilter,
            placeholder: __props.positionPlaceholder,
            clearable: "",
            size: "default",
            style: { "width": "200px" },
            "onUpdate:modelValue": _cache[1] || (_cache[1] = (val) => _ctx.$emit("update:positionFilter", val)),
            onClear: onPositionClear,
            onKeyup: withKeys(onPositionSearch, ["enter"])
          }, {
            prefix: withCtx(() => [
              createVNode(unref(ElIcon), null, {
                default: withCtx(() => [
                  createVNode(unref(search_default))
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model-value", "placeholder"])
        ]),
        isMinimal.value ? (openBlock(), createBlock(unref(BtcTableButton), {
          key: 2,
          class: "btc-crud-action-icon",
          config: printButtonConfig.value
        }, null, 8, ["config"])) : (openBlock(), createBlock(unref(ElButton), {
          key: 3,
          type: "primary",
          class: "btc-crud-btn btc-crud-btn--with-icon",
          onClick: onPrint
        }, {
          default: withCtx(() => [
            createVNode(BtcSvg, {
              class: "btc-crud-btn__icon",
              name: "print"
            }),
            createBaseVNode("span", _hoisted_5, toDisplayString(unref(t)("inventory.ticket.print.print")), 1)
          ]),
          _: 1
        }))
      ]);
    };
  }
});
var BtcInventoryTicketPrintToolbar = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-736808cb"]]);
const _hoisted_1$1 = { class: "print-range-dialog" };
const _hoisted_2$1 = { class: "range-input-group" };
const _hoisted_3 = { class: "range-separator" };
const _hoisted_4 = { class: "range-hint" };
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    name: "PrintRangeDialog"
  },
  __name: "PrintRangeDialog",
  props: {
    modelValue: { type: Boolean, default: false },
    totalCount: { default: 0 },
    defaultRange: { default: () => ({ start: 1, end: 1 }) }
  },
  emits: ["update:modelValue", "confirm"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const visible = ref(props.modelValue);
    const startIndex = ref(1);
    const endIndex = ref(1);
    const maxIndex = ref(1);
    watch(() => props.modelValue, (val) => {
      visible.value = val;
      if (val && props.totalCount > 0) {
        maxIndex.value = props.totalCount;
        if (props.defaultRange && props.defaultRange.start && props.defaultRange.end) {
          startIndex.value = Math.max(1, Math.min(props.defaultRange.start, props.totalCount));
          endIndex.value = Math.max(startIndex.value, Math.min(props.defaultRange.end, props.totalCount));
        } else {
          startIndex.value = 1;
          endIndex.value = Math.min(50, props.totalCount);
        }
      }
    });
    watch(() => props.totalCount, (val) => {
      if (val > 0) {
        maxIndex.value = val;
        if (visible.value) {
          if (endIndex.value > val) {
            endIndex.value = val;
          }
          if (startIndex.value > val) {
            startIndex.value = 1;
            endIndex.value = Math.min(50, val);
          }
        }
      }
    });
    watch(() => props.defaultRange, (newRange) => {
      if (visible.value && newRange && newRange.start && newRange.end && props.totalCount > 0) {
        startIndex.value = Math.max(1, Math.min(newRange.start, props.totalCount));
        endIndex.value = Math.max(startIndex.value, Math.min(newRange.end, props.totalCount));
      }
    }, { deep: true });
    const handleConfirm = () => {
      if (maxIndex.value <= 0) {
        return;
      }
      const start = Math.max(1, Math.min(startIndex.value || 1, maxIndex.value));
      const end = Math.max(start, Math.min(endIndex.value || maxIndex.value, maxIndex.value));
      emit("confirm", { start, end });
      visible.value = false;
      emit("update:modelValue", false);
    };
    const handleCancel = () => {
      visible.value = false;
      emit("update:modelValue", false);
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ElDialog), {
        modelValue: visible.value,
        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => visible.value = $event),
        title: unref(t)("inventory.ticket.print.select_range"),
        width: "500px",
        "close-on-click-modal": false,
        onClose: handleCancel
      }, {
        footer: withCtx(() => [
          createVNode(unref(ElButton), { onClick: handleCancel }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(t)("common.button.cancel")), 1)
            ]),
            _: 1
          }),
          createVNode(unref(ElButton), {
            type: "primary",
            onClick: handleConfirm
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(t)("common.button.confirm")), 1)
            ]),
            _: 1
          })
        ]),
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_1$1, [
            createBaseVNode("div", _hoisted_2$1, [
              createVNode(unref(ElInputNumber), {
                modelValue: startIndex.value,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => startIndex.value = $event),
                min: 1,
                max: maxIndex.value,
                placeholder: unref(t)("inventory.ticket.print.start_index"),
                style: { "width": "100%" }
              }, null, 8, ["modelValue", "max", "placeholder"]),
              createBaseVNode("span", _hoisted_3, toDisplayString(unref(t)("inventory.ticket.print.to")), 1),
              createVNode(unref(ElInputNumber), {
                modelValue: endIndex.value,
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => endIndex.value = $event),
                min: 1,
                max: maxIndex.value,
                placeholder: unref(t)("inventory.ticket.print.end_index"),
                style: { "width": "100%" }
              }, null, 8, ["modelValue", "max", "placeholder"])
            ]),
            createBaseVNode("div", _hoisted_4, toDisplayString(unref(t)("inventory.ticket.print.range_hint", { total: maxIndex.value })), 1)
          ])
        ]),
        _: 1
      }, 8, ["modelValue", "title"]);
    };
  }
});
var PrintRangeDialog = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-9187dd15"]]);
const _hoisted_1 = { class: "inventory-ticket-print-page" };
const _hoisted_2 = { class: "ticket-print-wrapper" };
const DEFAULT_RANGE_SIZE = 50;
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcInventoryTicketPrint"
  },
  __name: "index",
  setup(__props) {
    const { t, locale } = useI18n();
    const viewGroupRef = ref();
    const crudRef = ref();
    const printContentRef = ref();
    const showPrintRangeDialog = ref(false);
    const printRange = ref(null);
    const lastPrintEndIndex = ref(0);
    const totalTicketCount = computed(() => {
      return crudRef.value?.crud?.pagination?.total || 0;
    });
    const defaultPrintRange = computed(() => {
      const total = totalTicketCount.value;
      if (total === 0) {
        return { start: 1, end: 1 };
      }
      if (lastPrintEndIndex.value === 0) {
        return {
          start: 1,
          end: Math.min(DEFAULT_RANGE_SIZE, total)
        };
      }
      const nextStart = lastPrintEndIndex.value + 1;
      if (nextStart > total) {
        return {
          start: 1,
          end: Math.min(DEFAULT_RANGE_SIZE, total)
        };
      }
      const nextEnd = Math.min(nextStart + DEFAULT_RANGE_SIZE - 1, total);
      return {
        start: nextStart,
        end: nextEnd
      };
    });
    const {
      ticketList,
      selectedDomain,
      positionFilter,
      materialCodeFilter,
      pagination,
      positionPlaceholder,
      materialCodePlaceholder,
      tableColumns,
      ticketService,
      domainService
    } = useTicketService();
    const isProductionDomain = computed(() => {
      if (!selectedDomain.value) return false;
      const name = selectedDomain.value.name || "";
      return name === "生产域";
    });
    const productionPrint = useProductionInventoryTicketPrint(
      selectedDomain,
      positionFilter,
      materialCodeFilter,
      ticketList,
      crudRef,
      printContentRef
    );
    const nonProductionPrint = useNonProductionInventoryTicketPrint(
      selectedDomain,
      positionFilter,
      materialCodeFilter,
      ticketList,
      crudRef,
      printContentRef
    );
    const loadTicketData = () => {
      if (isProductionDomain.value) {
        return productionPrint.loadTicketData();
      } else {
        return nonProductionPrint.loadTicketData();
      }
    };
    const handlePrint = async () => {
      try {
        if (!selectedDomain.value) {
          BtcMessage.warning(t("inventory.dataSource.domain.selectRequired"));
          return;
        }
        await loadTicketData();
        await nextTick();
        const total = crudRef.value?.crud?.pagination?.total || 0;
        if (total > 0) {
          showPrintRangeDialog.value = true;
        } else {
          BtcMessage.warning("没有可打印的数据");
        }
      } catch (error) {
        console.error("[InventoryTicketPrint] Failed to load data:", error);
        BtcMessage.error(t("inventory.ticket.print.load_failed"));
      }
    };
    const handlePrintRangeConfirm = (range) => {
      printRange.value = range;
      lastPrintEndIndex.value = range.end;
      if (isProductionDomain.value) {
        productionPrint.handlePrint(range);
      } else {
        nonProductionPrint.handlePrint(range);
      }
    };
    const elLocale = computed(() => {
      const currentLocale = locale.value || "zh-CN";
      return currentLocale === "zh-CN" ? zhCn : English;
    });
    const onDomainSelect = (domain) => {
      selectedDomain.value = domain;
      pagination.value.page = 1;
      lastPrintEndIndex.value = 0;
      nextTick(() => {
        loadTicketData();
      });
    };
    const handlePositionSearch = () => {
      pagination.value.page = 1;
      lastPrintEndIndex.value = 0;
      loadTicketData();
    };
    const handlePositionClear = () => {
      pagination.value.page = 1;
      lastPrintEndIndex.value = 0;
      loadTicketData();
    };
    const handleMaterialCodeSearch = () => {
      pagination.value.page = 1;
      lastPrintEndIndex.value = 0;
      loadTicketData();
    };
    const handleMaterialCodeClear = () => {
      pagination.value.page = 1;
      lastPrintEndIndex.value = 0;
      loadTicketData();
    };
    const handleRefresh = () => {
      loadTicketData();
      viewGroupRef.value?.refresh?.();
    };
    onMounted(() => {
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcViewGroup), {
          ref_key: "viewGroupRef",
          ref: viewGroupRef,
          "left-service": unref(domainService),
          "left-title": unref(t)("inventory.dataSource.domain"),
          "show-unassigned": false,
          "enable-key-search": false,
          "left-size": "small",
          onSelect: onDomainSelect
        }, {
          right: withCtx(() => [
            createBaseVNode("div", _hoisted_2, [
              createVNode(BtcInventoryTicketPrintToolbar, {
                "position-filter": unref(positionFilter),
                "onUpdate:positionFilter": _cache[0] || (_cache[0] = ($event) => isRef(positionFilter) ? positionFilter.value = $event : null),
                "position-placeholder": unref(positionPlaceholder),
                "material-code-filter": unref(materialCodeFilter),
                "onUpdate:materialCodeFilter": _cache[1] || (_cache[1] = ($event) => isRef(materialCodeFilter) ? materialCodeFilter.value = $event : null),
                "material-code-placeholder": unref(materialCodePlaceholder),
                "on-refresh": handleRefresh,
                "on-print": handlePrint,
                "on-position-search": handlePositionSearch,
                "on-position-clear": handlePositionClear,
                "on-material-code-search": handleMaterialCodeSearch,
                "on-material-code-clear": handleMaterialCodeClear
              }, null, 8, ["position-filter", "position-placeholder", "material-code-filter", "material-code-placeholder"]),
              createVNode(unref(BtcCrud), {
                ref_key: "crudRef",
                ref: crudRef,
                service: unref(ticketService),
                "auto-load": false
              }, {
                default: withCtx(() => [
                  createVNode(unref(BtcRow), null, {
                    default: withCtx(() => [
                      createBaseVNode("div", {
                        ref_key: "printContentRef",
                        ref: printContentRef,
                        style: { "width": "100%" }
                      }, [
                        createVNode(unref(BtcTable), {
                          columns: unref(tableColumns),
                          border: "",
                          "auto-height": "",
                          "disable-auto-created-at": true
                        }, null, 8, ["columns"])
                      ], 512)
                    ]),
                    _: 1
                  }),
                  createVNode(unref(BtcRow), null, {
                    default: withCtx(() => [
                      createVNode(unref(BtcFlex1)),
                      createVNode(unref(ElConfigProvider), { locale: elLocale.value }, {
                        default: withCtx(() => [
                          createVNode(unref(BtcPagination))
                        ]),
                        _: 1
                      }, 8, ["locale"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["service"])
            ])
          ]),
          _: 1
        }, 8, ["left-service", "left-title"]),
        createVNode(PrintRangeDialog, {
          modelValue: showPrintRangeDialog.value,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => showPrintRangeDialog.value = $event),
          "total-count": totalTicketCount.value,
          "default-range": defaultPrintRange.value,
          onConfirm: handlePrintRangeConfirm
        }, null, 8, ["modelValue", "total-count", "default-range"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3bf1abc3"]]);
export {
  index as default
};
