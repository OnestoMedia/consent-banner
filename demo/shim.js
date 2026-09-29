(function () {
  // Like GTM getCookieValues(name, decode): URL-decodes unless decode === false.
  var cookies = function (name, decode) {
    return document.cookie.split('; ').filter(function (c) { return c.indexOf(name + '=') === 0; })
      .map(function (c) { var v = c.slice(name.length + 1); return decode === false ? v : decodeURIComponent(v); });
  };
  var apis = {
    setDefaultConsentState: function (s) { gtag('consent', 'default', s); },
    updateConsentState: function (s) { gtag('consent', 'update', s); },
    getCookieValues: cookies,
    setInWindow: function (k, v) { window[k] = v; return true; },
    gtagSet: function (k, v) { gtag('set', k, v); },
    // Record template logs so e2e can assert on them; a load failure sets __omFailed.
    logToConsole: function () {
      var args = Array.prototype.slice.call(arguments);
      (window.__omLogs = window.__omLogs || []).push(args.join(' '));
      if (String(args[0]).indexOf('failed to load') !== -1) window.__omFailed = true;
      console.log.apply(console, arguments);
    },
    makeNumber: Number, makeString: String,
    injectScript: function (url, ok, fail) {
      var s = document.createElement('script');
      s.src = url.replace(/^https:\/\/cdn\.jsdelivr\.net\/gh\/OnestoMedia\/consent-banner@[^/]+/, '');
      s.onload = ok; s.onerror = fail;
      document.head.appendChild(s);
    }
  };
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/template/code.js', false);
  xhr.send();
  var data = Object.assign({
    gtmOnSuccess: function () { window.__omTagDone = true; },
    gtmOnFailure: function () { window.__omTagFailed = true; }
  }, window.__demoData);
  new Function('require', 'data', xhr.responseText)(function (n) { return apis[n]; }, data);
})();
