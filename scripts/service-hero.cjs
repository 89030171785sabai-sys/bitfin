// Service-specific wording in the approved home-page hero structure.
const points = {
  'vnedrenie-bit-finans': [
    'Согласуем финансовую модель',
    'Настроим систему под ваши процессы',
    'Подготовим команду к работе',
    'Зафиксируем состав и стоимость этапов'
  ],
  'byudzhetirovanie-bit-finans': [
    'Соберем бюджетную модель в одной системе',
    'Настроим формы ввода',
    'Настроим версии бюджетов и правила получения факта',
    'Проанализируем сопоставимые финансовые показатели'
  ],
  'kaznacheystvo-bit-finans': [
    'Выстроим путь от заявки до оплаты',
    'Настроим маршруты согласования',
    'Настроим контроль лимитов',
    'Подготовим платёжный календарь'
  ],
  'upravlencheskiy-uchet-bit-finans': [
    'Свяжем данные 1С с отчётами',
    'Согласуем правила управленческого учёта',
    'Настроим аналитики для руководства',
    'Проверим цифры контрольными сверками'
  ],
  'obuchenie-soprovozhdenie-bit-finans': [
    'Разберём ежедневные операции в вашей базе',
    'Подберём программу по ролям сотрудников',
    'Подготовим рабочие инструкции',
    'Закрепим навыки самостоятельной практикой'
  ]
};
const svg = path => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const trust = `<div class="service-hero-trust" aria-label="Опыт и условия работы">
  <div>${svg('M3 5h18v16H3zM8 3v4M16 3v4M3 10h18M8 15h3M8 18h6')}<strong>12+ лет</strong><span>практики внедрения</span></div>
  <div>${svg('m4 7.5 8-4.5 8 4.5v9L12 21l-8-4.5zM4 7.5l8 4.5 8-4.5M12 12v9')}<strong>40+</strong><span>полных внедрений</span></div>
  <div>${svg('M12 3 20 6v6c0 4.7-3.1 7.6-8 9-4.9-1.4-8-4.3-8-9V6zM8 12l2.5 2.5L16 9')}<strong>Поэтапно</strong><span>оплата после приёмки</span></div>
</div>`;
const render = p => `<div class="service-hero-copy"><p class="service-hero-label">${p.short} БИТ.ФИНАНС</p>
  <h1>${p.h1}</h1>
  <ul class="service-hero-points">${points[p.slug].map(text=>`<li>${text}</li>`).join('')}</ul>
  <div class="service-hero-actions"><a class="btn" href="#request">БЕСПЛАТНАЯ КОНСУЛЬТАЦИЯ</a><a class="btn service-hero-secondary" href="#cases">Смотреть отзывы</a></div>
  ${trust}
</div>`;
const css = `.service-page .service-hero{grid-template-columns:minmax(0,1.25fr) minmax(0,.85fr);gap:48px;align-items:center;padding:16px 0 54px}
.service-hero-copy{min-width:0}
.service-hero-copy .service-hero-label{display:inline-block;margin:0 0 20px;padding:6px 12px;border:1px solid #dfe2e7;border-radius:999px;font-size:12px;line-height:1.35;color:#5f6672}
.service-hero-copy h1{max-width:760px;margin:0 0 26px;font-size:clamp(36px,3.8vw,54px);line-height:1.08;letter-spacing:-.04em;text-wrap:balance}
.service-hero-points{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px;list-style:none;margin:0;padding:0}
.service-hero-points li{position:relative;padding:12px 12px 12px 36px;border:1px solid #e6007621;border-radius:12px;background:#fff0f7;color:#5f6672;font-size:14px;line-height:1.4}
.service-hero-points li::before{content:'✓';position:absolute;top:10px;left:13px;font-size:18px;font-weight:700;color:#e60076}
.service-hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 0}
.service-page .service-hero-actions .btn{min-height:50px;margin:0;padding:14px 20px;font-size:13px;line-height:1.4;border:1px solid #e60076}
.service-page .service-hero-actions .service-hero-secondary{background:#fff;color:#171717;border-color:#bfc4cc;font-weight:500}
.service-page .service-hero-actions .service-hero-secondary:hover{border-color:#e60076;color:#c90067}
.service-hero-trust{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:18px;padding-top:26px;border-top:1px solid #dfe2e7}
.service-hero-trust>div{display:grid;grid-template-columns:44px minmax(0,1fr);grid-template-rows:auto auto;column-gap:10px;align-items:center}
.service-hero-trust svg{grid-row:1/3;width:44px;height:44px;padding:10px;border:1px solid #e600762e;border-radius:14px;background:#fff0f7;fill:none;stroke:#e60076;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.service-hero-trust strong{align-self:end;font-size:16px;line-height:1.3;font-weight:700}
.service-hero-trust span{align-self:start;margin-top:4px;color:#5f6672;font-size:12px;line-height:1.4}
@media(max-width:1100px){.service-page .service-hero{grid-template-columns:minmax(0,1.3fr) minmax(0,.8fr);gap:28px}.service-hero-trust{gap:12px}.service-hero-trust>div{grid-template-columns:36px minmax(0,1fr);gap:6px}.service-hero-trust svg{width:36px;height:36px;padding:8px}.service-hero-trust strong{font-size:14px}}
@media(max-width:900px){.service-page .service-hero{grid-template-columns:1fr;gap:32px}.service-hero-copy{max-width:720px}.service-hero-copy h1{font-size:clamp(36px,5.6vw,48px)}.service-hero .service-visual{max-width:720px}}
@media(max-width:600px){.service-page .service-hero{padding-top:8px;padding-bottom:36px}.service-hero-copy h1{font-size:34px;line-height:1.1;margin-bottom:22px;text-wrap:initial}.service-hero-points{grid-template-columns:1fr;gap:8px}.service-hero-actions{flex-direction:column;margin-top:20px}.service-hero-actions .btn{width:100%}.service-hero-trust{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding-top:20px}.service-hero-trust>div{display:flex;flex-direction:column;align-items:flex-start;gap:6px}.service-hero-trust strong,.service-hero-trust span{align-self:auto}.service-hero-trust span{margin:0;font-size:11px}}
`;
module.exports={render,css};
