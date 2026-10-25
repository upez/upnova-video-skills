// A video clock for a widget page (load it before anything else in the page).
//
// The widget's own code keeps running for real (React, motion, fetches, CSS animations), but time inside
// this page only moves when the video says so: performance.now, Date, setTimeout/setInterval,
// requestAnimationFrame and every CSS animation and transition follow __vclock. The page's real async work
// (promises, the mock fetch, image loads) still happens; advanceTo() lets it settle at every step.
// So each video frame shows exactly what the widget shows at that moment in a store, the same every render.
(function () {
  var realSetTimeout = window.setTimeout.bind(window);
  var RealDate = window.Date;
  var EPOCH = 1767225600000; // 2026-01-01, a fixed "now" for widgets that read the date
  var t = 0;                 // virtual milliseconds since the page loaded
  var seq = 0;
  var timers = [];           // { id, at, fn, args, every }
  var rafs = [];

  performance.now = function () { return t; };
  function VDate() {
    var a = [].slice.call(arguments);
    if (!(this instanceof VDate)) return new RealDate(EPOCH + t).toString();
    return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(EPOCH + t);
  }
  VDate.prototype = RealDate.prototype;
  VDate.now = function () { return EPOCH + t; };
  VDate.UTC = RealDate.UTC;
  VDate.parse = RealDate.parse;
  window.Date = VDate;

  window.setTimeout = function (fn, ms) {
    var id = ++seq;
    timers.push({ id: id, at: t + Math.max(0, +ms || 0), fn: fn, args: [].slice.call(arguments, 2) });
    return id;
  };
  window.setInterval = function (fn, ms) {
    var id = ++seq, every = Math.max(1, +ms || 0);
    timers.push({ id: id, at: t + every, fn: fn, args: [].slice.call(arguments, 2), every: every });
    return id;
  };
  window.clearTimeout = window.clearInterval = function (id) {
    timers = timers.filter(function (x) { return x.id !== id; });
  };
  window.requestAnimationFrame = function (fn) { var id = ++seq; rafs.push({ id: id, fn: fn }); return id; };
  window.cancelAnimationFrame = function (id) { rafs = rafs.filter(function (x) { return x.id !== id; }); };
  window.requestIdleCallback = function (fn) { return window.setTimeout(function () { fn({ didTimeout: false, timeRemaining: function () { return 50; } }); }, 1); };
  window.cancelIdleCallback = window.clearTimeout;
  // React's scheduler posts its work through MessageChannel (a real-time task); without it, it uses
  // setTimeout, which follows this clock
  try { window.MessageChannel = undefined; } catch (e) {}

  function call(fn, args) {
    try { typeof fn === "function" ? fn.apply(window, args || []) : (0, eval)(String(fn)); } catch (e) { console.error(e); }
  }
  function nextDue(until) {
    var best = null;
    for (var i = 0; i < timers.length; i++) {
      var x = timers[i];
      if (x.at <= until && (!best || x.at < best.at || (x.at === best.at && x.id < best.id))) best = x;
    }
    return best;
  }
  function runDue(until) {
    for (var guard = 0; guard < 5000; guard++) {
      var x = nextDue(until);
      if (!x) return;
      var at = x.at;
      if (x.every) x.at += x.every; else timers.splice(timers.indexOf(x), 1);
      t = Math.max(t, at);
      call(x.fn, x.args);
    }
  }

  // widgets live in shadow roots, whose animations don't show in document.getAnimations(): keep a list
  var shadowRoots = [];
  var attachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function () {
    var root = attachShadow.apply(this, arguments);
    shadowRoots.push(root);
    return root;
  };
  function allAnimations() {
    var list = document.getAnimations ? document.getAnimations() : [];
    shadowRoots.forEach(function (r) { if (r.getAnimations) list = list.concat(r.getAnimations()); });
    return list;
  }

  // CSS animations and transitions: paused and set to the clock (their start is when the clock first saw them)
  var startedAt = new WeakMap();
  function syncAnimations() {
    allAnimations().forEach(function (a) {
      try {
        if (a.playState === "finished") return;
        if (!startedAt.has(a)) startedAt.set(a, t - (a.currentTime || 0));
        var at = Math.max(0, t - startedAt.get(a));
        var end = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming().endTime : Infinity;
        // a paused animation never "finishes", and widgets (motion) wait for that before the next step:
        // once its time is up, finish it for real
        if (isFinite(end) && at >= end) { a.finish(); return; }
        a.pause();
        a.currentTime = at;
      } catch (e) {}
    });
  }

  function frame(to) {
    runDue(to);
    t = Math.max(t, to);
    var list = rafs; rafs = [];
    list.forEach(function (r) { call(r.fn, [t]); });
    syncAnimations();
  }
  function yieldReal() { return new Promise(function (r) { realSetTimeout(r, 0); }); }
  // let promise chains and timers they start at this same moment finish
  async function settle() {
    for (var i = 0; i < 12; i++) {
      await yieldReal();
      if (!nextDue(t)) { if (i >= 1) break; continue; }
      runDue(t);
    }
  }

  var busy = Promise.resolve();
  function advanceTo(ms, stepMs) {
    busy = busy.then(async function () {
      var step = stepMs || 1000 / 60;
      while (t < ms - 1e-6) {
        frame(Math.min(ms, t + step));
        await settle();
      }
      frame(t);
      await settle();
      syncAnimations();
    });
    return busy;
  }
  // run until test() is true (setup), in the same fixed steps, so it ends at the same moment every time
  async function runUntil(test, maxMs) {
    var limit = t + (maxMs || 15000);
    while (!test()) {
      if (t > limit) throw new Error("widget did not get ready");
      await advanceTo(t + 1000 / 60);
    }
  }

  window.__vclock = { now: function () { return t; }, advanceTo: advanceTo, runUntil: runUntil };
})();
