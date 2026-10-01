(() => {
  // Keep the native app's existing flow separate from web checkout.
  if (window.Capacitor) { document.querySelectorAll('.shop-banner,.shop-mobile,.shop-result').forEach(el => el.remove()); return; }
  const products = [
    ['Adult Complete Edition','100 cards · sharp satire','2.99','XEhxj6wfeIfoNzHcvuVxR'],
    ['Family Complete Edition','36 cards · playful definitions','2.99','5x9nABognL3Zp8viH8hiCS'],
    ['Adult & Family Bundle','Both packs · 136 cards','4.99','GdeLw30T7sPq6MO1UQdsG']
  ];
  const dialog = document.createElement('dialog');
  dialog.className = 'shop-dialog';
  dialog.setAttribute('aria-labelledby','shop-dialog-title');
  dialog.innerHTML = `<button class="shop-close" aria-label="Close printable shop" autofocus>×</button><p class="shop-kicker">THE PAPER COLLECTION</p><h2 id="shop-dialog-title">Good words. Bad intentions.<br>Great game nights.</h2><p>Print, cut, and play. English PDFs with rules and solutions.<br>A4 and US Letter included. No subscription. No physical shipping.</p><div class="shop-options">${products.map(([name,detail,price,id],i) => `<article class="${i===2?'shop-best':''}">${i===2?'<p class="shop-badge">BEST VALUE · SAVE $0.99</p>':''}<h3>${name}</h3><p>${detail}</p><strong class="shop-cost">$${price}<small> USD · one-time</small></strong><a class="shop-buy" href="https://www.creem.io/payment/prod_${id}">Get ${i===2?'both packs':i===0?'adult edition':'family edition'} ↗</a></article>`).join('')}</div><p class="shop-fine">Secure checkout and file delivery through Creem. Personal use. The bundle contains the same editions sold separately.</p><div class="shop-bottom"><a href="/print-play#starters">Try free samples first</a><a href="/print-play#purchased">Already purchased?</a><a href="/print-play#books">Books on Amazon ↗</a></div>`;
  document.body.append(dialog);
  document.querySelectorAll('[data-shop-open]').forEach(link => link.addEventListener('click', e => { e.preventDefault(); dialog.showModal(); }));
  dialog.querySelector('.shop-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click',e => { if(e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
})();
