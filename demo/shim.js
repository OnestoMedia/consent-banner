(function () {
  var cookies = function (name) {
    return document.cookie.split('; ').filter(function (c) { return c.indexOf(name + '=') === 0; })
      .map(function (c) { return c.slice(name.length + 1); });
  };
  var apis = {
    setDefaultConsentState: function (s) { gtag('consent', 'default', s); },
    updateConsentState: function (s) { gtag('consent', 'update', s); },
    getCookieValues: cookies,
    setInWindow: function (k, v) { window[k] = v; return true; },
    gtagSet: function (k, v) { gtag('set', k, v); },
    logToConsole: function () { console.log.apply(console, arguments); },
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
  var data = Object.assign({ gtmOnSuccess: function () {}, gtmOnFailure: function () { window.__omFailed = true; } }, window.__demoData);
  new Function('require', 'data', xhr.responseText)(function (n) { return apis[n]; }, data);
})();
