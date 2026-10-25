// Runs a real Upnova widget inside an <iframe> on the video's clock (see virtual-clock.js).
//
//   var w = UpnovaWidgetFrame(iframe, {
//     global: "UpnovaFreeGiftCart",          // what the widget bundle puts on the frame's window
//     options: { ... },                       // handed to its mount()
//     actions: [{ at: 2.0, run: function (api) { api.changeQuantity(5); } }],   // seconds into the section
//     section: rootElement                    // the section's root, to read its start time
//   });
//   w.ready.then(...)                         // the widget has loaded and settled
//   w.show(seconds)                           // a promise: the widget as it is that many seconds in
//
// Every video frame calls show() (from the section's timeline and from the renderer's "hf-seek" event,
// which waits for it before taking the frame). Going backwards reloads the frame and replays to the moment.
(function () {
  function UpnovaWidgetFrame(iframe, cfg) {
    var fw = null, api = null, t0 = 0, loadedOnce = null, chain = Promise.resolve();

    function load() {
      return new Promise(function (resolve) {
        var done = function () { iframe.removeEventListener("load", done); resolve(); };
        iframe.addEventListener("load", done);
        if (loadedOnce) iframe.contentWindow.location.reload();
        else if (iframe.contentDocument && iframe.contentDocument.readyState === "complete" && iframe.contentWindow.__vclock) { iframe.removeEventListener("load", done); resolve(); }
      });
    }
    async function boot() {
      await load();
      loadedOnce = true;
      fw = iframe.contentWindow;
      var mountPromise = fw[cfg.global].mount(fw.document.getElementById("widget"), cfg.options);
      var mounted = false;
      mountPromise.then(function (a) { api = a; mounted = true; });
      await fw.__vclock.runUntil(function () { return mounted; });
      // let it settle for half a second, then the section's time 0 is this moment
      await fw.__vclock.advanceTo(fw.__vclock.now() + 500);
      t0 = fw.__vclock.now();
      (cfg.actions || []).forEach(function (a) {
        fw.setTimeout(function () { a.run(api); }, a.at * 1000);
      });
    }
    var ready = boot();

    function show(seconds) {
      var s = Math.max(0, seconds || 0);
      chain = chain.then(async function () {
        await ready;
        var target = t0 + s * 1000;
        if (target < fw.__vclock.now() - 0.5) { ready = boot(); await ready; target = t0 + s * 1000; }
        await fw.__vclock.advanceTo(target);
      }).catch(function (e) { console.error(e); });
      return chain;
    }

    // the renderer seeks the video and waits for this before it takes each frame
    if (cfg.section) {
      var host = cfg.section.closest("[data-start]") || cfg.section;
      window.addEventListener("hf-seek", function (e) {
        var start = parseFloat(host.getAttribute("data-start")) || 0;
        var dur = parseFloat(host.getAttribute("data-duration")) || Infinity;
        var local = e.detail.time - start;
        if (local < -0.05 || local > dur + 0.05) return;
        e.detail.waitUntil(show(local));
      });
    }
    return { ready: ready.then(function () { return api; }), show: show, frame: function () { return fw; } };
  }
  window.UpnovaWidgetFrame = UpnovaWidgetFrame;
})();
