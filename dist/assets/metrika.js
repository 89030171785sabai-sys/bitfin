(function () {
  const counterId = 114367039;
  const tagUrl = 'https://mc.yandex.ru/metrika/tag.js?id=' + counterId;

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

  document.addEventListener('click', function (event) {
    const link = event.target.closest?.('a[href]');
    if (!link) return;

    const isTelegram = link.protocol === 'tg:' ||
      (link.protocol === 'https:' && ['t.me', 'telegram.me'].includes(link.hostname));
    const goal = isTelegram ? 'telegram_click' :
      { 'tel:': 'phone_click', 'mailto:': 'email_click' }[link.protocol];
    if (goal) window.ym(counterId, 'reachGoal', goal);
  });
})();
