var e = function () {
  return (e =
    Object.assign ||
    function (e) {
      for (var t, n = 1, r = arguments.length; n < r; n++)
        for (var a in (t = arguments[n]))
          Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
      return e;
    }).apply(this, arguments);
};
function t(e, t, n, r) {
  return new (n || (n = Promise))(function (a, i) {
    function o(e) {
      try {
        s(r.next(e));
      } catch (e) {
        i(e);
      }
    }
    function c(e) {
      try {
        s(r.throw(e));
      } catch (e) {
        i(e);
      }
    }
    function s(e) {
      var t;
      e.done
        ? a(e.value)
        : ((t = e.value),
          t instanceof n
            ? t
            : new n(function (e) {
                e(t);
              })).then(o, c);
    }
    s((r = r.apply(e, t || [])).next());
  });
}
function n(e, t) {
  var n,
    r,
    a,
    i,
    o = {
      label: 0,
      sent: function () {
        if (1 & a[0]) throw a[1];
        return a[1];
      },
      trys: [],
      ops: [],
    };
  return (
    (i = { next: c(0), throw: c(1), return: c(2) }),
    'function' == typeof Symbol &&
      (i[Symbol.iterator] = function () {
        return this;
      }),
    i
  );
  function c(i) {
    return function (c) {
      return (function (i) {
        if (n) throw new TypeError('Generator is already executing.');
        for (; o; )
          try {
            if (
              ((n = 1),
              r &&
                (a =
                  2 & i[0]
                    ? r.return
                    : i[0]
                    ? r.throw || ((a = r.return) && a.call(r), 0)
                    : r.next) &&
                !(a = a.call(r, i[1])).done)
            )
              return a;
            switch (((r = 0), a && (i = [2 & i[0], a.value]), i[0])) {
              case 0:
              case 1:
                a = i;
                break;
              case 4:
                return o.label++, { value: i[1], done: !1 };
              case 5:
                o.label++, (r = i[1]), (i = [0]);
                continue;
              case 7:
                (i = o.ops.pop()), o.trys.pop();
                continue;
              default:
                if (
                  !(a = (a = o.trys).length > 0 && a[a.length - 1]) &&
                  (6 === i[0] || 2 === i[0])
                ) {
                  o = 0;
                  continue;
                }
                if (3 === i[0] && (!a || (i[1] > a[0] && i[1] < a[3]))) {
                  o.label = i[1];
                  break;
                }
                if (6 === i[0] && o.label < a[1]) {
                  (o.label = a[1]), (a = i);
                  break;
                }
                if (a && o.label < a[2]) {
                  (o.label = a[2]), o.ops.push(i);
                  break;
                }
                a[2] && o.ops.pop(), o.trys.pop();
                continue;
            }
            i = t.call(e, o);
          } catch (e) {
            (i = [6, e]), (r = 0);
          } finally {
            n = a = 0;
          }
        if (5 & i[0]) throw i[1];
        return { value: i[0] ? i[1] : void 0, done: !0 };
      })([i, c]);
    };
  }
}
var r = (function () {
  function e() {}
  return (
    (e.add = function (t) {
      e.HANDLE_LIST.push(t), window.addEventListener('message', t, !1);
    }),
    (e.remove = function (t) {
      var n = e.HANDLE_LIST.indexOf(t);
      n >= 0 && e.HANDLE_LIST.splice(n, 1),
        window.removeEventListener('message', t, !1);
    }),
    (e.empty = function () {
      for (; e.HANDLE_LIST.length; )
        window.removeEventListener('message', e.HANDLE_LIST.shift(), !1);
    }),
    (e.parse = function (e) {
      try {
        return 'object' == typeof e ? e : e ? JSON.parse(e) : e;
      } catch (t) {
        return console.log('Message.parse Error:', t), e;
      }
    }),
    (e.HANDLE_LIST = []),
    e
  );
})();
function a(e) {
  return '[object Function]' === {}.toString.call(e);
}
var i,
  o,
  c,
  s,
  u = { origin: '' };
function l(e, t) {
  u[e] = t;
}
function d(e) {
  return u[e];
}
function f(e) {
  var t = d('origin');
  return (
    !!(function (e, t) {
      return (
        e !== t &&
        (e.replace(/www\./i, '').toLowerCase() !==
          t.replace(/www\./i, '').toLowerCase() ||
          (e.match('www.') ? void 0 : (l('origin', t), !1)))
      );
    })(t, e.origin) &&
    (console.warn('postMessage 域名检查不通过', {
      safeOrigin: t,
      eventOrigin: e.origin,
    }),
    !0)
  );
}
!(function (e) {
  (e.unknown = 'unknown'),
    (e.spreadsheet = 's'),
    (e.writer = 'w'),
    (e.presentation = 'p'),
    (e.pdf = 'f');
})(i || (i = {})),
  (function (e) {
    (e.wps = 'w'), (e.et = 's'), (e.presentation = 'p'), (e.pdf = 'f');
  })(o || (o = {})),
  (function (e) {
    (e.nomal = 'nomal'), (e.simple = 'simple');
  })(c || (c = {})),
  (function (e) {
    (e[(e.requestFullscreen = 1)] = 'requestFullscreen'),
      (e[(e.exitFullscreen = 0)] = 'exitFullscreen');
  })(s || (s = {}));
var p,
  v,
  b,
  h =
    ((p = 0),
    function () {
      return (p += 1);
    }),
  m = function (e, t, n) {
    void 0 === n && (n = !0);
    var r = t;
    if (!v) {
      var a = function e(t) {
        var n = t.clientHeight;
        var r = t.clientWidth;
        0 !== n || 0 !== r || b
          ? (0 === n && 0 === r) || !b || (b.disconnect(), (b = null))
          : window.ResizeObserver &&
            (b = new ResizeObserver(function (n) {
              e(t);
            })).observe(t);
        v.style.cssText += 'height: ' + n + 'px; width: ' + r + 'px';
      }.bind(null, r);
      (v = document.createElement('iframe')).classList.add('web-office-iframe');
      var i = {
        id: 'office-iframe',
        src: e,
        scrolling: 'no',
        frameborder: '0',
        allowfullscreen: 'allowfullscreen',
        webkitallowfullscreen: 'true',
        mozallowfullscreen: 'true',
      };
      for (var o in (r
        ? ((i.style =
            'width: ' +
            r.clientWidth +
            'px; height: ' +
            r.clientHeight +
            'px;'),
          n && window.addEventListener('resize', a))
        : ((r = document.createElement('div')).classList.add(
            'web-office-default-container',
          ),
          (function (e) {
            var t = document.createElement('style');
            document.head.appendChild(t);
            var n = t.sheet;
            n.insertRule(e, n.cssRules.length);
          })(
            '.web-office-default-container {position: absolute; padding: 0;  margin: 0; width: 100%; height: 100%; left: 0; top: 0;}',
          ),
          document.body.appendChild(r),
          (i.style =
            'position: fixed; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%;')),
      i))
        v.setAttribute(o, i[o]);
      r.appendChild(v),
        (v.destroy = function () {
          v.parentNode.removeChild(v),
            (v = null),
            window.removeEventListener('resize', a),
            b && (b.disconnect(), (b = null));
        });
    }
    return v;
  };
var g = function (e) {
  m().contentWindow.postMessage(JSON.stringify(e), d('origin'));
};
function w(e, t, n) {
  return new Promise(function (a) {
    var i = h(),
      o = function (e) {
        if (!f(e)) {
          var t = r.parse(e.data);
          t.eventName === n && t.msgId === i && (a(t.data), r.remove(o));
        }
      };
    r.add(o), g({ data: e, msgId: i, eventName: t });
  });
}
var y = function (e) {
    return w(e, 'wps.jssdk.api', 'wps.api.reply');
  },
  k = function (e) {
    return w(e, 'api.basic', 'api.basic.reply');
  },
  j = { idMap: {} };
function I(e) {
  return t(this, void 0, void 0, function () {
    var t, a, i, o, c, s, u, l, d, p;
    return n(this, function (n) {
      switch (n.label) {
        case 0:
          return f(e)
            ? [2]
            : ((t = r.parse(e.data)),
              (a = t.eventName),
              (i = t.callbackId),
              (o = t.data),
              i && (c = j.idMap[i])
                ? ((s = c.split(':')),
                  (u = s[0]),
                  (l = s[1]),
                  'api.callback' === a && j[u] && j[u][l]
                    ? [4, (p = j[u][l]).callback.apply(p, o.args)]
                    : [3, 2])
                : [3, 2]);
        case 1:
          (d = n.sent()),
            g({ result: d, callbackId: i, eventName: 'api.callback.reply' }),
            (n.label = 2);
        case 2:
          return [2];
      }
    });
  });
}
var O = function (e) {
    return t(void 0, void 0, void 0, function () {
      function t() {
        return Object.keys(j.idMap).find(function (e) {
          return j.idMap[e] === i + ':' + a;
        });
      }
      var a, i, o, c, s, u, l, d, f;
      return n(this, function (n) {
        switch (n.label) {
          case 0:
            return (a = e.prop), (i = e.parentObjId), [4, _([(o = e.value)])];
          case 1:
            return (
              (c = n.sent()),
              (s = c[0]),
              (u = c[1]),
              (e.value = s[0]),
              (l = Object.keys(u)[0]),
              (d = j[i]),
              null === o &&
                d &&
                d[a] &&
                ((f = t()) && delete j.idMap[f],
                delete d[a],
                Object.keys(d).length || delete j[i],
                Object.keys(j.idMap).length || r.remove(I)),
              l &&
                (Object.keys(j.idMap).length || r.add(I),
                j[i] || (j[i] = {}),
                (j[i][a] = { callbackId: l, callback: u[l] }),
                (f = t()) && delete j.idMap[f],
                (j.idMap[l] = i + ':' + a)),
              [2]
            );
        }
      });
    });
  },
  x = function (a, i, o, c) {
    return t(void 0, void 0, void 0, function () {
      var s, u, l, d, p, v, b, m;
      return n(this, function (w) {
        switch (w.label) {
          case 0:
            return (
              (s = h()),
              (d = new Promise(function (e, t) {
                (u = e), (l = t);
              })),
              (p = {}),
              i.args ? [4, _(i.args)] : [3, 2]
            );
          case 1:
            (v = w.sent()),
              (b = v[0]),
              (m = v[1]),
              (i.args = b),
              (p = m),
              (w.label = 2);
          case 2:
            return 'api.setter' !== a ? [3, 4] : [4, O(i)];
          case 3:
            w.sent(), (w.label = 4);
          case 4:
            return (
              (function (t) {
                var n = t[0],
                  r = t[1];
                'function' == typeof (n = e({}, n)).data && (n.data = n.data());
                r(), g(n);
              })([
                { eventName: a, data: i, msgId: s },
                function () {
                  var e = this,
                    i = function (d) {
                      return t(e, void 0, void 0, function () {
                        var e, t, v;
                        return n(this, function (n) {
                          switch (n.label) {
                            case 0:
                              return f(d)
                                ? [2]
                                : 'api.callback' ===
                                    (e = r.parse(d.data)).eventName &&
                                  e.callbackId &&
                                  p[e.callbackId]
                                ? [4, p[e.callbackId].apply(p, e.data.args)]
                                : [3, 2];
                            case 1:
                              (t = n.sent()),
                                g({
                                  result: t,
                                  eventName: 'api.callback.reply',
                                  callbackId: e.callbackId,
                                }),
                                (n.label = 2);
                            case 2:
                              return (
                                e.eventName === a + '.reply' &&
                                  e.msgId === s &&
                                  (e.error
                                    ? (((v = new Error('')).stack =
                                        e.error + '\n' + o),
                                      c && c(),
                                      l(v))
                                    : u(e.result),
                                  r.remove(i)),
                                [2]
                              );
                          }
                        });
                      });
                    };
                  return r.add(i), d;
                },
              ]),
              [2, d]
            );
        }
      });
    });
  };
function _(e) {
  return t(this, void 0, void 0, function () {
    var t, r, a, i, o, c, s, u, l, d, f;
    return n(this, function (n) {
      switch (n.label) {
        case 0:
          (t = {}), (r = []), (a = e.slice(0)), (n.label = 1);
        case 1:
          return a.length ? ((i = void 0), [4, a.shift()]) : [3, 13];
        case 2:
          return (o = n.sent()) && o.done ? [4, o.done()] : [3, 4];
        case 3:
          n.sent(), (n.label = 4);
        case 4:
          if (
            !(function (e) {
              if (!e) return !1;
              for (var t = e; null !== Object.getPrototypeOf(t); )
                t = Object.getPrototypeOf(t);
              return Object.getPrototypeOf(e) === t;
            })(i)
          )
            return [3, 11];
          for (s in ((i = {}), (c = []), o)) c.push(s);
          (u = 0), (n.label = 5);
        case 5:
          return u < c.length
            ? ((l = c[u]),
              (d = o[l]),
              /^[A-Z]/.test(l)
                ? d && d.done
                  ? [4, d.done()]
                  : [3, 7]
                : [3, 8])
            : [3, 10];
        case 6:
          n.sent(), (n.label = 7);
        case 7:
          d && d.objId
            ? (d = { objId: d.objId })
            : 'function' == typeof d &&
              ((f = h()), (t[f] = d), (d = { callbackId: f })),
            (n.label = 8);
        case 8:
          (i[l] = d), (n.label = 9);
        case 9:
          return u++, [3, 5];
        case 10:
          return [3, 12];
        case 11:
          o && o.objId
            ? (i = { objId: o.objId })
            : 'function' == typeof o && void 0 === o.objId
            ? ((f = h()), (t[f] = o), (i = { callbackId: f }))
            : (i = o),
            (n.label = 12);
        case 12:
          return r.push(i), [3, 1];
        case 13:
          return [2, [r, t]];
      }
    });
  });
}
var C = function (t, n) {
    void 0 === n && (n = !0);
    var r = e({}, t),
      a = r.headers,
      i = void 0 === a ? {} : a,
      o = r.subscriptions,
      s = void 0 === o ? {} : o,
      u = r.mode,
      l = void 0 === u ? c.nomal : u,
      d = r.commonOptions,
      f = i.backBtn,
      p = void 0 === f ? {} : f,
      v = i.shareBtn,
      b = void 0 === v ? {} : v,
      h = i.otherMenuBtn,
      m = void 0 === h ? {} : h,
      g = function (e, t) {
        e.subscribe &&
          'function' == typeof e.subscribe &&
          ((e.callback = t), (s[t] = e.subscribe), n && delete e.subscribe);
      };
    if (
      (g(p, 'wpsconfig_back_btn'),
      g(b, 'wpsconfig_share_btn'),
      g(m, 'wpsconfig_other_menu_btn'),
      m.items && Array.isArray(m.items))
    ) {
      var w = [];
      m.items.forEach(function (e, t) {
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
            (e.type = 3), g(e, 'wpsconfig_other_menu_btn_' + t), w.push(e);
        }
      }),
        w.length && (T || L) && (m.items = w);
    }
    r.url = r.url || r.wpsUrl;
    var y = [];
    if (
      ((l === c.simple || (d && !1 === d.isShowTopArea)) &&
        y.push('simple', 'hidecmb'),
      r.debug && y.push('debugger'),
      r.url &&
        y.length &&
        (r.url = r.url + (r.url.indexOf('?') >= 0 ? '&' : '?') + y.join('&')),
      d &&
        (d.isParentFullscreen || d.isBrowserViewFullscreen) &&
        (document.addEventListener('fullscreenchange', P),
        document.addEventListener('webkitfullscreenchange', P),
        document.addEventListener('mozfullscreenchange', P)),
      r.wordOptions && (r.wpsOptions = r.wordOptions),
      r.excelOptions && (r.etOptions = r.excelOptions),
      r.pptOptions && (r.wppOptions = r.pptOptions),
      'object' == typeof s.print)
    ) {
      var k = 'wpsconfig_print';
      'function' == typeof s.print.subscribe &&
        ((s[k] = s.print.subscribe),
        (r.print = { callback: k }),
        void 0 !== s.print.custom && (r.print.custom = s.print.custom)),
        delete s.print;
    }
    'function' == typeof s.exportPdf &&
      ((s[(k = 'wpsconfig_export_pdf')] = s.exportPdf),
      (r.exportPdf = { callback: k }),
      delete s.exportPdf);
    return (
      r.commandBars && E(r.commandBars, !1), e(e({}, r), { subscriptions: s })
    );
  },
  S = function (e) {
    void 0 === e && (e = '');
    var t = '';
    if (!t && e) {
      var n = e.toLowerCase();
      -1 !== n.indexOf('/office/s/') && (t = i.spreadsheet),
        -1 !== n.indexOf('/office/w/') && (t = i.writer),
        -1 !== n.indexOf('/office/p/') && (t = i.presentation),
        -1 !== n.indexOf('/office/f/') && (t = i.pdf);
    }
    if (!t) {
      var r = e.match(/[\?&]type=([a-z]+)/) || [];
      t = o[r[1]] || '';
    }
    return t;
  };
function E(e, t) {
  void 0 === t && (t = !0);
  var n = e.map(function (e) {
    var t = e.attributes;
    if (!Array.isArray(t)) {
      var n = [];
      for (var r in t)
        if (t.hasOwnProperty(r)) {
          var a = { name: r, value: t[r] };
          n.push(a);
        }
      e.attributes = n;
    }
    return e;
  });
  return t && g({ data: n, eventName: 'setCommandBars' }), n;
}
var N = window.navigator.userAgent.toLowerCase(),
  T = /Android|webOS|iPhone|iPod|BlackBerry|iPad/i.test(N),
  L = (function () {
    try {
      return (
        -1 !== window._parent.location.search.indexOf('from=wxminiprogram')
      );
    } catch (e) {
      return !1;
    }
  })();
function P() {
  var e = { status: s.requestFullscreen },
    t = document,
    n =
      t.fullscreenElement ||
      t.webkitFullscreenElement ||
      t.mozFullScreenElement;
  (e.status = n ? s.requestFullscreen : s.exitFullscreen),
    g({ data: e, eventName: 'fullscreenchange' });
}
var F = function () {
  j.idMap = {};
};
var A = 0,
  D = new Set();
function B(e) {
  return (
    (A += 1),
    !e &&
      (function (e) {
        D.forEach(function (t) {
          return t(e);
        });
      })(A),
    A
  );
}
function V() {
  var e = new Error('');
  return (e.stack || e.message || '').split('\n').slice(2).join('\n');
}
function H(a, o) {
  var c,
    s = this,
    u = o.Events,
    l = o.Enum,
    d = o.Props,
    p = d[0],
    v = d[1],
    b = { objId: A };
  switch (
    ((function t(n, r, a) {
      var i = r.slice(0);
      var o = function () {
        var r = i.shift();
        !r.alias &&
          ~R.indexOf(r.prop) &&
          i.push(e(e({}, r), { alias: r.prop + 'Async' })),
          Object.defineProperty(n, r.alias || r.prop, {
            get: function () {
              var i = this,
                o = 1 === r.cache,
                c = o && this['__' + r.prop + 'CacheValue'];
              if (!c) {
                var s = V(),
                  u = B(o),
                  l = function () {
                    for (var t, i = [], o = 0; o < arguments.length; o++)
                      i[o] = arguments[o];
                    void 0 !== r.caller
                      ? (function t(n, r, a) {
                          var i = r.slice(0);
                          var o = function () {
                            var r = i.shift();
                            !r.alias &&
                              ~R.indexOf(r.prop) &&
                              i.push(e(e({}, r), { alias: r.prop + 'Async' })),
                              Object.defineProperty(n, r.alias || r.prop, {
                                get: function () {
                                  var e = this,
                                    i = 1 === r.cache,
                                    o = i && this['__' + r.prop + 'CacheValue'];
                                  if (!o) {
                                    var c = V(),
                                      s = B(i),
                                      u = function () {
                                        for (
                                          var e, i = [], o = 0;
                                          o < arguments.length;
                                          o++
                                        )
                                          i[o] = arguments[o];
                                        void 0 !== r.caller
                                          ? t(
                                              (e = { objId: B() }),
                                              a[r.caller],
                                              a,
                                            )
                                          : (e = {});
                                        return (
                                          z(
                                            u,
                                            e,
                                            'api.caller',
                                            {
                                              obj: u,
                                              args: i,
                                              parentObjId: n.objId,
                                              objId: e.objId,
                                              prop: r.prop,
                                            },
                                            c,
                                          ),
                                          e
                                        );
                                      };
                                    return (
                                      (u.objId = -1),
                                      void 0 !== r.getter &&
                                        ((u.objId = s), t(u, a[r.getter], a)),
                                      z(
                                        n,
                                        u,
                                        'api.getter',
                                        {
                                          parentObjId: n.objId,
                                          objId: u.objId,
                                          prop: r.prop,
                                        },
                                        c,
                                        function () {
                                          delete e[
                                            '__' + r.prop + 'CacheValue'
                                          ];
                                        },
                                      ),
                                      i &&
                                        (this['__' + r.prop + 'CacheValue'] =
                                          u),
                                      u
                                    );
                                  }
                                  return o;
                                },
                                set: function (e) {
                                  var t = V();
                                  return z(
                                    n,
                                    {},
                                    'api.setter',
                                    {
                                      value: e,
                                      parentObjId: n.objId,
                                      objId: -1,
                                      prop: r.prop,
                                    },
                                    t,
                                  );
                                },
                              });
                          };
                          for (; i.length; ) o();
                        })((t = { objId: B() }), a[r.caller], a)
                      : (t = {});
                    return (
                      z(
                        l,
                        t,
                        'api.caller',
                        {
                          obj: l,
                          args: i,
                          parentObjId: n.objId,
                          objId: t.objId,
                          prop: r.prop,
                        },
                        s,
                      ),
                      t
                    );
                  };
                return (
                  (l.objId = -1),
                  void 0 !== r.getter && ((l.objId = u), t(l, a[r.getter], a)),
                  z(
                    n,
                    l,
                    'api.getter',
                    { parentObjId: n.objId, objId: l.objId, prop: r.prop },
                    s,
                    function () {
                      delete i['__' + r.prop + 'CacheValue'];
                    },
                  ),
                  o && (this['__' + r.prop + 'CacheValue'] = l),
                  l
                );
              }
              return c;
            },
            set: function (e) {
              var t = V();
              return z(
                n,
                {},
                'api.setter',
                { value: e, parentObjId: n.objId, objId: -1, prop: r.prop },
                t,
              );
            },
          });
      };
      for (; i.length; ) o();
    })(b, p, v),
    (b.Events = u),
    (b.Enum = l),
    (a.Enum = b.Enum),
    (a.Events = b.Events),
    (a.Props = d),
    S(a.url))
  ) {
    case i.writer:
      a.WordApplication = a.WpsApplication = function () {
        return b;
      };
      break;
    case i.spreadsheet:
      a.ExcelApplication = a.EtApplication = function () {
        return b;
      };
      break;
    case i.presentation:
      a.PPTApplication = a.WppApplication = function () {
        return b;
      };
      break;
    case i.pdf:
      a.PDFApplication = function () {
        return b;
      };
  }
  (a.Application = b),
    (a.Free = function (e) {
      return x('api.free', { objId: e }, '');
    }),
    (a.Stack = b.Stack =
      ((c = function (e) {
        a && a.Free(e);
      }),
      function () {
        var e = [],
          t = function (t) {
            e.push(t);
          };
        return (
          D.add(t),
          {
            End: function () {
              c(e), D.delete(t);
            },
          }
        );
      }));
  var h = {};
  r.add(function (e) {
    return t(s, void 0, void 0, function () {
      var t, a, i, o, c;
      return n(this, function (n) {
        switch (n.label) {
          case 0:
            return f(e)
              ? [2]
              : 'api.event' === (t = r.parse(e.data)).eventName && t.data
              ? ((a = t.data),
                (i = a.eventName),
                (o = a.data),
                (c = h[i]) ? [4, c(o)] : [3, 2])
              : [3, 2];
          case 1:
            n.sent(), (n.label = 2);
          case 2:
            return [2];
        }
      });
    });
  }),
    (b.Sub = {});
  var m = function (e) {
    var t = u[e];
    Object.defineProperty(b.Sub, t, {
      set: function (e) {
        (h[t] = e),
          g({
            eventName: 'api.event.register',
            data: { eventName: t, register: !!e, objId: (A += 1) },
          });
      },
    });
  };
  for (var w in u) m(w);
}
var R = [
  'ExportAsFixedFormat',
  'GetOperatorsInfo',
  'ImportDataIntoFields',
  'ReplaceText',
  'ReplaceBookmark',
  'GetBookmarkText',
  'GetComments',
];
function M(t, n, r) {
  var a = n.slice(0);
  var i = function () {
    var n = a.shift();
    if (!n.alias && ~R.indexOf(n.prop)) {
      a.push(e(e({}, n), { alias: n.prop + 'Async' }));
    }
    Object.defineProperty(t, n.alias || n.prop, {
      get: function () {
        var e = this;
        var a = n.cache === 1;
        var i = a && this['__' + n.prop + 'CacheValue'];
        if (!i) {
          var o = V();
          var c = B(a);
          var s = function () {
            for (var e = [], a = 0, i; a < arguments.length; a++) {
              e[a] = arguments[a];
            }
            if (n.caller !== undefined) {
              i = { objId: B() };
              M(i, r[n.caller], r);
            } else {
              i = {};
            }
            return (
              z(
                u,
                i,
                'api.caller',
                {
                  obj: u,
                  args: e,
                  parentObjId: t.objId,
                  objId: i.objId,
                  prop: n.prop,
                },
                o,
              ),
              i
            );
          };
          var u = s;
          u.objId = -1;
          if (n.getter !== undefined) {
            u.objId = c;
            M(u, r[n.getter], r);
          }
          z(
            t,
            u,
            'api.getter',
            { parentObjId: t.objId, objId: u.objId, prop: n.prop },
            o,
            function () {
              delete e['__' + n.prop + 'CacheValue'];
            },
          );
          if (a) {
            this['__' + n.prop + 'CacheValue'] = u;
          }
          return u;
        }
        return i;
      },
      set: function (e) {
        var r = V();
        return z(
          t,
          {},
          'api.setter',
          { value: e, parentObjId: t.objId, objId: -1, prop: n.prop },
          r,
        );
      },
    });
  };
  while (a.length) {
    i();
  }
}
function z(e, t, n, r, a, i) {
  var o,
    c = (e.done ? e.done() : Promise.resolve()).then(function () {
      return o || (o = x(n, r, a, i)), o;
    });
  (t.done = function () {
    return c;
  }),
    (t.then = function (e, n) {
      return r.objId >= 0
        ? ((t.then = null),
          (t.catch = null),
          c
            .then(function () {
              e(t);
            })
            .catch(function (e) {
              return n(e);
            }))
        : c.then(e, n);
    }),
    (t.catch = function (e) {
      return c.catch(e);
    }),
    (t.Destroy = function () {
      return x('api.free', { objId: t.objId }, '');
    });
}
var W = [],
  q = null,
  G = {
    fileOpen: 'fileOpen',
    tabSwitch: 'tabSwitch',
    fileSaved: 'fileSaved',
    fileStatus: 'fileStatus',
    fullscreenChange: 'fullscreenChange',
    error: 'error',
    stage: 'stage',
  },
  K = {
    getToken: 'api.getToken',
    onToast: 'event.toast',
    onHyperLinkOpen: 'event.hyperLinkOpen',
    getClipboardData: 'api.getClipboardData',
  };
function J(a, i, o, c, s, u, l) {
  var d = this;
  void 0 === o && (o = {});
  r.add(function (p) {
    return t(d, void 0, void 0, function () {
      var t, d, v, b, h, m, w, y, k, j, I, O, x, _, C, S, E, N, T;
      return n(this, function (n) {
        switch (n.label) {
          case 0:
            return f(p)
              ? [2]
              : ((t = r.parse(p.data)),
                (d = t.eventName),
                (v = void 0 === d ? '' : d),
                (b = t.data),
                (h = void 0 === b ? null : b),
                (m = t.url),
                (w = void 0 === m ? null : m),
                -1 !== ['wps.jssdk.api'].indexOf(v)
                  ? [2]
                  : 'ready' !== v
                  ? [3, 1]
                  : (g({
                      eventName: 'setConfig',
                      data: e(e({}, o), { version: a.version }),
                    }),
                    a.tokenData &&
                      a.setToken(
                        e(e({}, a.tokenData), {
                          hasRefreshTokenConfig: !!o.refreshToken,
                        }),
                      ),
                    s.apiReadySended &&
                      (g({ eventName: 'api.ready' }),
                      W.forEach(function (e) {
                        return a.on(e.eventName, e.handle);
                      })),
                    (a.iframeReady = !0),
                    [3, 17]));
          case 1:
            return 'error' !== v ? [3, 2] : (i.emit(G.error, h), [3, 17]);
          case 2:
            return 'open.result' !== v
              ? [3, 3]
              : (void 0 !==
                  (null === (E = null == h ? void 0 : h.fileInfo) ||
                  void 0 === E
                    ? void 0
                    : E.officeVersion) &&
                  ((a.mainVersion = h.fileInfo.officeVersion),
                  console.log('WebOfficeSDK Main Version: V' + a.mainVersion)),
                i.emit(G.fileOpen, h),
                [3, 17]);
          case 3:
            return 'file.saved' !== v
              ? [3, 4]
              : (i.emit(G.fileStatus, h), i.emit(G.fileSaved, h), [3, 17]);
          case 4:
            return 'tab.switch' !== v
              ? [3, 5]
              : (i.emit(G.tabSwitch, h), [3, 17]);
          case 5:
            return 'api.scroll' !== v
              ? [3, 6]
              : (window.scrollTo(h.x, h.y), [3, 17]);
          case 6:
            if (v !== K.getToken) return [3, 11];
            (y = { token: !1 }), (n.label = 7);
          case 7:
            return n.trys.push([7, 9, , 10]), [4, s.refreshToken()];
          case 8:
            return (y = n.sent()), [3, 10];
          case 9:
            return (
              (k = n.sent()),
              console.error('refreshToken: ' + (k || 'fail to get')),
              [3, 10]
            );
          case 10:
            return g({ eventName: K.getToken + '.reply', data: y }), [3, 17];
          case 11:
            if (v !== K.getClipboardData) return [3, 16];
            (j = { text: '', html: '' }), (n.label = 12);
          case 12:
            return n.trys.push([12, 14, , 15]), [4, s.getClipboardData()];
          case 13:
            return (j = n.sent()), [3, 15];
          case 14:
            return (
              (I = n.sent()),
              console.error('getClipboardData: ' + (I || 'fail to get')),
              [3, 15]
            );
          case 15:
            return (
              g({ eventName: K.getClipboardData + '.reply', data: j }), [3, 17]
            );
          case 16:
            v === K.onToast
              ? s.onToast(h)
              : v === K.onHyperLinkOpen
              ? s.onHyperLinkOpen(h)
              : 'stage' === v
              ? i.emit(G.stage, h)
              : 'event.callback' === v
              ? ((O = h.eventName),
                (x = h.data),
                (_ = O),
                'fullScreenChange' === O && (_ = G.fullscreenChange),
                ((null === (N = o.commonOptions) || void 0 === N
                  ? void 0
                  : N.isBrowserViewFullscreen) ||
                  (null === (T = o.commonOptions) || void 0 === T
                    ? void 0
                    : T.isParentFullscreen)) &&
                'fullscreenchange' === _
                  ? ((C = x.status),
                    (S = x.isDispatchEvent),
                    o.commonOptions.isBrowserViewFullscreen
                      ? (function (e, t, n, r) {
                          0 === e
                            ? (t.style =
                                'position: static; width: ' +
                                n.width +
                                '; height: ' +
                                n.height)
                            : 1 === e &&
                              (t.style =
                                'position: absolute; width: 100%; height: 100%'),
                            r &&
                              (function (e) {
                                ['fullscreen', 'fullscreenElement'].forEach(
                                  function (t) {
                                    Object.defineProperty(document, t, {
                                      get: function () {
                                        return !!e.status;
                                      },
                                      configurable: !0,
                                    });
                                  },
                                );
                                var t = new CustomEvent('fullscreenchange');
                                document.dispatchEvent(t);
                              })({ status: e });
                        })(C, u, l, S)
                      : o.commonOptions.isParentFullscreen &&
                        (function (e, t, n) {
                          var r = document.querySelector(n),
                            a = r && 1 === r.nodeType ? r : t;
                          if (0 === e) {
                            var i = document,
                              o =
                                i.exitFullscreen ||
                                i.mozCancelFullScreen ||
                                i.msExitFullscreen ||
                                i.webkitCancelFullScreen ||
                                i.webkitExitFullscreen;
                            o.call(document);
                          } else if (1 === e) {
                            var c =
                              a.requestFullscreen ||
                              a.mozRequestFullScreen ||
                              a.msRequestFullscreen ||
                              a.webkitRequestFullscreen;
                            c.call(a);
                          }
                        })(C, u, o.commonOptions.isParentFullscreen),
                    i.emit(_, x))
                  : i.emit(_, x))
              : 'api.ready' === v && H(a, h),
              (n.label = 17);
          case 17:
            return 'function' == typeof c[v] && c[v](a, w || h), [2];
        }
      });
    });
  });
}
function U(e) {
  return new Promise(function (t) {
    var n = function (a) {
      f(a) || (r.parse(a.data).eventName === e && (t(), r.remove(n)));
    };
    r.add(n);
  });
}
function Z(e) {
  void 0 === e && (e = {}), q && q.destroy();
  try {
    var i = C(e),
      o = i.subscriptions,
      c = void 0 === o ? {} : o,
      s = i.mount,
      u = void 0 === s ? null : s,
      d = i.url,
      f = i.refreshToken,
      p = i.onToast,
      v = i.onHyperLinkOpen,
      b = i.getClipboardData;
    l('origin', (d.match(/https*:\/\/[^\/]+/g) || [])[0]);
    var h = m(d, u),
      w = U('ready'),
      j = U('open.result'),
      I = U('api.ready'),
      O = u
        ? { width: u.clientWidth + 'px', height: u.clientHeight + 'px' }
        : { width: '100vw', height: '100vh' };
    delete i.mount, d && delete i.url, delete i.subscriptions;
    var x =
        ((S = S || Object.create(null)),
        {
          on: function (e, t) {
            (S[e] || (S[e] = [])).push(t);
          },
          off: function (e, t) {
            S[e] && S[e].splice(S[e].indexOf(t) >>> 0, 1);
          },
          emit: function (e, t) {
            (S[e] || []).slice().map(function (e) {
              e(t);
            }),
              (S['*'] || []).slice().map(function (n) {
                n(e, t);
              });
          },
        }),
      _ = { apiReadySended: !1 };
    return (
      (q = {
        url: d,
        iframe: h,
        version: '1.1.14',
        iframeReady: !1,
        tokenData: null,
        commandBars: null,
        tabs: {
          getTabs: function () {
            return t(this, void 0, void 0, function () {
              return n(this, function (e) {
                switch (e.label) {
                  case 0:
                    return [4, w];
                  case 1:
                    return e.sent(), [2, k({ api: 'tab.getTabs' })];
                }
              });
            });
          },
          switchTab: function (e) {
            return t(this, void 0, void 0, function () {
              return n(this, function (t) {
                switch (t.label) {
                  case 0:
                    return [4, w];
                  case 1:
                    return (
                      t.sent(),
                      [2, k({ api: 'tab.switchTab', args: { tabKey: e } })]
                    );
                }
              });
            });
          },
        },
        setCooperUserColor: function (e) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, w];
                case 1:
                  return (
                    t.sent(), [2, k({ api: 'setCooperUserColor', args: e })]
                  );
              }
            });
          });
        },
        setToken: function (e) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, w];
                case 1:
                  return (
                    t.sent(),
                    (q.tokenData = e),
                    g({ eventName: 'setToken', data: e }),
                    [2]
                  );
              }
            });
          });
        },
        ready: function () {
          return t(this, void 0, void 0, function () {
            return n(this, function (e) {
              switch (e.label) {
                case 0:
                  return _.apiReadySended ? [3, 2] : [4, j];
                case 1:
                  e.sent(),
                    (_.apiReadySended = !0),
                    g({ eventName: 'api.ready' }),
                    (e.label = 2);
                case 2:
                  return [4, I];
                case 3:
                  return (
                    e.sent(),
                    [
                      2,
                      new Promise(function (e) {
                        return setTimeout(function () {
                          return e(null == q ? void 0 : q.Application);
                        }, 0);
                      }),
                    ]
                  );
              }
            });
          });
        },
        destroy: function () {
          h.destroy(),
            r.empty(),
            (q = null),
            (W = []),
            (D = new Set()),
            (A = 0),
            document.removeEventListener('fullscreenchange', P),
            F();
        },
        save: function () {
          return t(this, void 0, void 0, function () {
            return n(this, function (e) {
              switch (e.label) {
                case 0:
                  return [4, w];
                case 1:
                  return e.sent(), [2, y({ api: 'save' })];
              }
            });
          });
        },
        setCommandBars: function (e) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, w];
                case 1:
                  return t.sent(), E(e), [2];
              }
            });
          });
        },
        updateConfig: function (e) {
          return (
            void 0 === e && (e = {}),
            t(this, void 0, void 0, function () {
              return n(this, function (t) {
                switch (t.label) {
                  case 0:
                    return [4, w];
                  case 1:
                    return (
                      t.sent(),
                      e.commandBars
                        ? (console.warn(
                            'Deprecated: `updateConfig()` 方法即将废弃，请使用`setCommandBars()`代替`updateConfig()`更新`commandBars`配置。',
                          ),
                          [4, E(e.commandBars)])
                        : [3, 3]
                    );
                  case 2:
                    t.sent(), (t.label = 3);
                  case 3:
                    return [2];
                }
              });
            })
          );
        },
        executeCommandBar: function (e) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, w];
                case 1:
                  return (
                    t.sent(),
                    E([
                      { cmbId: e, attributes: [{ name: 'click', value: !0 }] },
                    ]),
                    [2]
                  );
              }
            });
          });
        },
        on: function (e, r) {
          return t(this, void 0, void 0, function () {
            var t, a;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return (
                    -1 ===
                    (t = W.findIndex(function (t) {
                      return t.eventName === e;
                    }))
                      ? W.push({ eventName: e, handle: r })
                      : (W[t] = { eventName: e, handle: r }),
                    [4, w]
                  );
                case 1:
                  return (
                    n.sent(),
                    (a = e),
                    e === G.fileSaved &&
                      console.warn(
                        'fileSaved事件监听即将弃用， 推荐使用fileStatus进行文件状态的监听',
                      ),
                    e === G.fullscreenChange && (a = 'fullscreenchange'),
                    Q(a, 'on'),
                    x.on(e, r),
                    [2]
                  );
              }
            });
          });
        },
        off: function (e, r) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return (
                    (W = W.filter(function (t) {
                      t.eventName !== e && t.handle;
                    })),
                    [4, w]
                  );
                case 1:
                  return t.sent(), Q(e, 'off'), x.off(e, r), [2];
              }
            });
          });
        },
      }),
      (function (e, t, n, r, i, o) {
        t &&
          a(t) &&
          ((i.refreshToken = t), (e.refreshToken = { eventName: K.getToken }));
        o &&
          a(o) &&
          ((i.getClipboardData = o),
          (e.getClipboardData = { eventName: K.getClipboardData }));
        n && a(n) && ((i.onToast = n), (e.onToast = { eventName: K.onToast }));
        r &&
          a(r) &&
          ((i.onHyperLinkOpen = r),
          (e.onHyperLinkOpen = { eventName: K.onHyperLinkOpen }));
      })(i, f, p, v, _, b),
      J(q, x, i, c, _, h, O),
      q
    );
  } catch (e) {
    console.error(e);
  }
  var S;
}
function Q(e, t) {
  var n = e;
  ['error', 'fileOpen'].includes(n) ||
    ('fileSaved' === n && (n = 'fileStatus'),
    g({ eventName: 'basic.event', data: { eventName: n, action: t } }));
}
console.log('WebOfficeSDK JS-SDK V1.1.14');
var X = Object.freeze({ __proto__: null, listener: J, config: Z });
window.WPS = X;
var Y = Z;
export default { config: Z };
export { Y as config };
