(function () {
  const counterId = 114367039;
  const tagUrl = 'https://mc.yandex.ru/metrika/tag.js?id=' + counterId;
  const preferenceKey = 'bitfinans-analytics-consent-v1';
  const preferenceLifetime = 180 * 24 * 60 * 60 * 1000;
  const banner = document.querySelector('#cookie-preferences');
  if (!banner) return;

  const settings = document.querySelector('[data-cookie-settings]');
  let started = false;

  function readPreference() {
    try {
      const saved = JSON.parse(localStorage.getItem(preferenceKey));
      if (saved?.expires > Date.now() && ['allow', 'deny'].includes(saved.choice)) return saved.choice;
    } catch {
      // Analytics stays off if browser storage is unavailable.
    }
    return null;
  }

  function startAnalytics() {
    if (started) return;
    started = true;
    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = tagUrl;
    document.head.append(tag);

    window.ym(counterId, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });
  }

  function clearSiteAnalyticsStorage() {
    for (const entry of document.cookie.split(';')) {
      const name = entry.split('=')[0].trim();
      if (!/^_ym_[a-z0-9_]+$/i.test(name)) continue;
      const expired = name + '=; Max-Age=0; Path=/';
      document.cookie = expired;
      document.cookie = expired + '; Domain=bitfinans.pro';
    }
    for (const storage of ['localStorage', 'sessionStorage']) {
      try {
        const store = window[storage];
        Object.keys(store).filter(key => key.startsWith('_ym')).forEach(key => store.removeItem(key));
      } catch {
        // Storage access may be disabled by the browser.
      }
    }
  }

  function applyPreference(choice) {
    banner.hidden = choice !== null;
    if (choice === 'allow') startAnalytics();
    if (choice !== 'allow' && started) {
      clearSiteAnalyticsStorage();
      location.reload();
    }
  }

  settings.hidden = false;
  settings.addEventListener('click', function () {
    banner.hidden = false;
    banner.querySelector('a').focus({preventScroll: true});
  });
  banner.addEventListener('click', function (event) {
    const button = event.target.closest('[data-cookie-choice]');
    if (!button) return;
    const choice = button.dataset.cookieChoice;
    try {
      localStorage.setItem(preferenceKey, JSON.stringify({
        choice,
        expires: Date.now() + preferenceLifetime
      }));
    } catch {
      // The choice still applies to the current page.
    }
    if (choice === 'deny') clearSiteAnalyticsStorage();
    applyPreference(choice);
    settings.focus({preventScroll: true});
  });
  window.addEventListener('storage', function (event) {
    if (event.key === preferenceKey || event.key === null) applyPreference(readPreference());
  });
  applyPreference(readPreference());

  document.addEventListener('click', function (event) {
    if (!started) return;
    const link = event.target.closest?.('a[href]');
    if (!link) return;

    const isTelegram = link.protocol === 'tg:' ||
      (link.protocol === 'https:' && ['t.me', 'telegram.me'].includes(link.hostname));
    const goal = isTelegram ? 'telegram_click' :
      { 'tel:': 'phone_click', 'mailto:': 'email_click' }[link.protocol];
    if (goal) window.ym(counterId, 'reachGoal', goal);
  });
})();
