// Reuse the approved home sections and their behavior on every content page.
module.exports = function sharedHomeBlocks(home, primary = '') {
  const section = id => {
    const match = home.match(new RegExp('<section[^>]*\\bid="' + id + '"[^>]*>[\\s\\S]*?<\\/section>'));
    if (!match) throw Error('Missing shared section: ' + id);
    return match[0];
  };
  const services = home.match(/<div class="hero-carousel"[\s\S]*?<p class="carousel-status"[^>]*><\/p>\s*<\/div>/)[0];
  const problem = home.match(/<section[^>]*>[\s\S]*?<\/section>/g).find(s => s.includes('<h2>Когда компании нужен БИТ.ФИНАНС</h2>'));
  if (!problem) throw Error('Missing problem section');
  const modal = home.match(/<div class="video-modal"[^\r\n]+/)[0];
  const blocks = {
    services: '<section class="section shared-services"><div class="wrap">' + services + '</div></section>',
    expert: section('expert'),
    problem: problem.replace('<section ', '<section id="when-needed" '),
    reviews: section('cases'),
    certificates: section('certificates')
  };
  const order = Object.keys(blocks);
  if (primary && order.includes(primary)) order.splice(0, 0, order.splice(order.indexOf(primary), 1)[0]);
  const html = '<div class="shared-content">' + order.map(key => blocks[key]).join('') + modal + '</div>';

  // Scope existing CSS to the reused sections, keeping each page's own layout intact.
  function scopedCSS(input) {
    input = input.replace(/\/\*[\s\S]*?\*\//g, '');
    let result = '', start = 0;
    while (start < input.length) {
      const open = input.indexOf('{', start);
      if (open < 0) break;
      const selector = input.slice(start, open).trim();
      let depth = 1, end = open + 1, quote = '';
      for (; end < input.length && depth; end++) {
        const c = input[end];
        if (quote) { if (c === quote && input[end - 1] !== '\\') quote = ''; }
        else if (c === '"' || c === "'") quote = c;
        else if (c === '{') depth++;
        else if (c === '}') depth--;
      }
      const body = input.slice(open + 1, end - 1);
      if (/^@(media|supports)/.test(selector)) result += selector + '{' + scopedCSS(body) + '}';
      else if (selector.startsWith('@')) result += selector + '{' + body + '}';
      else {
        const selectors = selector.split(/,(?![^()]*\))/).map(s => s.trim());
        const scoped = selectors.map(s => s === ':root' ? '.shared-content' : '.shared-content ' + s);
        result += scoped.join(',') + '{' + body + '}';
      }
      start = end;
    }
    return result;
  }
  const css = scopedCSS(home.match(/<style>([\s\S]*?)<\/style>/)[1]) + `
    .shared-content{font:400 16px/1.65 Manrope,Arial,sans-serif;min-width:0}
    .shared-content .hero-carousel{margin-top:0}
    .shared-content .shared-services{background:#f4f5f7}
    .shared-content .direction-card{position:relative}
    .shared-content .direction-card h3 a::after{content:'';position:absolute;inset:0;border-radius:18px}
    .shared-content .direction-card:focus-within{outline:3px solid #e60076;outline-offset:2px}
    .shared-content .direction-more{display:block;color:#c90067;font-size:13px;font-weight:700;margin-top:18px}
    .shared-content .video-modal{z-index:200}
    .shared-content .shared-reveal{transition:opacity .5s,transform .5s}
    .shared-content .shared-reveal:not(.is-visible){opacity:0;transform:translateY(16px)}
    @media(prefers-reduced-motion:reduce){.shared-content .shared-reveal:not(.is-visible){opacity:1;transform:none}}
  `;
  const lines = home.split(/\r?\n/);
  const carouselJS = lines.find(line => line.includes('const carousel=document.querySelector'));
  const countersJS = lines.find(line => line.includes('const statsBlock='));
  const reviewsJS = home.slice(home.indexOf("const reviews=document.querySelector"), home.indexOf('const revealTitles='));
  if (!carouselJS || !countersJS || !reviewsJS) throw Error('Missing shared behavior');
  const js = `(()=>{${carouselJS}\n${countersJS}\n${reviewsJS}
    if(!reduceMotion.matches&&'IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.06});
      document.querySelectorAll('.shared-content .section>.wrap').forEach(el=>{el.classList.add('shared-reveal');observer.observe(el)});
    }
    document.addEventListener('keydown',e=>{if(e.key!=='Tab'||videoModal.hidden)return;const controls=[...videoModal.querySelectorAll('button:not([hidden]),video[controls]')].filter(x=>x.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
  })();`;
  return {html, css, js: js.replace(/[\t ]+$/gm, '')};
};
