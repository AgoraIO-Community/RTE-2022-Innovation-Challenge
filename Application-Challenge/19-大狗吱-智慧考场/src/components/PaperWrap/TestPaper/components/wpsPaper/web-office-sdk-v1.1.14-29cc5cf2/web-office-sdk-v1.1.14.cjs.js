'use strict';
Object.defineProperty(exports, '__esModule', { value: !0 });
var __assign = function () {
  return (__assign =
    Object.assign ||
    function (e) {
      for (var n, t = 1, a = arguments.length; t < a; t++)
        for (var r in (n = arguments[t]))
          Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
      return e;
    }).apply(this, arguments);
};
function __awaiter(e, n, t, a) {
  return new (t || (t = Promise))(function (r, i) {
    function s(e) {
      try {
        c(a.next(e));
      } catch (e) {
        i(e);
      }
    }
    function o(e) {
      try {
        c(a.throw(e));
      } catch (e) {
        i(e);
      }
    }
    function c(e) {
      var n;
      e.done
        ? r(e.value)
        : ((n = e.value),
          n instanceof t
            ? n
            : new t(function (e) {
                e(n);
              })).then(s, o);
    }
    c((a = a.apply(e, n || [])).next());
  });
}
function __generator(e, n) {
  var t,
    a,
    r,
    i,
    s = {
      label: 0,
      sent: function () {
        if (1 & r[0]) throw r[1];
        return r[1];
      },
      trys: [],
      ops: [],
    };
  return (
    (i = { next: o(0), throw: o(1), return: o(2) }),
    'function' == typeof Symbol &&
      (i[Symbol.iterator] = function () {
        return this;
      }),
    i
  );
  function o(i) {
    return function (o) {
      return (function (i) {
        if (t) throw new TypeError('Generator is already executing.');
        for (; s; )
          try {
            if (
              ((t = 1),
              a &&
                (r =
                  2 & i[0]
                    ? a.return
                    : i[0]
                    ? a.throw || ((r = a.return) && r.call(a), 0)
                    : a.next) &&
                !(r = r.call(a, i[1])).done)
            )
              return r;
            switch (((a = 0), r && (i = [2 & i[0], r.value]), i[0])) {
              case 0:
              case 1:
                r = i;
                break;
              case 4:
                return s.label++, { value: i[1], done: !1 };
              case 5:
                s.label++, (a = i[1]), (i = [0]);
                continue;
              case 7:
                (i = s.ops.pop()), s.trys.pop();
                continue;
              default:
                if (
                  !(r = (r = s.trys).length > 0 && r[r.length - 1]) &&
                  (6 === i[0] || 2 === i[0])
                ) {
                  s = 0;
                  continue;
                }
                if (3 === i[0] && (!r || (i[1] > r[0] && i[1] < r[3]))) {
                  s.label = i[1];
                  break;
                }
                if (6 === i[0] && s.label < r[1]) {
                  (s.label = r[1]), (r = i);
                  break;
                }
                if (r && s.label < r[2]) {
                  (s.label = r[2]), s.ops.push(i);
                  break;
                }
                r[2] && s.ops.pop(), s.trys.pop();
                continue;
            }
            i = n.call(e, s);
          } catch (e) {
            (i = [6, e]), (a = 0);
          } finally {
            t = r = 0;
          }
        if (5 & i[0]) throw i[1];
        return { value: i[0] ? i[1] : void 0, done: !0 };
      })([i, o]);
    };
  }
}
var Message = (function () {
  function e() {}
  return (
    (e.add = function (n) {
      e.HANDLE_LIST.push(n), window.addEventListener('message', n, !1);
    }),
    (e.remove = function (n) {
      var t = e.HANDLE_LIST.indexOf(n);
      t >= 0 && e.HANDLE_LIST.splice(t, 1),
        window.removeEventListener('message', n, !1);
    }),
    (e.empty = function () {
      for (; e.HANDLE_LIST.length; )
        window.removeEventListener('message', e.HANDLE_LIST.shift(), !1);
    }),
    (e.parse = function (e) {
      try {
        return 'object' == typeof e ? e : e ? JSON.parse(e) : e;
      } catch (n) {
        return console.log('Message.parse Error:', n), e;
      }
    }),
    (e.HANDLE_LIST = []),
    e
  );
})();
function isPlainObject(e) {
  if (!e) return !1;
  for (var n = e; null !== Object.getPrototypeOf(n); )
    n = Object.getPrototypeOf(n);
  return Object.getPrototypeOf(e) === n;
}
function isFunction(e) {
  return '[object Function]' === {}.toString.call(e);
}
function dispatchFullScreenChange(e) {
  ['fullscreen', 'fullscreenElement'].forEach(function (n) {
    Object.defineProperty(document, n, {
      get: function () {
        return !!e.status;
      },
      configurable: !0,
    });
  });
  var n = new CustomEvent('fullscreenchange');
  document.dispatchEvent(n);
}
function addStylesheetRules(e) {
  var n = document.createElement('style');
  document.head.appendChild(n);
  var t = n.sheet;
  t.insertRule(e, t.cssRules.length);
}
var officeTypes,
  officeNameTypes,
  modeTypes,
  fullScreenStatus,
  variables = { origin: '' };
function setGlobalData(e, n) {
  variables[e] = n;
}
function getGlobalData(e) {
  return variables[e];
}
function isUnsafeMessage(e) {
  var n = getGlobalData('origin');
  return (
    !!(function (e, n) {
      return (
        e !== n &&
        (e.replace(/www\./i, '').toLowerCase() !==
          n.replace(/www\./i, '').toLowerCase() ||
          (e.match('www.') ? void 0 : (setGlobalData('origin', n), !1)))
      );
    })(n, e.origin) &&
    (console.warn('postMessage 域名检查不通过', {
      safeOrigin: n,
      eventOrigin: e.origin,
    }),
    !0)
  );
}
function makeId() {
  var e = 0;
  return function () {
    return (e += 1);
  };
}
!(function (e) {
  (e.unknown = 'unknown'),
    (e.spreadsheet = 's'),
    (e.writer = 'w'),
    (e.presentation = 'p'),
    (e.pdf = 'f');
})(officeTypes || (officeTypes = {})),
  (function (e) {
    (e.wps = 'w'), (e.et = 's'), (e.presentation = 'p'), (e.pdf = 'f');
  })(officeNameTypes || (officeNameTypes = {})),
  (function (e) {
    (e.nomal = 'nomal'), (e.simple = 'simple');
  })(modeTypes || (modeTypes = {})),
  (function (e) {
    (e[(e.requestFullscreen = 1)] = 'requestFullscreen'),
      (e[(e.exitFullscreen = 0)] = 'exitFullscreen');
  })(fullScreenStatus || (fullScreenStatus = {}));
var iframe,
  mountResizeObserver,
  getId = makeId(),
  getIframe = function (e, n, t) {
    void 0 === t && (t = !0);
    var a = n;
    if (!iframe) {
      var r = handleMountResize.bind(null, a);
      (iframe = document.createElement('iframe')).classList.add(
        'web-office-iframe',
      );
      var i = {
        id: 'office-iframe',
        src: e,
        scrolling: 'no',
        frameborder: '0',
        allowfullscreen: 'allowfullscreen',
        webkitallowfullscreen: 'true',
        mozallowfullscreen: 'true',
      };
      for (var s in (a
        ? ((i.style =
            'width: ' +
            a.clientWidth +
            'px; height: ' +
            a.clientHeight +
            'px;'),
          t && window.addEventListener('resize', r))
        : ((a = document.createElement('div')).classList.add(
            'web-office-default-container',
          ),
          addStylesheetRules(
            '.web-office-default-container {position: absolute; padding: 0;  margin: 0; width: 100%; height: 100%; left: 0; top: 0;}',
          ),
          document.body.appendChild(a),
          (i.style =
            'position: fixed; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%;')),
      i))
        iframe.setAttribute(s, i[s]);
      a.appendChild(iframe),
        (iframe.destroy = function () {
          iframe.parentNode.removeChild(iframe),
            (iframe = null),
            window.removeEventListener('resize', r),
            mountResizeObserver &&
              (mountResizeObserver.disconnect(), (mountResizeObserver = null));
        });
    }
    return iframe;
  };
function handleMountResize(e) {
  var n = e.clientHeight,
    t = e.clientWidth;
  0 !== n || 0 !== t || mountResizeObserver
    ? (0 === n && 0 === t) ||
      !mountResizeObserver ||
      (mountResizeObserver.disconnect(), (mountResizeObserver = null))
    : window.ResizeObserver &&
      (mountResizeObserver = new ResizeObserver(function (n) {
        handleMountResize(e);
      })).observe(e),
    (iframe.style.cssText += 'height: ' + n + 'px; width: ' + t + 'px');
}
var sendMsgToWps = function (e) {
  getIframe().contentWindow.postMessage(
    JSON.stringify(e),
    getGlobalData('origin'),
  );
};
function apiSender(e, n, t) {
  return new Promise(function (a) {
    var r = getId(),
      i = function (e) {
        if (!isUnsafeMessage(e)) {
          var n = Message.parse(e.data);
          n.eventName === t && n.msgId === r && (a(n.data), Message.remove(i));
        }
      };
    Message.add(i), sendMsgToWps({ data: e, msgId: r, eventName: n });
  });
}
var apiChannelOld = function (e) {
    return apiSender(e, 'wps.jssdk.api', 'wps.api.reply');
  },
  apiBasicChannel = function (e) {
    return apiSender(e, 'api.basic', 'api.basic.reply');
  },
  setterCallbacks = { idMap: {} };
function setterCallbackSubscribe(e) {
  return __awaiter(this, void 0, void 0, function () {
    var n, t, a, r, i, s, o, c, l, u;
    return __generator(this, function (d) {
      switch (d.label) {
        case 0:
          return isUnsafeMessage(e)
            ? [2]
            : ((n = Message.parse(e.data)),
              (t = n.eventName),
              (a = n.callbackId),
              (r = n.data),
              a && (i = setterCallbacks.idMap[a])
                ? ((s = i.split(':')),
                  (o = s[0]),
                  (c = s[1]),
                  'api.callback' === t &&
                  setterCallbacks[o] &&
                  setterCallbacks[o][c]
                    ? [4, (u = setterCallbacks[o][c]).callback.apply(u, r.args)]
                    : [3, 2])
                : [3, 2]);
        case 1:
          (l = d.sent()),
            sendMsgToWps({
              result: l,
              callbackId: a,
              eventName: 'api.callback.reply',
            }),
            (d.label = 2);
        case 2:
          return [2];
      }
    });
  });
}
var handleApiSetter = function (e) {
    return __awaiter(void 0, void 0, void 0, function () {
      function n() {
        return Object.keys(setterCallbacks.idMap).find(function (e) {
          return setterCallbacks.idMap[e] === a + ':' + t;
        });
      }
      var t, a, r, i, s, o, c, l, u;
      return __generator(this, function (d) {
        switch (d.label) {
          case 0:
            return (
              (t = e.prop),
              (a = e.parentObjId),
              [4, reduceArgs([(r = e.value)])]
            );
          case 1:
            return (
              (i = d.sent()),
              (s = i[0]),
              (o = i[1]),
              (e.value = s[0]),
              (c = Object.keys(o)[0]),
              (l = setterCallbacks[a]),
              null === r &&
                l &&
                l[t] &&
                ((u = n()) && delete setterCallbacks.idMap[u],
                delete l[t],
                Object.keys(l).length || delete setterCallbacks[a],
                Object.keys(setterCallbacks.idMap).length ||
                  Message.remove(setterCallbackSubscribe)),
              c &&
                (Object.keys(setterCallbacks.idMap).length ||
                  Message.add(setterCallbackSubscribe),
                setterCallbacks[a] || (setterCallbacks[a] = {}),
                (setterCallbacks[a][t] = { callbackId: c, callback: o[c] }),
                (u = n()) && delete setterCallbacks.idMap[u],
                (setterCallbacks.idMap[c] = a + ':' + t)),
              [2]
            );
        }
      });
    });
  },
  apiChannel = function (e, n, t, a) {
    return __awaiter(void 0, void 0, void 0, function () {
      var r, i, s, o, c, l, u, d;
      return __generator(this, function (f) {
        switch (f.label) {
          case 0:
            return (
              (r = getId()),
              (o = new Promise(function (e, n) {
                (i = e), (s = n);
              })),
              (c = {}),
              n.args ? [4, reduceArgs(n.args)] : [3, 2]
            );
          case 1:
            (l = f.sent()),
              (u = l[0]),
              (d = l[1]),
              (n.args = u),
              (c = d),
              (f.label = 2);
          case 2:
            return 'api.setter' !== e ? [3, 4] : [4, handleApiSetter(n)];
          case 3:
            f.sent(), (f.label = 4);
          case 4:
            return (
              handleSendApiChannel([
                { eventName: e, data: n, msgId: r },
                function () {
                  var n = this,
                    l = function (o) {
                      return __awaiter(n, void 0, void 0, function () {
                        var n, u, d;
                        return __generator(this, function (f) {
                          switch (f.label) {
                            case 0:
                              return isUnsafeMessage(o)
                                ? [2]
                                : 'api.callback' ===
                                    (n = Message.parse(o.data)).eventName &&
                                  n.callbackId &&
                                  c[n.callbackId]
                                ? [4, c[n.callbackId].apply(c, n.data.args)]
                                : [3, 2];
                            case 1:
                              (u = f.sent()),
                                sendMsgToWps({
                                  result: u,
                                  eventName: 'api.callback.reply',
                                  callbackId: n.callbackId,
                                }),
                                (f.label = 2);
                            case 2:
                              return (
                                n.eventName === e + '.reply' &&
                                  n.msgId === r &&
                                  (n.error
                                    ? (((d = new Error('')).stack =
                                        n.error + '\n' + t),
                                      a && a(),
                                      s(d))
                                    : i(n.result),
                                  Message.remove(l)),
                                [2]
                              );
                          }
                        });
                      });
                    };
                  return Message.add(l), o;
                },
              ]),
              [2, o]
            );
        }
      });
    });
  };
function reduceArgs(e) {
  return __awaiter(this, void 0, void 0, function () {
    var n, t, a, r, i, s, o, c, l, u, d;
    return __generator(this, function (f) {
      switch (f.label) {
        case 0:
          (n = {}), (t = []), (a = e.slice(0)), (f.label = 1);
        case 1:
          return a.length ? ((r = void 0), [4, a.shift()]) : [3, 13];
        case 2:
          return (i = f.sent()) && i.done ? [4, i.done()] : [3, 4];
        case 3:
          f.sent(), (f.label = 4);
        case 4:
          if (!isPlainObject(r)) return [3, 11];
          for (o in ((r = {}), (s = []), i)) s.push(o);
          (c = 0), (f.label = 5);
        case 5:
          return c < s.length
            ? ((l = s[c]),
              (u = i[l]),
              /^[A-Z]/.test(l)
                ? u && u.done
                  ? [4, u.done()]
                  : [3, 7]
                : [3, 8])
            : [3, 10];
        case 6:
          f.sent(), (f.label = 7);
        case 7:
          u && u.objId
            ? (u = { objId: u.objId })
            : 'function' == typeof u &&
              ((d = getId()), (n[d] = u), (u = { callbackId: d })),
            (f.label = 8);
        case 8:
          (r[l] = u), (f.label = 9);
        case 9:
          return c++, [3, 5];
        case 10:
          return [3, 12];
        case 11:
          i && i.objId
            ? (r = { objId: i.objId })
            : 'function' == typeof i && void 0 === i.objId
            ? ((d = getId()), (n[d] = i), (r = { callbackId: d }))
            : (r = i),
            (f.label = 12);
        case 12:
          return t.push(r), [3, 1];
        case 13:
          return [2, [t, n]];
      }
    });
  });
}
function handleSendApiChannel(e) {
  var n = e[0],
    t = e[1];
  'function' == typeof (n = __assign({}, n)).data && (n.data = n.data()),
    t(),
    sendMsgToWps(n);
}
var userConfHandler = function (e, n) {
    void 0 === n && (n = !0);
    var t = __assign({}, e),
      a = t.headers,
      r = void 0 === a ? {} : a,
      i = t.subscriptions,
      s = void 0 === i ? {} : i,
      o = t.mode,
      c = void 0 === o ? modeTypes.nomal : o,
      l = t.commonOptions,
      u = r.backBtn,
      d = void 0 === u ? {} : u,
      f = r.shareBtn,
      p = void 0 === f ? {} : f,
      v = r.otherMenuBtn,
      b = void 0 === v ? {} : v,
      h = function (e, t) {
        e.subscribe &&
          'function' == typeof e.subscribe &&
          ((e.callback = t), (s[t] = e.subscribe), n && delete e.subscribe);
      };
    if (
      (h(d, 'wpsconfig_back_btn'),
      h(p, 'wpsconfig_share_btn'),
      h(b, 'wpsconfig_other_menu_btn'),
      b.items && Array.isArray(b.items))
    ) {
      var g = [];
      b.items.forEach(function (e, n) {
        switch ((void 0 === e && (e = {}), e.type)) {
          case 'export_img':
            (e.type = 1), (e.callback = 'export_img');
            break;
          case 'export_pdf':
            (e.type = 1), (e.callback = 'export_pdf');
            break;
          case 'save_version':
            (e.type = 1), (e.callback = 'save_version');
            break;
          case 'about_wps':
            (e.type = 1), (e.callback = 'about_wps');
            break;
          case 'split_line':
            e.type = 2;
            break;
          case 'custom':
            (e.type = 3), h(e, 'wpsconfig_other_menu_btn_' + n), g.push(e);
        }
      }),
        g.length && (isMobile || isInMiniProgram) && (b.items = g);
    }
    t.url = t.url || t.wpsUrl;
    var m = [];
    if (
      ((c === modeTypes.simple || (l && !1 === l.isShowTopArea)) &&
        m.push('simple', 'hidecmb'),
      t.debug && m.push('debugger'),
      t.url &&
        m.length &&
        (t.url = t.url + (t.url.indexOf('?') >= 0 ? '&' : '?') + m.join('&')),
      l &&
        (l.isParentFullscreen || l.isBrowserViewFullscreen) &&
        (document.addEventListener('fullscreenchange', handleFullscreenChange),
        document.addEventListener(
          'webkitfullscreenchange',
          handleFullscreenChange,
        ),
        document.addEventListener(
          'mozfullscreenchange',
          handleFullscreenChange,
        )),
      t.wordOptions && (t.wpsOptions = t.wordOptions),
      t.excelOptions && (t.etOptions = t.excelOptions),
      t.pptOptions && (t.wppOptions = t.pptOptions),
      'object' == typeof s.print)
    ) {
      var w = 'wpsconfig_print';
      'function' == typeof s.print.subscribe &&
        ((s[w] = s.print.subscribe),
        (t.print = { callback: w }),
        void 0 !== s.print.custom && (t.print.custom = s.print.custom)),
        delete s.print;
    }
    'function' == typeof s.exportPdf &&
      ((s[(w = 'wpsconfig_export_pdf')] = s.exportPdf),
      (t.exportPdf = { callback: w }),
      delete s.exportPdf);
    return (
      t.commandBars && setCommandBars(t.commandBars, !1),
      __assign(__assign({}, t), { subscriptions: s })
    );
  },
  getOfficeType = function (e) {
    void 0 === e && (e = '');
    var n = '';
    if (!n && e) {
      var t = e.toLowerCase();
      -1 !== t.indexOf('/office/s/') && (n = officeTypes.spreadsheet),
        -1 !== t.indexOf('/office/w/') && (n = officeTypes.writer),
        -1 !== t.indexOf('/office/p/') && (n = officeTypes.presentation),
        -1 !== t.indexOf('/office/f/') && (n = officeTypes.pdf);
    }
    if (!n) {
      var a = e.match(/[\?&]type=([a-z]+)/) || [];
      n = officeNameTypes[a[1]] || '';
    }
    return n;
  };
function setCommandBars(e, n) {
  void 0 === n && (n = !0);
  var t = e.map(function (e) {
    var n = e.attributes;
    if (!Array.isArray(n)) {
      var t = [];
      for (var a in n)
        if (n.hasOwnProperty(a)) {
          var r = { name: a, value: n[a] };
          t.push(r);
        }
      e.attributes = t;
    }
    return e;
  });
  return n && sendMsgToWps({ data: t, eventName: 'setCommandBars' }), t;
}
var agent = window.navigator.userAgent.toLowerCase(),
  isMobile = /Android|webOS|iPhone|iPod|BlackBerry|iPad/i.test(agent),
  isInMiniProgram = (function () {
    try {
      return (
        -1 !== window._parent.location.search.indexOf('from=wxminiprogram')
      );
    } catch (e) {
      return !1;
    }
  })();
function handleFullscreenChange() {
  var e = { status: fullScreenStatus.requestFullscreen },
    n = document,
    t =
      n.fullscreenElement ||
      n.webkitFullscreenElement ||
      n.mozFullScreenElement;
  (e.status = t
    ? fullScreenStatus.requestFullscreen
    : fullScreenStatus.exitFullscreen),
    sendMsgToWps({ data: e, eventName: 'fullscreenchange' });
}
function removeFullscreenEventListener() {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
}
var clearSetterCallbacks = function () {
  setterCallbacks.idMap = {};
};
function mitt(e) {
  return (
    (e = e || Object.create(null)),
    {
      on: function (n, t) {
        (e[n] || (e[n] = [])).push(t);
      },
      off: function (n, t) {
        e[n] && e[n].splice(e[n].indexOf(t) >>> 0, 1);
      },
      emit: function (n, t) {
        (e[n] || []).slice().map(function (e) {
          e(t);
        }),
          (e['*'] || []).slice().map(function (e) {
            e(n, t);
          });
      },
    }
  );
}
var objId = 0,
  collectObjIdHandlers = new Set();
function createObjId(e) {
  return (objId += 1), !e && collectObjId(objId), objId;
}
function collectObjId(e) {
  collectObjIdHandlers.forEach(function (n) {
    return n(e);
  });
}
function makeCollectObjIdHandle(e) {
  return function () {
    var n = [],
      t = function (e) {
        n.push(e);
      };
    return (
      collectObjIdHandlers.add(t),
      {
        End: function () {
          e(n), collectObjIdHandlers.delete(t);
        },
      }
    );
  };
}
function getError() {
  var e = new Error('');
  return (e.stack || e.message || '').split('\n').slice(2).join('\n');
}
function destroyApplication() {
  (collectObjIdHandlers = new Set()), (objId = 0);
}
function initApplication(e, n) {
  var t = this,
    a = n.Events,
    r = n.Enum,
    i = n.Props,
    s = i[0],
    o = i[1],
    c = { objId: objId };
  switch (
    (assign(c, s, o),
    (c.Events = a),
    (c.Enum = r),
    (e.Enum = c.Enum),
    (e.Events = c.Events),
    (e.Props = i),
    getOfficeType(e.url))
  ) {
    case officeTypes.writer:
      e.WordApplication = e.WpsApplication = function () {
        return c;
      };
      break;
    case officeTypes.spreadsheet:
      e.ExcelApplication = e.EtApplication = function () {
        return c;
      };
      break;
    case officeTypes.presentation:
      e.PPTApplication = e.WppApplication = function () {
        return c;
      };
      break;
    case officeTypes.pdf:
      e.PDFApplication = function () {
        return c;
      };
  }
  (e.Application = c),
    (e.Free = function (e) {
      return apiChannel('api.free', { objId: e }, '');
    }),
    (e.Stack = c.Stack =
      makeCollectObjIdHandle(function (n) {
        e && e.Free(n);
      }));
  var l = {};
  Message.add(function (e) {
    return __awaiter(t, void 0, void 0, function () {
      var n, t, a, r, i;
      return __generator(this, function (s) {
        switch (s.label) {
          case 0:
            return isUnsafeMessage(e)
              ? [2]
              : 'api.event' === (n = Message.parse(e.data)).eventName && n.data
              ? ((t = n.data),
                (a = t.eventName),
                (r = t.data),
                (i = l[a]) ? [4, i(r)] : [3, 2])
              : [3, 2];
          case 1:
            s.sent(), (s.label = 2);
          case 2:
            return [2];
        }
      });
    });
  }),
    (c.Sub = {});
  var u = function (e) {
    var n = a[e];
    Object.defineProperty(c.Sub, n, {
      set: function (e) {
        (l[n] = e),
          sendMsgToWps({
            eventName: 'api.event.register',
            data: { eventName: n, register: !!e, objId: (objId += 1) },
          });
      },
    });
  };
  for (var d in a) u(d);
}
var polyfillApi = [
  'ExportAsFixedFormat',
  'GetOperatorsInfo',
  'ImportDataIntoFields',
  'ReplaceText',
  'ReplaceBookmark',
  'GetBookmarkText',
  'GetComments',
];
function assign(e, n, t) {
  for (
    var a = n.slice(0),
      r = function () {
        var n = a.shift();
        !n.alias &&
          ~polyfillApi.indexOf(n.prop) &&
          a.push(__assign(__assign({}, n), { alias: n.prop + 'Async' })),
          Object.defineProperty(e, n.alias || n.prop, {
            get: function () {
              var a = this,
                r = 1 === n.cache,
                i = r && this['__' + n.prop + 'CacheValue'];
              if (!i) {
                var s = getError(),
                  o = createObjId(r),
                  c = function () {
                    for (var a, r = [], i = 0; i < arguments.length; i++)
                      r[i] = arguments[i];
                    return (
                      void 0 !== n.caller
                        ? assign((a = { objId: createObjId() }), t[n.caller], t)
                        : (a = {}),
                      wrapper(
                        c,
                        a,
                        'api.caller',
                        {
                          obj: c,
                          args: r,
                          parentObjId: e.objId,
                          objId: a.objId,
                          prop: n.prop,
                        },
                        s,
                      ),
                      a
                    );
                  };
                return (
                  (c.objId = -1),
                  void 0 !== n.getter &&
                    ((c.objId = o), assign(c, t[n.getter], t)),
                  wrapper(
                    e,
                    c,
                    'api.getter',
                    { parentObjId: e.objId, objId: c.objId, prop: n.prop },
                    s,
                    function () {
                      delete a['__' + n.prop + 'CacheValue'];
                    },
                  ),
                  r && (this['__' + n.prop + 'CacheValue'] = c),
                  c
                );
              }
              return i;
            },
            set: function (t) {
              var a = getError();
              return wrapper(
                e,
                {},
                'api.setter',
                { value: t, parentObjId: e.objId, objId: -1, prop: n.prop },
                a,
              );
            },
          });
      };
    a.length;

  )
    r();
}
function wrapper(e, n, t, a, r, i) {
  var s,
    o = (e.done ? e.done() : Promise.resolve()).then(function () {
      return s || (s = apiChannel(t, a, r, i)), s;
    });
  (n.done = function () {
    return o;
  }),
    (n.then = function (e, t) {
      return a.objId >= 0
        ? ((n.then = null),
          (n.catch = null),
          o
            .then(function () {
              e(n);
            })
            .catch(function (e) {
              return t(e);
            }))
        : o.then(e, t);
    }),
    (n.catch = function (e) {
      return o.catch(e);
    }),
    (n.Destroy = function () {
      return apiChannel('api.free', { objId: n.objId }, '');
    });
}
var cacheEventList = [],
  sdkInstance = null,
  EVENT_TYPES = {
    fileOpen: 'fileOpen',
    tabSwitch: 'tabSwitch',
    fileSaved: 'fileSaved',
    fileStatus: 'fileStatus',
    fullscreenChange: 'fullscreenChange',
    error: 'error',
    stage: 'stage',
  },
  EVENT_NAME = {
    getToken: 'api.getToken',
    onToast: 'event.toast',
    onHyperLinkOpen: 'event.hyperLinkOpen',
    getClipboardData: 'api.getClipboardData',
  };
function listener(e, n, t, a, r, i, s) {
  var o = this;
  void 0 === t && (t = {});
  Message.add(function (c) {
    return __awaiter(o, void 0, void 0, function () {
      var o, l, u, d, f, p, v, b, h, g, m, w, _, y, k, E, T, O, C;
      return __generator(this, function (I) {
        switch (I.label) {
          case 0:
            return isUnsafeMessage(c)
              ? [2]
              : ((o = Message.parse(c.data)),
                (l = o.eventName),
                (u = void 0 === l ? '' : l),
                (d = o.data),
                (f = void 0 === d ? null : d),
                (p = o.url),
                (v = void 0 === p ? null : p),
                -1 !== ['wps.jssdk.api'].indexOf(u)
                  ? [2]
                  : 'ready' !== u
                  ? [3, 1]
                  : (sendMsgToWps({
                      eventName: 'setConfig',
                      data: __assign(__assign({}, t), { version: e.version }),
                    }),
                    e.tokenData &&
                      e.setToken(
                        __assign(__assign({}, e.tokenData), {
                          hasRefreshTokenConfig: !!t.refreshToken,
                        }),
                      ),
                    r.apiReadySended &&
                      (sendMsgToWps({ eventName: 'api.ready' }),
                      cacheEventList.forEach(function (n) {
                        return e.on(n.eventName, n.handle);
                      })),
                    (e.iframeReady = !0),
                    [3, 17]));
          case 1:
            return 'error' !== u
              ? [3, 2]
              : (n.emit(EVENT_TYPES.error, f), [3, 17]);
          case 2:
            return 'open.result' !== u
              ? [3, 3]
              : (void 0 !==
                  (null === (T = null == f ? void 0 : f.fileInfo) ||
                  void 0 === T
                    ? void 0
                    : T.officeVersion) &&
                  ((e.mainVersion = f.fileInfo.officeVersion),
                  console.log('WebOfficeSDK Main Version: V' + e.mainVersion)),
                n.emit(EVENT_TYPES.fileOpen, f),
                [3, 17]);
          case 3:
            return 'file.saved' !== u
              ? [3, 4]
              : (n.emit(EVENT_TYPES.fileStatus, f),
                n.emit(EVENT_TYPES.fileSaved, f),
                [3, 17]);
          case 4:
            return 'tab.switch' !== u
              ? [3, 5]
              : (n.emit(EVENT_TYPES.tabSwitch, f), [3, 17]);
          case 5:
            return 'api.scroll' !== u
              ? [3, 6]
              : (window.scrollTo(f.x, f.y), [3, 17]);
          case 6:
            if (u !== EVENT_NAME.getToken) return [3, 11];
            (b = { token: !1 }), (I.label = 7);
          case 7:
            return I.trys.push([7, 9, , 10]), [4, r.refreshToken()];
          case 8:
            return (b = I.sent()), [3, 10];
          case 9:
            return (
              (h = I.sent()),
              console.error('refreshToken: ' + (h || 'fail to get')),
              [3, 10]
            );
          case 10:
            return (
              sendMsgToWps({
                eventName: EVENT_NAME.getToken + '.reply',
                data: b,
              }),
              [3, 17]
            );
          case 11:
            if (u !== EVENT_NAME.getClipboardData) return [3, 16];
            (g = { text: '', html: '' }), (I.label = 12);
          case 12:
            return I.trys.push([12, 14, , 15]), [4, r.getClipboardData()];
          case 13:
            return (g = I.sent()), [3, 15];
          case 14:
            return (
              (m = I.sent()),
              console.error('getClipboardData: ' + (m || 'fail to get')),
              [3, 15]
            );
          case 15:
            return (
              sendMsgToWps({
                eventName: EVENT_NAME.getClipboardData + '.reply',
                data: g,
              }),
              [3, 17]
            );
          case 16:
            u === EVENT_NAME.onToast
              ? r.onToast(f)
              : u === EVENT_NAME.onHyperLinkOpen
              ? r.onHyperLinkOpen(f)
              : 'stage' === u
              ? n.emit(EVENT_TYPES.stage, f)
              : 'event.callback' === u
              ? ((w = f.eventName),
                (_ = f.data),
                (y = w),
                'fullScreenChange' === w && (y = EVENT_TYPES.fullscreenChange),
                ((null === (O = t.commonOptions) || void 0 === O
                  ? void 0
                  : O.isBrowserViewFullscreen) ||
                  (null === (C = t.commonOptions) || void 0 === C
                    ? void 0
                    : C.isParentFullscreen)) &&
                'fullscreenchange' === y
                  ? ((k = _.status),
                    (E = _.isDispatchEvent),
                    t.commonOptions.isBrowserViewFullscreen
                      ? handleBrowserViewFullscreen(k, i, s, E)
                      : t.commonOptions.isParentFullscreen &&
                        handleParenFullscreenEvent(
                          k,
                          i,
                          t.commonOptions.isParentFullscreen,
                        ),
                    n.emit(y, _))
                  : n.emit(y, _))
              : 'api.ready' === u && initApplication(e, f),
              (I.label = 17);
          case 17:
            return 'function' == typeof a[u] && a[u](e, v || f), [2];
        }
      });
    });
  });
}
function makeReady(e) {
  return new Promise(function (n) {
    var t = function (a) {
      isUnsafeMessage(a) ||
        (Message.parse(a.data).eventName === e && (n(), Message.remove(t)));
    };
    Message.add(t);
  });
}
function config(e) {
  void 0 === e && (e = {}), sdkInstance && sdkInstance.destroy();
  try {
    var n = userConfHandler(e),
      t = n.subscriptions,
      a = void 0 === t ? {} : t,
      r = n.mount,
      i = void 0 === r ? null : r,
      s = n.url,
      o = n.refreshToken,
      c = n.onToast,
      l = n.onHyperLinkOpen,
      u = n.getClipboardData;
    setGlobalData('origin', (s.match(/https*:\/\/[^\/]+/g) || [])[0]);
    var d = getIframe(s, i),
      f = makeReady('ready'),
      p = makeReady('open.result'),
      v = makeReady('api.ready'),
      b = i
        ? { width: i.clientWidth + 'px', height: i.clientHeight + 'px' }
        : { width: '100vw', height: '100vh' };
    delete n.mount, s && delete n.url, delete n.subscriptions;
    var h = mitt(),
      g = { apiReadySended: !1 };
    return (
      (sdkInstance = {
        url: s,
        iframe: d,
        version: '1.1.14',
        iframeReady: !1,
        tokenData: null,
        commandBars: null,
        tabs: {
          getTabs: function () {
            return __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (e) {
                switch (e.label) {
                  case 0:
                    return [4, f];
                  case 1:
                    return (
                      e.sent(), [2, apiBasicChannel({ api: 'tab.getTabs' })]
                    );
                }
              });
            });
          },
          switchTab: function (e) {
            return __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (n) {
                switch (n.label) {
                  case 0:
                    return [4, f];
                  case 1:
                    return (
                      n.sent(),
                      [
                        2,
                        apiBasicChannel({
                          api: 'tab.switchTab',
                          args: { tabKey: e },
                        }),
                      ]
                    );
                }
              });
            });
          },
        },
        setCooperUserColor: function (e) {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, f];
                case 1:
                  return (
                    n.sent(),
                    [2, apiBasicChannel({ api: 'setCooperUserColor', args: e })]
                  );
              }
            });
          });
        },
        setToken: function (e) {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, f];
                case 1:
                  return (
                    n.sent(),
                    (sdkInstance.tokenData = e),
                    sendMsgToWps({ eventName: 'setToken', data: e }),
                    [2]
                  );
              }
            });
          });
        },
        ready: function () {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (e) {
              switch (e.label) {
                case 0:
                  return g.apiReadySended ? [3, 2] : [4, p];
                case 1:
                  e.sent(),
                    (g.apiReadySended = !0),
                    sendMsgToWps({ eventName: 'api.ready' }),
                    (e.label = 2);
                case 2:
                  return [4, v];
                case 3:
                  return (
                    e.sent(),
                    [
                      2,
                      new Promise(function (e) {
                        return setTimeout(function () {
                          return e(
                            null == sdkInstance
                              ? void 0
                              : sdkInstance.Application,
                          );
                        }, 0);
                      }),
                    ]
                  );
              }
            });
          });
        },
        destroy: function () {
          d.destroy(),
            Message.empty(),
            (sdkInstance = null),
            (cacheEventList = []),
            destroyApplication(),
            removeFullscreenEventListener(),
            clearSetterCallbacks();
        },
        save: function () {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (e) {
              switch (e.label) {
                case 0:
                  return [4, f];
                case 1:
                  return e.sent(), [2, apiChannelOld({ api: 'save' })];
              }
            });
          });
        },
        setCommandBars: function (e) {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, f];
                case 1:
                  return n.sent(), setCommandBars(e), [2];
              }
            });
          });
        },
        updateConfig: function (e) {
          return (
            void 0 === e && (e = {}),
            __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (n) {
                switch (n.label) {
                  case 0:
                    return [4, f];
                  case 1:
                    return (
                      n.sent(),
                      e.commandBars
                        ? (console.warn(
                            'Deprecated: `updateConfig()` 方法即将废弃，请使用`setCommandBars()`代替`updateConfig()`更新`commandBars`配置。',
                          ),
                          [4, setCommandBars(e.commandBars)])
                        : [3, 3]
                    );
                  case 2:
                    n.sent(), (n.label = 3);
                  case 3:
                    return [2];
                }
              });
            })
          );
        },
        executeCommandBar: function (e) {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, f];
                case 1:
                  return (
                    n.sent(),
                    setCommandBars([
                      { cmbId: e, attributes: [{ name: 'click', value: !0 }] },
                    ]),
                    [2]
                  );
              }
            });
          });
        },
        on: function (e, n) {
          return __awaiter(this, void 0, void 0, function () {
            var t, a;
            return __generator(this, function (r) {
              switch (r.label) {
                case 0:
                  return (
                    -1 ===
                    (t = cacheEventList.findIndex(function (n) {
                      return n.eventName === e;
                    }))
                      ? cacheEventList.push({ eventName: e, handle: n })
                      : (cacheEventList[t] = { eventName: e, handle: n }),
                    [4, f]
                  );
                case 1:
                  return (
                    r.sent(),
                    (a = e),
                    e === EVENT_TYPES.fileSaved &&
                      console.warn(
                        'fileSaved事件监听即将弃用， 推荐使用fileStatus进行文件状态的监听',
                      ),
                    e === EVENT_TYPES.fullscreenChange &&
                      (a = 'fullscreenchange'),
                    handleBasicEvent(a, 'on'),
                    h.on(e, n),
                    [2]
                  );
              }
            });
          });
        },
        off: function (e, n) {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (t) {
              switch (t.label) {
                case 0:
                  return (
                    (cacheEventList = cacheEventList.filter(function (n) {
                      n.eventName !== e && n.handle;
                    })),
                    [4, f]
                  );
                case 1:
                  return t.sent(), handleBasicEvent(e, 'off'), h.off(e, n), [2];
              }
            });
          });
        },
      }),
      handleFunctionConfig(n, o, c, l, g, u),
      listener(sdkInstance, h, n, a, g, d, b),
      sdkInstance
    );
  } catch (e) {
    console.error(e);
  }
}
function handleFunctionConfig(e, n, t, a, r, i) {
  n &&
    isFunction(n) &&
    ((r.refreshToken = n),
    (e.refreshToken = { eventName: EVENT_NAME.getToken })),
    i &&
      isFunction(i) &&
      ((r.getClipboardData = i),
      (e.getClipboardData = { eventName: EVENT_NAME.getClipboardData })),
    t &&
      isFunction(t) &&
      ((r.onToast = t), (e.onToast = { eventName: EVENT_NAME.onToast })),
    a &&
      isFunction(a) &&
      ((r.onHyperLinkOpen = a),
      (e.onHyperLinkOpen = { eventName: EVENT_NAME.onHyperLinkOpen }));
}
function handleBasicEvent(e, n) {
  var t = e;
  ['error', 'fileOpen'].includes(t) ||
    ('fileSaved' === t && (t = 'fileStatus'),
    sendMsgToWps({
      eventName: 'basic.event',
      data: { eventName: t, action: n },
    }));
}
function handleParenFullscreenEvent(e, n, t) {
  var a = document.querySelector(t),
    r = a && 1 === a.nodeType ? a : n;
  if (0 === e) {
    var i = document;
    (
      i.exitFullscreen ||
      i.mozCancelFullScreen ||
      i.msExitFullscreen ||
      i.webkitCancelFullScreen ||
      i.webkitExitFullscreen
    ).call(document);
  } else if (1 === e) {
    (
      r.requestFullscreen ||
      r.mozRequestFullScreen ||
      r.msRequestFullscreen ||
      r.webkitRequestFullscreen
    ).call(r);
  }
}
function handleBrowserViewFullscreen(e, n, t, a) {
  0 === e
    ? (n.style =
        'position: static; width: ' + t.width + '; height: ' + t.height)
    : 1 === e && (n.style = 'position: absolute; width: 100%; height: 100%'),
    a && dispatchFullScreenChange({ status: e });
}
console.log('WebOfficeSDK JS-SDK V1.1.14');
var wps = Object.freeze({
  __proto__: null,
  listener: listener,
  config: config,
});
window.WPS = wps;
var config$1 = config,
  index = { config: config$1 };
(exports.config = config$1), (exports.default = index);
