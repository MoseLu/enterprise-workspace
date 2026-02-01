import { g as getDefaultExportFromCjs, c as commonjsGlobal } from "./index-CeQEKVXA.js";
import "@btc/shared-core";
import "@btc/shared-utils";
import "@btc/shared-components";
function asyncGeneratorStep(n2, t2, e2, r2, o2, a2, c2) {
  try {
    var i2 = n2[a2](c2), u2 = i2.value;
  } catch (n3) {
    return void e2(n3);
  }
  i2.done ? t2(u2) : Promise.resolve(u2).then(r2, o2);
}
function _asyncToGenerator(n2) {
  return function() {
    var t2 = this, e2 = arguments;
    return new Promise(function(r2, o2) {
      var a2 = n2.apply(t2, e2);
      function _next(n3) {
        asyncGeneratorStep(a2, r2, o2, _next, _throw, "next", n3);
      }
      function _throw(n3) {
        asyncGeneratorStep(a2, r2, o2, _next, _throw, "throw", n3);
      }
      _next(void 0);
    });
  };
}
function noop() {
}
var noop_1 = noop;
var _noop = /* @__PURE__ */ getDefaultExportFromCjs(noop_1);
function _objectWithoutPropertiesLoose(r2, e2) {
  if (null == r2) return {};
  var t2 = {};
  for (var n2 in r2) if ({}.hasOwnProperty.call(r2, n2)) {
    if (-1 !== e2.indexOf(n2)) continue;
    t2[n2] = r2[n2];
  }
  return t2;
}
function _objectWithoutProperties(e2, t2) {
  if (null == e2) return {};
  var o2, r2, i2 = _objectWithoutPropertiesLoose(e2, t2);
  if (Object.getOwnPropertySymbols) {
    var n2 = Object.getOwnPropertySymbols(e2);
    for (r2 = 0; r2 < n2.length; r2++) o2 = n2[r2], -1 === t2.indexOf(o2) && {}.propertyIsEnumerable.call(e2, o2) && (i2[o2] = e2[o2]);
  }
  return i2;
}
function _arrayLikeToArray(r2, a2) {
  (null == a2 || a2 > r2.length) && (a2 = r2.length);
  for (var e2 = 0, n2 = Array(a2); e2 < a2; e2++) n2[e2] = r2[e2];
  return n2;
}
function _arrayWithoutHoles(r2) {
  if (Array.isArray(r2)) return _arrayLikeToArray(r2);
}
function _iterableToArray(r2) {
  if ("undefined" != typeof Symbol && null != r2[Symbol.iterator] || null != r2["@@iterator"]) return Array.from(r2);
}
function _unsupportedIterableToArray(r2, a2) {
  if (r2) {
    if ("string" == typeof r2) return _arrayLikeToArray(r2, a2);
    var t2 = {}.toString.call(r2).slice(8, -1);
    return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray(r2, a2) : void 0;
  }
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toConsumableArray(r2) {
  return _arrayWithoutHoles(r2) || _iterableToArray(r2) || _unsupportedIterableToArray(r2) || _nonIterableSpread();
}
function _typeof$1(o2) {
  "@babel/helpers - typeof";
  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o3) {
    return typeof o3;
  } : function(o3) {
    return o3 && "function" == typeof Symbol && o3.constructor === Symbol && o3 !== Symbol.prototype ? "symbol" : typeof o3;
  }, _typeof$1(o2);
}
function toPrimitive(t2, r2) {
  if ("object" != _typeof$1(t2) || !t2) return t2;
  var e2 = t2[Symbol.toPrimitive];
  if (void 0 !== e2) {
    var i2 = e2.call(t2, r2);
    if ("object" != _typeof$1(i2)) return i2;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r2 ? String : Number)(t2);
}
function toPropertyKey(t2) {
  var i2 = toPrimitive(t2, "string");
  return "symbol" == _typeof$1(i2) ? i2 : i2 + "";
}
function _defineProperty$1(e2, r2, t2) {
  return (r2 = toPropertyKey(r2)) in e2 ? Object.defineProperty(e2, r2, {
    value: t2,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e2[r2] = t2, e2;
}
function ownKeys$1(e2, r2) {
  var t2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var o2 = Object.getOwnPropertySymbols(e2);
    r2 && (o2 = o2.filter(function(r3) {
      return Object.getOwnPropertyDescriptor(e2, r3).enumerable;
    })), t2.push.apply(t2, o2);
  }
  return t2;
}
function _objectSpread2(e2) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var t2 = null != arguments[r2] ? arguments[r2] : {};
    r2 % 2 ? ownKeys$1(Object(t2), true).forEach(function(r3) {
      _defineProperty$1(e2, r3, t2[r3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(t2)) : ownKeys$1(Object(t2)).forEach(function(r3) {
      Object.defineProperty(e2, r3, Object.getOwnPropertyDescriptor(t2, r3));
    });
  }
  return e2;
}
var regeneratorRuntime$1 = { exports: {} };
var OverloadYield = { exports: {} };
(function(module) {
  function _OverloadYield(e2, d2) {
    this.v = e2, this.k = d2;
  }
  module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(OverloadYield);
var OverloadYieldExports = OverloadYield.exports;
var regenerator$1 = { exports: {} };
var regeneratorDefine = { exports: {} };
(function(module) {
  function _regeneratorDefine(e2, r2, n2, t2) {
    var i2 = Object.defineProperty;
    try {
      i2({}, "", {});
    } catch (e3) {
      i2 = 0;
    }
    module.exports = _regeneratorDefine = function regeneratorDefine2(e3, r3, n3, t3) {
      function o2(r4, n4) {
        _regeneratorDefine(e3, r4, function(e4) {
          return this._invoke(r4, n4, e4);
        });
      }
      r3 ? i2 ? i2(e3, r3, {
        value: n3,
        enumerable: !t3,
        configurable: !t3,
        writable: !t3
      }) : e3[r3] = n3 : (o2("next", 0), o2("throw", 1), o2("return", 2));
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _regeneratorDefine(e2, r2, n2, t2);
  }
  module.exports = _regeneratorDefine, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(regeneratorDefine);
var regeneratorDefineExports = regeneratorDefine.exports;
(function(module) {
  var regeneratorDefine2 = regeneratorDefineExports;
  function _regenerator() {
    /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
    var e2, t2, r2 = "function" == typeof Symbol ? Symbol : {}, n2 = r2.iterator || "@@iterator", o2 = r2.toStringTag || "@@toStringTag";
    function i2(r3, n3, o3, i3) {
      var c3 = n3 && n3.prototype instanceof Generator ? n3 : Generator, u3 = Object.create(c3.prototype);
      return regeneratorDefine2(u3, "_invoke", function(r4, n4, o4) {
        var i4, c4, u4, f3 = 0, p2 = o4 || [], y2 = false, G2 = {
          p: 0,
          n: 0,
          v: e2,
          a: d2,
          f: d2.bind(e2, 4),
          d: function d3(t3, r5) {
            return i4 = t3, c4 = 0, u4 = e2, G2.n = r5, a2;
          }
        };
        function d2(r5, n5) {
          for (c4 = r5, u4 = n5, t2 = 0; !y2 && f3 && !o5 && t2 < p2.length; t2++) {
            var o5, i5 = p2[t2], d3 = G2.p, l2 = i5[2];
            r5 > 3 ? (o5 = l2 === n5) && (u4 = i5[(c4 = i5[4]) ? 5 : (c4 = 3, 3)], i5[4] = i5[5] = e2) : i5[0] <= d3 && ((o5 = r5 < 2 && d3 < i5[1]) ? (c4 = 0, G2.v = n5, G2.n = i5[1]) : d3 < l2 && (o5 = r5 < 3 || i5[0] > n5 || n5 > l2) && (i5[4] = r5, i5[5] = n5, G2.n = l2, c4 = 0));
          }
          if (o5 || r5 > 1) return a2;
          throw y2 = true, n5;
        }
        return function(o5, p3, l2) {
          if (f3 > 1) throw TypeError("Generator is already running");
          for (y2 && 1 === p3 && d2(p3, l2), c4 = p3, u4 = l2; (t2 = c4 < 2 ? e2 : u4) || !y2; ) {
            i4 || (c4 ? c4 < 3 ? (c4 > 1 && (G2.n = -1), d2(c4, u4)) : G2.n = u4 : G2.v = u4);
            try {
              if (f3 = 2, i4) {
                if (c4 || (o5 = "next"), t2 = i4[o5]) {
                  if (!(t2 = t2.call(i4, u4))) throw TypeError("iterator result is not an object");
                  if (!t2.done) return t2;
                  u4 = t2.value, c4 < 2 && (c4 = 0);
                } else 1 === c4 && (t2 = i4["return"]) && t2.call(i4), c4 < 2 && (u4 = TypeError("The iterator does not provide a '" + o5 + "' method"), c4 = 1);
                i4 = e2;
              } else if ((t2 = (y2 = G2.n < 0) ? u4 : r4.call(n4, G2)) !== a2) break;
            } catch (t3) {
              i4 = e2, c4 = 1, u4 = t3;
            } finally {
              f3 = 1;
            }
          }
          return {
            value: t2,
            done: y2
          };
        };
      }(r3, o3, i3), true), u3;
    }
    var a2 = {};
    function Generator() {
    }
    function GeneratorFunction() {
    }
    function GeneratorFunctionPrototype() {
    }
    t2 = Object.getPrototypeOf;
    var c2 = [][n2] ? t2(t2([][n2]())) : (regeneratorDefine2(t2 = {}, n2, function() {
      return this;
    }), t2), u2 = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c2);
    function f2(e3) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(e3, GeneratorFunctionPrototype) : (e3.__proto__ = GeneratorFunctionPrototype, regeneratorDefine2(e3, o2, "GeneratorFunction")), e3.prototype = Object.create(u2), e3;
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, regeneratorDefine2(u2, "constructor", GeneratorFunctionPrototype), regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", regeneratorDefine2(GeneratorFunctionPrototype, o2, "GeneratorFunction"), regeneratorDefine2(u2), regeneratorDefine2(u2, o2, "Generator"), regeneratorDefine2(u2, n2, function() {
      return this;
    }), regeneratorDefine2(u2, "toString", function() {
      return "[object Generator]";
    }), (module.exports = _regenerator = function _regenerator2() {
      return {
        w: i2,
        m: f2
      };
    }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
  }
  module.exports = _regenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(regenerator$1);
var regeneratorExports = regenerator$1.exports;
var regeneratorAsync = { exports: {} };
var regeneratorAsyncGen = { exports: {} };
var regeneratorAsyncIterator = { exports: {} };
(function(module) {
  var OverloadYield2 = OverloadYieldExports;
  var regeneratorDefine2 = regeneratorDefineExports;
  function AsyncIterator(t2, e2) {
    function n2(r3, o2, i2, f2) {
      try {
        var c2 = t2[r3](o2), u2 = c2.value;
        return u2 instanceof OverloadYield2 ? e2.resolve(u2.v).then(function(t3) {
          n2("next", t3, i2, f2);
        }, function(t3) {
          n2("throw", t3, i2, f2);
        }) : e2.resolve(u2).then(function(t3) {
          c2.value = t3, i2(c2);
        }, function(t3) {
          return n2("throw", t3, i2, f2);
        });
      } catch (t3) {
        f2(t3);
      }
    }
    var r2;
    this.next || (regeneratorDefine2(AsyncIterator.prototype), regeneratorDefine2(AsyncIterator.prototype, "function" == typeof Symbol && Symbol.asyncIterator || "@asyncIterator", function() {
      return this;
    })), regeneratorDefine2(this, "_invoke", function(t3, o2, i2) {
      function f2() {
        return new e2(function(e3, r3) {
          n2(t3, i2, e3, r3);
        });
      }
      return r2 = r2 ? r2.then(f2, f2) : f2();
    }, true);
  }
  module.exports = AsyncIterator, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(regeneratorAsyncIterator);
var regeneratorAsyncIteratorExports = regeneratorAsyncIterator.exports;
(function(module) {
  var regenerator2 = regeneratorExports;
  var regeneratorAsyncIterator2 = regeneratorAsyncIteratorExports;
  function _regeneratorAsyncGen(r2, e2, t2, o2, n2) {
    return new regeneratorAsyncIterator2(regenerator2().w(r2, e2, t2, o2), n2 || Promise);
  }
  module.exports = _regeneratorAsyncGen, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(regeneratorAsyncGen);
var regeneratorAsyncGenExports = regeneratorAsyncGen.exports;
(function(module) {
  var regeneratorAsyncGen2 = regeneratorAsyncGenExports;
  function _regeneratorAsync(n2, e2, r2, t2, o2) {
    var a2 = regeneratorAsyncGen2(n2, e2, r2, t2, o2);
    return a2.next().then(function(n3) {
      return n3.done ? n3.value : a2.next();
    });
  }
  module.exports = _regeneratorAsync, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(regeneratorAsync);
var regeneratorAsyncExports = regeneratorAsync.exports;
var regeneratorKeys = { exports: {} };
(function(module) {
  function _regeneratorKeys(e2) {
    var n2 = Object(e2), r2 = [];
    for (var t2 in n2) r2.unshift(t2);
    return function e3() {
      for (; r2.length; ) if ((t2 = r2.pop()) in n2) return e3.value = t2, e3.done = false, e3;
      return e3.done = true, e3;
    };
  }
  module.exports = _regeneratorKeys, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(regeneratorKeys);
var regeneratorKeysExports = regeneratorKeys.exports;
var regeneratorValues = { exports: {} };
var _typeof = { exports: {} };
(function(module) {
  function _typeof2(o2) {
    "@babel/helpers - typeof";
    return module.exports = _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o3) {
      return typeof o3;
    } : function(o3) {
      return o3 && "function" == typeof Symbol && o3.constructor === Symbol && o3 !== Symbol.prototype ? "symbol" : typeof o3;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof2(o2);
  }
  module.exports = _typeof2, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(_typeof);
var _typeofExports = _typeof.exports;
(function(module) {
  var _typeof2 = _typeofExports["default"];
  function _regeneratorValues(e2) {
    if (null != e2) {
      var t2 = e2["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r2 = 0;
      if (t2) return t2.call(e2);
      if ("function" == typeof e2.next) return e2;
      if (!isNaN(e2.length)) return {
        next: function next() {
          return e2 && r2 >= e2.length && (e2 = void 0), {
            value: e2 && e2[r2++],
            done: !e2
          };
        }
      };
    }
    throw new TypeError(_typeof2(e2) + " is not iterable");
  }
  module.exports = _regeneratorValues, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(regeneratorValues);
var regeneratorValuesExports = regeneratorValues.exports;
(function(module) {
  var OverloadYield2 = OverloadYieldExports;
  var regenerator2 = regeneratorExports;
  var regeneratorAsync2 = regeneratorAsyncExports;
  var regeneratorAsyncGen2 = regeneratorAsyncGenExports;
  var regeneratorAsyncIterator2 = regeneratorAsyncIteratorExports;
  var regeneratorKeys2 = regeneratorKeysExports;
  var regeneratorValues2 = regeneratorValuesExports;
  function _regeneratorRuntime2() {
    var r2 = regenerator2(), e2 = r2.m(_regeneratorRuntime2), t2 = (Object.getPrototypeOf ? Object.getPrototypeOf(e2) : e2.__proto__).constructor;
    function n2(r3) {
      var e3 = "function" == typeof r3 && r3.constructor;
      return !!e3 && (e3 === t2 || "GeneratorFunction" === (e3.displayName || e3.name));
    }
    var o2 = {
      "throw": 1,
      "return": 2,
      "break": 3,
      "continue": 3
    };
    function a2(r3) {
      var e3, t3;
      return function(n3) {
        e3 || (e3 = {
          stop: function stop() {
            return t3(n3.a, 2);
          },
          "catch": function _catch() {
            return n3.v;
          },
          abrupt: function abrupt(r4, e4) {
            return t3(n3.a, o2[r4], e4);
          },
          delegateYield: function delegateYield(r4, o3, a3) {
            return e3.resultName = o3, t3(n3.d, regeneratorValues2(r4), a3);
          },
          finish: function finish(r4) {
            return t3(n3.f, r4);
          }
        }, t3 = function t4(r4, _t2, o3) {
          n3.p = e3.prev, n3.n = e3.next;
          try {
            return r4(_t2, o3);
          } finally {
            e3.next = n3.n;
          }
        }), e3.resultName && (e3[e3.resultName] = n3.v, e3.resultName = void 0), e3.sent = n3.v, e3.next = n3.n;
        try {
          return r3.call(this, e3);
        } finally {
          n3.p = e3.prev, n3.n = e3.next;
        }
      };
    }
    return (module.exports = _regeneratorRuntime2 = function _regeneratorRuntime3() {
      return {
        wrap: function wrap(e3, t3, n3, o3) {
          return r2.w(a2(e3), t3, n3, o3 && o3.reverse());
        },
        isGeneratorFunction: n2,
        mark: r2.m,
        awrap: function awrap(r3, e3) {
          return new OverloadYield2(r3, e3);
        },
        AsyncIterator: regeneratorAsyncIterator2,
        async: function async(r3, e3, t3, o3, u2) {
          return (n2(e3) ? regeneratorAsyncGen2 : regeneratorAsync2)(a2(r3), e3, t3, o3, u2);
        },
        keys: regeneratorKeys2,
        values: regeneratorValues2
      };
    }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
  }
  module.exports = _regeneratorRuntime2, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(regeneratorRuntime$1);
var regeneratorRuntimeExports = regeneratorRuntime$1.exports;
var runtime = regeneratorRuntimeExports();
var regenerator = runtime;
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}
var _regeneratorRuntime = /* @__PURE__ */ getDefaultExportFromCjs(regenerator);
var t = Object.freeze({ __proto__: null, get start() {
  return Bt;
}, get ensureJQuerySupport() {
  return lt;
}, get setBootstrapMaxTime() {
  return J;
}, get setMountMaxTime() {
  return H;
}, get setUnmountMaxTime() {
  return Q;
}, get setUnloadMaxTime() {
  return V;
}, get registerApplication() {
  return bt;
}, get unregisterApplication() {
  return At;
}, get getMountedApps() {
  return yt;
}, get getAppStatus() {
  return Ot;
}, get unloadApplication() {
  return Nt;
}, get checkActivityFunctions() {
  return Tt;
}, get getAppNames() {
  return Pt;
}, get pathToActiveWhen() {
  return Dt;
}, get navigateToUrl() {
  return et;
}, get triggerAppChange() {
  return Lt;
}, get addErrorHandler() {
  return a;
}, get removeErrorHandler() {
  return c;
}, get mountRootParcel() {
  return W;
}, get NOT_LOADED() {
  return l;
}, get LOADING_SOURCE_CODE() {
  return p;
}, get NOT_BOOTSTRAPPED() {
  return h;
}, get BOOTSTRAPPING() {
  return m;
}, get NOT_MOUNTED() {
  return v;
}, get MOUNTING() {
  return d;
}, get UPDATING() {
  return g;
}, get LOAD_ERROR() {
  return P;
}, get MOUNTED() {
  return w;
}, get UNLOADING() {
  return y;
}, get UNMOUNTING() {
  return E;
}, get SKIP_BECAUSE_BROKEN() {
  return O;
} });
function n(t2) {
  return (n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
    return typeof t3;
  } : function(t3) {
    return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
  })(t2);
}
function e(t2, n2, e2) {
  return n2 in t2 ? Object.defineProperty(t2, n2, { value: e2, enumerable: true, configurable: true, writable: true }) : t2[n2] = e2, t2;
}
var r = ("undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {}).CustomEvent, o = function() {
  try {
    var t2 = new r("cat", { detail: { foo: "bar" } });
    return "cat" === t2.type && "bar" === t2.detail.foo;
  } catch (t3) {
  }
  return false;
}() ? r : "undefined" != typeof document && "function" == typeof document.createEvent ? function(t2, n2) {
  var e2 = document.createEvent("CustomEvent");
  return n2 ? e2.initCustomEvent(t2, n2.bubbles, n2.cancelable, n2.detail) : e2.initCustomEvent(t2, false, false, void 0), e2;
} : function(t2, n2) {
  var e2 = document.createEventObject();
  return e2.type = t2, n2 ? (e2.bubbles = Boolean(n2.bubbles), e2.cancelable = Boolean(n2.cancelable), e2.detail = n2.detail) : (e2.bubbles = false, e2.cancelable = false, e2.detail = void 0), e2;
}, i = [];
function u(t2, n2, e2) {
  var r2 = f(t2, n2, e2);
  i.length ? i.forEach(function(t3) {
    return t3(r2);
  }) : setTimeout(function() {
    throw r2;
  });
}
function a(t2) {
  if ("function" != typeof t2) throw Error(s(28, false));
  i.push(t2);
}
function c(t2) {
  if ("function" != typeof t2) throw Error(s(29, false));
  var n2 = false;
  return i = i.filter(function(e2) {
    var r2 = e2 === t2;
    return n2 = n2 || r2, !r2;
  }), n2;
}
function s(t2, n2) {
  for (var e2 = arguments.length, r2 = new Array(e2 > 2 ? e2 - 2 : 0), o2 = 2; o2 < e2; o2++) r2[o2 - 2] = arguments[o2];
  return "single-spa minified message #".concat(t2, ": ").concat("", "See https://single-spa.js.org/error/?code=").concat(t2).concat(r2.length ? "&arg=".concat(r2.join("&arg=")) : "");
}
function f(t2, n2, e2) {
  var r2, o2 = "".concat(S(n2), " '").concat(A(n2), "' died in status ").concat(n2.status, ": ");
  if (t2 instanceof Error) {
    try {
      t2.message = o2 + t2.message;
    } catch (t3) {
    }
    r2 = t2;
  } else {
    console.warn(s(30, false, n2.status, A(n2)));
    try {
      r2 = Error(o2 + JSON.stringify(t2));
    } catch (n3) {
      r2 = t2;
    }
  }
  return r2.appOrParcelName = A(n2), n2.status = e2, r2;
}
var l = "NOT_LOADED", p = "LOADING_SOURCE_CODE", h = "NOT_BOOTSTRAPPED", m = "BOOTSTRAPPING", v = "NOT_MOUNTED", d = "MOUNTING", w = "MOUNTED", g = "UPDATING", E = "UNMOUNTING", y = "UNLOADING", P = "LOAD_ERROR", O = "SKIP_BECAUSE_BROKEN";
function b(t2) {
  return t2.status === w;
}
function T(t2) {
  try {
    return t2.activeWhen(window.location);
  } catch (n2) {
    return u(n2, t2, O), false;
  }
}
function A(t2) {
  return t2.name;
}
function N(t2) {
  return Boolean(t2.unmountThisParcel);
}
function S(t2) {
  return N(t2) ? "parcel" : "application";
}
function _() {
  for (var t2 = arguments.length - 1; t2 > 0; t2--) for (var n2 in arguments[t2]) "__proto__" !== n2 && (arguments[t2 - 1][n2] = arguments[t2][n2]);
  return arguments[0];
}
function D(t2, n2) {
  for (var e2 = 0; e2 < t2.length; e2++) if (n2(t2[e2])) return t2[e2];
  return null;
}
function U(t2) {
  return t2 && ("function" == typeof t2 || (n2 = t2, Array.isArray(n2) && !D(n2, function(t3) {
    return "function" != typeof t3;
  })));
  var n2;
}
function j(t2, n2) {
  var e2 = t2[n2] || [];
  0 === (e2 = Array.isArray(e2) ? e2 : [e2]).length && (e2 = [function() {
    return Promise.resolve();
  }]);
  var r2 = S(t2), o2 = A(t2);
  return function(t3) {
    return e2.reduce(function(e3, i2, u2) {
      return e3.then(function() {
        var e4 = i2(t3);
        return M(e4) ? e4 : Promise.reject(s(15, false, r2, o2, n2, u2));
      });
    }, Promise.resolve());
  };
}
function M(t2) {
  return t2 && "function" == typeof t2.then && "function" == typeof t2.catch;
}
function L(t2, n2) {
  return Promise.resolve().then(function() {
    return t2.status !== h ? t2 : (t2.status = m, t2.bootstrap ? q(t2, "bootstrap").then(e2).catch(function(e3) {
      if (n2) throw f(e3, t2, O);
      return u(e3, t2, O), t2;
    }) : Promise.resolve().then(e2));
  });
  function e2() {
    return t2.status = v, t2;
  }
}
function R(t2, n2) {
  return Promise.resolve().then(function() {
    if (t2.status !== w) return t2;
    t2.status = E;
    var e2 = Object.keys(t2.parcels).map(function(n3) {
      return t2.parcels[n3].unmountThisParcel();
    });
    return Promise.all(e2).then(r2, function(e3) {
      return r2().then(function() {
        var r3 = Error(e3.message);
        if (n2) throw f(r3, t2, O);
        u(r3, t2, O);
      });
    }).then(function() {
      return t2;
    });
    function r2() {
      return q(t2, "unmount").then(function() {
        t2.status = v;
      }).catch(function(e3) {
        if (n2) throw f(e3, t2, O);
        u(e3, t2, O);
      });
    }
  });
}
var I = false, x = false;
function B(t2, n2) {
  return Promise.resolve().then(function() {
    return t2.status !== v ? t2 : (I || (window.dispatchEvent(new o("single-spa:before-first-mount")), I = true), q(t2, "mount").then(function() {
      return t2.status = w, x || (window.dispatchEvent(new o("single-spa:first-mount")), x = true), t2;
    }).catch(function(e2) {
      return t2.status = w, R(t2, true).then(r2, r2);
      function r2() {
        if (n2) throw f(e2, t2, O);
        return u(e2, t2, O), t2;
      }
    }));
  });
}
var G = 0, C = { parcels: {} };
function W() {
  return $.apply(C, arguments);
}
function $(t2, e2) {
  var r2 = this;
  if (!t2 || "object" !== n(t2) && "function" != typeof t2) throw Error(s(2, false));
  if (t2.name && "string" != typeof t2.name) throw Error(s(3, false, n(t2.name)));
  if ("object" !== n(e2)) throw Error(s(4, false, name, n(e2)));
  if (!e2.domElement) throw Error(s(5, false, name));
  var o2, i2 = G++, u2 = "function" == typeof t2, a2 = u2 ? t2 : function() {
    return Promise.resolve(t2);
  }, c2 = { id: i2, parcels: {}, status: u2 ? p : h, customProps: e2, parentName: A(r2), unmountThisParcel: function() {
    return y2.then(function() {
      if (c2.status !== w) throw Error(s(6, false, name, c2.status));
      return R(c2, true);
    }).then(function(t3) {
      return c2.parentName && delete r2.parcels[c2.id], t3;
    }).then(function(t3) {
      return m2(t3), t3;
    }).catch(function(t3) {
      throw c2.status = O, d2(t3), t3;
    });
  } };
  r2.parcels[i2] = c2;
  var l2 = a2();
  if (!l2 || "function" != typeof l2.then) throw Error(s(7, false));
  var m2, d2, E2 = (l2 = l2.then(function(t3) {
    if (!t3) throw Error(s(8, false));
    var n2 = t3.name || "parcel-".concat(i2);
    if (Object.prototype.hasOwnProperty.call(t3, "bootstrap") && !U(t3.bootstrap)) throw Error(s(9, false, n2));
    if (!U(t3.mount)) throw Error(s(10, false, n2));
    if (!U(t3.unmount)) throw Error(s(11, false, n2));
    if (t3.update && !U(t3.update)) throw Error(s(12, false, n2));
    var e3 = j(t3, "bootstrap"), r3 = j(t3, "mount"), u3 = j(t3, "unmount");
    c2.status = h, c2.name = n2, c2.bootstrap = e3, c2.mount = r3, c2.unmount = u3, c2.timeouts = z(t3.timeouts), t3.update && (c2.update = j(t3, "update"), o2.update = function(t4) {
      return c2.customProps = t4, k(function(t5) {
        return Promise.resolve().then(function() {
          if (t5.status !== w) throw Error(s(32, false, A(t5)));
          return t5.status = g, q(t5, "update").then(function() {
            return t5.status = w, t5;
          }).catch(function(n3) {
            throw f(n3, t5, O);
          });
        });
      }(c2));
    });
  })).then(function() {
    return L(c2, true);
  }), y2 = E2.then(function() {
    return B(c2, true);
  }), P2 = new Promise(function(t3, n2) {
    m2 = t3, d2 = n2;
  });
  return o2 = { mount: function() {
    return k(Promise.resolve().then(function() {
      if (c2.status !== v) throw Error(s(13, false, name, c2.status));
      return r2.parcels[i2] = c2, B(c2);
    }));
  }, unmount: function() {
    return k(c2.unmountThisParcel());
  }, getStatus: function() {
    return c2.status;
  }, loadPromise: k(l2), bootstrapPromise: k(E2), mountPromise: k(y2), unmountPromise: k(P2) };
}
function k(t2) {
  return t2.then(function() {
    return null;
  });
}
function K(e2) {
  var r2 = A(e2), o2 = "function" == typeof e2.customProps ? e2.customProps(r2, window.location) : e2.customProps;
  ("object" !== n(o2) || null === o2 || Array.isArray(o2)) && (o2 = {}, console.warn(s(40, false), r2, o2));
  var i2 = _({}, o2, { name: r2, mountParcel: $.bind(e2), singleSpa: t });
  return N(e2) && (i2.unmountSelf = e2.unmountThisParcel), i2;
}
var F = { bootstrap: { millis: 4e3, dieOnTimeout: false, warningMillis: 1e3 }, mount: { millis: 3e3, dieOnTimeout: false, warningMillis: 1e3 }, unmount: { millis: 3e3, dieOnTimeout: false, warningMillis: 1e3 }, unload: { millis: 3e3, dieOnTimeout: false, warningMillis: 1e3 }, update: { millis: 3e3, dieOnTimeout: false, warningMillis: 1e3 } };
function J(t2, n2, e2) {
  if ("number" != typeof t2 || t2 <= 0) throw Error(s(16, false));
  F.bootstrap = { millis: t2, dieOnTimeout: n2, warningMillis: e2 || 1e3 };
}
function H(t2, n2, e2) {
  if ("number" != typeof t2 || t2 <= 0) throw Error(s(17, false));
  F.mount = { millis: t2, dieOnTimeout: n2, warningMillis: e2 || 1e3 };
}
function Q(t2, n2, e2) {
  if ("number" != typeof t2 || t2 <= 0) throw Error(s(18, false));
  F.unmount = { millis: t2, dieOnTimeout: n2, warningMillis: e2 || 1e3 };
}
function V(t2, n2, e2) {
  if ("number" != typeof t2 || t2 <= 0) throw Error(s(19, false));
  F.unload = { millis: t2, dieOnTimeout: n2, warningMillis: e2 || 1e3 };
}
function q(t2, n2) {
  var e2 = t2.timeouts[n2], r2 = e2.warningMillis, o2 = S(t2);
  return new Promise(function(i2, u2) {
    var a2 = false, c2 = false;
    t2[n2](K(t2)).then(function(t3) {
      a2 = true, i2(t3);
    }).catch(function(t3) {
      a2 = true, u2(t3);
    }), setTimeout(function() {
      return l2(1);
    }, r2), setTimeout(function() {
      return l2(true);
    }, e2.millis);
    var f2 = s(31, false, n2, o2, A(t2), e2.millis);
    function l2(t3) {
      if (!a2) {
        if (true === t3) c2 = true, e2.dieOnTimeout ? u2(Error(f2)) : console.error(f2);
        else if (!c2) {
          var n3 = t3, o3 = n3 * r2;
          console.warn(f2), o3 + r2 < e2.millis && setTimeout(function() {
            return l2(n3 + 1);
          }, r2);
        }
      }
    }
  });
}
function z(t2) {
  var n2 = {};
  for (var e2 in F) n2[e2] = _({}, F[e2], t2 && t2[e2] || {});
  return n2;
}
function X(t2) {
  return Promise.resolve().then(function() {
    return t2.loadPromise ? t2.loadPromise : t2.status !== l && t2.status !== P ? t2 : (t2.status = p, t2.loadPromise = Promise.resolve().then(function() {
      var o2 = t2.loadApp(K(t2));
      if (!M(o2)) throw r2 = true, Error(s(33, false, A(t2)));
      return o2.then(function(r3) {
        var o3;
        t2.loadErrorTime = null, "object" !== n(e2 = r3) && (o3 = 34), Object.prototype.hasOwnProperty.call(e2, "bootstrap") && !U(e2.bootstrap) && (o3 = 35), U(e2.mount) || (o3 = 36), U(e2.unmount) || (o3 = 37);
        var i2 = S(e2);
        if (o3) {
          var a2;
          try {
            a2 = JSON.stringify(e2);
          } catch (t3) {
          }
          return console.error(s(o3, false, i2, A(t2), a2), e2), u(void 0, t2, O), t2;
        }
        return e2.devtools && e2.devtools.overlays && (t2.devtools.overlays = _({}, t2.devtools.overlays, e2.devtools.overlays)), t2.status = h, t2.bootstrap = j(e2, "bootstrap"), t2.mount = j(e2, "mount"), t2.unmount = j(e2, "unmount"), t2.unload = j(e2, "unload"), t2.timeouts = z(e2.timeouts), delete t2.loadPromise, t2;
      });
    }).catch(function(n2) {
      var e3;
      return delete t2.loadPromise, r2 ? e3 = O : (e3 = P, t2.loadErrorTime = (/* @__PURE__ */ new Date()).getTime()), u(n2, t2, e3), t2;
    }));
    var e2, r2;
  });
}
var Y, Z = "undefined" != typeof window, tt = { hashchange: [], popstate: [] }, nt = ["hashchange", "popstate"];
function et(t2) {
  var n2;
  if ("string" == typeof t2) n2 = t2;
  else if (this && this.href) n2 = this.href;
  else {
    if (!(t2 && t2.currentTarget && t2.currentTarget.href && t2.preventDefault)) throw Error(s(14, false));
    n2 = t2.currentTarget.href, t2.preventDefault();
  }
  var e2 = st(window.location.href), r2 = st(n2);
  0 === n2.indexOf("#") ? window.location.hash = r2.hash : e2.host !== r2.host && r2.host ? window.location.href = n2 : r2.pathname === e2.pathname && r2.search === e2.search ? window.location.hash = r2.hash : window.history.pushState(null, null, n2);
}
function rt(t2) {
  var n2 = this;
  if (t2) {
    var e2 = t2[0].type;
    nt.indexOf(e2) >= 0 && tt[e2].forEach(function(e3) {
      try {
        e3.apply(n2, t2);
      } catch (t3) {
        setTimeout(function() {
          throw t3;
        });
      }
    });
  }
}
function ot() {
  Rt([], arguments);
}
function it(t2, n2) {
  return function() {
    var e2 = window.location.href, r2 = t2.apply(this, arguments), o2 = window.location.href;
    return Y && e2 === o2 || (Gt() ? window.dispatchEvent(ut(window.history.state, n2)) : Rt([])), r2;
  };
}
function ut(t2, n2) {
  var e2;
  try {
    e2 = new PopStateEvent("popstate", { state: t2 });
  } catch (n3) {
    (e2 = document.createEvent("PopStateEvent")).initPopStateEvent("popstate", false, false, t2);
  }
  return e2.singleSpa = true, e2.singleSpaTrigger = n2, e2;
}
if (Z) {
  window.addEventListener("hashchange", ot), window.addEventListener("popstate", ot);
  var at = window.addEventListener, ct = window.removeEventListener;
  window.addEventListener = function(t2, n2) {
    if (!("function" == typeof n2 && nt.indexOf(t2) >= 0) || D(tt[t2], function(t3) {
      return t3 === n2;
    })) return at.apply(this, arguments);
    tt[t2].push(n2);
  }, window.removeEventListener = function(t2, n2) {
    if (!("function" == typeof n2 && nt.indexOf(t2) >= 0)) return ct.apply(this, arguments);
    tt[t2] = tt[t2].filter(function(t3) {
      return t3 !== n2;
    });
  }, window.history.pushState = it(window.history.pushState, "pushState"), window.history.replaceState = it(window.history.replaceState, "replaceState"), window.singleSpaNavigate ? console.warn(s(41, false)) : window.singleSpaNavigate = et;
}
function st(t2) {
  var n2 = document.createElement("a");
  return n2.href = t2, n2;
}
var ft = false;
function lt() {
  var t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : window.jQuery;
  if (t2 || window.$ && window.$.fn && window.$.fn.jquery && (t2 = window.$), t2 && !ft) {
    var n2 = t2.fn.on, e2 = t2.fn.off;
    t2.fn.on = function(t3, e3) {
      return pt.call(this, n2, window.addEventListener, t3, e3, arguments);
    }, t2.fn.off = function(t3, n3) {
      return pt.call(this, e2, window.removeEventListener, t3, n3, arguments);
    }, ft = true;
  }
}
function pt(t2, n2, e2, r2, o2) {
  return "string" != typeof e2 ? t2.apply(this, o2) : (e2.split(/\s+/).forEach(function(t3) {
    nt.indexOf(t3) >= 0 && (n2(t3, r2), e2 = e2.replace(t3, ""));
  }), "" === e2.trim() ? this : t2.apply(this, o2));
}
var ht = {};
function mt(t2) {
  return Promise.resolve().then(function() {
    var n2 = ht[A(t2)];
    if (!n2) return t2;
    if (t2.status === l) return vt(t2, n2), t2;
    if (t2.status === y) return n2.promise.then(function() {
      return t2;
    });
    if (t2.status !== v && t2.status !== P) return t2;
    var e2 = t2.status === P ? Promise.resolve() : q(t2, "unload");
    return t2.status = y, e2.then(function() {
      return vt(t2, n2), t2;
    }).catch(function(e3) {
      return function(t3, n3, e4) {
        delete ht[A(t3)], delete t3.bootstrap, delete t3.mount, delete t3.unmount, delete t3.unload, u(e4, t3, O), n3.reject(e4);
      }(t2, n2, e3), t2;
    });
  });
}
function vt(t2, n2) {
  delete ht[A(t2)], delete t2.bootstrap, delete t2.mount, delete t2.unmount, delete t2.unload, t2.status = l, n2.resolve();
}
function dt(t2, n2, e2, r2) {
  ht[A(t2)] = { app: t2, resolve: e2, reject: r2 }, Object.defineProperty(ht[A(t2)], "promise", { get: n2 });
}
function wt(t2) {
  return ht[t2];
}
var gt = [];
function Et() {
  var t2 = [], n2 = [], e2 = [], r2 = [], o2 = (/* @__PURE__ */ new Date()).getTime();
  return gt.forEach(function(i2) {
    var u2 = i2.status !== O && T(i2);
    switch (i2.status) {
      case P:
        u2 && o2 - i2.loadErrorTime >= 200 && e2.push(i2);
        break;
      case l:
      case p:
        u2 && e2.push(i2);
        break;
      case h:
      case v:
        !u2 && wt(A(i2)) ? t2.push(i2) : u2 && r2.push(i2);
        break;
      case w:
        u2 || n2.push(i2);
    }
  }), { appsToUnload: t2, appsToUnmount: n2, appsToLoad: e2, appsToMount: r2 };
}
function yt() {
  return gt.filter(b).map(A);
}
function Pt() {
  return gt.map(A);
}
function Ot(t2) {
  var n2 = D(gt, function(n3) {
    return A(n3) === t2;
  });
  return n2 ? n2.status : null;
}
function bt(t2, e2, r2, o2) {
  var i2 = function(t3, e3, r3, o3) {
    var i3, u2 = { name: null, loadApp: null, activeWhen: null, customProps: null };
    return "object" === n(t3) ? (function(t4) {
      if (Array.isArray(t4) || null === t4) throw Error(s(39, false));
      var e4 = ["name", "app", "activeWhen", "customProps"], r4 = Object.keys(t4).reduce(function(t5, n2) {
        return e4.indexOf(n2) >= 0 ? t5 : t5.concat(n2);
      }, []);
      if (0 !== r4.length) throw Error(s(38, false, e4.join(", "), r4.join(", ")));
      if ("string" != typeof t4.name || 0 === t4.name.length) throw Error(s(20, false));
      if ("object" !== n(t4.app) && "function" != typeof t4.app) throw Error(s(20, false));
      var o4 = function(t5) {
        return "string" == typeof t5 || "function" == typeof t5;
      };
      if (!(o4(t4.activeWhen) || Array.isArray(t4.activeWhen) && t4.activeWhen.every(o4))) throw Error(s(24, false));
      if (!_t(t4.customProps)) throw Error(s(22, false));
    }(t3), u2.name = t3.name, u2.loadApp = t3.app, u2.activeWhen = t3.activeWhen, u2.customProps = t3.customProps) : (function(t4, n2, e4, r4) {
      if ("string" != typeof t4 || 0 === t4.length) throw Error(s(20, false));
      if (!n2) throw Error(s(23, false));
      if ("function" != typeof e4) throw Error(s(24, false));
      if (!_t(r4)) throw Error(s(22, false));
    }(t3, e3, r3, o3), u2.name = t3, u2.loadApp = e3, u2.activeWhen = r3, u2.customProps = o3), u2.loadApp = "function" != typeof (i3 = u2.loadApp) ? function() {
      return Promise.resolve(i3);
    } : i3, u2.customProps = /* @__PURE__ */ function(t4) {
      return t4 || {};
    }(u2.customProps), u2.activeWhen = function(t4) {
      var n2 = Array.isArray(t4) ? t4 : [t4];
      return n2 = n2.map(function(t5) {
        return "function" == typeof t5 ? t5 : Dt(t5);
      }), function(t5) {
        return n2.some(function(n3) {
          return n3(t5);
        });
      };
    }(u2.activeWhen), u2;
  }(t2, e2, r2, o2);
  if (-1 !== Pt().indexOf(i2.name)) throw Error(s(21, false, i2.name));
  gt.push(_({ loadErrorTime: null, status: l, parcels: {}, devtools: { overlays: { options: {}, selectors: [] } } }, i2)), Z && (lt(), Rt());
}
function Tt() {
  var t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : window.location;
  return gt.filter(function(n2) {
    return n2.activeWhen(t2);
  }).map(A);
}
function At(t2) {
  if (0 === gt.filter(function(n2) {
    return A(n2) === t2;
  }).length) throw Error(s(25, false, t2));
  return Nt(t2).then(function() {
    var n2 = gt.map(A).indexOf(t2);
    gt.splice(n2, 1);
  });
}
function Nt(t2) {
  var n2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { waitForUnmount: false };
  if ("string" != typeof t2) throw Error(s(26, false));
  var e2 = D(gt, function(n3) {
    return A(n3) === t2;
  });
  if (!e2) throw Error(s(27, false, t2));
  var r2, o2 = wt(A(e2));
  if (n2 && n2.waitForUnmount) {
    if (o2) return o2.promise;
    var i2 = new Promise(function(t3, n3) {
      dt(e2, function() {
        return i2;
      }, t3, n3);
    });
    return i2;
  }
  return o2 ? (r2 = o2.promise, St(e2, o2.resolve, o2.reject)) : r2 = new Promise(function(t3, n3) {
    dt(e2, function() {
      return r2;
    }, t3, n3), St(e2, t3, n3);
  }), r2;
}
function St(t2, n2, e2) {
  R(t2).then(mt).then(function() {
    n2(), setTimeout(function() {
      Rt();
    });
  }).catch(e2);
}
function _t(t2) {
  return !t2 || "function" == typeof t2 || "object" === n(t2) && null !== t2 && !Array.isArray(t2);
}
function Dt(t2, n2) {
  var e2 = function(t3, n3) {
    var e3 = 0, r2 = false, o2 = "^";
    "/" !== t3[0] && (t3 = "/" + t3);
    for (var i2 = 0; i2 < t3.length; i2++) {
      var u2 = t3[i2];
      (!r2 && ":" === u2 || r2 && "/" === u2) && a2(i2);
    }
    return a2(t3.length), new RegExp(o2, "i");
    function a2(i3) {
      var u3 = t3.slice(e3, i3).replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
      if (o2 += r2 ? "[^/]+/?" : u3, i3 === t3.length) if (r2) n3 && (o2 += "$");
      else {
        var a3 = n3 ? "" : ".*";
        o2 = "/" === o2.charAt(o2.length - 1) ? "".concat(o2).concat(a3, "$") : "".concat(o2, "(/").concat(a3, ")?(#.*)?$");
      }
      r2 = !r2, e3 = i3;
    }
  }(t2, n2);
  return function(t3) {
    var n3 = t3.origin;
    n3 || (n3 = "".concat(t3.protocol, "//").concat(t3.host));
    var r2 = t3.href.replace(n3, "").replace(t3.search, "").split("?")[0];
    return e2.test(r2);
  };
}
var Ut = false, jt = [], Mt = Z && window.location.href;
function Lt() {
  return Rt();
}
function Rt() {
  var t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], n2 = arguments.length > 1 ? arguments[1] : void 0;
  if (Ut) return new Promise(function(t3, e2) {
    jt.push({ resolve: t3, reject: e2, eventArguments: n2 });
  });
  var r2, i2 = Et(), u2 = i2.appsToUnload, a2 = i2.appsToUnmount, c2 = i2.appsToLoad, s2 = i2.appsToMount, f2 = false, p2 = Mt, h2 = Mt = window.location.href;
  return Gt() ? (Ut = true, r2 = u2.concat(c2, a2, s2), g2()) : (r2 = c2, d2());
  function m2() {
    f2 = true;
  }
  function d2() {
    return Promise.resolve().then(function() {
      var t3 = c2.map(X);
      return Promise.all(t3).then(y2).then(function() {
        return [];
      }).catch(function(t4) {
        throw y2(), t4;
      });
    });
  }
  function g2() {
    return Promise.resolve().then(function() {
      if (window.dispatchEvent(new o(0 === r2.length ? "single-spa:before-no-app-change" : "single-spa:before-app-change", P2(true))), window.dispatchEvent(new o("single-spa:before-routing-event", P2(true, { cancelNavigation: m2 }))), f2) return window.dispatchEvent(new o("single-spa:before-mount-routing-event", P2(true))), E2(), void et(p2);
      var n3 = u2.map(mt), e2 = a2.map(R).map(function(t3) {
        return t3.then(mt);
      }).concat(n3), i3 = Promise.all(e2);
      i3.then(function() {
        window.dispatchEvent(new o("single-spa:before-mount-routing-event", P2(true)));
      });
      var l2 = c2.map(function(t3) {
        return X(t3).then(function(t4) {
          return It(t4, i3);
        });
      }), h3 = s2.filter(function(t3) {
        return c2.indexOf(t3) < 0;
      }).map(function(t3) {
        return It(t3, i3);
      });
      return i3.catch(function(t3) {
        throw y2(), t3;
      }).then(function() {
        return y2(), Promise.all(l2.concat(h3)).catch(function(n4) {
          throw t2.forEach(function(t3) {
            return t3.reject(n4);
          }), n4;
        }).then(E2);
      });
    });
  }
  function E2() {
    var n3 = yt();
    t2.forEach(function(t3) {
      return t3.resolve(n3);
    });
    try {
      var e2 = 0 === r2.length ? "single-spa:no-app-change" : "single-spa:app-change";
      window.dispatchEvent(new o(e2, P2())), window.dispatchEvent(new o("single-spa:routing-event", P2()));
    } catch (t3) {
      setTimeout(function() {
        throw t3;
      });
    }
    if (Ut = false, jt.length > 0) {
      var i3 = jt;
      jt = [], Rt(i3);
    }
    return n3;
  }
  function y2() {
    t2.forEach(function(t3) {
      rt(t3.eventArguments);
    }), rt(n2);
  }
  function P2() {
    var t3, o2 = arguments.length > 0 && void 0 !== arguments[0] && arguments[0], i3 = arguments.length > 1 ? arguments[1] : void 0, m3 = {}, d3 = (e(t3 = {}, w, []), e(t3, v, []), e(t3, l, []), e(t3, O, []), t3);
    o2 ? (c2.concat(s2).forEach(function(t4, n3) {
      E3(t4, w);
    }), u2.forEach(function(t4) {
      E3(t4, l);
    }), a2.forEach(function(t4) {
      E3(t4, v);
    })) : r2.forEach(function(t4) {
      E3(t4);
    });
    var g3 = { detail: { newAppStatuses: m3, appsByNewStatus: d3, totalAppChanges: r2.length, originalEvent: null == n2 ? void 0 : n2[0], oldUrl: p2, newUrl: h2, navigationIsCanceled: f2 } };
    return i3 && _(g3.detail, i3), g3;
    function E3(t4, n3) {
      var e2 = A(t4);
      n3 = n3 || Ot(e2), m3[e2] = n3, (d3[n3] = d3[n3] || []).push(e2);
    }
  }
}
function It(t2, n2) {
  return T(t2) ? L(t2).then(function(t3) {
    return n2.then(function() {
      return T(t3) ? B(t3) : t3;
    });
  }) : n2.then(function() {
    return t2;
  });
}
var xt = false;
function Bt(t2) {
  var n2;
  xt = true, t2 && t2.urlRerouteOnly && (n2 = t2.urlRerouteOnly, Y = n2), Z && Rt();
}
function Gt() {
  return xt;
}
Z && setTimeout(function() {
  xt || console.warn(s(1, false));
}, 5e3);
var Ct = { getRawAppData: function() {
  return [].concat(gt);
}, reroute: Rt, NOT_LOADED: l, toLoadPromise: X, toBootstrapPromise: L, unregisterApplication: At };
Z && window.__SINGLE_SPA_DEVTOOLS__ && (window.__SINGLE_SPA_DEVTOOLS__.exposedMethods = Ct);
function arrayPush$4(array, values) {
  var index = -1, length = values.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}
var _arrayPush = arrayPush$4;
var freeGlobal$1 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
var _freeGlobal = freeGlobal$1;
var freeGlobal = _freeGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root$8 = freeGlobal || freeSelf || Function("return this")();
var _root = root$8;
var root$7 = _root;
var Symbol$6 = root$7.Symbol;
var _Symbol = Symbol$6;
var Symbol$5 = _Symbol;
var objectProto$d = Object.prototype;
var hasOwnProperty$a = objectProto$d.hasOwnProperty;
var nativeObjectToString$1 = objectProto$d.toString;
var symToStringTag$1 = Symbol$5 ? Symbol$5.toStringTag : void 0;
function getRawTag$1(value) {
  var isOwn = hasOwnProperty$a.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e2) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var _getRawTag = getRawTag$1;
var objectProto$c = Object.prototype;
var nativeObjectToString = objectProto$c.toString;
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}
var _objectToString = objectToString$1;
var Symbol$4 = _Symbol, getRawTag = _getRawTag, objectToString = _objectToString;
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$4 ? Symbol$4.toStringTag : void 0;
function baseGetTag$6(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
var _baseGetTag = baseGetTag$6;
function isObjectLike$8(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_1 = isObjectLike$8;
var baseGetTag$5 = _baseGetTag, isObjectLike$7 = isObjectLike_1;
var argsTag$2 = "[object Arguments]";
function baseIsArguments$1(value) {
  return isObjectLike$7(value) && baseGetTag$5(value) == argsTag$2;
}
var _baseIsArguments = baseIsArguments$1;
var baseIsArguments = _baseIsArguments, isObjectLike$6 = isObjectLike_1;
var objectProto$b = Object.prototype;
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$b.propertyIsEnumerable;
var isArguments$3 = baseIsArguments(/* @__PURE__ */ function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike$6(value) && hasOwnProperty$9.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
var isArguments_1 = isArguments$3;
var isArray$8 = Array.isArray;
var isArray_1 = isArray$8;
var Symbol$3 = _Symbol, isArguments$2 = isArguments_1, isArray$7 = isArray_1;
var spreadableSymbol = Symbol$3 ? Symbol$3.isConcatSpreadable : void 0;
function isFlattenable$1(value) {
  return isArray$7(value) || isArguments$2(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
var _isFlattenable = isFlattenable$1;
var arrayPush$3 = _arrayPush, isFlattenable = _isFlattenable;
function baseFlatten$1(array, depth, predicate, isStrict, result) {
  var index = -1, length = array.length;
  predicate || (predicate = isFlattenable);
  result || (result = []);
  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten$1(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush$3(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}
var _baseFlatten = baseFlatten$1;
function copyArray$3(source, array) {
  var index = -1, length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}
var _copyArray = copyArray$3;
var arrayPush$2 = _arrayPush, baseFlatten = _baseFlatten, copyArray$2 = _copyArray, isArray$6 = isArray_1;
function concat() {
  var length = arguments.length;
  if (!length) {
    return [];
  }
  var args = Array(length - 1), array = arguments[0], index = length;
  while (index--) {
    args[index - 1] = arguments[index];
  }
  return arrayPush$2(isArray$6(array) ? copyArray$2(array) : [array], baseFlatten(args, 1));
}
var concat_1 = concat;
var _concat = /* @__PURE__ */ getDefaultExportFromCjs(concat_1);
function listCacheClear$1() {
  this.__data__ = [];
  this.size = 0;
}
var _listCacheClear = listCacheClear$1;
function eq$4(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_1 = eq$4;
var eq$3 = eq_1;
function assocIndexOf$4(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$3(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var _assocIndexOf = assocIndexOf$4;
var assocIndexOf$3 = _assocIndexOf;
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete$1(key) {
  var data = this.__data__, index = assocIndexOf$3(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
var _listCacheDelete = listCacheDelete$1;
var assocIndexOf$2 = _assocIndexOf;
function listCacheGet$1(key) {
  var data = this.__data__, index = assocIndexOf$2(data, key);
  return index < 0 ? void 0 : data[index][1];
}
var _listCacheGet = listCacheGet$1;
var assocIndexOf$1 = _assocIndexOf;
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}
var _listCacheHas = listCacheHas$1;
var assocIndexOf = _assocIndexOf;
function listCacheSet$1(key, value) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
var _listCacheSet = listCacheSet$1;
var listCacheClear = _listCacheClear, listCacheDelete = _listCacheDelete, listCacheGet = _listCacheGet, listCacheHas = _listCacheHas, listCacheSet = _listCacheSet;
function ListCache$4(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache$4.prototype.clear = listCacheClear;
ListCache$4.prototype["delete"] = listCacheDelete;
ListCache$4.prototype.get = listCacheGet;
ListCache$4.prototype.has = listCacheHas;
ListCache$4.prototype.set = listCacheSet;
var _ListCache = ListCache$4;
var ListCache$3 = _ListCache;
function stackClear$1() {
  this.__data__ = new ListCache$3();
  this.size = 0;
}
var _stackClear = stackClear$1;
function stackDelete$1(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
var _stackDelete = stackDelete$1;
function stackGet$1(key) {
  return this.__data__.get(key);
}
var _stackGet = stackGet$1;
function stackHas$1(key) {
  return this.__data__.has(key);
}
var _stackHas = stackHas$1;
function isObject$9(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_1 = isObject$9;
var baseGetTag$4 = _baseGetTag, isObject$8 = isObject_1;
var asyncTag = "[object AsyncFunction]", funcTag$2 = "[object Function]", genTag$1 = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction$3(value) {
  if (!isObject$8(value)) {
    return false;
  }
  var tag = baseGetTag$4(value);
  return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
}
var isFunction_1 = isFunction$3;
var _isFunction = /* @__PURE__ */ getDefaultExportFromCjs(isFunction_1);
var root$6 = _root;
var coreJsData$1 = root$6["__core-js_shared__"];
var _coreJsData = coreJsData$1;
var coreJsData = _coreJsData;
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked$1(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var _isMasked = isMasked$1;
var funcProto$2 = Function.prototype;
var funcToString$2 = funcProto$2.toString;
function toSource$2(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e2) {
    }
    try {
      return func + "";
    } catch (e2) {
    }
  }
  return "";
}
var _toSource = toSource$2;
var isFunction$2 = isFunction_1, isMasked = _isMasked, isObject$7 = isObject_1, toSource$1 = _toSource;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto$1 = Function.prototype, objectProto$a = Object.prototype;
var funcToString$1 = funcProto$1.toString;
var hasOwnProperty$8 = objectProto$a.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString$1.call(hasOwnProperty$8).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative$1(value) {
  if (!isObject$7(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction$2(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource$1(value));
}
var _baseIsNative = baseIsNative$1;
function getValue$1(object, key) {
  return object == null ? void 0 : object[key];
}
var _getValue = getValue$1;
var baseIsNative = _baseIsNative, getValue = _getValue;
function getNative$7(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var _getNative = getNative$7;
var getNative$6 = _getNative, root$5 = _root;
var Map$4 = getNative$6(root$5, "Map");
var _Map = Map$4;
var getNative$5 = _getNative;
var nativeCreate$4 = getNative$5(Object, "create");
var _nativeCreate = nativeCreate$4;
var nativeCreate$3 = _nativeCreate;
function hashClear$1() {
  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
  this.size = 0;
}
var _hashClear = hashClear$1;
function hashDelete$1(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var _hashDelete = hashDelete$1;
var nativeCreate$2 = _nativeCreate;
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$9 = Object.prototype;
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$2) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$7.call(data, key) ? data[key] : void 0;
}
var _hashGet = hashGet$1;
var nativeCreate$1 = _nativeCreate;
var objectProto$8 = Object.prototype;
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? data[key] !== void 0 : hasOwnProperty$6.call(data, key);
}
var _hashHas = hashHas$1;
var nativeCreate = _nativeCreate;
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet$1(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
var _hashSet = hashSet$1;
var hashClear = _hashClear, hashDelete = _hashDelete, hashGet = _hashGet, hashHas = _hashHas, hashSet = _hashSet;
function Hash$1(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash$1.prototype.clear = hashClear;
Hash$1.prototype["delete"] = hashDelete;
Hash$1.prototype.get = hashGet;
Hash$1.prototype.has = hashHas;
Hash$1.prototype.set = hashSet;
var _Hash = Hash$1;
var Hash = _Hash, ListCache$2 = _ListCache, Map$3 = _Map;
function mapCacheClear$1() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$3 || ListCache$2)(),
    "string": new Hash()
  };
}
var _mapCacheClear = mapCacheClear$1;
function isKeyable$1(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
var _isKeyable = isKeyable$1;
var isKeyable = _isKeyable;
function getMapData$4(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var _getMapData = getMapData$4;
var getMapData$3 = _getMapData;
function mapCacheDelete$1(key) {
  var result = getMapData$3(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var _mapCacheDelete = mapCacheDelete$1;
var getMapData$2 = _getMapData;
function mapCacheGet$1(key) {
  return getMapData$2(this, key).get(key);
}
var _mapCacheGet = mapCacheGet$1;
var getMapData$1 = _getMapData;
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}
var _mapCacheHas = mapCacheHas$1;
var getMapData = _getMapData;
function mapCacheSet$1(key, value) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var _mapCacheSet = mapCacheSet$1;
var mapCacheClear = _mapCacheClear, mapCacheDelete = _mapCacheDelete, mapCacheGet = _mapCacheGet, mapCacheHas = _mapCacheHas, mapCacheSet = _mapCacheSet;
function MapCache$3(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache$3.prototype.clear = mapCacheClear;
MapCache$3.prototype["delete"] = mapCacheDelete;
MapCache$3.prototype.get = mapCacheGet;
MapCache$3.prototype.has = mapCacheHas;
MapCache$3.prototype.set = mapCacheSet;
var _MapCache = MapCache$3;
var ListCache$1 = _ListCache, Map$2 = _Map, MapCache$2 = _MapCache;
var LARGE_ARRAY_SIZE$1 = 200;
function stackSet$1(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache$1) {
    var pairs = data.__data__;
    if (!Map$2 || pairs.length < LARGE_ARRAY_SIZE$1 - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache$2(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
var _stackSet = stackSet$1;
var ListCache = _ListCache, stackClear = _stackClear, stackDelete = _stackDelete, stackGet = _stackGet, stackHas = _stackHas, stackSet = _stackSet;
function Stack$2(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack$2.prototype.clear = stackClear;
Stack$2.prototype["delete"] = stackDelete;
Stack$2.prototype.get = stackGet;
Stack$2.prototype.has = stackHas;
Stack$2.prototype.set = stackSet;
var _Stack = Stack$2;
var getNative$4 = _getNative;
var defineProperty$2 = function() {
  try {
    var func = getNative$4(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e2) {
  }
}();
var _defineProperty = defineProperty$2;
var defineProperty$1 = _defineProperty;
function baseAssignValue$3(object, key, value) {
  if (key == "__proto__" && defineProperty$1) {
    defineProperty$1(object, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object[key] = value;
  }
}
var _baseAssignValue = baseAssignValue$3;
var baseAssignValue$2 = _baseAssignValue, eq$2 = eq_1;
function assignMergeValue$2(object, key, value) {
  if (value !== void 0 && !eq$2(object[key], value) || value === void 0 && !(key in object)) {
    baseAssignValue$2(object, key, value);
  }
}
var _assignMergeValue = assignMergeValue$2;
function createBaseFor$1(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}
var _createBaseFor = createBaseFor$1;
var createBaseFor = _createBaseFor;
var baseFor$2 = createBaseFor();
var _baseFor = baseFor$2;
var _cloneBuffer = { exports: {} };
_cloneBuffer.exports;
(function(module, exports$1) {
  var root2 = _root;
  var freeExports = exports$1 && !exports$1.nodeType && exports$1;
  var freeModule = freeExports && true && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer = moduleExports ? root2.Buffer : void 0, allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0;
  function cloneBuffer2(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
    buffer.copy(result);
    return result;
  }
  module.exports = cloneBuffer2;
})(_cloneBuffer, _cloneBuffer.exports);
var _cloneBufferExports = _cloneBuffer.exports;
var root$4 = _root;
var Uint8Array$1 = root$4.Uint8Array;
var _Uint8Array = Uint8Array$1;
var Uint8Array = _Uint8Array;
function cloneArrayBuffer$3(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}
var _cloneArrayBuffer = cloneArrayBuffer$3;
var cloneArrayBuffer$2 = _cloneArrayBuffer;
function cloneTypedArray$2(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer$2(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var _cloneTypedArray = cloneTypedArray$2;
var isObject$6 = isObject_1;
var objectCreate = Object.create;
var baseCreate$1 = /* @__PURE__ */ function() {
  function object() {
  }
  return function(proto) {
    if (!isObject$6(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object();
    object.prototype = void 0;
    return result;
  };
}();
var _baseCreate = baseCreate$1;
function overArg$2(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var _overArg = overArg$2;
var overArg$1 = _overArg;
var getPrototype$3 = overArg$1(Object.getPrototypeOf, Object);
var _getPrototype = getPrototype$3;
var objectProto$7 = Object.prototype;
function isPrototype$3(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$7;
  return value === proto;
}
var _isPrototype = isPrototype$3;
var baseCreate = _baseCreate, getPrototype$2 = _getPrototype, isPrototype$2 = _isPrototype;
function initCloneObject$2(object) {
  return typeof object.constructor == "function" && !isPrototype$2(object) ? baseCreate(getPrototype$2(object)) : {};
}
var _initCloneObject = initCloneObject$2;
var MAX_SAFE_INTEGER$1 = 9007199254740991;
function isLength$2(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}
var isLength_1 = isLength$2;
var isFunction$1 = isFunction_1, isLength$1 = isLength_1;
function isArrayLike$5(value) {
  return value != null && isLength$1(value.length) && !isFunction$1(value);
}
var isArrayLike_1 = isArrayLike$5;
var isArrayLike$4 = isArrayLike_1, isObjectLike$5 = isObjectLike_1;
function isArrayLikeObject$2(value) {
  return isObjectLike$5(value) && isArrayLike$4(value);
}
var isArrayLikeObject_1 = isArrayLikeObject$2;
var isBuffer$3 = { exports: {} };
function stubFalse() {
  return false;
}
var stubFalse_1 = stubFalse;
isBuffer$3.exports;
(function(module, exports$1) {
  var root2 = _root, stubFalse2 = stubFalse_1;
  var freeExports = exports$1 && !exports$1.nodeType && exports$1;
  var freeModule = freeExports && true && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer = moduleExports ? root2.Buffer : void 0;
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
  var isBuffer2 = nativeIsBuffer || stubFalse2;
  module.exports = isBuffer2;
})(isBuffer$3, isBuffer$3.exports);
var isBufferExports = isBuffer$3.exports;
var baseGetTag$3 = _baseGetTag, getPrototype$1 = _getPrototype, isObjectLike$4 = isObjectLike_1;
var objectTag$3 = "[object Object]";
var funcProto = Function.prototype, objectProto$6 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function isPlainObject$1(value) {
  if (!isObjectLike$4(value) || baseGetTag$3(value) != objectTag$3) {
    return false;
  }
  var proto = getPrototype$1(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$5.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
var isPlainObject_1 = isPlainObject$1;
var baseGetTag$2 = _baseGetTag, isLength = isLength_1, isObjectLike$3 = isObjectLike_1;
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$2 = "[object Boolean]", dateTag$2 = "[object Date]", errorTag$1 = "[object Error]", funcTag$1 = "[object Function]", mapTag$4 = "[object Map]", numberTag$2 = "[object Number]", objectTag$2 = "[object Object]", regexpTag$2 = "[object RegExp]", setTag$4 = "[object Set]", stringTag$2 = "[object String]", weakMapTag$2 = "[object WeakMap]";
var arrayBufferTag$2 = "[object ArrayBuffer]", dataViewTag$3 = "[object DataView]", float32Tag$2 = "[object Float32Array]", float64Tag$2 = "[object Float64Array]", int8Tag$2 = "[object Int8Array]", int16Tag$2 = "[object Int16Array]", int32Tag$2 = "[object Int32Array]", uint8Tag$2 = "[object Uint8Array]", uint8ClampedTag$2 = "[object Uint8ClampedArray]", uint16Tag$2 = "[object Uint16Array]", uint32Tag$2 = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] = typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] = typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] = typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] = typedArrayTags[uint32Tag$2] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$2] = typedArrayTags[boolTag$2] = typedArrayTags[dataViewTag$3] = typedArrayTags[dateTag$2] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$4] = typedArrayTags[numberTag$2] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$2] = typedArrayTags[setTag$4] = typedArrayTags[stringTag$2] = typedArrayTags[weakMapTag$2] = false;
function baseIsTypedArray$1(value) {
  return isObjectLike$3(value) && isLength(value.length) && !!typedArrayTags[baseGetTag$2(value)];
}
var _baseIsTypedArray = baseIsTypedArray$1;
function baseUnary$4(func) {
  return function(value) {
    return func(value);
  };
}
var _baseUnary = baseUnary$4;
var _nodeUtil = { exports: {} };
_nodeUtil.exports;
(function(module, exports$1) {
  var freeGlobal2 = _freeGlobal;
  var freeExports = exports$1 && !exports$1.nodeType && exports$1;
  var freeModule = freeExports && true && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal2.process;
  var nodeUtil2 = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e2) {
    }
  }();
  module.exports = nodeUtil2;
})(_nodeUtil, _nodeUtil.exports);
var _nodeUtilExports = _nodeUtil.exports;
var baseIsTypedArray = _baseIsTypedArray, baseUnary$3 = _baseUnary, nodeUtil$2 = _nodeUtilExports;
var nodeIsTypedArray = nodeUtil$2 && nodeUtil$2.isTypedArray;
var isTypedArray$2 = nodeIsTypedArray ? baseUnary$3(nodeIsTypedArray) : baseIsTypedArray;
var isTypedArray_1 = isTypedArray$2;
function safeGet$2(object, key) {
  if (key === "constructor" && typeof object[key] === "function") {
    return;
  }
  if (key == "__proto__") {
    return;
  }
  return object[key];
}
var _safeGet = safeGet$2;
var baseAssignValue$1 = _baseAssignValue, eq$1 = eq_1;
var objectProto$5 = Object.prototype;
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
function assignValue$2(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$4.call(object, key) && eq$1(objValue, value)) || value === void 0 && !(key in object)) {
    baseAssignValue$1(object, key, value);
  }
}
var _assignValue = assignValue$2;
var assignValue$1 = _assignValue, baseAssignValue = _baseAssignValue;
function copyObject$5(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1, length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
    if (newValue === void 0) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue$1(object, key, newValue);
    }
  }
  return object;
}
var _copyObject = copyObject$5;
function baseTimes$1(n2, iteratee) {
  var index = -1, result = Array(n2);
  while (++index < n2) {
    result[index] = iteratee(index);
  }
  return result;
}
var _baseTimes = baseTimes$1;
var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex$2(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var _isIndex = isIndex$2;
var baseTimes = _baseTimes, isArguments$1 = isArguments_1, isArray$5 = isArray_1, isBuffer$2 = isBufferExports, isIndex$1 = _isIndex, isTypedArray$1 = isTypedArray_1;
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function arrayLikeKeys$2(value, inherited) {
  var isArr = isArray$5(value), isArg = !isArr && isArguments$1(value), isBuff = !isArr && !isArg && isBuffer$2(value), isType = !isArr && !isArg && !isBuff && isTypedArray$1(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$3.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex$1(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var _arrayLikeKeys = arrayLikeKeys$2;
function nativeKeysIn$1(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
var _nativeKeysIn = nativeKeysIn$1;
var isObject$5 = isObject_1, isPrototype$1 = _isPrototype, nativeKeysIn = _nativeKeysIn;
var objectProto$3 = Object.prototype;
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
function baseKeysIn$1(object) {
  if (!isObject$5(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype$1(object), result = [];
  for (var key in object) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty$2.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
var _baseKeysIn = baseKeysIn$1;
var arrayLikeKeys$1 = _arrayLikeKeys, baseKeysIn = _baseKeysIn, isArrayLike$3 = isArrayLike_1;
function keysIn$5(object) {
  return isArrayLike$3(object) ? arrayLikeKeys$1(object, true) : baseKeysIn(object);
}
var keysIn_1 = keysIn$5;
var copyObject$4 = _copyObject, keysIn$4 = keysIn_1;
function toPlainObject$1(value) {
  return copyObject$4(value, keysIn$4(value));
}
var toPlainObject_1 = toPlainObject$1;
var assignMergeValue$1 = _assignMergeValue, cloneBuffer$1 = _cloneBufferExports, cloneTypedArray$1 = _cloneTypedArray, copyArray$1 = _copyArray, initCloneObject$1 = _initCloneObject, isArguments = isArguments_1, isArray$4 = isArray_1, isArrayLikeObject$1 = isArrayLikeObject_1, isBuffer$1 = isBufferExports, isFunction = isFunction_1, isObject$4 = isObject_1, isPlainObject = isPlainObject_1, isTypedArray = isTypedArray_1, safeGet$1 = _safeGet, toPlainObject = toPlainObject_1;
function baseMergeDeep$1(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet$1(object, key), srcValue = safeGet$1(source, key), stacked = stack.get(srcValue);
  if (stacked) {
    assignMergeValue$1(object, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
  var isCommon = newValue === void 0;
  if (isCommon) {
    var isArr = isArray$4(srcValue), isBuff = !isArr && isBuffer$1(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray$4(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject$1(objValue)) {
        newValue = copyArray$1(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer$1(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray$1(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject$4(objValue) || isFunction(objValue)) {
        newValue = initCloneObject$1(srcValue);
      }
    } else {
      isCommon = false;
    }
  }
  if (isCommon) {
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack["delete"](srcValue);
  }
  assignMergeValue$1(object, key, newValue);
}
var _baseMergeDeep = baseMergeDeep$1;
var Stack$1 = _Stack, assignMergeValue = _assignMergeValue, baseFor$1 = _baseFor, baseMergeDeep = _baseMergeDeep, isObject$3 = isObject_1, keysIn$3 = keysIn_1, safeGet = _safeGet;
function baseMerge$1(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor$1(source, function(srcValue, key) {
    stack || (stack = new Stack$1());
    if (isObject$3(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge$1, customizer, stack);
    } else {
      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
      if (newValue === void 0) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn$3);
}
var _baseMerge = baseMerge$1;
function identity$3(value) {
  return value;
}
var identity_1 = identity$3;
function apply$1(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
var _apply = apply$1;
var apply = _apply;
var nativeMax = Math.max;
function overRest$1(func, start2, transform) {
  start2 = nativeMax(start2 === void 0 ? func.length - 1 : start2, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax(args.length - start2, 0), array = Array(length);
    while (++index < length) {
      array[index] = args[start2 + index];
    }
    index = -1;
    var otherArgs = Array(start2 + 1);
    while (++index < start2) {
      otherArgs[index] = args[index];
    }
    otherArgs[start2] = transform(array);
    return apply(func, this, otherArgs);
  };
}
var _overRest = overRest$1;
function constant$1(value) {
  return function() {
    return value;
  };
}
var constant_1 = constant$1;
var constant = constant_1, defineProperty = _defineProperty, identity$2 = identity_1;
var baseSetToString$1 = !defineProperty ? identity$2 : function(func, string) {
  return defineProperty(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant(string),
    "writable": true
  });
};
var _baseSetToString = baseSetToString$1;
var HOT_COUNT = 800, HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut$1(func) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(void 0, arguments);
  };
}
var _shortOut = shortOut$1;
var baseSetToString = _baseSetToString, shortOut = _shortOut;
var setToString$1 = shortOut(baseSetToString);
var _setToString = setToString$1;
var identity$1 = identity_1, overRest = _overRest, setToString = _setToString;
function baseRest$2(func, start2) {
  return setToString(overRest(func, start2, identity$1), func + "");
}
var _baseRest = baseRest$2;
var eq = eq_1, isArrayLike$2 = isArrayLike_1, isIndex = _isIndex, isObject$2 = isObject_1;
function isIterateeCall$1(value, index, object) {
  if (!isObject$2(object)) {
    return false;
  }
  var type = typeof index;
  if (type == "number" ? isArrayLike$2(object) && isIndex(index, object.length) : type == "string" && index in object) {
    return eq(object[index], value);
  }
  return false;
}
var _isIterateeCall = isIterateeCall$1;
var baseRest$1 = _baseRest, isIterateeCall = _isIterateeCall;
function createAssigner$1(assigner) {
  return baseRest$1(function(object, sources) {
    var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
    customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? void 0 : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}
var _createAssigner = createAssigner$1;
var baseMerge = _baseMerge, createAssigner = _createAssigner;
var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});
var mergeWith_1 = mergeWith;
var _mergeWith2 = /* @__PURE__ */ getDefaultExportFromCjs(mergeWith_1);
function arrayEach$2(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}
var _arrayEach = arrayEach$2;
var overArg = _overArg;
var nativeKeys$1 = overArg(Object.keys, Object);
var _nativeKeys = nativeKeys$1;
var isPrototype = _isPrototype, nativeKeys = _nativeKeys;
var objectProto$2 = Object.prototype;
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
function baseKeys$1(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$1.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
var _baseKeys = baseKeys$1;
var arrayLikeKeys = _arrayLikeKeys, baseKeys = _baseKeys, isArrayLike$1 = isArrayLike_1;
function keys$4(object) {
  return isArrayLike$1(object) ? arrayLikeKeys(object) : baseKeys(object);
}
var keys_1 = keys$4;
var baseFor = _baseFor, keys$3 = keys_1;
function baseForOwn$1(object, iteratee) {
  return object && baseFor(object, iteratee, keys$3);
}
var _baseForOwn = baseForOwn$1;
var isArrayLike = isArrayLike_1;
function createBaseEach$1(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}
var _createBaseEach = createBaseEach$1;
var baseForOwn = _baseForOwn, createBaseEach = _createBaseEach;
var baseEach$1 = createBaseEach(baseForOwn);
var _baseEach = baseEach$1;
var identity = identity_1;
function castFunction$1(value) {
  return typeof value == "function" ? value : identity;
}
var _castFunction = castFunction$1;
var arrayEach$1 = _arrayEach, baseEach = _baseEach, castFunction = _castFunction, isArray$3 = isArray_1;
function forEach(collection, iteratee) {
  var func = isArray$3(collection) ? arrayEach$1 : baseEach;
  return func(collection, castFunction(iteratee));
}
var forEach_1 = forEach;
var _forEach = /* @__PURE__ */ getDefaultExportFromCjs(forEach_1);
function allSettledButCanBreak(promises, shouldBreakWhileError) {
  return Promise.all(promises.map(function(promise, i2) {
    return promise.then(function(value) {
      return {
        status: "fulfilled",
        value
      };
    })["catch"](function(reason) {
      if (shouldBreakWhileError !== null && shouldBreakWhileError !== void 0 && shouldBreakWhileError(i2)) {
        throw reason;
      }
      return {
        status: "rejected",
        reason
      };
    });
  }));
}
function _arrayWithHoles(r2) {
  if (Array.isArray(r2)) return r2;
}
function _iterableToArrayLimit(r2, l2) {
  var t2 = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
  if (null != t2) {
    var e2, n2, i2, u2, a2 = [], f2 = true, o2 = false;
    try {
      if (i2 = (t2 = t2.call(r2)).next, 0 === l2) {
        if (Object(t2) !== t2) return;
        f2 = false;
      } else for (; !(f2 = (e2 = i2.call(t2)).done) && (a2.push(e2.value), a2.length !== l2); f2 = true) ;
    } catch (r3) {
      o2 = true, n2 = r3;
    } finally {
      try {
        if (!f2 && null != t2["return"] && (u2 = t2["return"](), Object(u2) !== u2)) return;
      } finally {
        if (o2) throw n2;
      }
    }
    return a2;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r2, e2) {
  return _arrayWithHoles(r2) || _iterableToArrayLimit(r2, e2) || _unsupportedIterableToArray(r2, e2) || _nonIterableRest();
}
var isIE11 = typeof navigator !== "undefined" && navigator.userAgent.indexOf("Trident") !== -1;
function shouldSkipProperty(global2, p2) {
  if (!global2.hasOwnProperty(p2) || !isNaN(p2) && p2 < global2.length) return true;
  if (isIE11) {
    try {
      return global2[p2] && typeof window !== "undefined" && global2[p2].parent === window;
    } catch (err) {
      return true;
    }
  } else {
    return false;
  }
}
var firstGlobalProp, secondGlobalProp, lastGlobalProp;
function getGlobalProp(global2) {
  var cnt = 0;
  var lastProp;
  var hasIframe = false;
  for (var p2 in global2) {
    if (shouldSkipProperty(global2, p2)) continue;
    for (var i2 = 0; i2 < window.frames.length && !hasIframe; i2++) {
      var frame = window.frames[i2];
      if (frame === global2[p2]) {
        hasIframe = true;
        break;
      }
    }
    if (!hasIframe && (cnt === 0 && p2 !== firstGlobalProp || cnt === 1 && p2 !== secondGlobalProp)) return p2;
    cnt++;
    lastProp = p2;
  }
  if (lastProp !== lastGlobalProp) return lastProp;
}
function noteGlobalProps(global2) {
  firstGlobalProp = secondGlobalProp = void 0;
  for (var p2 in global2) {
    if (shouldSkipProperty(global2, p2)) continue;
    if (!firstGlobalProp) firstGlobalProp = p2;
    else if (!secondGlobalProp) secondGlobalProp = p2;
    lastGlobalProp = p2;
  }
  return lastGlobalProp;
}
function getInlineCode(match) {
  var start2 = match.indexOf(">") + 1;
  var end = match.lastIndexOf("<");
  return match.substring(start2, end);
}
function defaultGetPublicPath(entry) {
  if (_typeof$1(entry) === "object") {
    return "/";
  }
  try {
    var _URL = new URL(entry, location.href), origin = _URL.origin, pathname = _URL.pathname;
    var paths = pathname.split("/");
    paths.pop();
    return "".concat(origin).concat(paths.join("/"), "/");
  } catch (e2) {
    console.warn(e2);
    return "";
  }
}
function isModuleScriptSupported() {
  var s2 = document.createElement("script");
  return "noModule" in s2;
}
var requestIdleCallback$1 = window.requestIdleCallback || function requestIdleCallback(cb) {
  var start2 = Date.now();
  return setTimeout(function() {
    cb({
      didTimeout: false,
      timeRemaining: function timeRemaining() {
        return Math.max(0, 50 - (Date.now() - start2));
      }
    });
  }, 1);
};
function readResAsString(response, autoDetectCharset) {
  if (!autoDetectCharset) {
    return response.text();
  }
  if (!response.headers) {
    return response.text();
  }
  var contentType = response.headers.get("Content-Type");
  if (!contentType) {
    return response.text();
  }
  var charset = "utf-8";
  var parts = contentType.split(";");
  if (parts.length === 2) {
    var _parts$1$split = parts[1].split("="), _parts$1$split2 = _slicedToArray(_parts$1$split, 2), value = _parts$1$split2[1];
    var encoding = value && value.trim();
    if (encoding) {
      charset = encoding;
    }
  }
  if (charset.toUpperCase() === "UTF-8") {
    return response.text();
  }
  return response.blob().then(function(file) {
    return new Promise(function(resolve, reject) {
      var reader = new window.FileReader();
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsText(file, charset);
    });
  });
}
var evalCache = {};
function evalCode(scriptSrc, code) {
  var key = scriptSrc;
  if (!evalCache[key]) {
    var functionWrappedCode = "(function(){".concat(code, "})");
    evalCache[key] = (0, eval)(functionWrappedCode);
  }
  var evalFunc = evalCache[key];
  evalFunc.call(window);
}
function parseUrl(url) {
  var parser = new DOMParser();
  var html = '<script src="'.concat(url, '"><\/script>');
  var doc = parser.parseFromString(html, "text/html");
  return doc.scripts[0].src;
}
var ALL_SCRIPT_REGEX = /(<script[\s\S]*?>)[\s\S]*?<\/script>/gi;
var SCRIPT_TAG_REGEX = /<(script)\s+((?!type=('|")text\/ng\x2Dtemplate\3)[\s\S])*?>[\s\S]*?<\/\1>/i;
var SCRIPT_SRC_REGEX = /.*\ssrc=('|")?([^>'"\s]+)/;
var SCRIPT_TYPE_REGEX = /.*\stype=('|")?([^>'"\s]+)/;
var SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;
var SCRIPT_ASYNC_REGEX = /.*\sasync\s*.*/;
var SCRIPT_CROSSORIGIN_REGEX = /.*\scrossorigin=('|")?use-credentials\1/;
var SCRIPT_NO_MODULE_REGEX = /.*\snomodule\s*.*/;
var SCRIPT_MODULE_REGEX = /.*\stype=('|")?module('|")?\s*.*/;
var LINK_TAG_REGEX = /<(link)\s+[\s\S]*?>/ig;
var LINK_PRELOAD_OR_PREFETCH_REGEX = /\srel=('|")?(preload|prefetch)\1/;
var LINK_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
var LINK_AS_FONT = /.*\sas=('|")?font\1.*/;
var STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;
var STYLE_TYPE_REGEX = /\s+rel=('|")?stylesheet\1.*/;
var STYLE_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
var HTML_COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
var LINK_IGNORE_REGEX = /<link(\s+|\s+[\s\S]+\s+)ignore(\s*|\s+[\s\S]*|=[\s\S]*)>/i;
var STYLE_IGNORE_REGEX = /<style(\s+|\s+[\s\S]+\s+)ignore(\s*|\s+[\s\S]*|=[\s\S]*)>/i;
var SCRIPT_IGNORE_REGEX = /<script(\s+|\s+[\s\S]+\s+)ignore(\s*|\s+[\s\S]*|=[\s\S]*)>/i;
function hasProtocol(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}
function getEntirePath(path, baseURI) {
  return new URL(path, baseURI).toString();
}
function isValidJavaScriptType(type) {
  var handleTypes = ["text/javascript", "module", "application/javascript", "text/ecmascript", "application/ecmascript"];
  return !type || handleTypes.indexOf(type) !== -1;
}
var genLinkReplaceSymbol = function genLinkReplaceSymbol2(linkHref) {
  var preloadOrPrefetch = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  return "<!-- ".concat(preloadOrPrefetch ? "prefetch/preload" : "", " link ").concat(linkHref, " replaced by import-html-entry -->");
};
var genScriptReplaceSymbol = function genScriptReplaceSymbol2(scriptSrc) {
  var async = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  var crossOrigin = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
  return "<!-- ".concat(crossOrigin ? "cors" : "", " ").concat(async ? "async" : "", " script ").concat(scriptSrc, " replaced by import-html-entry -->");
};
var inlineScriptReplaceSymbol = "<!-- inline scripts replaced by import-html-entry -->";
var genIgnoreAssetReplaceSymbol = function genIgnoreAssetReplaceSymbol2(url) {
  return "<!-- ignore asset ".concat(url || "file", " replaced by import-html-entry -->");
};
var genModuleScriptReplaceSymbol = function genModuleScriptReplaceSymbol2(scriptSrc, moduleSupport) {
  return "<!-- ".concat(moduleSupport ? "nomodule" : "module", " script ").concat(scriptSrc, " ignored by import-html-entry -->");
};
function processTpl(tpl, baseURI, postProcessTemplate) {
  var scripts = [];
  var styles = [];
  var entry = null;
  var moduleSupport = isModuleScriptSupported();
  var template = tpl.replace(HTML_COMMENT_REGEX, "").replace(LINK_TAG_REGEX, function(match) {
    var styleType = !!match.match(STYLE_TYPE_REGEX);
    if (styleType) {
      var styleHref = match.match(STYLE_HREF_REGEX);
      var styleIgnore = match.match(LINK_IGNORE_REGEX);
      if (styleHref) {
        var href = styleHref && styleHref[2];
        var newHref = href;
        if (href && !hasProtocol(href)) {
          newHref = getEntirePath(href, baseURI);
        }
        if (styleIgnore) {
          return genIgnoreAssetReplaceSymbol(newHref);
        }
        newHref = parseUrl(newHref);
        styles.push(newHref);
        return genLinkReplaceSymbol(newHref);
      }
    }
    var preloadOrPrefetchType = match.match(LINK_PRELOAD_OR_PREFETCH_REGEX) && match.match(LINK_HREF_REGEX) && !match.match(LINK_AS_FONT);
    if (preloadOrPrefetchType) {
      var _match$match = match.match(LINK_HREF_REGEX), _match$match2 = _slicedToArray(_match$match, 3), linkHref = _match$match2[2];
      return genLinkReplaceSymbol(linkHref, true);
    }
    return match;
  }).replace(STYLE_TAG_REGEX, function(match) {
    if (STYLE_IGNORE_REGEX.test(match)) {
      return genIgnoreAssetReplaceSymbol("style file");
    }
    return match;
  }).replace(ALL_SCRIPT_REGEX, function(match, scriptTag) {
    var scriptIgnore = scriptTag.match(SCRIPT_IGNORE_REGEX);
    var moduleScriptIgnore = moduleSupport && !!scriptTag.match(SCRIPT_NO_MODULE_REGEX) || !moduleSupport && !!scriptTag.match(SCRIPT_MODULE_REGEX);
    var matchedScriptTypeMatch = scriptTag.match(SCRIPT_TYPE_REGEX);
    var matchedScriptType = matchedScriptTypeMatch && matchedScriptTypeMatch[2];
    if (!isValidJavaScriptType(matchedScriptType)) {
      return match;
    }
    if (SCRIPT_TAG_REGEX.test(match) && scriptTag.match(SCRIPT_SRC_REGEX)) {
      var matchedScriptEntry = scriptTag.match(SCRIPT_ENTRY_REGEX);
      var matchedScriptSrcMatch = scriptTag.match(SCRIPT_SRC_REGEX);
      var matchedScriptSrc = matchedScriptSrcMatch && matchedScriptSrcMatch[2];
      if (entry && matchedScriptEntry) {
        throw new SyntaxError("You should not set multiply entry script!");
      }
      if (matchedScriptSrc) {
        if (!hasProtocol(matchedScriptSrc)) {
          matchedScriptSrc = getEntirePath(matchedScriptSrc, baseURI);
        }
        matchedScriptSrc = parseUrl(matchedScriptSrc);
      }
      entry = entry || matchedScriptEntry && matchedScriptSrc;
      if (scriptIgnore) {
        return genIgnoreAssetReplaceSymbol(matchedScriptSrc || "js file");
      }
      if (moduleScriptIgnore) {
        return genModuleScriptReplaceSymbol(matchedScriptSrc || "js file", moduleSupport);
      }
      if (matchedScriptSrc) {
        var asyncScript = !!scriptTag.match(SCRIPT_ASYNC_REGEX);
        var crossOriginScript = !!scriptTag.match(SCRIPT_CROSSORIGIN_REGEX);
        scripts.push(asyncScript || crossOriginScript ? {
          async: asyncScript,
          src: matchedScriptSrc,
          crossOrigin: crossOriginScript
        } : matchedScriptSrc);
        return genScriptReplaceSymbol(matchedScriptSrc, asyncScript, crossOriginScript);
      }
      return match;
    } else {
      if (scriptIgnore) {
        return genIgnoreAssetReplaceSymbol("js file");
      }
      if (moduleScriptIgnore) {
        return genModuleScriptReplaceSymbol("js file", moduleSupport);
      }
      var code = getInlineCode(match);
      var isPureCommentBlock = code.split(/[\r\n]+/).every(function(line) {
        return !line.trim() || line.trim().startsWith("//");
      });
      if (!isPureCommentBlock) {
        scripts.push(match);
      }
      return inlineScriptReplaceSymbol;
    }
  });
  scripts = scripts.filter(function(script) {
    return !!script;
  });
  var tplResult = {
    template,
    scripts,
    styles,
    // set the last script as entry if have not set
    entry: entry || scripts[scripts.length - 1]
  };
  if (typeof postProcessTemplate === "function") {
    tplResult = postProcessTemplate(tplResult);
  }
  return tplResult;
}
function ownKeys(object, enumerableOnly) {
  var keys2 = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys2.push.apply(keys2, symbols);
  }
  return keys2;
}
function _objectSpread(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = null != arguments[i2] ? arguments[i2] : {};
    i2 % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty$1(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
var styleCache = {};
var scriptCache = {};
var embedHTMLCache = {};
if (!window.fetch) {
  throw new Error('[import-html-entry] Here is no "fetch" on the window env, you need to polyfill it');
}
var defaultFetch = window.fetch.bind(window);
function defaultGetTemplate(tpl) {
  return tpl;
}
function getEmbedHTML(template, styles) {
  var opts = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  var _opts$fetch = opts.fetch, fetch2 = _opts$fetch === void 0 ? defaultFetch : _opts$fetch;
  var embedHTML = template;
  return _getExternalStyleSheets(styles, fetch2).then(function(styleSheets) {
    embedHTML = styleSheets.reduce(function(html, styleSheet) {
      var styleSrc = styleSheet.src;
      var styleSheetContent = styleSheet.value;
      html = html.replace(genLinkReplaceSymbol(styleSrc), isInlineCode(styleSrc) ? "".concat(styleSrc) : "<style>/* ".concat(styleSrc, " */").concat(styleSheetContent, "</style>"));
      return html;
    }, embedHTML);
    return embedHTML;
  });
}
var isInlineCode = function isInlineCode2(code) {
  return code.startsWith("<");
};
function getExecutableScript(scriptSrc, scriptText) {
  var opts = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  var proxy = opts.proxy, strictGlobal = opts.strictGlobal, _opts$scopedGlobalVar = opts.scopedGlobalVariables, scopedGlobalVariables = _opts$scopedGlobalVar === void 0 ? [] : _opts$scopedGlobalVar;
  var sourceUrl = isInlineCode(scriptSrc) ? "" : "//# sourceURL=".concat(scriptSrc, "\n");
  var scopedGlobalVariableDefinition = scopedGlobalVariables.length ? "const {".concat(scopedGlobalVariables.join(","), "}=this;") : "";
  var globalWindow = (0, eval)("window");
  globalWindow.proxy = proxy;
  return strictGlobal ? scopedGlobalVariableDefinition ? ";(function(){with(this){".concat(scopedGlobalVariableDefinition).concat(scriptText, "\n").concat(sourceUrl, "}}).bind(window.proxy)();") : ";(function(window, self, globalThis){with(window){;".concat(scriptText, "\n").concat(sourceUrl, "}}).bind(window.proxy)(window.proxy, window.proxy, window.proxy);") : ";(function(window, self, globalThis){;".concat(scriptText, "\n").concat(sourceUrl, "}).bind(window.proxy)(window.proxy, window.proxy, window.proxy);");
}
function _getExternalStyleSheets(styles) {
  var fetch2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : defaultFetch;
  return allSettledButCanBreak(styles.map(/* @__PURE__ */ function() {
    var _ref = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee(styleLink) {
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (!isInlineCode(styleLink)) {
              _context.next = 4;
              break;
            }
            return _context.abrupt("return", getInlineCode(styleLink));
          case 4:
            return _context.abrupt("return", styleCache[styleLink] || (styleCache[styleLink] = fetch2(styleLink).then(function(response) {
              if (response.status >= 400) {
                throw new Error("".concat(styleLink, " load failed with status ").concat(response.status));
              }
              return response.text();
            })["catch"](function(e2) {
              try {
                if (e2.message.indexOf(styleLink) === -1) {
                  e2.message = "".concat(styleLink, " ").concat(e2.message);
                }
              } catch (_2) {
              }
              throw e2;
            })));
          case 5:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function(_x) {
      return _ref.apply(this, arguments);
    };
  }())).then(function(results) {
    return results.map(function(result, i2) {
      if (result.status === "fulfilled") {
        result.value = {
          src: styles[i2],
          value: result.value
        };
      }
      return result;
    }).filter(function(result) {
      if (result.status === "rejected") {
        Promise.reject(result.reason);
      }
      return result.status === "fulfilled";
    }).map(function(result) {
      return result.value;
    });
  });
}
function _getExternalScripts(scripts) {
  var fetch2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : defaultFetch;
  var entry = arguments.length > 2 ? arguments[2] : void 0;
  var fetchScript = function fetchScript2(scriptUrl, opts) {
    return scriptCache[scriptUrl] || (scriptCache[scriptUrl] = fetch2(scriptUrl, opts).then(function(response) {
      if (response.status >= 400) {
        throw new Error("".concat(scriptUrl, " load failed with status ").concat(response.status));
      }
      return response.text();
    })["catch"](function(e2) {
      try {
        if (e2.message.indexOf(scriptUrl) === -1) {
          e2.message = "".concat(scriptUrl, " ").concat(e2.message);
        }
      } catch (_2) {
      }
      throw e2;
    }));
  };
  var shouldBreakWhileError = function shouldBreakWhileError2(i2) {
    return scripts[i2] === entry;
  };
  return allSettledButCanBreak(scripts.map(/* @__PURE__ */ function() {
    var _ref2 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee2(script) {
      var src, async, crossOrigin, fetchOpts;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            if (!(typeof script === "string")) {
              _context2.next = 8;
              break;
            }
            if (!isInlineCode(script)) {
              _context2.next = 5;
              break;
            }
            return _context2.abrupt("return", getInlineCode(script));
          case 5:
            return _context2.abrupt("return", fetchScript(script));
          case 6:
            _context2.next = 13;
            break;
          case 8:
            src = script.src, async = script.async, crossOrigin = script.crossOrigin;
            fetchOpts = crossOrigin ? {
              credentials: "include"
            } : {};
            if (!async) {
              _context2.next = 12;
              break;
            }
            return _context2.abrupt("return", {
              src,
              async: true,
              content: new Promise(function(resolve, reject) {
                return requestIdleCallback$1(function() {
                  return fetchScript(src, fetchOpts).then(resolve, reject);
                });
              })
            });
          case 12:
            return _context2.abrupt("return", fetchScript(src, fetchOpts));
          case 13:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function(_x2) {
      return _ref2.apply(this, arguments);
    };
  }()), shouldBreakWhileError).then(function(results) {
    return results.map(function(result, i2) {
      if (result.status === "fulfilled") {
        result.value = {
          src: scripts[i2],
          value: result.value
        };
      }
      return result;
    }).filter(function(result) {
      if (result.status === "rejected") {
        Promise.reject(result.reason);
      }
      return result.status === "fulfilled";
    }).map(function(result) {
      return result.value;
    });
  });
}
function throwNonBlockingError(error, msg) {
  setTimeout(function() {
    console.error(msg);
    throw error;
  });
}
function _execScripts(entry, scripts) {
  var proxy = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : window;
  var opts = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
  var _opts$fetch2 = opts.fetch, fetch2 = _opts$fetch2 === void 0 ? defaultFetch : _opts$fetch2, _opts$strictGlobal = opts.strictGlobal, strictGlobal = _opts$strictGlobal === void 0 ? false : _opts$strictGlobal, success = opts.success, _opts$error = opts.error, error = _opts$error === void 0 ? function() {
  } : _opts$error, _opts$beforeExec = opts.beforeExec, beforeExec = _opts$beforeExec === void 0 ? function() {
  } : _opts$beforeExec, _opts$afterExec = opts.afterExec, afterExec = _opts$afterExec === void 0 ? function() {
  } : _opts$afterExec, _opts$scopedGlobalVar2 = opts.scopedGlobalVariables, scopedGlobalVariables = _opts$scopedGlobalVar2 === void 0 ? [] : _opts$scopedGlobalVar2;
  return _getExternalScripts(scripts, fetch2, entry).then(function(scriptsText) {
    var geval = function geval2(scriptSrc, inlineScript) {
      var rawCode = beforeExec(inlineScript, scriptSrc) || inlineScript;
      var code = getExecutableScript(scriptSrc, rawCode, {
        proxy,
        strictGlobal,
        scopedGlobalVariables
      });
      evalCode(scriptSrc, code);
      afterExec(inlineScript, scriptSrc);
    };
    function exec(scriptSrc, inlineScript, resolve) {
      if (scriptSrc === entry) {
        noteGlobalProps(strictGlobal ? proxy : window);
        try {
          geval(scriptSrc, inlineScript);
          var exports$1 = proxy[getGlobalProp(strictGlobal ? proxy : window)] || {};
          resolve(exports$1);
        } catch (e2) {
          console.error("[import-html-entry]: error occurs while executing entry script ".concat(scriptSrc));
          throw e2;
        }
      } else {
        if (typeof inlineScript === "string") {
          try {
            if (scriptSrc !== null && scriptSrc !== void 0 && scriptSrc.src) {
              geval(scriptSrc.src, inlineScript);
            } else {
              geval(scriptSrc, inlineScript);
            }
          } catch (e2) {
            throwNonBlockingError(e2, "[import-html-entry]: error occurs while executing normal script ".concat(scriptSrc));
          }
        } else {
          inlineScript.async && (inlineScript === null || inlineScript === void 0 ? void 0 : inlineScript.content.then(function(downloadedScriptText) {
            return geval(inlineScript.src, downloadedScriptText);
          })["catch"](function(e2) {
            throwNonBlockingError(e2, "[import-html-entry]: error occurs while executing async script ".concat(inlineScript.src));
          }));
        }
      }
    }
    function schedule(i2, resolvePromise) {
      if (i2 < scriptsText.length) {
        var script = scriptsText[i2];
        var scriptSrc = script.src;
        var inlineScript = script.value;
        exec(scriptSrc, inlineScript, resolvePromise);
        if (!entry && i2 === scriptsText.length - 1) {
          resolvePromise();
        } else {
          schedule(i2 + 1, resolvePromise);
        }
      }
    }
    return new Promise(function(resolve) {
      return schedule(0, success || resolve);
    });
  })["catch"](function(e2) {
    error();
    throw e2;
  });
}
function importHTML(url) {
  var opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var fetch2 = defaultFetch;
  var autoDecodeResponse = false;
  var getPublicPath = defaultGetPublicPath;
  var getTemplate = defaultGetTemplate;
  var postProcessTemplate = opts.postProcessTemplate;
  if (typeof opts === "function") {
    fetch2 = opts;
  } else {
    if (opts.fetch) {
      if (typeof opts.fetch === "function") {
        fetch2 = opts.fetch;
      } else {
        fetch2 = opts.fetch.fn || defaultFetch;
        autoDecodeResponse = !!opts.fetch.autoDecodeResponse;
      }
    }
    getPublicPath = opts.getPublicPath || opts.getDomain || defaultGetPublicPath;
    getTemplate = opts.getTemplate || defaultGetTemplate;
  }
  return embedHTMLCache[url] || (embedHTMLCache[url] = fetch2(url).then(function(response) {
    return readResAsString(response, autoDecodeResponse);
  }).then(function(html) {
    var assetPublicPath = getPublicPath(url);
    var _processTpl = processTpl(getTemplate(html), assetPublicPath, postProcessTemplate), template = _processTpl.template, scripts = _processTpl.scripts, entry = _processTpl.entry, styles = _processTpl.styles;
    return getEmbedHTML(template, styles, {
      fetch: fetch2
    }).then(function(embedHTML) {
      return {
        template: embedHTML,
        assetPublicPath,
        getExternalScripts: function getExternalScripts() {
          return _getExternalScripts(scripts, fetch2);
        },
        getExternalStyleSheets: function getExternalStyleSheets() {
          return _getExternalStyleSheets(styles, fetch2);
        },
        execScripts: function execScripts(proxy, strictGlobal) {
          var opts2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          if (!scripts.length) {
            return Promise.resolve();
          }
          return _execScripts(entry, scripts, proxy, _objectSpread({
            fetch: fetch2,
            strictGlobal
          }, opts2));
        }
      };
    });
  }));
}
function importEntry(entry) {
  var opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var _opts$fetch3 = opts.fetch, fetch2 = _opts$fetch3 === void 0 ? defaultFetch : _opts$fetch3, _opts$getTemplate = opts.getTemplate, getTemplate = _opts$getTemplate === void 0 ? defaultGetTemplate : _opts$getTemplate, postProcessTemplate = opts.postProcessTemplate;
  var getPublicPath = opts.getPublicPath || opts.getDomain || defaultGetPublicPath;
  if (!entry) {
    throw new SyntaxError("entry should not be empty!");
  }
  if (typeof entry === "string") {
    return importHTML(entry, {
      fetch: fetch2,
      getPublicPath,
      getTemplate,
      postProcessTemplate
    });
  }
  if (Array.isArray(entry.scripts) || Array.isArray(entry.styles)) {
    var _entry$scripts = entry.scripts, scripts = _entry$scripts === void 0 ? [] : _entry$scripts, _entry$styles = entry.styles, styles = _entry$styles === void 0 ? [] : _entry$styles, _entry$html = entry.html, html = _entry$html === void 0 ? "" : _entry$html;
    var getHTMLWithStylePlaceholder = function getHTMLWithStylePlaceholder2(tpl) {
      return styles.reduceRight(function(html2, styleSrc) {
        return "".concat(genLinkReplaceSymbol(styleSrc)).concat(html2);
      }, tpl);
    };
    var getHTMLWithScriptPlaceholder = function getHTMLWithScriptPlaceholder2(tpl) {
      return scripts.reduce(function(html2, scriptSrc) {
        return "".concat(html2).concat(genScriptReplaceSymbol(scriptSrc));
      }, tpl);
    };
    return getEmbedHTML(getTemplate(getHTMLWithScriptPlaceholder(getHTMLWithStylePlaceholder(html))), styles, {
      fetch: fetch2
    }).then(function(embedHTML) {
      return {
        template: embedHTML,
        assetPublicPath: getPublicPath(entry),
        getExternalScripts: function getExternalScripts() {
          return _getExternalScripts(scripts, fetch2);
        },
        getExternalStyleSheets: function getExternalStyleSheets() {
          return _getExternalStyleSheets(styles, fetch2);
        },
        execScripts: function execScripts(proxy, strictGlobal) {
          var opts2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          if (!scripts.length) {
            return Promise.resolve();
          }
          return _execScripts(scripts[scripts.length - 1], scripts, proxy, _objectSpread({
            fetch: fetch2,
            strictGlobal
          }, opts2));
        }
      };
    });
  } else {
    throw new SyntaxError("entry scripts or styles should be array!");
  }
}
function getAddOn$1(global2) {
  return {
    beforeLoad: function beforeLoad() {
      return _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              global2.__POWERED_BY_QIANKUN__ = true;
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }))();
    },
    beforeMount: function beforeMount() {
      return _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              global2.__POWERED_BY_QIANKUN__ = true;
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }))();
    },
    beforeUnmount: function beforeUnmount() {
      return _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee3() {
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              delete global2.__POWERED_BY_QIANKUN__;
            case 1:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }))();
    }
  };
}
var rawPublicPath = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
function getAddOn(global2) {
  var publicPath = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "/";
  var hasMountedOnce = false;
  return {
    beforeLoad: function beforeLoad() {
      return _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              global2.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = publicPath;
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }))();
    },
    beforeMount: function beforeMount() {
      return _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (hasMountedOnce) {
                global2.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = publicPath;
              }
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }))();
    },
    beforeUnmount: function beforeUnmount() {
      return _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee3() {
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (rawPublicPath === void 0) {
                delete global2.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
              } else {
                global2.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = rawPublicPath;
              }
              hasMountedOnce = true;
            case 2:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }))();
    }
  };
}
function getAddOns(global2, publicPath) {
  return _mergeWith2({}, getAddOn$1(global2), getAddOn(global2, publicPath), function(v1, v2) {
    return _concat(v1 !== null && v1 !== void 0 ? v1 : [], v2 !== null && v2 !== void 0 ? v2 : []);
  });
}
function _defineProperties(e2, r2) {
  for (var t2 = 0; t2 < r2.length; t2++) {
    var o2 = r2[t2];
    o2.enumerable = o2.enumerable || false, o2.configurable = true, "value" in o2 && (o2.writable = true), Object.defineProperty(e2, toPropertyKey(o2.key), o2);
  }
}
function _createClass(e2, r2, t2) {
  return r2 && _defineProperties(e2.prototype, r2), Object.defineProperty(e2, "prototype", {
    writable: false
  }), e2;
}
function _classCallCheck(a2, n2) {
  if (!(a2 instanceof n2)) throw new TypeError("Cannot call a class as a function");
}
function _setPrototypeOf(t2, e2) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t3, e3) {
    return t3.__proto__ = e3, t3;
  }, _setPrototypeOf(t2, e2);
}
function _inherits(t2, e2) {
  if ("function" != typeof e2 && null !== e2) throw new TypeError("Super expression must either be null or a function");
  t2.prototype = Object.create(e2 && e2.prototype, {
    constructor: {
      value: t2,
      writable: true,
      configurable: true
    }
  }), Object.defineProperty(t2, "prototype", {
    writable: false
  }), e2 && _setPrototypeOf(t2, e2);
}
function _getPrototypeOf(t2) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t3) {
    return t3.__proto__ || Object.getPrototypeOf(t3);
  }, _getPrototypeOf(t2);
}
function _isNativeReflectConstruct() {
  try {
    var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t3) {
  }
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
    return !!t2;
  })();
}
function _assertThisInitialized(e2) {
  if (void 0 === e2) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e2;
}
function _possibleConstructorReturn(t2, e2) {
  if (e2 && ("object" == _typeof$1(e2) || "function" == typeof e2)) return e2;
  if (void 0 !== e2) throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t2);
}
function _createSuper(t2) {
  var r2 = _isNativeReflectConstruct();
  return function() {
    var e2, o2 = _getPrototypeOf(t2);
    if (r2) {
      var s2 = _getPrototypeOf(this).constructor;
      e2 = Reflect.construct(o2, arguments, s2);
    } else e2 = o2.apply(this, arguments);
    return _possibleConstructorReturn(this, e2);
  };
}
function _isNativeFunction(t2) {
  try {
    return -1 !== Function.toString.call(t2).indexOf("[native code]");
  } catch (n2) {
    return "function" == typeof t2;
  }
}
function _construct(t2, e2, r2) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o2 = [null];
  o2.push.apply(o2, e2);
  var p2 = new (t2.bind.apply(t2, o2))();
  return r2 && _setPrototypeOf(p2, r2.prototype), p2;
}
function _wrapNativeSuper(t2) {
  var r2 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
  return _wrapNativeSuper = function _wrapNativeSuper2(t3) {
    if (null === t3 || !_isNativeFunction(t3)) return t3;
    if ("function" != typeof t3) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== r2) {
      if (r2.has(t3)) return r2.get(t3);
      r2.set(t3, Wrapper);
    }
    function Wrapper() {
      return _construct(t3, arguments, _getPrototypeOf(this).constructor);
    }
    return Wrapper.prototype = Object.create(t3.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    }), _setPrototypeOf(Wrapper, t3);
  }, _wrapNativeSuper(t2);
}
var QiankunError = /* @__PURE__ */ function(_Error) {
  _inherits(QiankunError2, _Error);
  var _super = _createSuper(QiankunError2);
  function QiankunError2(message) {
    _classCallCheck(this, QiankunError2);
    return _super.call(this, "[qiankun]: ".concat(message));
  }
  return _createClass(QiankunError2);
}(/* @__PURE__ */ _wrapNativeSuper(Error));
var copyObject$3 = _copyObject, keys$2 = keys_1;
function baseAssign$1(object, source) {
  return object && copyObject$3(source, keys$2(source), object);
}
var _baseAssign = baseAssign$1;
var copyObject$2 = _copyObject, keysIn$2 = keysIn_1;
function baseAssignIn$1(object, source) {
  return object && copyObject$2(source, keysIn$2(source), object);
}
var _baseAssignIn = baseAssignIn$1;
function arrayFilter$1(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var _arrayFilter = arrayFilter$1;
function stubArray$2() {
  return [];
}
var stubArray_1 = stubArray$2;
var arrayFilter = _arrayFilter, stubArray$1 = stubArray_1;
var objectProto$1 = Object.prototype;
var propertyIsEnumerable = objectProto$1.propertyIsEnumerable;
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;
var getSymbols$3 = !nativeGetSymbols$1 ? stubArray$1 : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols$1(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
var _getSymbols = getSymbols$3;
var copyObject$1 = _copyObject, getSymbols$2 = _getSymbols;
function copySymbols$1(source, object) {
  return copyObject$1(source, getSymbols$2(source), object);
}
var _copySymbols = copySymbols$1;
var arrayPush$1 = _arrayPush, getPrototype = _getPrototype, getSymbols$1 = _getSymbols, stubArray = stubArray_1;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbolsIn$2 = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush$1(result, getSymbols$1(object));
    object = getPrototype(object);
  }
  return result;
};
var _getSymbolsIn = getSymbolsIn$2;
var copyObject = _copyObject, getSymbolsIn$1 = _getSymbolsIn;
function copySymbolsIn$1(source, object) {
  return copyObject(source, getSymbolsIn$1(source), object);
}
var _copySymbolsIn = copySymbolsIn$1;
var arrayPush = _arrayPush, isArray$2 = isArray_1;
function baseGetAllKeys$2(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$2(object) ? result : arrayPush(result, symbolsFunc(object));
}
var _baseGetAllKeys = baseGetAllKeys$2;
var baseGetAllKeys$1 = _baseGetAllKeys, getSymbols = _getSymbols, keys$1 = keys_1;
function getAllKeys$1(object) {
  return baseGetAllKeys$1(object, keys$1, getSymbols);
}
var _getAllKeys = getAllKeys$1;
var baseGetAllKeys = _baseGetAllKeys, getSymbolsIn = _getSymbolsIn, keysIn$1 = keysIn_1;
function getAllKeysIn$1(object) {
  return baseGetAllKeys(object, keysIn$1, getSymbolsIn);
}
var _getAllKeysIn = getAllKeysIn$1;
var getNative$3 = _getNative, root$3 = _root;
var DataView$1 = getNative$3(root$3, "DataView");
var _DataView = DataView$1;
var getNative$2 = _getNative, root$2 = _root;
var Promise$2 = getNative$2(root$2, "Promise");
var _Promise = Promise$2;
var getNative$1 = _getNative, root$1 = _root;
var Set$2 = getNative$1(root$1, "Set");
var _Set = Set$2;
var getNative = _getNative, root = _root;
var WeakMap$2 = getNative(root, "WeakMap");
var _WeakMap = WeakMap$2;
var DataView = _DataView, Map$1 = _Map, Promise$1 = _Promise, Set$1 = _Set, WeakMap$1 = _WeakMap, baseGetTag$1 = _baseGetTag, toSource = _toSource;
var mapTag$3 = "[object Map]", objectTag$1 = "[object Object]", promiseTag = "[object Promise]", setTag$3 = "[object Set]", weakMapTag$1 = "[object WeakMap]";
var dataViewTag$2 = "[object DataView]";
var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set$1), weakMapCtorString = toSource(WeakMap$1);
var getTag$3 = baseGetTag$1;
if (DataView && getTag$3(new DataView(new ArrayBuffer(1))) != dataViewTag$2 || Map$1 && getTag$3(new Map$1()) != mapTag$3 || Promise$1 && getTag$3(Promise$1.resolve()) != promiseTag || Set$1 && getTag$3(new Set$1()) != setTag$3 || WeakMap$1 && getTag$3(new WeakMap$1()) != weakMapTag$1) {
  getTag$3 = function(value) {
    var result = baseGetTag$1(value), Ctor = result == objectTag$1 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag$2;
        case mapCtorString:
          return mapTag$3;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag$3;
        case weakMapCtorString:
          return weakMapTag$1;
      }
    }
    return result;
  };
}
var _getTag = getTag$3;
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function initCloneArray$1(array) {
  var length = array.length, result = new array.constructor(length);
  if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}
var _initCloneArray = initCloneArray$1;
var cloneArrayBuffer$1 = _cloneArrayBuffer;
function cloneDataView$1(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer$1(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}
var _cloneDataView = cloneDataView$1;
var reFlags = /\w*$/;
function cloneRegExp$1(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}
var _cloneRegExp = cloneRegExp$1;
var Symbol$2 = _Symbol;
var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : void 0, symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : void 0;
function cloneSymbol$1(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}
var _cloneSymbol = cloneSymbol$1;
var cloneArrayBuffer = _cloneArrayBuffer, cloneDataView = _cloneDataView, cloneRegExp = _cloneRegExp, cloneSymbol = _cloneSymbol, cloneTypedArray = _cloneTypedArray;
var boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", mapTag$2 = "[object Map]", numberTag$1 = "[object Number]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", symbolTag$2 = "[object Symbol]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]", float32Tag$1 = "[object Float32Array]", float64Tag$1 = "[object Float64Array]", int8Tag$1 = "[object Int8Array]", int16Tag$1 = "[object Int16Array]", int32Tag$1 = "[object Int32Array]", uint8Tag$1 = "[object Uint8Array]", uint8ClampedTag$1 = "[object Uint8ClampedArray]", uint16Tag$1 = "[object Uint16Array]", uint32Tag$1 = "[object Uint32Array]";
function initCloneByTag$1(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$1:
      return cloneArrayBuffer(object);
    case boolTag$1:
    case dateTag$1:
      return new Ctor(+object);
    case dataViewTag$1:
      return cloneDataView(object, isDeep);
    case float32Tag$1:
    case float64Tag$1:
    case int8Tag$1:
    case int16Tag$1:
    case int32Tag$1:
    case uint8Tag$1:
    case uint8ClampedTag$1:
    case uint16Tag$1:
    case uint32Tag$1:
      return cloneTypedArray(object, isDeep);
    case mapTag$2:
      return new Ctor();
    case numberTag$1:
    case stringTag$1:
      return new Ctor(object);
    case regexpTag$1:
      return cloneRegExp(object);
    case setTag$2:
      return new Ctor();
    case symbolTag$2:
      return cloneSymbol(object);
  }
}
var _initCloneByTag = initCloneByTag$1;
var getTag$2 = _getTag, isObjectLike$2 = isObjectLike_1;
var mapTag$1 = "[object Map]";
function baseIsMap$1(value) {
  return isObjectLike$2(value) && getTag$2(value) == mapTag$1;
}
var _baseIsMap = baseIsMap$1;
var baseIsMap = _baseIsMap, baseUnary$2 = _baseUnary, nodeUtil$1 = _nodeUtilExports;
var nodeIsMap = nodeUtil$1 && nodeUtil$1.isMap;
var isMap$1 = nodeIsMap ? baseUnary$2(nodeIsMap) : baseIsMap;
var isMap_1 = isMap$1;
var getTag$1 = _getTag, isObjectLike$1 = isObjectLike_1;
var setTag$1 = "[object Set]";
function baseIsSet$1(value) {
  return isObjectLike$1(value) && getTag$1(value) == setTag$1;
}
var _baseIsSet = baseIsSet$1;
var baseIsSet = _baseIsSet, baseUnary$1 = _baseUnary, nodeUtil = _nodeUtilExports;
var nodeIsSet = nodeUtil && nodeUtil.isSet;
var isSet$1 = nodeIsSet ? baseUnary$1(nodeIsSet) : baseIsSet;
var isSet_1 = isSet$1;
var Stack = _Stack, arrayEach = _arrayEach, assignValue = _assignValue, baseAssign = _baseAssign, baseAssignIn = _baseAssignIn, cloneBuffer = _cloneBufferExports, copyArray = _copyArray, copySymbols = _copySymbols, copySymbolsIn = _copySymbolsIn, getAllKeys = _getAllKeys, getAllKeysIn = _getAllKeysIn, getTag = _getTag, initCloneArray = _initCloneArray, initCloneByTag = _initCloneByTag, initCloneObject = _initCloneObject, isArray$1 = isArray_1, isBuffer = isBufferExports, isMap = isMap_1, isObject$1 = isObject_1, isSet = isSet_1, keys = keys_1, keysIn = keysIn_1;
var CLONE_DEEP_FLAG$1 = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG$1 = 4;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag$1 = "[object Symbol]", weakMapTag = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag$1] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
function baseClone$1(value, bitmask, customizer, key, object, stack) {
  var result, isDeep = bitmask & CLONE_DEEP_FLAG$1, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG$1;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== void 0) {
    return result;
  }
  if (!isObject$1(value)) {
    return value;
  }
  var isArr = isArray$1(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || isFunc && !object) {
      result = isFlat || isFunc ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  stack || (stack = new Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);
  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone$1(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key2) {
      result.set(key2, baseClone$1(subValue, bitmask, customizer, key2, value, stack));
    });
  }
  var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
  var props = isArr ? void 0 : keysFunc(value);
  arrayEach(props || value, function(subValue, key2) {
    if (props) {
      key2 = subValue;
      subValue = value[key2];
    }
    assignValue(result, key2, baseClone$1(subValue, bitmask, customizer, key2, value, stack));
  });
  return result;
}
var _baseClone = baseClone$1;
var baseClone = _baseClone;
var CLONE_DEEP_FLAG = 1, CLONE_SYMBOLS_FLAG = 4;
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}
var cloneDeep_1 = cloneDeep;
var _cloneDeep = /* @__PURE__ */ getDefaultExportFromCjs(cloneDeep_1);
var globalState = {};
var deps = {};
function emitGlobal(state, prevState) {
  Object.keys(deps).forEach(function(id) {
    if (deps[id] instanceof Function) {
      deps[id](_cloneDeep(state), _cloneDeep(prevState));
    }
  });
}
function initGlobalState() {
  var state = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  if (state === globalState) {
    console.warn("[qiankun] state has not changed！");
  } else {
    var prevGlobalState = _cloneDeep(globalState);
    globalState = _cloneDeep(state);
    emitGlobal(globalState, prevGlobalState);
  }
  return getMicroAppStateActions("global-".concat(+/* @__PURE__ */ new Date()), true);
}
function getMicroAppStateActions(id, isMaster) {
  return {
    /**
     * onGlobalStateChange 全局依赖监听
     *
     * 收集 setState 时所需要触发的依赖
     *
     * 限制条件：每个子应用只有一个激活状态的全局监听，新监听覆盖旧监听，若只是监听部分属性，请使用 onGlobalStateChange
     *
     * 这么设计是为了减少全局监听滥用导致的内存爆炸
     *
     * 依赖数据结构为：
     * {
     *   {id}: callback
     * }
     *
     * @param callback
     * @param fireImmediately
     */
    onGlobalStateChange: function onGlobalStateChange(callback, fireImmediately) {
      if (!(callback instanceof Function)) {
        console.error("[qiankun] callback must be function!");
        return;
      }
      if (deps[id]) {
        console.warn("[qiankun] '".concat(id, "' global listener already exists before this, new listener will overwrite it."));
      }
      deps[id] = callback;
      if (fireImmediately) {
        var cloneState = _cloneDeep(globalState);
        callback(cloneState, cloneState);
      }
    },
    /**
     * setGlobalState 更新 store 数据
     *
     * 1. 对输入 state 的第一层属性做校验，只有初始化时声明过的第一层（bucket）属性才会被更改
     * 2. 修改 store 并触发全局监听
     *
     * @param state
     */
    setGlobalState: function setGlobalState() {
      var state = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (state === globalState) {
        console.warn("[qiankun] state has not changed！");
        return false;
      }
      var changeKeys = [];
      var prevGlobalState = _cloneDeep(globalState);
      globalState = _cloneDeep(Object.keys(state).reduce(function(_globalState, changeKey) {
        if (isMaster || _globalState.hasOwnProperty(changeKey)) {
          changeKeys.push(changeKey);
          return Object.assign(_globalState, _defineProperty$1({}, changeKey, state[changeKey]));
        }
        console.warn("[qiankun] '".concat(changeKey, "' not declared when init state！"));
        return _globalState;
      }, globalState));
      if (changeKeys.length === 0) {
        console.warn("[qiankun] state has not changed！");
        return false;
      }
      emitGlobal(globalState, prevGlobalState);
      return true;
    },
    // 注销该应用下的依赖
    offGlobalStateChange: function offGlobalStateChange() {
      delete deps[id];
      return true;
    }
  };
}
var SandBoxType;
(function(SandBoxType2) {
  SandBoxType2["Proxy"] = "Proxy";
  SandBoxType2["Snapshot"] = "Snapshot";
  SandBoxType2["LegacyProxy"] = "LegacyProxy";
})(SandBoxType || (SandBoxType = {}));
var reWhitespace = /\s/;
function trimmedEndIndex$1(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {
  }
  return index;
}
var _trimmedEndIndex = trimmedEndIndex$1;
var trimmedEndIndex = _trimmedEndIndex;
var reTrimStart = /^\s+/;
function baseTrim$1(string) {
  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
var _baseTrim = baseTrim$1;
var baseGetTag = _baseGetTag, isObjectLike = isObjectLike_1;
var symbolTag = "[object Symbol]";
function isSymbol$2(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
}
var isSymbol_1 = isSymbol$2;
var baseTrim = _baseTrim, isObject = isObject_1, isSymbol$1 = isSymbol_1;
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber$1(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol$1(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var toNumber_1 = toNumber$1;
var toNumber = toNumber_1;
var INFINITY = 1 / 0, MAX_INTEGER = 17976931348623157e292;
function toFinite$1(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}
var toFinite_1 = toFinite$1;
var toFinite = toFinite_1;
function toInteger$1(value) {
  var result = toFinite(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
var toInteger_1 = toInteger$1;
var toInteger = toInteger_1;
var FUNC_ERROR_TEXT$1 = "Expected a function";
function before$1(n2, func) {
  var result;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  n2 = toInteger(n2);
  return function() {
    if (--n2 > 0) {
      result = func.apply(this, arguments);
    }
    if (n2 <= 1) {
      func = void 0;
    }
    return result;
  };
}
var before_1 = before$1;
var before = before_1;
function once(func) {
  return before(2, func);
}
var once_1 = once;
var _once = /* @__PURE__ */ getDefaultExportFromCjs(once_1);
function arrayReduce$1(array, iteratee, accumulator, initAccum) {
  var index = -1, length = array == null ? 0 : array.length;
  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}
var _arrayReduce = arrayReduce$1;
function basePropertyOf$1(object) {
  return function(key) {
    return object == null ? void 0 : object[key];
  };
}
var _basePropertyOf = basePropertyOf$1;
var basePropertyOf = _basePropertyOf;
var deburredLetters = {
  // Latin-1 Supplement block.
  "À": "A",
  "Á": "A",
  "Â": "A",
  "Ã": "A",
  "Ä": "A",
  "Å": "A",
  "à": "a",
  "á": "a",
  "â": "a",
  "ã": "a",
  "ä": "a",
  "å": "a",
  "Ç": "C",
  "ç": "c",
  "Ð": "D",
  "ð": "d",
  "È": "E",
  "É": "E",
  "Ê": "E",
  "Ë": "E",
  "è": "e",
  "é": "e",
  "ê": "e",
  "ë": "e",
  "Ì": "I",
  "Í": "I",
  "Î": "I",
  "Ï": "I",
  "ì": "i",
  "í": "i",
  "î": "i",
  "ï": "i",
  "Ñ": "N",
  "ñ": "n",
  "Ò": "O",
  "Ó": "O",
  "Ô": "O",
  "Õ": "O",
  "Ö": "O",
  "Ø": "O",
  "ò": "o",
  "ó": "o",
  "ô": "o",
  "õ": "o",
  "ö": "o",
  "ø": "o",
  "Ù": "U",
  "Ú": "U",
  "Û": "U",
  "Ü": "U",
  "ù": "u",
  "ú": "u",
  "û": "u",
  "ü": "u",
  "Ý": "Y",
  "ý": "y",
  "ÿ": "y",
  "Æ": "Ae",
  "æ": "ae",
  "Þ": "Th",
  "þ": "th",
  "ß": "ss",
  // Latin Extended-A block.
  "Ā": "A",
  "Ă": "A",
  "Ą": "A",
  "ā": "a",
  "ă": "a",
  "ą": "a",
  "Ć": "C",
  "Ĉ": "C",
  "Ċ": "C",
  "Č": "C",
  "ć": "c",
  "ĉ": "c",
  "ċ": "c",
  "č": "c",
  "Ď": "D",
  "Đ": "D",
  "ď": "d",
  "đ": "d",
  "Ē": "E",
  "Ĕ": "E",
  "Ė": "E",
  "Ę": "E",
  "Ě": "E",
  "ē": "e",
  "ĕ": "e",
  "ė": "e",
  "ę": "e",
  "ě": "e",
  "Ĝ": "G",
  "Ğ": "G",
  "Ġ": "G",
  "Ģ": "G",
  "ĝ": "g",
  "ğ": "g",
  "ġ": "g",
  "ģ": "g",
  "Ĥ": "H",
  "Ħ": "H",
  "ĥ": "h",
  "ħ": "h",
  "Ĩ": "I",
  "Ī": "I",
  "Ĭ": "I",
  "Į": "I",
  "İ": "I",
  "ĩ": "i",
  "ī": "i",
  "ĭ": "i",
  "į": "i",
  "ı": "i",
  "Ĵ": "J",
  "ĵ": "j",
  "Ķ": "K",
  "ķ": "k",
  "ĸ": "k",
  "Ĺ": "L",
  "Ļ": "L",
  "Ľ": "L",
  "Ŀ": "L",
  "Ł": "L",
  "ĺ": "l",
  "ļ": "l",
  "ľ": "l",
  "ŀ": "l",
  "ł": "l",
  "Ń": "N",
  "Ņ": "N",
  "Ň": "N",
  "Ŋ": "N",
  "ń": "n",
  "ņ": "n",
  "ň": "n",
  "ŋ": "n",
  "Ō": "O",
  "Ŏ": "O",
  "Ő": "O",
  "ō": "o",
  "ŏ": "o",
  "ő": "o",
  "Ŕ": "R",
  "Ŗ": "R",
  "Ř": "R",
  "ŕ": "r",
  "ŗ": "r",
  "ř": "r",
  "Ś": "S",
  "Ŝ": "S",
  "Ş": "S",
  "Š": "S",
  "ś": "s",
  "ŝ": "s",
  "ş": "s",
  "š": "s",
  "Ţ": "T",
  "Ť": "T",
  "Ŧ": "T",
  "ţ": "t",
  "ť": "t",
  "ŧ": "t",
  "Ũ": "U",
  "Ū": "U",
  "Ŭ": "U",
  "Ů": "U",
  "Ű": "U",
  "Ų": "U",
  "ũ": "u",
  "ū": "u",
  "ŭ": "u",
  "ů": "u",
  "ű": "u",
  "ų": "u",
  "Ŵ": "W",
  "ŵ": "w",
  "Ŷ": "Y",
  "ŷ": "y",
  "Ÿ": "Y",
  "Ź": "Z",
  "Ż": "Z",
  "Ž": "Z",
  "ź": "z",
  "ż": "z",
  "ž": "z",
  "Ĳ": "IJ",
  "ĳ": "ij",
  "Œ": "Oe",
  "œ": "oe",
  "ŉ": "'n",
  "ſ": "s"
};
var deburrLetter$1 = basePropertyOf(deburredLetters);
var _deburrLetter = deburrLetter$1;
function arrayMap$2(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
var _arrayMap = arrayMap$2;
var Symbol$1 = _Symbol, arrayMap$1 = _arrayMap, isArray = isArray_1, isSymbol = isSymbol_1;
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
function baseToString$1(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray(value)) {
    return arrayMap$1(value, baseToString$1) + "";
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -Infinity ? "-0" : result;
}
var _baseToString = baseToString$1;
var baseToString = _baseToString;
function toString$2(value) {
  return value == null ? "" : baseToString(value);
}
var toString_1 = toString$2;
var deburrLetter = _deburrLetter, toString$1 = toString_1;
var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
var rsComboMarksRange$1 = "\\u0300-\\u036f", reComboHalfMarksRange$1 = "\\ufe20-\\ufe2f", rsComboSymbolsRange$1 = "\\u20d0-\\u20ff", rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsCombo$1 = "[" + rsComboRange$1 + "]";
var reComboMark = RegExp(rsCombo$1, "g");
function deburr$1(string) {
  string = toString$1(string);
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
}
var deburr_1 = deburr$1;
var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
function asciiWords$1(string) {
  return string.match(reAsciiWord) || [];
}
var _asciiWords = asciiWords$1;
var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
function hasUnicodeWord$1(string) {
  return reHasUnicodeWord.test(string);
}
var _hasUnicodeWord = hasUnicodeWord$1;
var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
var rsApos$1 = "['’]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos$1 + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos$1 + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq;
var reUnicodeWord = RegExp([
  rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
  rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
  rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
  rsUpper + "+" + rsOptContrUpper,
  rsOrdUpper,
  rsOrdLower,
  rsDigits,
  rsEmoji
].join("|"), "g");
function unicodeWords$1(string) {
  return string.match(reUnicodeWord) || [];
}
var _unicodeWords = unicodeWords$1;
var asciiWords = _asciiWords, hasUnicodeWord = _hasUnicodeWord, toString = toString_1, unicodeWords = _unicodeWords;
function words$1(string, pattern, guard) {
  string = toString(string);
  pattern = guard ? void 0 : pattern;
  if (pattern === void 0) {
    return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
  }
  return string.match(pattern) || [];
}
var words_1 = words$1;
var arrayReduce = _arrayReduce, deburr = deburr_1, words = words_1;
var rsApos = "['’]";
var reApos = RegExp(rsApos, "g");
function createCompounder$1(callback) {
  return function(string) {
    return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
  };
}
var _createCompounder = createCompounder$1;
var createCompounder = _createCompounder;
var snakeCase = createCompounder(function(result, word, index) {
  return result + (index ? "_" : "") + word.toLowerCase();
});
var snakeCase_1 = snakeCase;
var _snakeCase = /* @__PURE__ */ getDefaultExportFromCjs(snakeCase_1);
var MapCache$1 = _MapCache;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache$1)();
  return memoized;
}
memoize.Cache = MapCache$1;
var memoize_1 = memoize;
var _memoize = /* @__PURE__ */ getDefaultExportFromCjs(memoize_1);
var version = "2.10.16";
function toArray(array) {
  return Array.isArray(array) ? array : [array];
}
var nextTick = typeof window.__zone_symbol__setTimeout === "function" ? window.__zone_symbol__setTimeout : function(cb) {
  return Promise.resolve().then(cb);
};
var globalTaskPending = false;
function nextTask(cb) {
  if (!globalTaskPending) {
    globalTaskPending = true;
    nextTick(function() {
      cb();
      globalTaskPending = false;
    });
  }
}
var fnRegexCheckCacheMap = /* @__PURE__ */ new WeakMap();
function isConstructable(fn) {
  var hasPrototypeMethods = fn.prototype && fn.prototype.constructor === fn && Object.getOwnPropertyNames(fn.prototype).length > 1;
  if (hasPrototypeMethods) return true;
  if (fnRegexCheckCacheMap.has(fn)) {
    return fnRegexCheckCacheMap.get(fn);
  }
  var constructable = hasPrototypeMethods;
  if (!constructable) {
    var fnString = fn.toString();
    var constructableFunctionRegex = /^function\b\s[A-Z].*/;
    var classRegex = /^class\b/;
    constructable = constructableFunctionRegex.test(fnString) || classRegex.test(fnString);
  }
  fnRegexCheckCacheMap.set(fn, constructable);
  return constructable;
}
var callableFnCacheMap = /* @__PURE__ */ new WeakMap();
function isCallable(fn) {
  if (callableFnCacheMap.has(fn)) {
    return true;
  }
  var callable = typeof fn === "function" && fn instanceof Function;
  if (callable) {
    callableFnCacheMap.set(fn, callable);
  }
  return callable;
}
var frozenPropertyCacheMap = /* @__PURE__ */ new WeakMap();
function isPropertyFrozen(target, p2) {
  if (!target || !p2) {
    return false;
  }
  var targetPropertiesFromCache = frozenPropertyCacheMap.get(target) || {};
  if (targetPropertiesFromCache[p2]) {
    return targetPropertiesFromCache[p2];
  }
  var propertyDescriptor = Object.getOwnPropertyDescriptor(target, p2);
  var frozen = Boolean(propertyDescriptor && propertyDescriptor.configurable === false && (propertyDescriptor.writable === false || propertyDescriptor.get && !propertyDescriptor.set));
  targetPropertiesFromCache[p2] = frozen;
  frozenPropertyCacheMap.set(target, targetPropertiesFromCache);
  return frozen;
}
var boundedMap = /* @__PURE__ */ new WeakMap();
function isBoundedFunction(fn) {
  if (boundedMap.has(fn)) {
    return boundedMap.get(fn);
  }
  var bounded = fn.name.indexOf("bound ") === 0 && !fn.hasOwnProperty("prototype");
  boundedMap.set(fn, bounded);
  return bounded;
}
var isConstDestructAssignmentSupported = _memoize(function() {
  try {
    new Function("const { a } = { a: 1 }")();
    return true;
  } catch (e2) {
    return false;
  }
});
var qiankunHeadTagName = "qiankun-head";
function getDefaultTplWrapper(name2, sandboxOpts) {
  return function(tpl) {
    var tplWithSimulatedHead;
    if (tpl.indexOf("<head>") !== -1) {
      tplWithSimulatedHead = tpl.replace("<head>", "<".concat(qiankunHeadTagName, ">")).replace("</head>", "</".concat(qiankunHeadTagName, ">"));
    } else {
      tplWithSimulatedHead = "<".concat(qiankunHeadTagName, "></").concat(qiankunHeadTagName, ">").concat(tpl);
    }
    return '<div id="'.concat(getWrapperId(name2), '" data-name="').concat(name2, '" data-version="').concat(version, '" data-sandbox-cfg=').concat(JSON.stringify(sandboxOpts), ">").concat(tplWithSimulatedHead, "</div>");
  };
}
function getWrapperId(name2) {
  return "__qiankun_microapp_wrapper_for_".concat(_snakeCase(name2), "__");
}
var nativeGlobal = new Function("return this")();
var nativeDocument = new Function("return document")();
var getGlobalAppInstanceMap = _once(function() {
  if (!nativeGlobal.hasOwnProperty("__app_instance_name_map__")) {
    Object.defineProperty(nativeGlobal, "__app_instance_name_map__", {
      enumerable: false,
      configurable: true,
      writable: true,
      value: {}
    });
  }
  return nativeGlobal.__app_instance_name_map__;
});
var genAppInstanceIdByName = function genAppInstanceIdByName2(appName) {
  var globalAppInstanceMap = getGlobalAppInstanceMap();
  if (!(appName in globalAppInstanceMap)) {
    nativeGlobal.__app_instance_name_map__[appName] = 0;
    return appName;
  }
  globalAppInstanceMap[appName]++;
  return "".concat(appName, "_").concat(globalAppInstanceMap[appName]);
};
function validateExportLifecycle(exports$1) {
  var _ref = exports$1 !== null && exports$1 !== void 0 ? exports$1 : {}, bootstrap = _ref.bootstrap, mount = _ref.mount, unmount = _ref.unmount;
  return _isFunction(bootstrap) && _isFunction(mount) && _isFunction(unmount);
}
var Deferred = /* @__PURE__ */ _createClass(function Deferred2() {
  var _this = this;
  _classCallCheck(this, Deferred2);
  this.promise = void 0;
  this.resolve = void 0;
  this.reject = void 0;
  this.promise = new Promise(function(resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
});
function isEnableScopedCSS(sandbox) {
  if (_typeof$1(sandbox) !== "object") {
    return false;
  }
  if (sandbox.strictStyleIsolation) {
    return false;
  }
  return !!sandbox.experimentalStyleIsolation;
}
function getXPathForElement(el, document2) {
  if (!document2.body.contains(el)) {
    return void 0;
  }
  var xpath = "";
  var pos;
  var tmpEle;
  var element = el;
  while (element !== document2.documentElement) {
    pos = 0;
    tmpEle = element;
    while (tmpEle) {
      if (tmpEle.nodeType === 1 && tmpEle.nodeName === element.nodeName) {
        pos += 1;
      }
      tmpEle = tmpEle.previousSibling;
    }
    xpath = "*[name()='".concat(element.nodeName, "'][").concat(pos, "]/").concat(xpath);
    element = element.parentNode;
  }
  xpath = "/*[name()='".concat(document2.documentElement.nodeName, "']/").concat(xpath);
  xpath = xpath.replace(/\/$/, "");
  return xpath;
}
function getContainer(container) {
  return typeof container === "string" ? document.querySelector(container) : container;
}
function getContainerXPath(container) {
  if (container) {
    var containerElement = getContainer(container);
    if (containerElement) {
      return getXPathForElement(containerElement, document);
    }
  }
  return void 0;
}
var currentRunningApp = null;
function getCurrentRunningApp() {
  return currentRunningApp;
}
function setCurrentRunningApp(appInstance) {
  currentRunningApp = appInstance;
}
function clearCurrentRunningApp() {
  currentRunningApp = null;
}
var functionBoundedValueMap = /* @__PURE__ */ new WeakMap();
function rebindTarget2Fn(target, fn) {
  if (isCallable(fn) && !isBoundedFunction(fn) && !isConstructable(fn)) {
    var cachedBoundFunction = functionBoundedValueMap.get(fn);
    if (cachedBoundFunction) {
      return cachedBoundFunction;
    }
    var boundValue = Function.prototype.bind.call(fn, target);
    Object.getOwnPropertyNames(fn).forEach(function(key) {
      if (!boundValue.hasOwnProperty(key)) {
        Object.defineProperty(boundValue, key, Object.getOwnPropertyDescriptor(fn, key));
      }
    });
    if (fn.hasOwnProperty("prototype") && !boundValue.hasOwnProperty("prototype")) {
      Object.defineProperty(boundValue, "prototype", {
        value: fn.prototype,
        enumerable: false,
        writable: true
      });
    }
    if (typeof fn.toString === "function") {
      var valueHasInstanceToString = fn.hasOwnProperty("toString") && !boundValue.hasOwnProperty("toString");
      var boundValueHasPrototypeToString = boundValue.toString === Function.prototype.toString;
      if (valueHasInstanceToString || boundValueHasPrototypeToString) {
        var originToStringDescriptor = Object.getOwnPropertyDescriptor(valueHasInstanceToString ? fn : Function.prototype, "toString");
        Object.defineProperty(boundValue, "toString", Object.assign({}, originToStringDescriptor, (originToStringDescriptor === null || originToStringDescriptor === void 0 ? void 0 : originToStringDescriptor.get) ? null : {
          value: function value() {
            return fn.toString();
          }
        }));
      }
    }
    functionBoundedValueMap.set(fn, boundValue);
    return boundValue;
  }
  return fn;
}
function isPropConfigurable(target, prop) {
  var descriptor = Object.getOwnPropertyDescriptor(target, prop);
  return descriptor ? descriptor.configurable : true;
}
var LegacySandbox = /* @__PURE__ */ function() {
  function LegacySandbox2(name2) {
    var _this = this;
    var globalContext = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : window;
    _classCallCheck(this, LegacySandbox2);
    this.addedPropsMapInSandbox = /* @__PURE__ */ new Map();
    this.modifiedPropsOriginalValueMapInSandbox = /* @__PURE__ */ new Map();
    this.currentUpdatedPropsValueMap = /* @__PURE__ */ new Map();
    this.name = void 0;
    this.proxy = void 0;
    this.globalContext = void 0;
    this.type = void 0;
    this.sandboxRunning = true;
    this.latestSetProp = null;
    this.name = name2;
    this.globalContext = globalContext;
    this.type = SandBoxType.LegacyProxy;
    var addedPropsMapInSandbox = this.addedPropsMapInSandbox, modifiedPropsOriginalValueMapInSandbox = this.modifiedPropsOriginalValueMapInSandbox, currentUpdatedPropsValueMap = this.currentUpdatedPropsValueMap;
    var rawWindow = globalContext;
    var fakeWindow = /* @__PURE__ */ Object.create(null);
    var setTrap = function setTrap2(p2, value, originalValue) {
      var sync2Window = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
      if (_this.sandboxRunning) {
        if (!rawWindow.hasOwnProperty(p2)) {
          addedPropsMapInSandbox.set(p2, value);
        } else if (!modifiedPropsOriginalValueMapInSandbox.has(p2)) {
          modifiedPropsOriginalValueMapInSandbox.set(p2, originalValue);
        }
        currentUpdatedPropsValueMap.set(p2, value);
        if (sync2Window) {
          rawWindow[p2] = value;
        }
        _this.latestSetProp = p2;
        return true;
      }
      return true;
    };
    var proxy = new Proxy(fakeWindow, {
      set: function set(_2, p2, value) {
        var originalValue = rawWindow[p2];
        return setTrap(p2, value, originalValue, true);
      },
      get: function get(_2, p2) {
        if (p2 === "top" || p2 === "parent" || p2 === "window" || p2 === "self") {
          return proxy;
        }
        var value = rawWindow[p2];
        return rebindTarget2Fn(rawWindow, value);
      },
      // trap in operator
      // see https://github.com/styled-components/styled-components/blob/master/packages/styled-components/src/constants.js#L12
      has: function has(_2, p2) {
        return p2 in rawWindow;
      },
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(_2, p2) {
        var descriptor = Object.getOwnPropertyDescriptor(rawWindow, p2);
        if (descriptor && !descriptor.configurable) {
          descriptor.configurable = true;
        }
        return descriptor;
      },
      defineProperty: function defineProperty2(_2, p2, attributes) {
        var originalValue = rawWindow[p2];
        var done = Reflect.defineProperty(rawWindow, p2, attributes);
        var value = rawWindow[p2];
        setTrap(p2, value, originalValue, false);
        return done;
      }
    });
    this.proxy = proxy;
  }
  _createClass(LegacySandbox2, [{
    key: "setWindowProp",
    value: function setWindowProp(prop, value, toDelete) {
      if (value === void 0 && toDelete) {
        delete this.globalContext[prop];
      } else if (isPropConfigurable(this.globalContext, prop) && _typeof$1(prop) !== "symbol") {
        Object.defineProperty(this.globalContext, prop, {
          writable: true,
          configurable: true
        });
        this.globalContext[prop] = value;
      }
    }
  }, {
    key: "active",
    value: function active() {
      var _this2 = this;
      if (!this.sandboxRunning) {
        this.currentUpdatedPropsValueMap.forEach(function(v2, p2) {
          return _this2.setWindowProp(p2, v2);
        });
      }
      this.sandboxRunning = true;
    }
  }, {
    key: "inactive",
    value: function inactive() {
      var _this3 = this;
      this.modifiedPropsOriginalValueMapInSandbox.forEach(function(v2, p2) {
        return _this3.setWindowProp(p2, v2);
      });
      this.addedPropsMapInSandbox.forEach(function(_2, p2) {
        return _this3.setWindowProp(p2, void 0, true);
      });
      this.sandboxRunning = false;
    }
  }, {
    key: "patchDocument",
    value: function patchDocument2() {
    }
  }]);
  return LegacySandbox2;
}();
var RuleType;
(function(RuleType2) {
  RuleType2[RuleType2["STYLE"] = 1] = "STYLE";
  RuleType2[RuleType2["MEDIA"] = 4] = "MEDIA";
  RuleType2[RuleType2["SUPPORTS"] = 12] = "SUPPORTS";
  RuleType2[RuleType2["IMPORT"] = 3] = "IMPORT";
  RuleType2[RuleType2["FONT_FACE"] = 5] = "FONT_FACE";
  RuleType2[RuleType2["PAGE"] = 6] = "PAGE";
  RuleType2[RuleType2["KEYFRAMES"] = 7] = "KEYFRAMES";
  RuleType2[RuleType2["KEYFRAME"] = 8] = "KEYFRAME";
})(RuleType || (RuleType = {}));
var arrayify = function arrayify2(list) {
  return [].slice.call(list, 0);
};
var rawDocumentBodyAppend = HTMLBodyElement.prototype.appendChild;
var ScopedCSS = /* @__PURE__ */ function() {
  function ScopedCSS2() {
    _classCallCheck(this, ScopedCSS2);
    this.sheet = void 0;
    this.swapNode = void 0;
    var styleNode = document.createElement("style");
    rawDocumentBodyAppend.call(document.body, styleNode);
    this.swapNode = styleNode;
    this.sheet = styleNode.sheet;
    this.sheet.disabled = true;
  }
  _createClass(ScopedCSS2, [{
    key: "process",
    value: function process3(styleNode) {
      var _this = this;
      var prefix = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      if (ScopedCSS2.ModifiedTag in styleNode) {
        return;
      }
      if (styleNode.textContent !== "") {
        var _sheet$cssRules;
        var textNode = document.createTextNode(styleNode.textContent || "");
        this.swapNode.appendChild(textNode);
        var sheet = this.swapNode.sheet;
        var rules = arrayify((_sheet$cssRules = sheet === null || sheet === void 0 ? void 0 : sheet.cssRules) !== null && _sheet$cssRules !== void 0 ? _sheet$cssRules : []);
        var css = this.rewrite(rules, prefix);
        styleNode.textContent = css;
        this.swapNode.removeChild(textNode);
        styleNode[ScopedCSS2.ModifiedTag] = true;
        return;
      }
      var mutator = new MutationObserver(function(mutations) {
        for (var i2 = 0; i2 < mutations.length; i2 += 1) {
          var mutation = mutations[i2];
          if (ScopedCSS2.ModifiedTag in styleNode) {
            return;
          }
          if (mutation.type === "childList") {
            var _sheet$cssRules2;
            var _sheet = styleNode.sheet;
            var _rules = arrayify((_sheet$cssRules2 = _sheet === null || _sheet === void 0 ? void 0 : _sheet.cssRules) !== null && _sheet$cssRules2 !== void 0 ? _sheet$cssRules2 : []);
            var _css = _this.rewrite(_rules, prefix);
            styleNode.textContent = _css;
            styleNode[ScopedCSS2.ModifiedTag] = true;
          }
        }
      });
      mutator.observe(styleNode, {
        childList: true
      });
    }
  }, {
    key: "rewrite",
    value: function rewrite(rules) {
      var _this2 = this;
      var prefix = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      var css = "";
      rules.forEach(function(rule) {
        switch (rule.type) {
          case RuleType.STYLE:
            css += _this2.ruleStyle(rule, prefix);
            break;
          case RuleType.MEDIA:
            css += _this2.ruleMedia(rule, prefix);
            break;
          case RuleType.SUPPORTS:
            css += _this2.ruleSupport(rule, prefix);
            break;
          default:
            if (typeof rule.cssText === "string") {
              css += "".concat(rule.cssText);
            }
            break;
        }
      });
      return css;
    }
    // handle case:
    // .app-main {}
    // html, body {}
    // eslint-disable-next-line class-methods-use-this
  }, {
    key: "ruleStyle",
    value: function ruleStyle(rule, prefix) {
      var rootSelectorRE = /((?:[^\w\-.#]|^)(body|html|:root))/gm;
      var rootCombinationRE = /(html[^\w{[]+)/gm;
      var selector = rule.selectorText.trim();
      var cssText = "";
      if (typeof rule.cssText === "string") {
        cssText = rule.cssText;
      }
      if (selector === "html" || selector === "body" || selector === ":root") {
        return cssText.replace(rootSelectorRE, prefix);
      }
      if (rootCombinationRE.test(rule.selectorText)) {
        var siblingSelectorRE = /(html[^\w{]+)(\+|~)/gm;
        if (!siblingSelectorRE.test(rule.selectorText)) {
          cssText = cssText.replace(rootCombinationRE, "");
        }
      }
      cssText = cssText.replace(/^[\s\S]+{/, function(selectors) {
        return selectors.replace(/(^|,\n?)([^,]+)/g, function(item, p2, s2) {
          if (rootSelectorRE.test(item)) {
            return item.replace(rootSelectorRE, function(m2) {
              var whitePrevChars = [",", "("];
              if (m2 && whitePrevChars.includes(m2[0])) {
                return "".concat(m2[0]).concat(prefix);
              }
              return prefix;
            });
          }
          return "".concat(p2).concat(prefix, " ").concat(s2.replace(/^ */, ""));
        });
      });
      return cssText;
    }
    // handle case:
    // @media screen and (max-width: 300px) {}
  }, {
    key: "ruleMedia",
    value: function ruleMedia(rule, prefix) {
      var css = this.rewrite(arrayify(rule.cssRules), prefix);
      return "@media ".concat(rule.conditionText || rule.media.mediaText, " {").concat(css, "}");
    }
    // handle case:
    // @supports (display: grid) {}
  }, {
    key: "ruleSupport",
    value: function ruleSupport(rule, prefix) {
      var css = this.rewrite(arrayify(rule.cssRules), prefix);
      return "@supports ".concat(rule.conditionText || rule.cssText.split("{")[0], " {").concat(css, "}");
    }
  }]);
  return ScopedCSS2;
}();
ScopedCSS.ModifiedTag = "Symbol(style-modified-qiankun)";
var processor;
var QiankunCSSRewriteAttr = "data-qiankun";
var process = function process2(appWrapper, stylesheetElement, appName) {
  if (!processor) {
    processor = new ScopedCSS();
  }
  if (stylesheetElement.tagName === "LINK") {
    console.warn("Feature: sandbox.experimentalStyleIsolation is not support for link element yet.");
  }
  var mountDOM = appWrapper;
  if (!mountDOM) {
    return;
  }
  var tag = (mountDOM.tagName || "").toLowerCase();
  if (tag && stylesheetElement.tagName === "STYLE") {
    var prefix = "".concat(tag, "[").concat(QiankunCSSRewriteAttr, '="').concat(appName, '"]');
    processor.process(stylesheetElement, prefix);
  }
};
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd$1(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
var _setCacheAdd = setCacheAdd$1;
function setCacheHas$1(value) {
  return this.__data__.has(value);
}
var _setCacheHas = setCacheHas$1;
var MapCache = _MapCache, setCacheAdd = _setCacheAdd, setCacheHas = _setCacheHas;
function SetCache$1(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache$1.prototype.add = SetCache$1.prototype.push = setCacheAdd;
SetCache$1.prototype.has = setCacheHas;
var _SetCache = SetCache$1;
function baseFindIndex$1(array, predicate, fromIndex, fromRight) {
  var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}
var _baseFindIndex = baseFindIndex$1;
function baseIsNaN$1(value) {
  return value !== value;
}
var _baseIsNaN = baseIsNaN$1;
function strictIndexOf$1(array, value, fromIndex) {
  var index = fromIndex - 1, length = array.length;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}
var _strictIndexOf = strictIndexOf$1;
var baseFindIndex = _baseFindIndex, baseIsNaN = _baseIsNaN, strictIndexOf = _strictIndexOf;
function baseIndexOf$1(array, value, fromIndex) {
  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}
var _baseIndexOf = baseIndexOf$1;
var baseIndexOf = _baseIndexOf;
function arrayIncludes$1(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}
var _arrayIncludes = arrayIncludes$1;
function arrayIncludesWith$1(array, value, comparator) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}
var _arrayIncludesWith = arrayIncludesWith$1;
function cacheHas$1(cache, key) {
  return cache.has(key);
}
var _cacheHas = cacheHas$1;
var SetCache = _SetCache, arrayIncludes = _arrayIncludes, arrayIncludesWith = _arrayIncludesWith, arrayMap = _arrayMap, baseUnary = _baseUnary, cacheHas = _cacheHas;
var LARGE_ARRAY_SIZE = 200;
function baseDifference$1(array, values, iteratee, comparator) {
  var index = -1, includes = arrayIncludes, isCommon = true, length = array.length, result = [], valuesLength = values.length;
  if (!length) {
    return result;
  }
  if (iteratee) {
    values = arrayMap(values, baseUnary(iteratee));
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  } else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = cacheHas;
    isCommon = false;
    values = new SetCache(values);
  }
  outer:
    while (++index < length) {
      var value = array[index], computed = iteratee == null ? value : iteratee(value);
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values[valuesIndex] === computed) {
            continue outer;
          }
        }
        result.push(value);
      } else if (!includes(values, computed, comparator)) {
        result.push(value);
      }
    }
  return result;
}
var _baseDifference = baseDifference$1;
var baseDifference = _baseDifference, baseRest = _baseRest, isArrayLikeObject = isArrayLikeObject_1;
var without = baseRest(function(array, values) {
  return isArrayLikeObject(array) ? baseDifference(array, values) : [];
});
var without_1 = without;
var _without = /* @__PURE__ */ getDefaultExportFromCjs(without_1);
var globalsInES2015 = window.Proxy ? ["Array", "ArrayBuffer", "Boolean", "constructor", "DataView", "Date", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "Error", "escape", "eval", "EvalError", "Float32Array", "Float64Array", "Function", "hasOwnProperty", "Infinity", "Int16Array", "Int32Array", "Int8Array", "isFinite", "isNaN", "isPrototypeOf", "JSON", "Map", "Math", "NaN", "Number", "Object", "parseFloat", "parseInt", "Promise", "propertyIsEnumerable", "Proxy", "RangeError", "ReferenceError", "Reflect", "RegExp", "Set", "String", "Symbol", "SyntaxError", "toLocaleString", "toString", "TypeError", "Uint16Array", "Uint32Array", "Uint8Array", "Uint8ClampedArray", "undefined", "unescape", "URIError", "valueOf", "WeakMap", "WeakSet"].filter(function(p2) {
  return (
    /* just keep the available properties in current window context */
    p2 in window
  );
}) : [];
var globalsInBrowser = ["AbortController", "AbortSignal", "addEventListener", "alert", "AnalyserNode", "Animation", "AnimationEffectReadOnly", "AnimationEffectTiming", "AnimationEffectTimingReadOnly", "AnimationEvent", "AnimationPlaybackEvent", "AnimationTimeline", "applicationCache", "ApplicationCache", "ApplicationCacheErrorEvent", "atob", "Attr", "Audio", "AudioBuffer", "AudioBufferSourceNode", "AudioContext", "AudioDestinationNode", "AudioListener", "AudioNode", "AudioParam", "AudioProcessingEvent", "AudioScheduledSourceNode", "AudioWorkletGlobalScope", "AudioWorkletNode", "AudioWorkletProcessor", "BarProp", "BaseAudioContext", "BatteryManager", "BeforeUnloadEvent", "BiquadFilterNode", "Blob", "BlobEvent", "blur", "BroadcastChannel", "btoa", "BudgetService", "ByteLengthQueuingStrategy", "Cache", "caches", "CacheStorage", "cancelAnimationFrame", "cancelIdleCallback", "CanvasCaptureMediaStreamTrack", "CanvasGradient", "CanvasPattern", "CanvasRenderingContext2D", "ChannelMergerNode", "ChannelSplitterNode", "CharacterData", "clearInterval", "clearTimeout", "clientInformation", "ClipboardEvent", "ClipboardItem", "close", "closed", "CloseEvent", "Comment", "CompositionEvent", "CompressionStream", "confirm", "console", "ConstantSourceNode", "ConvolverNode", "CountQueuingStrategy", "createImageBitmap", "Credential", "CredentialsContainer", "crypto", "Crypto", "CryptoKey", "CSS", "CSSConditionRule", "CSSFontFaceRule", "CSSGroupingRule", "CSSImportRule", "CSSKeyframeRule", "CSSKeyframesRule", "CSSMatrixComponent", "CSSMediaRule", "CSSNamespaceRule", "CSSPageRule", "CSSPerspective", "CSSRotate", "CSSRule", "CSSRuleList", "CSSScale", "CSSSkew", "CSSSkewX", "CSSSkewY", "CSSStyleDeclaration", "CSSStyleRule", "CSSStyleSheet", "CSSSupportsRule", "CSSTransformValue", "CSSTranslate", "CustomElementRegistry", "customElements", "CustomEvent", "DataTransfer", "DataTransferItem", "DataTransferItemList", "DecompressionStream", "defaultstatus", "defaultStatus", "DelayNode", "DeviceMotionEvent", "DeviceOrientationEvent", "devicePixelRatio", "dispatchEvent", "document", "Document", "DocumentFragment", "DocumentType", "DOMError", "DOMException", "DOMImplementation", "DOMMatrix", "DOMMatrixReadOnly", "DOMParser", "DOMPoint", "DOMPointReadOnly", "DOMQuad", "DOMRect", "DOMRectList", "DOMRectReadOnly", "DOMStringList", "DOMStringMap", "DOMTokenList", "DragEvent", "DynamicsCompressorNode", "Element", "ErrorEvent", "event", "Event", "EventSource", "EventTarget", "external", "fetch", "File", "FileList", "FileReader", "find", "focus", "FocusEvent", "FontFace", "FontFaceSetLoadEvent", "FormData", "FormDataEvent", "frameElement", "frames", "GainNode", "Gamepad", "GamepadButton", "GamepadEvent", "getComputedStyle", "getSelection", "HashChangeEvent", "Headers", "history", "History", "HTMLAllCollection", "HTMLAnchorElement", "HTMLAreaElement", "HTMLAudioElement", "HTMLBaseElement", "HTMLBodyElement", "HTMLBRElement", "HTMLButtonElement", "HTMLCanvasElement", "HTMLCollection", "HTMLContentElement", "HTMLDataElement", "HTMLDataListElement", "HTMLDetailsElement", "HTMLDialogElement", "HTMLDirectoryElement", "HTMLDivElement", "HTMLDListElement", "HTMLDocument", "HTMLElement", "HTMLEmbedElement", "HTMLFieldSetElement", "HTMLFontElement", "HTMLFormControlsCollection", "HTMLFormElement", "HTMLFrameElement", "HTMLFrameSetElement", "HTMLHeadElement", "HTMLHeadingElement", "HTMLHRElement", "HTMLHtmlElement", "HTMLIFrameElement", "HTMLImageElement", "HTMLInputElement", "HTMLLabelElement", "HTMLLegendElement", "HTMLLIElement", "HTMLLinkElement", "HTMLMapElement", "HTMLMarqueeElement", "HTMLMediaElement", "HTMLMenuElement", "HTMLMetaElement", "HTMLMeterElement", "HTMLModElement", "HTMLObjectElement", "HTMLOListElement", "HTMLOptGroupElement", "HTMLOptionElement", "HTMLOptionsCollection", "HTMLOutputElement", "HTMLParagraphElement", "HTMLParamElement", "HTMLPictureElement", "HTMLPreElement", "HTMLProgressElement", "HTMLQuoteElement", "HTMLScriptElement", "HTMLSelectElement", "HTMLShadowElement", "HTMLSlotElement", "HTMLSourceElement", "HTMLSpanElement", "HTMLStyleElement", "HTMLTableCaptionElement", "HTMLTableCellElement", "HTMLTableColElement", "HTMLTableElement", "HTMLTableRowElement", "HTMLTableSectionElement", "HTMLTemplateElement", "HTMLTextAreaElement", "HTMLTimeElement", "HTMLTitleElement", "HTMLTrackElement", "HTMLUListElement", "HTMLUnknownElement", "HTMLVideoElement", "IDBCursor", "IDBCursorWithValue", "IDBDatabase", "IDBFactory", "IDBIndex", "IDBKeyRange", "IDBObjectStore", "IDBOpenDBRequest", "IDBRequest", "IDBTransaction", "IDBVersionChangeEvent", "IdleDeadline", "IIRFilterNode", "Image", "ImageBitmap", "ImageBitmapRenderingContext", "ImageCapture", "ImageData", "indexedDB", "innerHeight", "innerWidth", "InputEvent", "IntersectionObserver", "IntersectionObserverEntry", "Intl", "isSecureContext", "KeyboardEvent", "KeyframeEffect", "KeyframeEffectReadOnly", "length", "localStorage", "location", "Location", "locationbar", "matchMedia", "MediaDeviceInfo", "MediaDevices", "MediaElementAudioSourceNode", "MediaEncryptedEvent", "MediaError", "MediaKeyMessageEvent", "MediaKeySession", "MediaKeyStatusMap", "MediaKeySystemAccess", "MediaList", "MediaMetadata", "MediaQueryList", "MediaQueryListEvent", "MediaRecorder", "MediaSettingsRange", "MediaSource", "MediaStream", "MediaStreamAudioDestinationNode", "MediaStreamAudioSourceNode", "MediaStreamConstraints", "MediaStreamEvent", "MediaStreamTrack", "MediaStreamTrackEvent", "menubar", "MessageChannel", "MessageEvent", "MessagePort", "MIDIAccess", "MIDIConnectionEvent", "MIDIInput", "MIDIInputMap", "MIDIMessageEvent", "MIDIOutput", "MIDIOutputMap", "MIDIPort", "MimeType", "MimeTypeArray", "MouseEvent", "moveBy", "moveTo", "MutationEvent", "MutationObserver", "MutationRecord", "name", "NamedNodeMap", "NavigationPreloadManager", "navigator", "Navigator", "NavigatorUAData", "NetworkInformation", "Node", "NodeFilter", "NodeIterator", "NodeList", "Notification", "OfflineAudioCompletionEvent", "OfflineAudioContext", "offscreenBuffering", "OffscreenCanvas", "OffscreenCanvasRenderingContext2D", "onabort", "onafterprint", "onanimationend", "onanimationiteration", "onanimationstart", "onappinstalled", "onauxclick", "onbeforeinstallprompt", "onbeforeprint", "onbeforeunload", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncuechange", "ondblclick", "ondevicemotion", "ondeviceorientation", "ondeviceorientationabsolute", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "ongotpointercapture", "onhashchange", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onlanguagechange", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onlostpointercapture", "onmessage", "onmessageerror", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onoffline", "ononline", "onpagehide", "onpageshow", "onpause", "onplay", "onplaying", "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave", "onpointermove", "onpointerout", "onpointerover", "onpointerup", "onpopstate", "onprogress", "onratechange", "onrejectionhandled", "onreset", "onresize", "onscroll", "onsearch", "onseeked", "onseeking", "onselect", "onstalled", "onstorage", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "ontransitionend", "onunhandledrejection", "onunload", "onvolumechange", "onwaiting", "onwheel", "open", "openDatabase", "opener", "Option", "origin", "OscillatorNode", "outerHeight", "outerWidth", "OverconstrainedError", "PageTransitionEvent", "pageXOffset", "pageYOffset", "PannerNode", "parent", "Path2D", "PaymentAddress", "PaymentRequest", "PaymentRequestUpdateEvent", "PaymentResponse", "performance", "Performance", "PerformanceEntry", "PerformanceLongTaskTiming", "PerformanceMark", "PerformanceMeasure", "PerformanceNavigation", "PerformanceNavigationTiming", "PerformanceObserver", "PerformanceObserverEntryList", "PerformancePaintTiming", "PerformanceResourceTiming", "PerformanceTiming", "PeriodicWave", "Permissions", "PermissionStatus", "personalbar", "PhotoCapabilities", "Plugin", "PluginArray", "PointerEvent", "PopStateEvent", "postMessage", "Presentation", "PresentationAvailability", "PresentationConnection", "PresentationConnectionAvailableEvent", "PresentationConnectionCloseEvent", "PresentationConnectionList", "PresentationReceiver", "PresentationRequest", "print", "ProcessingInstruction", "ProgressEvent", "PromiseRejectionEvent", "prompt", "PushManager", "PushSubscription", "PushSubscriptionOptions", "queueMicrotask", "RadioNodeList", "Range", "ReadableByteStreamController", "ReadableStream", "ReadableStreamBYOBReader", "ReadableStreamBYOBRequest", "ReadableStreamDefaultController", "ReadableStreamDefaultReader", "registerProcessor", "RemotePlayback", "removeEventListener", "reportError", "Request", "requestAnimationFrame", "requestIdleCallback", "resizeBy", "ResizeObserver", "ResizeObserverEntry", "resizeTo", "Response", "RTCCertificate", "RTCDataChannel", "RTCDataChannelEvent", "RTCDtlsTransport", "RTCIceCandidate", "RTCIceGatherer", "RTCIceTransport", "RTCPeerConnection", "RTCPeerConnectionIceEvent", "RTCRtpContributingSource", "RTCRtpReceiver", "RTCRtpSender", "RTCSctpTransport", "RTCSessionDescription", "RTCStatsReport", "RTCTrackEvent", "screen", "Screen", "screenLeft", "ScreenOrientation", "screenTop", "screenX", "screenY", "ScriptProcessorNode", "scroll", "scrollbars", "scrollBy", "scrollTo", "scrollX", "scrollY", "SecurityPolicyViolationEvent", "Selection", "self", "ServiceWorker", "ServiceWorkerContainer", "ServiceWorkerRegistration", "sessionStorage", "setInterval", "setTimeout", "ShadowRoot", "SharedWorker", "SourceBuffer", "SourceBufferList", "speechSynthesis", "SpeechSynthesisEvent", "SpeechSynthesisUtterance", "StaticRange", "status", "statusbar", "StereoPannerNode", "stop", "Storage", "StorageEvent", "StorageManager", "structuredClone", "styleMedia", "StyleSheet", "StyleSheetList", "SubmitEvent", "SubtleCrypto", "SVGAElement", "SVGAngle", "SVGAnimatedAngle", "SVGAnimatedBoolean", "SVGAnimatedEnumeration", "SVGAnimatedInteger", "SVGAnimatedLength", "SVGAnimatedLengthList", "SVGAnimatedNumber", "SVGAnimatedNumberList", "SVGAnimatedPreserveAspectRatio", "SVGAnimatedRect", "SVGAnimatedString", "SVGAnimatedTransformList", "SVGAnimateElement", "SVGAnimateMotionElement", "SVGAnimateTransformElement", "SVGAnimationElement", "SVGCircleElement", "SVGClipPathElement", "SVGComponentTransferFunctionElement", "SVGDefsElement", "SVGDescElement", "SVGDiscardElement", "SVGElement", "SVGEllipseElement", "SVGFEBlendElement", "SVGFEColorMatrixElement", "SVGFEComponentTransferElement", "SVGFECompositeElement", "SVGFEConvolveMatrixElement", "SVGFEDiffuseLightingElement", "SVGFEDisplacementMapElement", "SVGFEDistantLightElement", "SVGFEDropShadowElement", "SVGFEFloodElement", "SVGFEFuncAElement", "SVGFEFuncBElement", "SVGFEFuncGElement", "SVGFEFuncRElement", "SVGFEGaussianBlurElement", "SVGFEImageElement", "SVGFEMergeElement", "SVGFEMergeNodeElement", "SVGFEMorphologyElement", "SVGFEOffsetElement", "SVGFEPointLightElement", "SVGFESpecularLightingElement", "SVGFESpotLightElement", "SVGFETileElement", "SVGFETurbulenceElement", "SVGFilterElement", "SVGForeignObjectElement", "SVGGElement", "SVGGeometryElement", "SVGGradientElement", "SVGGraphicsElement", "SVGImageElement", "SVGLength", "SVGLengthList", "SVGLinearGradientElement", "SVGLineElement", "SVGMarkerElement", "SVGMaskElement", "SVGMatrix", "SVGMetadataElement", "SVGMPathElement", "SVGNumber", "SVGNumberList", "SVGPathElement", "SVGPatternElement", "SVGPoint", "SVGPointList", "SVGPolygonElement", "SVGPolylineElement", "SVGPreserveAspectRatio", "SVGRadialGradientElement", "SVGRect", "SVGRectElement", "SVGScriptElement", "SVGSetElement", "SVGStopElement", "SVGStringList", "SVGStyleElement", "SVGSVGElement", "SVGSwitchElement", "SVGSymbolElement", "SVGTextContentElement", "SVGTextElement", "SVGTextPathElement", "SVGTextPositioningElement", "SVGTitleElement", "SVGTransform", "SVGTransformList", "SVGTSpanElement", "SVGUnitTypes", "SVGUseElement", "SVGViewElement", "TaskAttributionTiming", "Text", "TextDecoder", "TextDecoderStream", "TextEncoder", "TextEncoderStream", "TextEvent", "TextMetrics", "TextTrack", "TextTrackCue", "TextTrackCueList", "TextTrackList", "TimeRanges", "ToggleEvent", "toolbar", "top", "Touch", "TouchEvent", "TouchList", "TrackEvent", "TransformStream", "TransformStreamDefaultController", "TransitionEvent", "TreeWalker", "UIEvent", "URL", "URLSearchParams", "ValidityState", "visualViewport", "VisualViewport", "VTTCue", "WaveShaperNode", "WebAssembly", "WebGL2RenderingContext", "WebGLActiveInfo", "WebGLBuffer", "WebGLContextEvent", "WebGLFramebuffer", "WebGLProgram", "WebGLQuery", "WebGLRenderbuffer", "WebGLRenderingContext", "WebGLSampler", "WebGLShader", "WebGLShaderPrecisionFormat", "WebGLSync", "WebGLTexture", "WebGLTransformFeedback", "WebGLUniformLocation", "WebGLVertexArrayObject", "WebSocket", "WheelEvent", "window", "Window", "Worker", "WritableStream", "WritableStreamDefaultController", "WritableStreamDefaultWriter", "XMLDocument", "XMLHttpRequest", "XMLHttpRequestEventTarget", "XMLHttpRequestUpload", "XMLSerializer", "XPathEvaluator", "XPathExpression", "XPathResult", "XSLTProcessor"];
function uniq(array) {
  return array.filter(function filter(element) {
    return element in this ? false : this[element] = true;
  }, /* @__PURE__ */ Object.create(null));
}
function array2TruthyObject(array) {
  return array.reduce(
    function(acc, key) {
      acc[key] = true;
      return acc;
    },
    // Notes that babel will transpile spread operator to Object.assign({}, ...args), which will keep the prototype of Object in merged object,
    // while this result used as Symbol.unscopables, it will make properties in Object.prototype always be escaped from proxy sandbox as unscopables check will look up prototype chain as well,
    // such as hasOwnProperty, toString, valueOf, etc.
    // so we should use Object.create(null) to create a pure object without prototype chain here.
    /* @__PURE__ */ Object.create(null)
  );
}
var cachedGlobalsInBrowser = array2TruthyObject(globalsInBrowser.concat([]));
function isNativeGlobalProp(prop) {
  return prop in cachedGlobalsInBrowser;
}
var rawObjectDefineProperty = Object.defineProperty;
var variableWhiteListInDev = window.__QIANKUN_DEVELOPMENT__ ? [
  // for react hot reload
  // see https://github.com/facebook/create-react-app/blob/66bf7dfc43350249e2f09d138a20840dae8a0a4a/packages/react-error-overlay/src/index.js#L180
  "__REACT_ERROR_OVERLAY_GLOBAL_HOOK__",
  // for react development event issue, see https://github.com/umijs/qiankun/issues/2375
  "event"
] : [];
var globalVariableWhiteList = [
  // FIXME System.js used a indirect call with eval, which would make it scope escape to global
  // To make System.js works well, we write it back to global window temporary
  // see https://github.com/systemjs/systemjs/blob/457f5b7e8af6bd120a279540477552a07d5de086/src/evaluate.js#L106
  "System",
  // see https://github.com/systemjs/systemjs/blob/457f5b7e8af6bd120a279540477552a07d5de086/src/instantiate.js#L357
  "__cjsWrapper"
].concat(variableWhiteListInDev);
var inTest = false;
var accessingSpiedGlobals = ["document", "top", "parent", "eval"];
var overwrittenGlobals = ["window", "self", "globalThis", "hasOwnProperty"].concat([]);
var cachedGlobals = Array.from(new Set(_without.apply(void 0, [globalsInES2015.concat(overwrittenGlobals).concat("requestAnimationFrame")].concat(accessingSpiedGlobals))));
var cachedGlobalObjects = array2TruthyObject(cachedGlobals);
var unscopables = array2TruthyObject(_without.apply(void 0, [cachedGlobals].concat(_toConsumableArray(accessingSpiedGlobals.concat(overwrittenGlobals)))));
var useNativeWindowForBindingsProps = /* @__PURE__ */ new Map([["fetch", true], ["mockDomAPIInBlackList", false]]);
function createFakeWindow(globalContext, speedy) {
  var propertiesWithGetter = /* @__PURE__ */ new Map();
  var fakeWindow = {};
  Object.getOwnPropertyNames(globalContext).filter(function(p2) {
    var descriptor = Object.getOwnPropertyDescriptor(globalContext, p2);
    return !(descriptor === null || descriptor === void 0 ? void 0 : descriptor.configurable);
  }).forEach(function(p2) {
    var descriptor = Object.getOwnPropertyDescriptor(globalContext, p2);
    if (descriptor) {
      var hasGetter = Object.prototype.hasOwnProperty.call(descriptor, "get");
      if (p2 === "top" || p2 === "parent" || p2 === "self" || p2 === "window" || // window.document is overwriting in speedy mode
      p2 === "document" && speedy || inTest) {
        descriptor.configurable = true;
        if (!hasGetter) {
          descriptor.writable = true;
        }
      }
      if (hasGetter) propertiesWithGetter.set(p2, true);
      rawObjectDefineProperty(fakeWindow, p2, Object.freeze(descriptor));
    }
  });
  return {
    fakeWindow,
    propertiesWithGetter
  };
}
var activeSandboxCount = 0;
var ProxySandbox = /* @__PURE__ */ function() {
  function ProxySandbox2(name2) {
    var _this = this;
    var globalContext = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : window;
    var opts = arguments.length > 2 ? arguments[2] : void 0;
    _classCallCheck(this, ProxySandbox2);
    this.updatedValueSet = /* @__PURE__ */ new Set();
    this.document = document;
    this.name = void 0;
    this.type = void 0;
    this.proxy = void 0;
    this.sandboxRunning = true;
    this.latestSetProp = null;
    this.globalWhitelistPrevDescriptor = {};
    this.globalContext = void 0;
    this.name = name2;
    this.globalContext = globalContext;
    this.type = SandBoxType.Proxy;
    var updatedValueSet = this.updatedValueSet;
    var _ref = opts || {}, speedy = _ref.speedy;
    var _createFakeWindow = createFakeWindow(globalContext, !!speedy), fakeWindow = _createFakeWindow.fakeWindow, propertiesWithGetter = _createFakeWindow.propertiesWithGetter;
    var descriptorTargetMap = /* @__PURE__ */ new Map();
    var proxy = new Proxy(fakeWindow, {
      set: function set(target, p2, value) {
        if (_this.sandboxRunning) {
          _this.registerRunningApp(name2, proxy);
          if (typeof p2 === "string" && globalVariableWhiteList.indexOf(p2) !== -1) {
            _this.globalWhitelistPrevDescriptor[p2] = Object.getOwnPropertyDescriptor(globalContext, p2);
            globalContext[p2] = value;
          } else {
            if (!target.hasOwnProperty(p2) && globalContext.hasOwnProperty(p2)) {
              var descriptor = Object.getOwnPropertyDescriptor(globalContext, p2);
              var writable = descriptor.writable, configurable = descriptor.configurable, enumerable = descriptor.enumerable, set2 = descriptor.set;
              if (writable || set2) {
                Object.defineProperty(target, p2, {
                  configurable,
                  enumerable,
                  writable: true,
                  value
                });
              }
            } else {
              target[p2] = value;
            }
          }
          updatedValueSet.add(p2);
          _this.latestSetProp = p2;
          return true;
        }
        return true;
      },
      get: function get(target, p2) {
        _this.registerRunningApp(name2, proxy);
        if (p2 === Symbol.unscopables) return unscopables;
        if (p2 === "window" || p2 === "self") {
          return proxy;
        }
        if (p2 === "globalThis" || inTest) {
          return proxy;
        }
        if (p2 === "top" || p2 === "parent" || inTest) {
          if (globalContext === globalContext.parent) {
            return proxy;
          }
          return globalContext[p2];
        }
        if (p2 === "hasOwnProperty") {
          return hasOwnProperty2;
        }
        if (p2 === "document") {
          return _this.document;
        }
        if (p2 === "eval") {
          return eval;
        }
        if (p2 === "string" && globalVariableWhiteList.indexOf(p2) !== -1) {
          return globalContext[p2];
        }
        var actualTarget = propertiesWithGetter.has(p2) ? globalContext : p2 in target ? target : globalContext;
        var value = actualTarget[p2];
        if (isPropertyFrozen(actualTarget, p2)) {
          return value;
        }
        if (!isNativeGlobalProp(p2) && !useNativeWindowForBindingsProps.has(p2)) {
          return value;
        }
        var boundTarget = useNativeWindowForBindingsProps.get(p2) ? nativeGlobal : globalContext;
        return rebindTarget2Fn(boundTarget, value);
      },
      // trap in operator
      // see https://github.com/styled-components/styled-components/blob/master/packages/styled-components/src/constants.js#L12
      has: function has(target, p2) {
        return p2 in cachedGlobalObjects || p2 in target || p2 in globalContext;
      },
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, p2) {
        if (target.hasOwnProperty(p2)) {
          var descriptor = Object.getOwnPropertyDescriptor(target, p2);
          descriptorTargetMap.set(p2, "target");
          return descriptor;
        }
        if (globalContext.hasOwnProperty(p2)) {
          var _descriptor = Object.getOwnPropertyDescriptor(globalContext, p2);
          descriptorTargetMap.set(p2, "globalContext");
          if (_descriptor && !_descriptor.configurable) {
            _descriptor.configurable = true;
          }
          return _descriptor;
        }
        return void 0;
      },
      // trap to support iterator with sandbox
      ownKeys: function ownKeys2(target) {
        return uniq(Reflect.ownKeys(globalContext).concat(Reflect.ownKeys(target)));
      },
      defineProperty: function defineProperty2(target, p2, attributes) {
        var from = descriptorTargetMap.get(p2);
        switch (from) {
          case "globalContext":
            return Reflect.defineProperty(globalContext, p2, attributes);
          default:
            return Reflect.defineProperty(target, p2, attributes);
        }
      },
      deleteProperty: function deleteProperty(target, p2) {
        _this.registerRunningApp(name2, proxy);
        if (target.hasOwnProperty(p2)) {
          delete target[p2];
          updatedValueSet.delete(p2);
          return true;
        }
        return true;
      },
      // makes sure `window instanceof Window` returns truthy in micro app
      getPrototypeOf: function getPrototypeOf() {
        return Reflect.getPrototypeOf(globalContext);
      }
    });
    this.proxy = proxy;
    activeSandboxCount++;
    function hasOwnProperty2(key) {
      if (this !== proxy && this !== null && _typeof$1(this) === "object") {
        return Object.prototype.hasOwnProperty.call(this, key);
      }
      return fakeWindow.hasOwnProperty(key) || globalContext.hasOwnProperty(key);
    }
  }
  _createClass(ProxySandbox2, [{
    key: "active",
    value: function active() {
      if (!this.sandboxRunning) activeSandboxCount++;
      this.sandboxRunning = true;
    }
  }, {
    key: "inactive",
    value: function inactive() {
      var _this2 = this;
      if (--activeSandboxCount === 0) {
        Object.keys(this.globalWhitelistPrevDescriptor).forEach(function(p2) {
          var descriptor = _this2.globalWhitelistPrevDescriptor[p2];
          if (descriptor) {
            Object.defineProperty(_this2.globalContext, p2, descriptor);
          } else {
            delete _this2.globalContext[p2];
          }
        });
      }
      this.sandboxRunning = false;
    }
  }, {
    key: "patchDocument",
    value: function patchDocument2(doc) {
      this.document = doc;
    }
  }, {
    key: "registerRunningApp",
    value: function registerRunningApp(name2, proxy) {
      if (this.sandboxRunning) {
        var currentRunningApp2 = getCurrentRunningApp();
        if (!currentRunningApp2 || currentRunningApp2.name !== name2) {
          setCurrentRunningApp({
            name: name2,
            window: proxy
          });
        }
        nextTask(clearCurrentRunningApp);
      }
    }
  }]);
  return ProxySandbox2;
}();
var SCRIPT_TAG_NAME = "SCRIPT";
var LINK_TAG_NAME = "LINK";
var STYLE_TAG_NAME = "STYLE";
var styleElementTargetSymbol = Symbol("target");
var styleElementRefNodeNo = Symbol("refNodeNo");
var overwrittenSymbol = Symbol("qiankun-overwritten");
var getAppWrapperHeadElement = function getAppWrapperHeadElement2(appWrapper) {
  return appWrapper.querySelector(qiankunHeadTagName);
};
function isExecutableScriptType(script) {
  return !script.type || ["text/javascript", "module", "application/javascript", "text/ecmascript", "application/ecmascript"].indexOf(script.type) !== -1;
}
function isHijackingTag(tagName) {
  return (tagName === null || tagName === void 0 ? void 0 : tagName.toUpperCase()) === LINK_TAG_NAME || (tagName === null || tagName === void 0 ? void 0 : tagName.toUpperCase()) === STYLE_TAG_NAME || (tagName === null || tagName === void 0 ? void 0 : tagName.toUpperCase()) === SCRIPT_TAG_NAME;
}
function isStyledComponentsLike(element) {
  var _element$sheet, _getStyledElementCSSR;
  return !element.textContent && (((_element$sheet = element.sheet) === null || _element$sheet === void 0 ? void 0 : _element$sheet.cssRules.length) || ((_getStyledElementCSSR = getStyledElementCSSRules(element)) === null || _getStyledElementCSSR === void 0 ? void 0 : _getStyledElementCSSR.length));
}
var appsCounterMap = /* @__PURE__ */ new Map();
function calcAppCount(appName, calcType, status) {
  var appCount = appsCounterMap.get(appName) || {
    bootstrappingPatchCount: 0,
    mountingPatchCount: 0
  };
  switch (calcType) {
    case "increase":
      appCount["".concat(status, "PatchCount")] += 1;
      break;
    case "decrease":
      if (appCount["".concat(status, "PatchCount")] > 0) {
        appCount["".concat(status, "PatchCount")] -= 1;
      }
      break;
  }
  appsCounterMap.set(appName, appCount);
}
function isAllAppsUnmounted() {
  return Array.from(appsCounterMap.entries()).every(function(_ref) {
    var _ref2 = _slicedToArray(_ref, 2), _ref2$ = _ref2[1], bpc = _ref2$.bootstrappingPatchCount, mpc = _ref2$.mountingPatchCount;
    return bpc === 0 && mpc === 0;
  });
}
function patchCustomEvent(e2, elementGetter) {
  Object.defineProperties(e2, {
    srcElement: {
      get: elementGetter
    },
    target: {
      get: elementGetter
    }
  });
  return e2;
}
function manualInvokeElementOnLoad(element) {
  var loadEvent = new CustomEvent("load");
  var patchedEvent = patchCustomEvent(loadEvent, function() {
    return element;
  });
  if (_isFunction(element.onload)) {
    element.onload(patchedEvent);
  } else {
    element.dispatchEvent(patchedEvent);
  }
}
function manualInvokeElementOnError(element) {
  var errorEvent = new CustomEvent("error");
  var patchedEvent = patchCustomEvent(errorEvent, function() {
    return element;
  });
  if (_isFunction(element.onerror)) {
    element.onerror(patchedEvent);
  } else {
    element.dispatchEvent(patchedEvent);
  }
}
function convertLinkAsStyle(element, postProcess) {
  var fetchFn = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : fetch;
  var styleElement = document.createElement("style");
  var href = element.href;
  styleElement.dataset.qiankunHref = href;
  fetchFn(href).then(function(res) {
    return res.text();
  }).then(function(styleContext) {
    styleElement.appendChild(document.createTextNode(styleContext));
    postProcess(styleElement);
    manualInvokeElementOnLoad(element);
  }).catch(function() {
    return manualInvokeElementOnError(element);
  });
  return styleElement;
}
var defineNonEnumerableProperty = function defineNonEnumerableProperty2(target, key, value) {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value
  });
};
var styledComponentCSSRulesMap = /* @__PURE__ */ new WeakMap();
var dynamicScriptAttachedCommentMap = /* @__PURE__ */ new WeakMap();
var dynamicLinkAttachedInlineStyleMap = /* @__PURE__ */ new WeakMap();
function recordStyledComponentsCSSRules(styleElements) {
  styleElements.forEach(function(styleElement) {
    if (styleElement instanceof HTMLStyleElement && isStyledComponentsLike(styleElement)) {
      if (styleElement.sheet) {
        styledComponentCSSRulesMap.set(styleElement, styleElement.sheet.cssRules);
      }
    }
  });
}
function getStyledElementCSSRules(styledElement) {
  return styledComponentCSSRulesMap.get(styledElement);
}
function getOverwrittenAppendChildOrInsertBefore(opts) {
  function appendChildOrInsertBefore(newChild) {
    var refChild = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
    var element = newChild;
    var rawDOMAppendOrInsertBefore = opts.rawDOMAppendOrInsertBefore, isInvokedByMicroApp = opts.isInvokedByMicroApp, containerConfigGetter = opts.containerConfigGetter, _opts$target = opts.target, target = _opts$target === void 0 ? "body" : _opts$target;
    if (!isHijackingTag(element.tagName) || !isInvokedByMicroApp(element)) {
      return rawDOMAppendOrInsertBefore.call(this, element, refChild);
    }
    if (element.tagName) {
      var containerConfig = containerConfigGetter(element);
      var appName = containerConfig.appName, appWrapperGetter = containerConfig.appWrapperGetter, proxy = containerConfig.proxy, strictGlobal = containerConfig.strictGlobal, speedySandbox = containerConfig.speedySandbox, dynamicStyleSheetElements = containerConfig.dynamicStyleSheetElements, scopedCSS = containerConfig.scopedCSS, excludeAssetFilter = containerConfig.excludeAssetFilter;
      switch (element.tagName) {
        case LINK_TAG_NAME:
        case STYLE_TAG_NAME: {
          var stylesheetElement = newChild;
          var _stylesheetElement = stylesheetElement, href = _stylesheetElement.href;
          if (excludeAssetFilter && href && excludeAssetFilter(href)) {
            return rawDOMAppendOrInsertBefore.call(this, element, refChild);
          }
          defineNonEnumerableProperty(stylesheetElement, styleElementTargetSymbol, target);
          var appWrapper = appWrapperGetter();
          if (scopedCSS) {
            var _element$tagName;
            var linkElementUsingStylesheet = ((_element$tagName = element.tagName) === null || _element$tagName === void 0 ? void 0 : _element$tagName.toUpperCase()) === LINK_TAG_NAME && element.rel === "stylesheet" && element.href;
            if (linkElementUsingStylesheet) {
              var _frameworkConfigurati;
              var _fetch = typeof frameworkConfiguration.fetch === "function" ? frameworkConfiguration.fetch : (_frameworkConfigurati = frameworkConfiguration.fetch) === null || _frameworkConfigurati === void 0 ? void 0 : _frameworkConfigurati.fn;
              stylesheetElement = convertLinkAsStyle(element, function(styleElement) {
                return process(appWrapper, styleElement, appName);
              }, _fetch);
              dynamicLinkAttachedInlineStyleMap.set(element, stylesheetElement);
            } else {
              process(appWrapper, stylesheetElement, appName);
            }
          }
          var mountDOM = target === "head" ? getAppWrapperHeadElement(appWrapper) : appWrapper;
          var referenceNode = mountDOM.contains(refChild) ? refChild : null;
          var refNo;
          if (referenceNode) {
            refNo = Array.from(mountDOM.childNodes).indexOf(referenceNode);
          }
          var result = rawDOMAppendOrInsertBefore.call(mountDOM, stylesheetElement, referenceNode);
          if (typeof refNo === "number" && refNo !== -1) {
            defineNonEnumerableProperty(stylesheetElement, styleElementRefNodeNo, refNo);
          }
          dynamicStyleSheetElements.push(stylesheetElement);
          return result;
        }
        case SCRIPT_TAG_NAME: {
          var _element = element, src = _element.src, text = _element.text;
          if (excludeAssetFilter && src && excludeAssetFilter(src) || !isExecutableScriptType(element)) {
            return rawDOMAppendOrInsertBefore.call(this, element, refChild);
          }
          var _appWrapper = appWrapperGetter();
          var _mountDOM = target === "head" ? getAppWrapperHeadElement(_appWrapper) : _appWrapper;
          var _fetch2 = frameworkConfiguration.fetch;
          var _referenceNode = _mountDOM.contains(refChild) ? refChild : null;
          var scopedGlobalVariables = speedySandbox ? cachedGlobals : [];
          if (src) {
            var isRedfinedCurrentScript = false;
            _execScripts(null, [src], proxy, {
              fetch: _fetch2,
              strictGlobal,
              scopedGlobalVariables,
              beforeExec: function beforeExec() {
                var isCurrentScriptConfigurable = function isCurrentScriptConfigurable2() {
                  var descriptor = Object.getOwnPropertyDescriptor(document, "currentScript");
                  return !descriptor || descriptor.configurable;
                };
                if (isCurrentScriptConfigurable()) {
                  Object.defineProperty(document, "currentScript", {
                    get: function get() {
                      return element;
                    },
                    configurable: true
                  });
                  isRedfinedCurrentScript = true;
                }
              },
              success: function success() {
                manualInvokeElementOnLoad(element);
                if (isRedfinedCurrentScript) {
                  delete document.currentScript;
                }
                element = null;
              },
              error: function error() {
                manualInvokeElementOnError(element);
                if (isRedfinedCurrentScript) {
                  delete document.currentScript;
                }
                element = null;
              }
            });
            var dynamicScriptCommentElement = document.createComment("dynamic script ".concat(src, " replaced by qiankun"));
            dynamicScriptAttachedCommentMap.set(element, dynamicScriptCommentElement);
            return rawDOMAppendOrInsertBefore.call(_mountDOM, dynamicScriptCommentElement, _referenceNode);
          }
          _execScripts(null, ["<script>".concat(text, "<\/script>")], proxy, {
            strictGlobal,
            scopedGlobalVariables
          });
          var dynamicInlineScriptCommentElement = document.createComment("dynamic inline script replaced by qiankun");
          dynamicScriptAttachedCommentMap.set(element, dynamicInlineScriptCommentElement);
          return rawDOMAppendOrInsertBefore.call(_mountDOM, dynamicInlineScriptCommentElement, _referenceNode);
        }
      }
    }
    return rawDOMAppendOrInsertBefore.call(this, element, refChild);
  }
  appendChildOrInsertBefore[overwrittenSymbol] = true;
  return appendChildOrInsertBefore;
}
function getNewRemoveChild(rawRemoveChild2, containerConfigGetter, target, isInvokedByMicroApp) {
  function removeChild(child) {
    var tagName = child.tagName;
    if (!isHijackingTag(tagName) || !isInvokedByMicroApp(child)) return rawRemoveChild2.call(this, child);
    try {
      var attachedElement;
      var _containerConfigGette = containerConfigGetter(child), appWrapperGetter = _containerConfigGette.appWrapperGetter, dynamicStyleSheetElements = _containerConfigGette.dynamicStyleSheetElements;
      switch (tagName) {
        case STYLE_TAG_NAME:
        case LINK_TAG_NAME: {
          attachedElement = dynamicLinkAttachedInlineStyleMap.get(child) || child;
          var dynamicElementIndex = dynamicStyleSheetElements.indexOf(attachedElement);
          if (dynamicElementIndex !== -1) {
            dynamicStyleSheetElements.splice(dynamicElementIndex, 1);
          }
          break;
        }
        case SCRIPT_TAG_NAME: {
          attachedElement = dynamicScriptAttachedCommentMap.get(child) || child;
          break;
        }
        default: {
          attachedElement = child;
        }
      }
      var appWrapper = appWrapperGetter();
      var container = target === "head" ? getAppWrapperHeadElement(appWrapper) : appWrapper;
      if (container.contains(attachedElement)) {
        return rawRemoveChild2.call(attachedElement.parentNode, attachedElement);
      }
    } catch (e2) {
      console.warn(e2);
    }
    return rawRemoveChild2.call(this, child);
  }
  removeChild[overwrittenSymbol] = true;
  return removeChild;
}
function patchHTMLDynamicAppendPrototypeFunctions(isInvokedByMicroApp, containerConfigGetter) {
  var rawHeadAppendChild2 = HTMLHeadElement.prototype.appendChild;
  var rawBodyAppendChild = HTMLBodyElement.prototype.appendChild;
  var rawHeadInsertBefore2 = HTMLHeadElement.prototype.insertBefore;
  if (rawHeadAppendChild2[overwrittenSymbol] !== true && rawBodyAppendChild[overwrittenSymbol] !== true && rawHeadInsertBefore2[overwrittenSymbol] !== true) {
    HTMLHeadElement.prototype.appendChild = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawHeadAppendChild2,
      containerConfigGetter,
      isInvokedByMicroApp,
      target: "head"
    });
    HTMLBodyElement.prototype.appendChild = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawBodyAppendChild,
      containerConfigGetter,
      isInvokedByMicroApp,
      target: "body"
    });
    HTMLHeadElement.prototype.insertBefore = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawHeadInsertBefore2,
      containerConfigGetter,
      isInvokedByMicroApp,
      target: "head"
    });
  }
  var rawHeadRemoveChild = HTMLHeadElement.prototype.removeChild;
  var rawBodyRemoveChild = HTMLBodyElement.prototype.removeChild;
  if (rawHeadRemoveChild[overwrittenSymbol] !== true && rawBodyRemoveChild[overwrittenSymbol] !== true) {
    HTMLHeadElement.prototype.removeChild = getNewRemoveChild(rawHeadRemoveChild, containerConfigGetter, "head", isInvokedByMicroApp);
    HTMLBodyElement.prototype.removeChild = getNewRemoveChild(rawBodyRemoveChild, containerConfigGetter, "body", isInvokedByMicroApp);
  }
  return function unpatch() {
    HTMLHeadElement.prototype.appendChild = rawHeadAppendChild2;
    HTMLHeadElement.prototype.removeChild = rawHeadRemoveChild;
    HTMLBodyElement.prototype.appendChild = rawBodyAppendChild;
    HTMLBodyElement.prototype.removeChild = rawBodyRemoveChild;
    HTMLHeadElement.prototype.insertBefore = rawHeadInsertBefore2;
  };
}
function rebuildCSSRules(styleSheetElements, reAppendElement) {
  styleSheetElements.forEach(function(stylesheetElement) {
    var appendSuccess = reAppendElement(stylesheetElement);
    if (appendSuccess) {
      if (stylesheetElement instanceof HTMLStyleElement && isStyledComponentsLike(stylesheetElement)) {
        var cssRules = getStyledElementCSSRules(stylesheetElement);
        if (cssRules) {
          for (var i2 = 0; i2 < cssRules.length; i2++) {
            var cssRule = cssRules[i2];
            var cssStyleSheetElement = stylesheetElement.sheet;
            cssStyleSheetElement.insertRule(cssRule.cssText, cssStyleSheetElement.cssRules.length);
          }
        }
      }
    }
  });
}
function patchLooseSandbox(appName, appWrapperGetter, sandbox) {
  var mounting = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
  var scopedCSS = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : false;
  var excludeAssetFilter = arguments.length > 5 ? arguments[5] : void 0;
  var proxy = sandbox.proxy;
  var dynamicStyleSheetElements = [];
  var unpatchDynamicAppendPrototypeFunctions = patchHTMLDynamicAppendPrototypeFunctions(
    /*
      check if the currently specified application is active
      While we switch page from qiankun app to a normal react routing page, the normal one may load stylesheet dynamically while page rendering,
      but the url change listener must wait until the current call stack is flushed.
      This scenario may cause we record the stylesheet from react routing page dynamic injection,
      and remove them after the url change triggered and qiankun app is unmounting
      see https://github.com/ReactTraining/history/blob/master/modules/createHashHistory.js#L222-L230
     */
    function() {
      return Tt(window.location).some(function(name2) {
        return name2 === appName;
      });
    },
    function() {
      return {
        appName,
        appWrapperGetter,
        proxy,
        strictGlobal: false,
        speedySandbox: false,
        scopedCSS,
        dynamicStyleSheetElements,
        excludeAssetFilter
      };
    }
  );
  if (!mounting) calcAppCount(appName, "increase", "bootstrapping");
  if (mounting) calcAppCount(appName, "increase", "mounting");
  return function free() {
    if (!mounting) calcAppCount(appName, "decrease", "bootstrapping");
    if (mounting) calcAppCount(appName, "decrease", "mounting");
    if (isAllAppsUnmounted()) unpatchDynamicAppendPrototypeFunctions();
    recordStyledComponentsCSSRules(dynamicStyleSheetElements);
    return function rebuild() {
      rebuildCSSRules(dynamicStyleSheetElements, function(stylesheetElement) {
        var appWrapper = appWrapperGetter();
        if (!appWrapper.contains(stylesheetElement)) {
          document.head.appendChild.call(appWrapper, stylesheetElement);
          return true;
        }
        return false;
      });
      if (mounting) {
        dynamicStyleSheetElements = [];
      }
    };
  };
}
Object.defineProperty(nativeGlobal, "__proxyAttachContainerConfigMap__", {
  enumerable: false,
  writable: true
});
Object.defineProperty(nativeGlobal, "__currentLockingSandbox__", {
  enumerable: false,
  writable: true,
  configurable: true
});
var rawHeadAppendChild = HTMLHeadElement.prototype.appendChild;
var rawHeadInsertBefore = HTMLHeadElement.prototype.insertBefore;
nativeGlobal.__proxyAttachContainerConfigMap__ = nativeGlobal.__proxyAttachContainerConfigMap__ || /* @__PURE__ */ new WeakMap();
var proxyAttachContainerConfigMap = nativeGlobal.__proxyAttachContainerConfigMap__;
var elementAttachContainerConfigMap = /* @__PURE__ */ new WeakMap();
var docCreatePatchedMap = /* @__PURE__ */ new WeakMap();
var patchMap = /* @__PURE__ */ new WeakMap();
function patchDocument(cfg) {
  var sandbox = cfg.sandbox, speedy = cfg.speedy;
  var attachElementToProxy = function attachElementToProxy2(element, proxy) {
    var proxyContainerConfig = proxyAttachContainerConfigMap.get(proxy);
    if (proxyContainerConfig) {
      elementAttachContainerConfigMap.set(element, proxyContainerConfig);
    }
  };
  if (speedy) {
    var modifications = {};
    var proxyDocument = new Proxy(document, {
      /**
       * Read and write must be paired, otherwise the write operation will leak to the global
       */
      set: function set(target, p2, value) {
        switch (p2) {
          case "createElement": {
            modifications.createElement = value;
            break;
          }
          case "querySelector": {
            modifications.querySelector = value;
            break;
          }
          default:
            target[p2] = value;
            break;
        }
        return true;
      },
      get: function get(target, p2, receiver) {
        switch (p2) {
          case "createElement": {
            var targetCreateElement = modifications.createElement || target.createElement;
            return function createElement2() {
              if (!nativeGlobal.__currentLockingSandbox__) {
                nativeGlobal.__currentLockingSandbox__ = sandbox.name;
              }
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
              var element = targetCreateElement.call.apply(targetCreateElement, [target].concat(args));
              if (nativeGlobal.__currentLockingSandbox__ === sandbox.name) {
                attachElementToProxy(element, sandbox.proxy);
                delete nativeGlobal.__currentLockingSandbox__;
              }
              return element;
            };
          }
          case "querySelector": {
            var targetQuerySelector = modifications.querySelector || target.querySelector;
            return function querySelector() {
              for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }
              var selector = args[0];
              switch (selector) {
                case "head": {
                  var containerConfig = proxyAttachContainerConfigMap.get(sandbox.proxy);
                  if (containerConfig) {
                    var qiankunHead = getAppWrapperHeadElement(containerConfig.appWrapperGetter());
                    qiankunHead.appendChild = HTMLHeadElement.prototype.appendChild;
                    qiankunHead.insertBefore = HTMLHeadElement.prototype.insertBefore;
                    qiankunHead.removeChild = HTMLHeadElement.prototype.removeChild;
                    return qiankunHead;
                  }
                  break;
                }
              }
              return targetQuerySelector.call.apply(targetQuerySelector, [target].concat(args));
            };
          }
        }
        var value = target[p2];
        if (isCallable(value) && !isBoundedFunction(value)) {
          return function proxyFunction() {
            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }
            return value.call.apply(value, [target].concat(_toConsumableArray(args.map(function(arg) {
              return arg === receiver ? target : arg;
            }))));
          };
        }
        return value;
      }
    });
    sandbox.patchDocument(proxyDocument);
    var nativeMutationObserverObserveFn = MutationObserver.prototype.observe;
    if (!patchMap.has(nativeMutationObserverObserveFn)) {
      var observe = function observe2(target, options) {
        var realTarget = target instanceof Document ? nativeDocument : target;
        return nativeMutationObserverObserveFn.call(this, realTarget, options);
      };
      MutationObserver.prototype.observe = observe;
      patchMap.set(nativeMutationObserverObserveFn, observe);
    }
    var prevCompareDocumentPosition = Node.prototype.compareDocumentPosition;
    if (!patchMap.has(prevCompareDocumentPosition)) {
      Node.prototype.compareDocumentPosition = function compareDocumentPosition(node) {
        var realNode = node instanceof Document ? nativeDocument : node;
        return prevCompareDocumentPosition.call(this, realNode);
      };
      patchMap.set(prevCompareDocumentPosition, Node.prototype.compareDocumentPosition);
    }
    var parentNodeDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, "parentNode");
    if (parentNodeDescriptor && !patchMap.has(parentNodeDescriptor)) {
      var parentNodeGetter = parentNodeDescriptor.get, configurable = parentNodeDescriptor.configurable;
      if (parentNodeGetter && configurable) {
        var patchedParentNodeDescriptor = _objectSpread2(_objectSpread2({}, parentNodeDescriptor), {}, {
          get: function get() {
            var parentNode = parentNodeGetter.call(this);
            if (parentNode instanceof Document) {
              var _getCurrentRunningApp;
              var proxy = (_getCurrentRunningApp = getCurrentRunningApp()) === null || _getCurrentRunningApp === void 0 ? void 0 : _getCurrentRunningApp.window;
              if (proxy) {
                return proxy.document;
              }
            }
            return parentNode;
          }
        });
        Object.defineProperty(Node.prototype, "parentNode", patchedParentNodeDescriptor);
        patchMap.set(parentNodeDescriptor, patchedParentNodeDescriptor);
      }
    }
    return function() {
      MutationObserver.prototype.observe = nativeMutationObserverObserveFn;
      patchMap.delete(nativeMutationObserverObserveFn);
      Node.prototype.compareDocumentPosition = prevCompareDocumentPosition;
      patchMap.delete(prevCompareDocumentPosition);
      if (parentNodeDescriptor) {
        Object.defineProperty(Node.prototype, "parentNode", parentNodeDescriptor);
        patchMap.delete(parentNodeDescriptor);
      }
    };
  }
  var docCreateElementFnBeforeOverwrite = docCreatePatchedMap.get(document.createElement);
  if (!docCreateElementFnBeforeOverwrite) {
    var rawDocumentCreateElement = document.createElement;
    Document.prototype.createElement = function createElement2(tagName, options) {
      var element = rawDocumentCreateElement.call(this, tagName, options);
      if (isHijackingTag(tagName)) {
        var _ref = getCurrentRunningApp() || {}, currentRunningSandboxProxy = _ref.window;
        if (currentRunningSandboxProxy) {
          attachElementToProxy(element, currentRunningSandboxProxy);
        }
      }
      return element;
    };
    if (document.hasOwnProperty("createElement")) {
      document.createElement = Document.prototype.createElement;
    }
    docCreatePatchedMap.set(Document.prototype.createElement, rawDocumentCreateElement);
  }
  return function unpatch() {
    if (docCreateElementFnBeforeOverwrite) {
      Document.prototype.createElement = docCreateElementFnBeforeOverwrite;
      document.createElement = docCreateElementFnBeforeOverwrite;
    }
  };
}
function patchStrictSandbox(appName, appWrapperGetter, sandbox) {
  var mounting = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
  var scopedCSS = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : false;
  var excludeAssetFilter = arguments.length > 5 ? arguments[5] : void 0;
  var speedySandbox = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : false;
  var proxy = sandbox.proxy;
  var containerConfig = proxyAttachContainerConfigMap.get(proxy);
  if (!containerConfig) {
    containerConfig = {
      appName,
      proxy,
      appWrapperGetter,
      dynamicStyleSheetElements: [],
      strictGlobal: true,
      speedySandbox,
      excludeAssetFilter,
      scopedCSS
    };
    proxyAttachContainerConfigMap.set(proxy, containerConfig);
  }
  var _containerConfig = containerConfig, dynamicStyleSheetElements = _containerConfig.dynamicStyleSheetElements;
  var unpatchDynamicAppendPrototypeFunctions = patchHTMLDynamicAppendPrototypeFunctions(function(element) {
    return elementAttachContainerConfigMap.has(element);
  }, function(element) {
    return elementAttachContainerConfigMap.get(element);
  });
  var unpatchDocument = patchDocument({
    sandbox,
    speedy: speedySandbox
  });
  if (!mounting) calcAppCount(appName, "increase", "bootstrapping");
  if (mounting) calcAppCount(appName, "increase", "mounting");
  return function free() {
    if (!mounting) calcAppCount(appName, "decrease", "bootstrapping");
    if (mounting) calcAppCount(appName, "decrease", "mounting");
    if (isAllAppsUnmounted()) {
      unpatchDynamicAppendPrototypeFunctions();
      unpatchDocument();
    }
    recordStyledComponentsCSSRules(dynamicStyleSheetElements);
    return function rebuild() {
      rebuildCSSRules(dynamicStyleSheetElements, function(stylesheetElement) {
        var appWrapper = appWrapperGetter();
        if (!appWrapper.contains(stylesheetElement)) {
          var mountDom = stylesheetElement[styleElementTargetSymbol] === "head" ? getAppWrapperHeadElement(appWrapper) : appWrapper;
          var refNo = stylesheetElement[styleElementRefNodeNo];
          if (typeof refNo === "number" && refNo !== -1) {
            var refNode = mountDom.childNodes[refNo] || null;
            rawHeadInsertBefore.call(mountDom, stylesheetElement, refNode);
            return true;
          } else {
            rawHeadAppendChild.call(mountDom, stylesheetElement);
            return true;
          }
        }
        return false;
      });
    };
  };
}
function patch$2() {
  var rawHistoryListen = function rawHistoryListen2(_2) {
    return _noop;
  };
  var historyListeners = [];
  var historyUnListens = [];
  if (window.g_history && _isFunction(window.g_history.listen)) {
    rawHistoryListen = window.g_history.listen.bind(window.g_history);
    window.g_history.listen = function(listener) {
      historyListeners.push(listener);
      var unListen = rawHistoryListen(listener);
      historyUnListens.push(unListen);
      return function() {
        unListen();
        historyUnListens.splice(historyUnListens.indexOf(unListen), 1);
        historyListeners.splice(historyListeners.indexOf(listener), 1);
      };
    };
  }
  return function free() {
    var rebuild = _noop;
    if (historyListeners.length) {
      rebuild = function rebuild2() {
        historyListeners.forEach(function(listener) {
          return window.g_history.listen(listener);
        });
      };
    }
    historyUnListens.forEach(function(unListen) {
      return unListen();
    });
    if (window.g_history && _isFunction(window.g_history.listen)) {
      window.g_history.listen = rawHistoryListen;
    }
    return rebuild;
  };
}
var rawWindowInterval = window.setInterval;
var rawWindowClearInterval = window.clearInterval;
function patch$1(global2) {
  var intervals = [];
  global2.clearInterval = function(intervalId) {
    intervals = intervals.filter(function(id) {
      return id !== intervalId;
    });
    return rawWindowClearInterval.call(window, intervalId);
  };
  global2.setInterval = function(handler, timeout) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    var intervalId = rawWindowInterval.apply(void 0, [handler, timeout].concat(args));
    intervals = [].concat(_toConsumableArray(intervals), [intervalId]);
    return intervalId;
  };
  return function free() {
    intervals.forEach(function(id) {
      return global2.clearInterval(id);
    });
    global2.setInterval = rawWindowInterval;
    global2.clearInterval = rawWindowClearInterval;
    return _noop;
  };
}
var rawAddEventListener = window.addEventListener;
var rawRemoveEventListener = window.removeEventListener;
function patch(global2) {
  var listenerMap = /* @__PURE__ */ new Map();
  global2.addEventListener = function(type, listener, options) {
    var listeners = listenerMap.get(type) || [];
    listenerMap.set(type, [].concat(_toConsumableArray(listeners), [listener]));
    return rawAddEventListener.call(window, type, listener, options);
  };
  global2.removeEventListener = function(type, listener, options) {
    var storedTypeListeners = listenerMap.get(type);
    if (storedTypeListeners && storedTypeListeners.length && storedTypeListeners.indexOf(listener) !== -1) {
      storedTypeListeners.splice(storedTypeListeners.indexOf(listener), 1);
    }
    return rawRemoveEventListener.call(window, type, listener, options);
  };
  return function free() {
    listenerMap.forEach(function(listeners, type) {
      return _toConsumableArray(listeners).forEach(function(listener) {
        return global2.removeEventListener(type, listener);
      });
    });
    global2.addEventListener = rawAddEventListener;
    global2.removeEventListener = rawRemoveEventListener;
    return _noop;
  };
}
function patchAtMounting(appName, elementGetter, sandbox, scopedCSS, excludeAssetFilter, speedySandBox) {
  var _patchersInSandbox$sa;
  var basePatchers = [function() {
    return patch$1(sandbox.proxy);
  }, function() {
    return patch(sandbox.proxy);
  }, function() {
    return patch$2();
  }];
  var patchersInSandbox = _defineProperty$1(_defineProperty$1(_defineProperty$1({}, SandBoxType.LegacyProxy, [].concat(basePatchers, [function() {
    return patchLooseSandbox(appName, elementGetter, sandbox, true, scopedCSS, excludeAssetFilter);
  }])), SandBoxType.Proxy, [].concat(basePatchers, [function() {
    return patchStrictSandbox(appName, elementGetter, sandbox, true, scopedCSS, excludeAssetFilter, speedySandBox);
  }])), SandBoxType.Snapshot, [].concat(basePatchers, [function() {
    return patchLooseSandbox(appName, elementGetter, sandbox, true, scopedCSS, excludeAssetFilter);
  }]));
  return (_patchersInSandbox$sa = patchersInSandbox[sandbox.type]) === null || _patchersInSandbox$sa === void 0 ? void 0 : _patchersInSandbox$sa.map(function(patch2) {
    return patch2();
  });
}
function patchAtBootstrapping(appName, elementGetter, sandbox, scopedCSS, excludeAssetFilter, speedySandBox) {
  var _patchersInSandbox$sa2;
  var patchersInSandbox = _defineProperty$1(_defineProperty$1(_defineProperty$1({}, SandBoxType.LegacyProxy, [function() {
    return patchLooseSandbox(appName, elementGetter, sandbox, false, scopedCSS, excludeAssetFilter);
  }]), SandBoxType.Proxy, [function() {
    return patchStrictSandbox(appName, elementGetter, sandbox, false, scopedCSS, excludeAssetFilter, speedySandBox);
  }]), SandBoxType.Snapshot, [function() {
    return patchLooseSandbox(appName, elementGetter, sandbox, false, scopedCSS, excludeAssetFilter);
  }]);
  return (_patchersInSandbox$sa2 = patchersInSandbox[sandbox.type]) === null || _patchersInSandbox$sa2 === void 0 ? void 0 : _patchersInSandbox$sa2.map(function(patch2) {
    return patch2();
  });
}
function iter(obj, callbackFn) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) || prop === "clearInterval") {
      callbackFn(prop);
    }
  }
}
var SnapshotSandbox = /* @__PURE__ */ function() {
  function SnapshotSandbox2(name2) {
    _classCallCheck(this, SnapshotSandbox2);
    this.proxy = void 0;
    this.name = void 0;
    this.type = void 0;
    this.sandboxRunning = true;
    this.windowSnapshot = void 0;
    this.modifyPropsMap = {};
    this.name = name2;
    this.proxy = window;
    this.type = SandBoxType.Snapshot;
  }
  _createClass(SnapshotSandbox2, [{
    key: "active",
    value: function active() {
      var _this = this;
      this.windowSnapshot = {};
      iter(window, function(prop) {
        _this.windowSnapshot[prop] = window[prop];
      });
      Object.keys(this.modifyPropsMap).forEach(function(p2) {
        window[p2] = _this.modifyPropsMap[p2];
      });
      this.sandboxRunning = true;
    }
  }, {
    key: "inactive",
    value: function inactive() {
      var _this2 = this;
      this.modifyPropsMap = {};
      iter(window, function(prop) {
        if (window[prop] !== _this2.windowSnapshot[prop]) {
          _this2.modifyPropsMap[prop] = window[prop];
          window[prop] = _this2.windowSnapshot[prop];
        }
      });
      this.sandboxRunning = false;
    }
  }, {
    key: "patchDocument",
    value: function patchDocument2() {
    }
  }]);
  return SnapshotSandbox2;
}();
function createSandboxContainer(appName, elementGetter, scopedCSS, useLooseSandbox, excludeAssetFilter, globalContext, speedySandBox) {
  var sandbox;
  if (window.Proxy) {
    sandbox = useLooseSandbox ? new LegacySandbox(appName, globalContext) : new ProxySandbox(appName, globalContext, {
      speedy: !!speedySandBox
    });
  } else {
    sandbox = new SnapshotSandbox(appName);
  }
  var bootstrappingFreers = patchAtBootstrapping(appName, elementGetter, sandbox, scopedCSS, excludeAssetFilter, speedySandBox);
  var mountingFreers = [];
  var sideEffectsRebuilders = [];
  return {
    instance: sandbox,
    /**
     * 沙箱被 mount
     * 可能是从 bootstrap 状态进入的 mount
     * 也可能是从 unmount 之后再次唤醒进入 mount
     */
    mount: function mount() {
      return _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee() {
        var sideEffectsRebuildersAtBootstrapping, sideEffectsRebuildersAtMounting;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              sandbox.active();
              sideEffectsRebuildersAtBootstrapping = sideEffectsRebuilders.slice(0, bootstrappingFreers.length);
              sideEffectsRebuildersAtMounting = sideEffectsRebuilders.slice(bootstrappingFreers.length);
              if (sideEffectsRebuildersAtBootstrapping.length) {
                sideEffectsRebuildersAtBootstrapping.forEach(function(rebuild) {
                  return rebuild();
                });
              }
              mountingFreers = patchAtMounting(appName, elementGetter, sandbox, scopedCSS, excludeAssetFilter, speedySandBox);
              if (sideEffectsRebuildersAtMounting.length) {
                sideEffectsRebuildersAtMounting.forEach(function(rebuild) {
                  return rebuild();
                });
              }
              sideEffectsRebuilders = [];
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }))();
    },
    /**
     * 恢复 global 状态，使其能回到应用加载之前的状态
     */
    unmount: function unmount() {
      return _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              sideEffectsRebuilders = [].concat(_toConsumableArray(bootstrappingFreers), _toConsumableArray(mountingFreers)).map(function(free) {
                return free();
              });
              sandbox.inactive();
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }))();
    }
  };
}
var _excluded$1 = ["singular", "sandbox", "excludeAssetFilter", "globalContext"];
function assertElementExist(element, msg) {
  if (!element) {
    if (msg) {
      throw new QiankunError(msg);
    }
    throw new QiankunError("element not existed!");
  }
}
function execHooksChain(hooks, app) {
  var global2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : window;
  if (hooks.length) {
    return hooks.reduce(function(chain, hook) {
      return chain.then(function() {
        return hook(app, global2);
      });
    }, Promise.resolve());
  }
  return Promise.resolve();
}
function validateSingularMode(_x, _x2) {
  return _validateSingularMode.apply(this, arguments);
}
function _validateSingularMode() {
  _validateSingularMode = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee(validate, app) {
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", typeof validate === "function" ? validate(app) : !!validate);
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _validateSingularMode.apply(this, arguments);
}
var supportShadowDOM = !!document.head.attachShadow || !!document.head.createShadowRoot;
function createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId) {
  var containerElement = document.createElement("div");
  containerElement.innerHTML = appContent;
  var appElement = containerElement.firstChild;
  if (strictStyleIsolation) {
    if (!supportShadowDOM) {
      console.warn("[qiankun]: As current browser not support shadow dom, your strictStyleIsolation configuration will be ignored!");
    } else {
      var innerHTML = appElement.innerHTML;
      appElement.innerHTML = "";
      var shadow;
      if (appElement.attachShadow) {
        shadow = appElement.attachShadow({
          mode: "open"
        });
      } else {
        shadow = appElement.createShadowRoot();
      }
      shadow.innerHTML = innerHTML;
    }
  }
  if (scopedCSS) {
    var attr = appElement.getAttribute(QiankunCSSRewriteAttr);
    if (!attr) {
      appElement.setAttribute(QiankunCSSRewriteAttr, appInstanceId);
    }
    var styleNodes = appElement.querySelectorAll("style") || [];
    _forEach(styleNodes, function(stylesheetElement) {
      process(appElement, stylesheetElement, appInstanceId);
    });
  }
  return appElement;
}
function getAppWrapperGetter(appInstanceId, useLegacyRender, strictStyleIsolation, scopedCSS, elementGetter) {
  return function() {
    if (useLegacyRender) {
      if (strictStyleIsolation) throw new QiankunError("strictStyleIsolation can not be used with legacy render!");
      if (scopedCSS) throw new QiankunError("experimentalStyleIsolation can not be used with legacy render!");
      var appWrapper = document.getElementById(getWrapperId(appInstanceId));
      assertElementExist(appWrapper, "Wrapper element for ".concat(appInstanceId, " is not existed!"));
      return appWrapper;
    }
    var element = elementGetter();
    assertElementExist(element, "Wrapper element for ".concat(appInstanceId, " is not existed!"));
    if (strictStyleIsolation && supportShadowDOM) {
      return element.shadowRoot;
    }
    return element;
  };
}
var rawAppendChild = HTMLElement.prototype.appendChild;
var rawRemoveChild = HTMLElement.prototype.removeChild;
function getRender(appInstanceId, appContent, legacyRender) {
  var render = function render2(_ref, phase) {
    var element = _ref.element, loading = _ref.loading, container = _ref.container;
    if (legacyRender) {
      return legacyRender({
        loading,
        appContent: element ? appContent : ""
      });
    }
    var containerElement = getContainer(container);
    if (phase !== "unmounted") {
      var errorMsg = function() {
        switch (phase) {
          case "loading":
          case "mounting":
            return "Target container with ".concat(container, " not existed while ").concat(appInstanceId, " ").concat(phase, "!");
          case "mounted":
            return "Target container with ".concat(container, " not existed after ").concat(appInstanceId, " ").concat(phase, "!");
          default:
            return "Target container with ".concat(container, " not existed while ").concat(appInstanceId, " rendering!");
        }
      }();
      assertElementExist(containerElement, errorMsg);
    }
    if (containerElement && !containerElement.contains(element)) {
      while (containerElement.firstChild) {
        rawRemoveChild.call(containerElement, containerElement.firstChild);
      }
      if (element) {
        rawAppendChild.call(containerElement, element);
      }
    }
    return void 0;
  };
  return render;
}
function getLifecyclesFromExports(scriptExports, appName, global2, globalLatestSetProp) {
  if (validateExportLifecycle(scriptExports)) {
    return scriptExports;
  }
  if (globalLatestSetProp) {
    var lifecycles = global2[globalLatestSetProp];
    if (validateExportLifecycle(lifecycles)) {
      return lifecycles;
    }
  }
  var globalVariableExports = global2[appName];
  if (validateExportLifecycle(globalVariableExports)) {
    return globalVariableExports;
  }
  throw new QiankunError("You need to export lifecycle functions in ".concat(appName, " entry"));
}
var prevAppUnmountedDeferred;
function loadApp(_x3) {
  return _loadApp.apply(this, arguments);
}
function _loadApp() {
  _loadApp = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee17(app) {
    var _sandboxContainer, _sandboxContainer$ins;
    var configuration, lifeCycles, entry, appName, appInstanceId, _configuration$singul, singular, _configuration$sandbo, sandbox, excludeAssetFilter, _configuration$global, globalContext, importEntryOpts, _yield$importEntry, template, execScripts, assetPublicPath, getExternalScripts, appContent, strictStyleIsolation, scopedCSS, initialAppWrapperElement, initialContainer, legacyRender, render, initialAppWrapperGetter, global2, mountSandbox, unmountSandbox, useLooseSandbox, speedySandbox, sandboxContainer, _mergeWith, _mergeWith$beforeUnmo, beforeUnmount, _mergeWith$afterUnmou, afterUnmount, _mergeWith$afterMount, afterMount, _mergeWith$beforeMoun, beforeMount, _mergeWith$beforeLoad, beforeLoad, scriptExports, _getLifecyclesFromExp, bootstrap, mount, unmount, update, _getMicroAppStateActi, onGlobalStateChange, setGlobalState, offGlobalStateChange, syncAppWrapperElement2Sandbox, parcelConfigGetter, _args17 = arguments;
    return _regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) switch (_context17.prev = _context17.next) {
        case 0:
          configuration = _args17.length > 1 && _args17[1] !== void 0 ? _args17[1] : {};
          lifeCycles = _args17.length > 2 ? _args17[2] : void 0;
          entry = app.entry, appName = app.name;
          appInstanceId = genAppInstanceIdByName(appName);
          _configuration$singul = configuration.singular, singular = _configuration$singul === void 0 ? false : _configuration$singul, _configuration$sandbo = configuration.sandbox, sandbox = _configuration$sandbo === void 0 ? true : _configuration$sandbo, excludeAssetFilter = configuration.excludeAssetFilter, _configuration$global = configuration.globalContext, globalContext = _configuration$global === void 0 ? window : _configuration$global, importEntryOpts = _objectWithoutProperties(configuration, _excluded$1);
          _context17.next = 9;
          return importEntry(entry, importEntryOpts);
        case 9:
          _yield$importEntry = _context17.sent;
          template = _yield$importEntry.template;
          execScripts = _yield$importEntry.execScripts;
          assetPublicPath = _yield$importEntry.assetPublicPath;
          getExternalScripts = _yield$importEntry.getExternalScripts;
          _context17.next = 16;
          return getExternalScripts();
        case 16:
          _context17.next = 18;
          return validateSingularMode(singular, app);
        case 18:
          if (!_context17.sent) {
            _context17.next = 21;
            break;
          }
          _context17.next = 21;
          return prevAppUnmountedDeferred && prevAppUnmountedDeferred.promise;
        case 21:
          appContent = getDefaultTplWrapper(appInstanceId, sandbox)(template);
          strictStyleIsolation = _typeof$1(sandbox) === "object" && !!sandbox.strictStyleIsolation;
          scopedCSS = isEnableScopedCSS(sandbox);
          initialAppWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId);
          initialContainer = "container" in app ? app.container : void 0;
          legacyRender = "render" in app ? app.render : void 0;
          render = getRender(appInstanceId, appContent, legacyRender);
          render({
            element: initialAppWrapperElement,
            loading: true,
            container: initialContainer
          }, "loading");
          initialAppWrapperGetter = getAppWrapperGetter(appInstanceId, !!legacyRender, strictStyleIsolation, scopedCSS, function() {
            return initialAppWrapperElement;
          });
          global2 = globalContext;
          mountSandbox = function mountSandbox2() {
            return Promise.resolve();
          };
          unmountSandbox = function unmountSandbox2() {
            return Promise.resolve();
          };
          useLooseSandbox = _typeof$1(sandbox) === "object" && !!sandbox.loose;
          speedySandbox = _typeof$1(sandbox) === "object" ? sandbox.speedy !== false : true;
          if (sandbox) {
            sandboxContainer = createSandboxContainer(
              appInstanceId,
              // FIXME should use a strict sandbox logic while remount, see https://github.com/umijs/qiankun/issues/518
              initialAppWrapperGetter,
              scopedCSS,
              useLooseSandbox,
              excludeAssetFilter,
              global2,
              speedySandbox
            );
            global2 = sandboxContainer.instance.proxy;
            mountSandbox = sandboxContainer.mount;
            unmountSandbox = sandboxContainer.unmount;
          }
          _mergeWith = _mergeWith2({}, getAddOns(global2, assetPublicPath), lifeCycles, function(v1, v2) {
            return _concat(v1 !== null && v1 !== void 0 ? v1 : [], v2 !== null && v2 !== void 0 ? v2 : []);
          }), _mergeWith$beforeUnmo = _mergeWith.beforeUnmount, beforeUnmount = _mergeWith$beforeUnmo === void 0 ? [] : _mergeWith$beforeUnmo, _mergeWith$afterUnmou = _mergeWith.afterUnmount, afterUnmount = _mergeWith$afterUnmou === void 0 ? [] : _mergeWith$afterUnmou, _mergeWith$afterMount = _mergeWith.afterMount, afterMount = _mergeWith$afterMount === void 0 ? [] : _mergeWith$afterMount, _mergeWith$beforeMoun = _mergeWith.beforeMount, beforeMount = _mergeWith$beforeMoun === void 0 ? [] : _mergeWith$beforeMoun, _mergeWith$beforeLoad = _mergeWith.beforeLoad, beforeLoad = _mergeWith$beforeLoad === void 0 ? [] : _mergeWith$beforeLoad;
          _context17.next = 40;
          return execHooksChain(toArray(beforeLoad), app, global2);
        case 40:
          _context17.next = 42;
          return execScripts(global2, sandbox && !useLooseSandbox, {
            scopedGlobalVariables: speedySandbox ? cachedGlobals : []
          });
        case 42:
          scriptExports = _context17.sent;
          _getLifecyclesFromExp = getLifecyclesFromExports(scriptExports, appName, global2, (_sandboxContainer = sandboxContainer) === null || _sandboxContainer === void 0 ? void 0 : (_sandboxContainer$ins = _sandboxContainer.instance) === null || _sandboxContainer$ins === void 0 ? void 0 : _sandboxContainer$ins.latestSetProp), bootstrap = _getLifecyclesFromExp.bootstrap, mount = _getLifecyclesFromExp.mount, unmount = _getLifecyclesFromExp.unmount, update = _getLifecyclesFromExp.update;
          _getMicroAppStateActi = getMicroAppStateActions(appInstanceId), onGlobalStateChange = _getMicroAppStateActi.onGlobalStateChange, setGlobalState = _getMicroAppStateActi.setGlobalState, offGlobalStateChange = _getMicroAppStateActi.offGlobalStateChange;
          syncAppWrapperElement2Sandbox = function syncAppWrapperElement2Sandbox2(element) {
            return initialAppWrapperElement = element;
          };
          parcelConfigGetter = function parcelConfigGetter2() {
            var remountContainer = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : initialContainer;
            var appWrapperElement;
            var appWrapperGetter;
            var parcelConfig = {
              name: appInstanceId,
              bootstrap,
              mount: [
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee2() {
                  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                      case 0:
                      case 1:
                      case "end":
                        return _context2.stop();
                    }
                  }, _callee2);
                })),
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee3() {
                  return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return validateSingularMode(singular, app);
                      case 2:
                        _context3.t0 = _context3.sent;
                        if (!_context3.t0) {
                          _context3.next = 5;
                          break;
                        }
                        _context3.t0 = prevAppUnmountedDeferred;
                      case 5:
                        if (!_context3.t0) {
                          _context3.next = 7;
                          break;
                        }
                        return _context3.abrupt("return", prevAppUnmountedDeferred.promise);
                      case 7:
                        return _context3.abrupt("return", void 0);
                      case 8:
                      case "end":
                        return _context3.stop();
                    }
                  }, _callee3);
                })),
                // initial wrapper element before app mount/remount
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee4() {
                  return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) switch (_context4.prev = _context4.next) {
                      case 0:
                        appWrapperElement = initialAppWrapperElement;
                        appWrapperGetter = getAppWrapperGetter(appInstanceId, !!legacyRender, strictStyleIsolation, scopedCSS, function() {
                          return appWrapperElement;
                        });
                      case 2:
                      case "end":
                        return _context4.stop();
                    }
                  }, _callee4);
                })),
                // 添加 mount hook, 确保每次应用加载前容器 dom 结构已经设置完毕
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee5() {
                  var useNewContainer;
                  return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) switch (_context5.prev = _context5.next) {
                      case 0:
                        useNewContainer = remountContainer !== initialContainer;
                        if (useNewContainer || !appWrapperElement) {
                          appWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId);
                          syncAppWrapperElement2Sandbox(appWrapperElement);
                        }
                        render({
                          element: appWrapperElement,
                          loading: true,
                          container: remountContainer
                        }, "mounting");
                      case 3:
                      case "end":
                        return _context5.stop();
                    }
                  }, _callee5);
                })),
                mountSandbox,
                // exec the chain after rendering to keep the behavior with beforeLoad
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee6() {
                  return _regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) switch (_context6.prev = _context6.next) {
                      case 0:
                        return _context6.abrupt("return", execHooksChain(toArray(beforeMount), app, global2));
                      case 1:
                      case "end":
                        return _context6.stop();
                    }
                  }, _callee6);
                })),
                /* @__PURE__ */ function() {
                  var _ref7 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee7(props) {
                    return _regeneratorRuntime.wrap(function _callee7$(_context7) {
                      while (1) switch (_context7.prev = _context7.next) {
                        case 0:
                          return _context7.abrupt("return", mount(_objectSpread2(_objectSpread2({}, props), {}, {
                            container: appWrapperGetter(),
                            setGlobalState,
                            onGlobalStateChange
                          })));
                        case 1:
                        case "end":
                          return _context7.stop();
                      }
                    }, _callee7);
                  }));
                  return function(_x4) {
                    return _ref7.apply(this, arguments);
                  };
                }(),
                // finish loading after app mounted
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee8() {
                  return _regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) switch (_context8.prev = _context8.next) {
                      case 0:
                        return _context8.abrupt("return", render({
                          element: appWrapperElement,
                          loading: false,
                          container: remountContainer
                        }, "mounted"));
                      case 1:
                      case "end":
                        return _context8.stop();
                    }
                  }, _callee8);
                })),
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee9() {
                  return _regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) switch (_context9.prev = _context9.next) {
                      case 0:
                        return _context9.abrupt("return", execHooksChain(toArray(afterMount), app, global2));
                      case 1:
                      case "end":
                        return _context9.stop();
                    }
                  }, _callee9);
                })),
                // initialize the unmount defer after app mounted and resolve the defer after it unmounted
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee10() {
                  return _regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) switch (_context10.prev = _context10.next) {
                      case 0:
                        _context10.next = 2;
                        return validateSingularMode(singular, app);
                      case 2:
                        if (!_context10.sent) {
                          _context10.next = 4;
                          break;
                        }
                        prevAppUnmountedDeferred = new Deferred();
                      case 4:
                      case "end":
                        return _context10.stop();
                    }
                  }, _callee10);
                })),
                /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee11() {
                  return _regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) switch (_context11.prev = _context11.next) {
                      case 0:
                      case 1:
                      case "end":
                        return _context11.stop();
                    }
                  }, _callee11);
                }))
              ],
              unmount: [/* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee12() {
                return _regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) switch (_context12.prev = _context12.next) {
                    case 0:
                      return _context12.abrupt("return", execHooksChain(toArray(beforeUnmount), app, global2));
                    case 1:
                    case "end":
                      return _context12.stop();
                  }
                }, _callee12);
              })), /* @__PURE__ */ function() {
                var _ref13 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee13(props) {
                  return _regeneratorRuntime.wrap(function _callee13$(_context13) {
                    while (1) switch (_context13.prev = _context13.next) {
                      case 0:
                        return _context13.abrupt("return", unmount(_objectSpread2(_objectSpread2({}, props), {}, {
                          container: appWrapperGetter()
                        })));
                      case 1:
                      case "end":
                        return _context13.stop();
                    }
                  }, _callee13);
                }));
                return function(_x5) {
                  return _ref13.apply(this, arguments);
                };
              }(), unmountSandbox, /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee14() {
                return _regeneratorRuntime.wrap(function _callee14$(_context14) {
                  while (1) switch (_context14.prev = _context14.next) {
                    case 0:
                      return _context14.abrupt("return", execHooksChain(toArray(afterUnmount), app, global2));
                    case 1:
                    case "end":
                      return _context14.stop();
                  }
                }, _callee14);
              })), /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee15() {
                return _regeneratorRuntime.wrap(function _callee15$(_context15) {
                  while (1) switch (_context15.prev = _context15.next) {
                    case 0:
                      render({
                        element: null,
                        loading: false,
                        container: remountContainer
                      }, "unmounted");
                      offGlobalStateChange(appInstanceId);
                      appWrapperElement = null;
                      syncAppWrapperElement2Sandbox(appWrapperElement);
                    case 4:
                    case "end":
                      return _context15.stop();
                  }
                }, _callee15);
              })), /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee16() {
                return _regeneratorRuntime.wrap(function _callee16$(_context16) {
                  while (1) switch (_context16.prev = _context16.next) {
                    case 0:
                      _context16.next = 2;
                      return validateSingularMode(singular, app);
                    case 2:
                      _context16.t0 = _context16.sent;
                      if (!_context16.t0) {
                        _context16.next = 5;
                        break;
                      }
                      _context16.t0 = prevAppUnmountedDeferred;
                    case 5:
                      if (!_context16.t0) {
                        _context16.next = 7;
                        break;
                      }
                      prevAppUnmountedDeferred.resolve();
                    case 7:
                    case "end":
                      return _context16.stop();
                  }
                }, _callee16);
              }))]
            };
            if (typeof update === "function") {
              parcelConfig.update = update;
            }
            return parcelConfig;
          };
          return _context17.abrupt("return", parcelConfigGetter);
        case 48:
        case "end":
          return _context17.stop();
      }
    }, _callee17);
  }));
  return _loadApp.apply(this, arguments);
}
function idleCall(cb, start2) {
  cb({
    didTimeout: false,
    timeRemaining: function timeRemaining() {
      return Math.max(0, 50 - (Date.now() - start2));
    }
  });
}
var requestIdleCallback2;
if (typeof window.requestIdleCallback !== "undefined") {
  requestIdleCallback2 = window.requestIdleCallback;
} else if (typeof window.MessageChannel !== "undefined") {
  var channel = new MessageChannel();
  var port = channel.port2;
  var tasks = [];
  channel.port1.onmessage = function(_ref) {
    var data = _ref.data;
    var task = tasks.shift();
    if (!task) {
      return;
    }
    idleCall(task, data.start);
  };
  requestIdleCallback2 = function requestIdleCallback22(cb) {
    tasks.push(cb);
    port.postMessage({
      start: Date.now()
    });
  };
} else {
  requestIdleCallback2 = function requestIdleCallback22(cb) {
    return setTimeout(idleCall, 0, cb, Date.now());
  };
}
var isSlowNetwork = navigator.connection ? navigator.connection.saveData || navigator.connection.type !== "wifi" && navigator.connection.type !== "ethernet" && /([23])g/.test(navigator.connection.effectiveType) : false;
function prefetch(entry, opts) {
  if (!navigator.onLine || isSlowNetwork) {
    return;
  }
  requestIdleCallback2(/* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee() {
    var _yield$importEntry, getExternalScripts, getExternalStyleSheets;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return importEntry(entry, opts);
        case 2:
          _yield$importEntry = _context.sent;
          getExternalScripts = _yield$importEntry.getExternalScripts;
          getExternalStyleSheets = _yield$importEntry.getExternalStyleSheets;
          requestIdleCallback2(getExternalStyleSheets);
          requestIdleCallback2(getExternalScripts);
        case 7:
        case "end":
          return _context.stop();
      }
    }, _callee);
  })));
}
function prefetchAfterFirstMounted(apps, opts) {
  window.addEventListener("single-spa:first-mount", function listener() {
    var notLoadedApps = apps.filter(function(app) {
      return Ot(app.name) === l;
    });
    notLoadedApps.forEach(function(_ref3) {
      var entry = _ref3.entry;
      return prefetch(entry, opts);
    });
    window.removeEventListener("single-spa:first-mount", listener);
  });
}
function prefetchImmediately(apps, opts) {
  apps.forEach(function(_ref4) {
    var entry = _ref4.entry;
    return prefetch(entry, opts);
  });
}
function doPrefetchStrategy(apps, prefetchStrategy, importEntryOpts) {
  var appsName2Apps = function appsName2Apps2(names) {
    return apps.filter(function(app) {
      return names.includes(app.name);
    });
  };
  if (Array.isArray(prefetchStrategy)) {
    prefetchAfterFirstMounted(appsName2Apps(prefetchStrategy), importEntryOpts);
  } else if (_isFunction(prefetchStrategy)) {
    _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee2() {
      var _yield$prefetchStrate, _yield$prefetchStrate2, criticalAppNames, _yield$prefetchStrate3, minorAppsName;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return prefetchStrategy(apps);
          case 2:
            _yield$prefetchStrate = _context2.sent;
            _yield$prefetchStrate2 = _yield$prefetchStrate.criticalAppNames;
            criticalAppNames = _yield$prefetchStrate2 === void 0 ? [] : _yield$prefetchStrate2;
            _yield$prefetchStrate3 = _yield$prefetchStrate.minorAppsName;
            minorAppsName = _yield$prefetchStrate3 === void 0 ? [] : _yield$prefetchStrate3;
            prefetchImmediately(appsName2Apps(criticalAppNames), importEntryOpts);
            prefetchAfterFirstMounted(appsName2Apps(minorAppsName), importEntryOpts);
          case 9:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }))();
  } else {
    switch (prefetchStrategy) {
      case true:
        prefetchAfterFirstMounted(apps, importEntryOpts);
        break;
      case "all":
        prefetchImmediately(apps, importEntryOpts);
        break;
    }
  }
}
var _excluded = ["name", "activeRule", "loader", "props"], _excluded2 = ["mount"], _excluded3 = ["prefetch", "urlRerouteOnly"];
var microApps = [];
var frameworkConfiguration = {};
var started = false;
var defaultUrlRerouteOnly = true;
var frameworkStartedDefer = new Deferred();
var autoDowngradeForLowVersionBrowser = function autoDowngradeForLowVersionBrowser2(configuration) {
  var _configuration$sandbo = configuration.sandbox, sandbox = _configuration$sandbo === void 0 ? true : _configuration$sandbo, singular = configuration.singular;
  if (sandbox) {
    if (!window.Proxy) {
      console.warn("[qiankun] Missing window.Proxy, proxySandbox will degenerate into snapshotSandbox");
      if (singular === false) {
        console.warn("[qiankun] Setting singular as false may cause unexpected behavior while your browser not support window.Proxy");
      }
      return _objectSpread2(_objectSpread2({}, configuration), {}, {
        sandbox: _typeof$1(sandbox) === "object" ? _objectSpread2(_objectSpread2({}, sandbox), {}, {
          loose: true
        }) : {
          loose: true
        }
      });
    }
    if (!isConstDestructAssignmentSupported() && (sandbox === true || _typeof$1(sandbox) === "object" && sandbox.speedy !== false)) {
      console.warn("[qiankun] Speedy mode will turn off as const destruct assignment not supported in current browser!");
      return _objectSpread2(_objectSpread2({}, configuration), {}, {
        sandbox: _typeof$1(sandbox) === "object" ? _objectSpread2(_objectSpread2({}, sandbox), {}, {
          speedy: false
        }) : {
          speedy: false
        }
      });
    }
  }
  return configuration;
};
function registerMicroApps(apps, lifeCycles) {
  var unregisteredApps = apps.filter(function(app) {
    return !microApps.some(function(registeredApp) {
      return registeredApp.name === app.name;
    });
  });
  microApps = [].concat(_toConsumableArray(microApps), _toConsumableArray(unregisteredApps));
  unregisteredApps.forEach(function(app) {
    var name2 = app.name, activeRule = app.activeRule, _app$loader = app.loader, loader = _app$loader === void 0 ? _noop : _app$loader, props = app.props, appConfig = _objectWithoutProperties(app, _excluded);
    bt({
      name: name2,
      app: function() {
        var _app = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee3() {
          var _yield$loadApp, mount, otherMicroAppConfigs;
          return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                loader(true);
                _context3.next = 3;
                return frameworkStartedDefer.promise;
              case 3:
                _context3.next = 5;
                return loadApp(_objectSpread2({
                  name: name2,
                  props
                }, appConfig), frameworkConfiguration, lifeCycles);
              case 5:
                _context3.t0 = _context3.sent;
                _yield$loadApp = (0, _context3.t0)();
                mount = _yield$loadApp.mount;
                otherMicroAppConfigs = _objectWithoutProperties(_yield$loadApp, _excluded2);
                return _context3.abrupt("return", _objectSpread2({
                  mount: [/* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee() {
                    return _regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) switch (_context.prev = _context.next) {
                        case 0:
                          return _context.abrupt("return", loader(true));
                        case 1:
                        case "end":
                          return _context.stop();
                      }
                    }, _callee);
                  }))].concat(_toConsumableArray(toArray(mount)), [/* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee2() {
                    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) switch (_context2.prev = _context2.next) {
                        case 0:
                          return _context2.abrupt("return", loader(false));
                        case 1:
                        case "end":
                          return _context2.stop();
                      }
                    }, _callee2);
                  }))])
                }, otherMicroAppConfigs));
              case 10:
              case "end":
                return _context3.stop();
            }
          }, _callee3);
        }));
        function app2() {
          return _app.apply(this, arguments);
        }
        return app2;
      }(),
      activeWhen: activeRule,
      customProps: props
    });
  });
}
var appConfigPromiseGetterMap = /* @__PURE__ */ new Map();
var containerMicroAppsMap = /* @__PURE__ */ new Map();
function loadMicroApp(app, configuration, lifeCycles) {
  var props = app.props, name2 = app.name;
  var container = "container" in app ? app.container : void 0;
  var containerXPath = getContainerXPath(container);
  var appContainerXPathKey = "".concat(name2, "-").concat(containerXPath);
  var microApp;
  var wrapParcelConfigForRemount = function wrapParcelConfigForRemount2(config) {
    var microAppConfig = config;
    if (container) {
      if (containerXPath) {
        var containerMicroApps = containerMicroAppsMap.get(appContainerXPathKey);
        if (containerMicroApps === null || containerMicroApps === void 0 ? void 0 : containerMicroApps.length) {
          var mount = [/* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee4() {
            var prevLoadMicroApps, prevLoadMicroAppsWhichNotBroken;
            return _regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  prevLoadMicroApps = containerMicroApps.slice(0, containerMicroApps.indexOf(microApp));
                  prevLoadMicroAppsWhichNotBroken = prevLoadMicroApps.filter(function(v2) {
                    return v2.getStatus() !== "LOAD_ERROR" && v2.getStatus() !== "SKIP_BECAUSE_BROKEN";
                  });
                  _context4.next = 4;
                  return Promise.all(prevLoadMicroAppsWhichNotBroken.map(function(v2) {
                    return v2.unmountPromise;
                  }));
                case 4:
                case "end":
                  return _context4.stop();
              }
            }, _callee4);
          }))].concat(_toConsumableArray(toArray(microAppConfig.mount)));
          microAppConfig = _objectSpread2(_objectSpread2({}, config), {}, {
            mount
          });
        }
      }
    }
    return _objectSpread2(_objectSpread2({}, microAppConfig), {}, {
      // empty bootstrap hook which should not run twice while it calling from cached micro app
      bootstrap: function bootstrap() {
        return Promise.resolve();
      }
    });
  };
  var memorizedLoadingFn = /* @__PURE__ */ function() {
    var _ref4 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime.mark(function _callee5() {
      var userConfiguration, $$cacheLifecycleByAppName, parcelConfigGetterPromise, _parcelConfigGetterPromise, parcelConfigObjectGetterPromise;
      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            userConfiguration = autoDowngradeForLowVersionBrowser(configuration !== null && configuration !== void 0 ? configuration : _objectSpread2(_objectSpread2({}, frameworkConfiguration), {}, {
              singular: false
            }));
            $$cacheLifecycleByAppName = userConfiguration.$$cacheLifecycleByAppName;
            if (!container) {
              _context5.next = 21;
              break;
            }
            if (!$$cacheLifecycleByAppName) {
              _context5.next = 12;
              break;
            }
            parcelConfigGetterPromise = appConfigPromiseGetterMap.get(name2);
            if (!parcelConfigGetterPromise) {
              _context5.next = 12;
              break;
            }
            _context5.t0 = wrapParcelConfigForRemount;
            _context5.next = 9;
            return parcelConfigGetterPromise;
          case 9:
            _context5.t1 = _context5.sent;
            _context5.t2 = (0, _context5.t1)(container);
            return _context5.abrupt("return", (0, _context5.t0)(_context5.t2));
          case 12:
            if (!containerXPath) {
              _context5.next = 21;
              break;
            }
            _parcelConfigGetterPromise = appConfigPromiseGetterMap.get(appContainerXPathKey);
            if (!_parcelConfigGetterPromise) {
              _context5.next = 21;
              break;
            }
            _context5.t3 = wrapParcelConfigForRemount;
            _context5.next = 18;
            return _parcelConfigGetterPromise;
          case 18:
            _context5.t4 = _context5.sent;
            _context5.t5 = (0, _context5.t4)(container);
            return _context5.abrupt("return", (0, _context5.t3)(_context5.t5));
          case 21:
            parcelConfigObjectGetterPromise = loadApp(app, userConfiguration, lifeCycles);
            if (container) {
              if ($$cacheLifecycleByAppName) {
                appConfigPromiseGetterMap.set(name2, parcelConfigObjectGetterPromise);
              } else if (containerXPath) appConfigPromiseGetterMap.set(appContainerXPathKey, parcelConfigObjectGetterPromise);
            }
            _context5.next = 25;
            return parcelConfigObjectGetterPromise;
          case 25:
            _context5.t6 = _context5.sent;
            return _context5.abrupt("return", (0, _context5.t6)(container));
          case 27:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }));
    return function memorizedLoadingFn2() {
      return _ref4.apply(this, arguments);
    };
  }();
  if (!started && (configuration === null || configuration === void 0 ? void 0 : configuration.autoStart) !== false) {
    var _frameworkConfigurati;
    Bt({
      urlRerouteOnly: (_frameworkConfigurati = frameworkConfiguration.urlRerouteOnly) !== null && _frameworkConfigurati !== void 0 ? _frameworkConfigurati : defaultUrlRerouteOnly
    });
  }
  microApp = W(memorizedLoadingFn, _objectSpread2({
    domElement: document.createElement("div")
  }, props));
  if (container) {
    if (containerXPath) {
      var microAppsRef = containerMicroAppsMap.get(appContainerXPathKey) || [];
      microAppsRef.push(microApp);
      containerMicroAppsMap.set(appContainerXPathKey, microAppsRef);
      var cleanup = function cleanup2() {
        var index = microAppsRef.indexOf(microApp);
        microAppsRef.splice(index, 1);
        microApp = null;
      };
      microApp.unmountPromise.then(cleanup).catch(cleanup);
    }
  }
  return microApp;
}
function start() {
  var opts = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  frameworkConfiguration = _objectSpread2({
    prefetch: true,
    singular: true,
    sandbox: true
  }, opts);
  var _frameworkConfigurati2 = frameworkConfiguration, prefetch2 = _frameworkConfigurati2.prefetch, _frameworkConfigurati3 = _frameworkConfigurati2.urlRerouteOnly, urlRerouteOnly = _frameworkConfigurati3 === void 0 ? defaultUrlRerouteOnly : _frameworkConfigurati3, importEntryOpts = _objectWithoutProperties(_frameworkConfigurati2, _excluded3);
  if (prefetch2) {
    doPrefetchStrategy(microApps, prefetch2, importEntryOpts);
  }
  frameworkConfiguration = autoDowngradeForLowVersionBrowser(frameworkConfiguration);
  Bt({
    urlRerouteOnly
  });
  started = true;
  frameworkStartedDefer.resolve();
}
function addGlobalUncaughtErrorHandler(errorHandler) {
  window.addEventListener("error", errorHandler);
  window.addEventListener("unhandledrejection", errorHandler);
}
function removeGlobalUncaughtErrorHandler(errorHandler) {
  window.removeEventListener("error", errorHandler);
  window.removeEventListener("unhandledrejection", errorHandler);
}
function setDefaultMountApp(defaultAppLink) {
  window.addEventListener("single-spa:no-app-change", function listener() {
    var mountedApps = yt();
    if (!mountedApps.length) {
      et(defaultAppLink);
    }
    window.removeEventListener("single-spa:no-app-change", listener);
  });
}
function runDefaultMountEffects(defaultAppLink) {
  console.warn("[qiankun] runDefaultMountEffects will be removed in next version, please use setDefaultMountApp instead");
  setDefaultMountApp(defaultAppLink);
}
function runAfterFirstMounted(effect) {
  window.addEventListener("single-spa:first-mount", function listener() {
    effect();
    window.removeEventListener("single-spa:first-mount", listener);
  });
}
export {
  SandBoxType,
  getCurrentRunningApp as __internalGetCurrentRunningApp,
  a as addErrorHandler,
  addGlobalUncaughtErrorHandler,
  initGlobalState,
  loadMicroApp,
  prefetchImmediately as prefetchApps,
  registerMicroApps,
  c as removeErrorHandler,
  removeGlobalUncaughtErrorHandler,
  runAfterFirstMounted,
  runDefaultMountEffects,
  setDefaultMountApp,
  start
};
