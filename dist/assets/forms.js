(() => {
  const aliases = {
    utm_source: ['utm_source'],
    utm_medium: ['utm_medium'],
    utm_campaign: ['utm_campaign'],
    group_id: ['group_id', 'adgroup_id', 'ad_group_id', 'utm_group'],
    ad_id: ['ad_id', 'banner_id', 'utm_ad'],
    utm_content: ['utm_content'],
    utm_term: ['utm_term', 'keyword']
  };
  const campaignKey = 'bitfinans_campaign';
  const url = new URL(location.href);
  const query = url.searchParams;
  const content = query.get('utm_content');
  const namedContent = new URLSearchParams((content || '').replace(/[|;]/g, '&'));
  const campaign = {};
  for (const [field, keys] of Object.entries(aliases)) {
    const value = keys.map(key => query.get(key) || namedContent.get(key)).find(Boolean);
    if (value) campaign[field] = value.slice(0, 100);
  }
  let attribution = campaign;
  try {
    if (Object.keys(campaign).length) sessionStorage.setItem(campaignKey, JSON.stringify(campaign));
    else attribution = JSON.parse(sessionStorage.getItem(campaignKey) || '{}');
  } catch {
    // The landing URL still supplies attribution when browser storage is unavailable.
  }

  for (const form of document.querySelectorAll('form[data-lead-type]')) {
    const status = form.querySelector('[aria-live]');
    const button = form.querySelector('button[type="submit"], button:not([type])');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (button.disabled || !form.reportValidity()) return;

      const data = new URLSearchParams(new FormData(form));
      data.set('type', form.dataset.leadType);
      data.set('page', url.pathname);
      for (const field of Object.keys(aliases)) {
        if (attribution[field]) data.set(field, attribution[field]);
      }
      button.disabled = true;
      status.textContent = 'Отправляем…';
      try {
        const result = await fetch('/request.php', {method: 'POST', body: data});
        if (!result.ok) throw new Error('Delivery failed');
        const response = await result.json();
        if (!response.ok) throw new Error('Delivery failed');
        status.textContent = form.dataset.leadType === 'materials'
          ? 'Запрос на материалы отправлен.'
          : 'Заявка отправлена. Мы свяжемся с вами.';
        if (form.dataset.leadType === 'materials' && response.download_url === '/assets/materials/bitfinans-materials.zip') {
          const download = document.createElement('a');
          download.href = response.download_url;
          download.download = 'bitfinans-materials.zip';
          download.textContent = 'Скачать материалы';
          status.textContent = 'Запрос отправлен. Если скачивание не началось, нажмите «Скачать материалы». ';
          status.append(download);
          download.click();
        }
        form.reset();
        window.ym?.(114367039, 'reachGoal', 'lead_submitted');
      } catch {
        status.textContent = 'Отправка не подтвердилась. Попробуйте ещё раз или свяжитесь с нами по телефону.';
      } finally {
        button.disabled = false;
      }
    });
  }
})();
