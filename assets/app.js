'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let toastTimer;
  function notify(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4200);
  }
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: 0.07 });
    document.documentElement.classList.add('js-ready');
    $$('.reveal').forEach(element => observer.observe(element));
  }
  const menu = $('#menuButton');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '打开导航菜单'); $('#navLinks').classList.remove('open'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    $('#navLinks').classList.toggle('open', open);
  });
  $('#navLinks').addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.addEventListener('scroll', () => $('#siteHeader').classList.toggle('scrolled', window.scrollY > 15), { passive: true });

  const scenes = {
    lunch: { kicker:'A PROPER LUNCH BREAK', title:'工作已经够满，\n午饭别再将就。', description:'会议和待办之间，给自己留一顿热饭的时间。先看预算与口味，再把午休交还给自己。', tags:['一人食也认真','口味先选好','预算不纠结'], action:'选一份工作餐', time:'12:00', caption:'今天的午休，留给一顿喜欢的饭。', photo:'rice', prompt:'工作日午餐，35元以内，不要辣' },
    tea: { kicker:'A LITTLE AFTERNOON JOY', title:'下午的好状态，\n从这一杯开始。', description:'忙碌到下午，也记得给自己一个小休息。咖啡提神，甜点解馋，把这一刻留给喜欢的味道。', tags:['咖啡与可颂','甜度自己选','给自己小休息'], action:'找一杯好心情', time:'15:30', caption:'快乐不必很大，一杯就刚刚好。', photo:'drink', prompt:'下午茶，30元以内，想喝咖啡' },
    home: { kicker:'HOME IS A GOOD MEAL', title:'下班后，不赶路。\n慢慢吃，慢慢生活。', description:'结束一天的忙碌，一顿喜欢的晚饭就是小小的奖励。把选择提前做好，把剩下的时间留给家。', tags:['热饭认真吃','补齐生活所需','留点时间给自己'], action:'安排今晚这一餐', time:'18:30', caption:'把奔忙放在门外，把美好端上餐桌。', photo:'rice', prompt:'晚餐想吃米饭，40元以内，不要辣' },
    night: { kicker:'YOUR LATE-NIGHT COMFORT', title:'夜深了，\n也别亏待自己。', description:'加班后的那点饿，值得被好好照顾。喜欢的面、刚好的分量，让今天在一口满足里结束。', tags:['夜宵刚刚好','喜欢的口味','等待看得见'], action:'犒劳一下今天', time:'22:00', caption:'给今天一个香香的句号。', photo:'night', prompt:'深夜加班，40元以内，想吃辣' }
  };
  let selectedScene = 'lunch';
  const tabs = $$('.moment-tabs [role=tab]');
  function setScene(key, moveFocus = false) {
    const scene = scenes[key]; if (!scene) return;
    selectedScene = key;
    tabs.forEach(tab => { const active = tab.dataset.scene === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if (active && moveFocus) tab.focus(); });
    $('#momentPanel').setAttribute('aria-labelledby', `tab-${key}`);
    $('#momentKicker').textContent = scene.kicker;
    $('#momentTitle').innerHTML = scene.title.split('\n').map(escape).join('<br>');
    $('#momentDescription').textContent = scene.description;
    $('#momentTags').innerHTML = scene.tags.map(tag => `<span>${escape(tag)}</span>`).join('');
    $('#momentAction').innerHTML = `${escape(scene.action)}${icon('arrow')}`;
    $('#momentTime').textContent = scene.time;
    $('#momentCaption').textContent = scene.caption;
    $('#momentArt').setAttribute('aria-label', `${scene.time} ${scene.action}场景示意`);
    $('#momentArt .moment-photo').className = `moment-photo food-photo-${scene.photo}`;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setScene(tab.dataset.scene));
    tab.addEventListener('keydown', event => {
      let next; if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0; if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); setScene(tabs[next].dataset.scene, true); }
    });
  });
  $$('[data-scene-link]').forEach(link => link.addEventListener('click', () => setScene(link.dataset.sceneLink)));

  const menuItems = [
    { id:'chicken',name:'照烧鸡肉饭',price:28,scene:['lunch','night'],spicy:false,vegetarian:false,kind:'rice',photo:'rice',note:'米饭、鸡肉与配菜，一份热乎的日常。' },
    { id:'beef',name:'香辣牛肉面',price:25,scene:['lunch','night'],spicy:true,vegetarian:false,kind:'noodles',photo:'night',note:'香辣汤底与牛肉，适合想吃点辣的时刻。' },
    { id:'veggie',name:'时蔬双拼饭',price:23,scene:['lunch','night'],spicy:false,vegetarian:true,kind:'rice',symbol:'leaf',note:'示例素食主餐，清爽口味与米饭搭配。' },
    { id:'tomato',name:'番茄菌菇面',price:19,scene:['lunch','night'],spicy:false,vegetarian:true,kind:'noodles',symbol:'bowl',note:'示例清淡面食，一份简单的暖胃选择。' },
    { id:'latte',name:'冰拿铁',price:18,scene:['tea'],spicy:false,vegetarian:true,kind:'coffee',photo:'drink',note:'示例咖啡饮品，甜度与规格下单前确认。' },
    { id:'tea',name:'冰柠檬茶',price:16,scene:['tea'],spicy:false,vegetarian:true,kind:'tea',photo:'drink',note:'示例清爽茶饮，让下午轻松一下。' },
    { id:'croissant',name:'拿铁与可颂组合',price:29,scene:['tea'],spicy:false,vegetarian:true,kind:'coffee',photo:'drink',note:'一杯咖啡和一份点心，留出片刻小休息。' },
    { id:'skewers',name:'香辣烤串小份',price:32,scene:['night'],spicy:true,vegetarian:false,kind:'snack',photo:'night',note:'示例夜宵小份，犒劳忙了一天的自己。' }
  ];
  const range = $('#budgetRange'), craving = $('#craving');
  const sceneSelect = $('#sceneSelect'), noSpicy = $('#noSpicy'), vegetarian = $('#vegetarian');
  function syncTextPreferences() {
    const text = craving.value.trim();
    const match = text.match(/(?:[¥￥]\s*(\d{1,3})|(\d{1,3})\s*(?:元|块))/);
    if (match) { const budget = Number(match[1] || match[2]); range.min = '0'; range.max = String(Math.max(80, budget)); range.step = '1'; range.value = String(budget); }
    if (/下午|咖啡|奶茶|茶饮|可颂/.test(text)) sceneSelect.value = 'tea';
    else if (/深夜|夜宵|晚餐|晚饭|加班/.test(text)) sceneSelect.value = 'night';
    else if (/午餐|午饭|工作餐/.test(text)) sceneSelect.value = 'lunch';
    if (/不要辣|不吃辣|不辣|清淡/.test(text)) noSpicy.checked = true;
    else if (/想吃辣|香辣|麻辣|重辣/.test(text)) noSpicy.checked = false;
    if (/素食|吃素|蔬菜|时蔬/.test(text)) vegetarian.checked = true;
    $('#budgetValue').textContent = `¥${range.value}`;
  }
  range.addEventListener('input', () => { $('#budgetValue').textContent = `¥${range.value}`; });
  craving.addEventListener('input', syncTextPreferences);
  function usePrompt(prompt, autoRecommend = false) {
    craving.value = prompt;
    noSpicy.checked = false; vegetarian.checked = false;
    syncTextPreferences();
    if (autoRecommend) recommend();
    location.hash = '#assistant';
    craving.focus({ preventScroll:true });
  }
  $$('[data-prompt]').forEach(button => button.addEventListener('click', () => { craving.value = button.dataset.prompt; noSpicy.checked = false; vegetarian.checked = false; syncTextPreferences(); craving.focus(); }));
  $('#momentAction').addEventListener('click', () => usePrompt(scenes[selectedScene].prompt, true));
  function recommend() {
    const text = craving.value.trim(), budget = Number(range.value), scene = sceneSelect.value;
    const results = $('#recommendResults');
    if (/过敏|忌敏|乳糖不耐/.test(text)) {
      results.innerHTML = '<div class="no-results"><b>这一条，需要商家来确认。</b>示例菜单没有完整配料与交叉接触信息，不能确认餐品是否适合过敏或不耐受需求。请在官方平台向商家核实，本原型暂不推荐具体餐品。</div>'; return;
    }
    let preferredKind = null;
    if (/米饭|鸡肉饭|盖饭|工作餐/.test(text)) preferredKind = 'rice';
    else if (/面条|面食|吃面|牛肉面/.test(text)) preferredKind = 'noodles';
    else if (/咖啡|拿铁/.test(text)) preferredKind = 'coffee';
    else if (/柠檬茶|茶饮|奶茶/.test(text)) preferredKind = 'tea';
    const picks = menuItems.filter(item => item.price <= budget && item.scene.includes(scene) && (!noSpicy.checked || !item.spicy) && (!vegetarian.checked || item.vegetarian)).map(item => ({...item,score:(item.kind === preferredKind ? 100 : 0) + (item.spicy && /想吃辣|香辣|麻辣/.test(text) ? 20 : 0) + (item.id === 'chicken' ? 8 : 0) - Math.abs(budget - item.price) / 10})).sort((a,b) => b.score-a.score).slice(0,3);
    if (!picks.length) {
      results.innerHTML = `<div class="no-results"><b>当前偏好下，示例菜单暂时没有匹配。</b>你选择了 ${escape(sceneSelect.selectedOptions[0].textContent)}、¥${budget} 以内${noSpicy.checked ? '、不吃辣' : ''}${vegetarian.checked ? '、素食' : ''}。可以修改预算或场景，再试一次；不会自动放宽你的选择。</div>`; return;
    }
    const summary = `${sceneSelect.selectedOptions[0].textContent} · ¥${budget} 以内${noSpicy.checked ? ' · 不吃辣' : ''}${vegetarian.checked ? ' · 素食' : ''}`;
    results.innerHTML = `<p class="result-summary"><b>给你 ${picks.length} 个刚刚好的选择</b><br>${escape(summary)} · 以下均为示例餐品，费用为餐品示例价</p>` + picks.map(item => {
      const reason = [item.kind === preferredKind ? '符合你想吃的类型' : '匹配当前用餐场景', `餐品价 ¥${item.price} 在预算内`, noSpicy.checked ? '示例口味不辣' : item.spicy ? '示例香辣口味' : '示例清淡口味'];
      const photo = item.symbol ? `<span class="result-photo result-symbol" aria-hidden="true">${icon(item.symbol)}</span>` : `<span class="result-photo food-photo-${item.photo}" role="img" aria-label="餐品类别示意图"></span>`;
      return `<article class="result-card">${photo}<div><h3>${escape(item.name)}</h3><p>${reason.map(escape).join(' · ')}</p></div><div class="result-price">¥${item.price}<button type="button" data-demo-order="${item.id}" aria-label="体验${item.name}的配送流程">体验配送 →</button></div></article>`;
    }).join('');
  }
  $('#recommendForm').addEventListener('submit', event => { event.preventDefault(); recommend(); });
  $('#recommendResults').addEventListener('click', event => {
    const button = event.target.closest('[data-demo-order]'); if (!button) return;
    const item = menuItems.find(item => item.id === button.dataset.demoOrder); if (!item) return;
    stopDelivery(); setDeliveryStep(0); $('#demoOrderName').textContent = `${item.name} · 示例餐品`;
    location.hash = '#delivery'; notify('已带入配送演示。这是体验流程，不会产生真实订单。');
  });

  const deliveryStates = [
    {status:'商家正在认真备餐',small:'每一步，都有回应',position:'106 172',progress:100,live:'商家备餐：餐品准备与打包的概念阶段。'},
    {status:'骑手已取到这一餐',small:'核对餐品，准备出发',position:'170 172',progress:78,live:'骑手取餐：核对餐品与收餐信息的概念阶段。'},
    {status:'美好正在稳稳靠近',small:'安全骑行，比催促更重要',position:'303 236',progress:38,live:'配送途中：示意路径正在连接商家与收餐位置。'},
    {status:'这一口，刚好到了',small:'好好吃饭，享受此刻',position:'477 236',progress:0,live:'演示已送达。请在真实订单中以实际送达信息为准。'}
  ];
  let deliveryStep = 0, deliveryTimer = null;
  const playButton = $('#playDelivery');
  function setDeliveryStep(step) {
    deliveryStep = step; const state = deliveryStates[step];
    $$('[data-step]').forEach(button => { const value = Number(button.dataset.step); button.classList.toggle('active',value === step); button.classList.toggle('completed',value < step); button.setAttribute('aria-pressed',String(value === step)); });
    $('#deliveryMapStatus').textContent = state.status; $('#deliverySmall').textContent = state.small;
    $('#routeProgress').style.strokeDashoffset = String(state.progress);
    $('#riderMarker').setAttribute('transform',`translate(${state.position})`);
    $('#deliveryLiveStatus').textContent = state.live;
  }
  function stopDelivery() {
    clearInterval(deliveryTimer); deliveryTimer = null;
    playButton.innerHTML = `${icon('scooter')}${deliveryStep === 3 ? '再看一次旅程' : '播放配送旅程'}`;
    playButton.setAttribute('aria-pressed','false');
  }
  $$('[data-step]').forEach(button => button.addEventListener('click', () => { stopDelivery(); setDeliveryStep(Number(button.dataset.step)); stopDelivery(); }));
  playButton.setAttribute('aria-pressed','false');
  playButton.addEventListener('click', () => {
    if (deliveryTimer) { stopDelivery(); return; }
    setDeliveryStep(0);
    playButton.innerHTML = `${icon('clock')}暂停配送演示`; playButton.setAttribute('aria-pressed','true');
    deliveryTimer = setInterval(() => { setDeliveryStep(Math.min(3,deliveryStep+1)); if (deliveryStep === 3) stopDelivery(); }, 1800);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopDelivery(); });
  setDeliveryStep(0);

  const serviceDetails = {
    food:{label:'美食外卖',title:'这一餐，吃点喜欢的。',description:'从工作日的一份热饭，到周末的一顿犒劳。先想好口味和预算，再把挑选与等待安排得更从容。',photo:'rice',cta:'试试点餐推荐',target:'#assistant',cards:[['工作日午餐','确认收餐位置与时间，再按口味与预算选择。'],['一人食也认真','查看份量与配菜，留意包装、配送等额外费用。'],['多人一起吃','先对齐忌口与份数，再统一核对商品与地址。']],checks:['核对菜品规格、份量与个人饮食需求。','结合商家公开信息与近期评价作选择。','确认地址、总费用与页面预计送达时间。'],faqs:[['这里可以下单吗？','本页面提供产品体验原型，不连接真实商家、支付与订单系统。'],['配送时间一定是 30 分钟吗？','本作品不承诺配送时长。请在官方平台查看商家营业状态与实际订单预计时间。']]},
    coffee:{label:'奶茶咖啡',title:'一杯，切换好状态。',description:'上午提神，下午解馋。选择喜欢的那杯，也记得看清规格、甜度和可选配料。',photo:'drink',cta:'安排一份下午茶',target:'#assistant',cards:[['上午提神','按饮用习惯查看容量、浓度与商家说明。'],['下午小休息','根据个人偏好选择甜度、冰量和配料。'],['办公室一起点','区分每杯规格与备注，核对收餐联系人。']],checks:['确认冷热、杯型、甜度与加料选项。','留意配料表与个人饮食需求，必要时联系商家。','核对餐品、包装及配送费用。'],faqs:[['能推荐附近咖啡店吗？','此处使用示例饮品，不读取真实位置或商家库存。'],['示例价格包含配送费吗？','示例价格只用于原型筛选，不包含真实包装与配送费用。']]},
    fresh:{label:'生鲜果蔬',title:'今晚的餐桌，不缺这一味。',description:'做饭少一样食材，也不必打断今晚的菜单。查看附近供给，把要补的食材先列清楚。',symbol:'leaf',cta:'回到生活服务',target:'#services',cards:[['晚餐补菜','按菜单列出食材、份量与替代选择。'],['水果补给','查看品种、产地、规格与储存说明。'],['家庭备餐','按用量选择商品，避免一次购入过多。']],checks:['确认重量、计价单位、包装和商品说明。','易腐商品收到后及时查看与储存。','实际库存、价格与营业情况以平台为准。'],faqs:[['商品缺货怎么办？','真实平台的替换与退款政策以对应订单说明为准，本页面不作承诺。'],['图片就是实际商品吗？','本页是品牌概念作品，图片与场景用于示意。']]},
    market:{label:'商超便利',title:'小小补给，接上日常。',description:'日用品临时见底，零食饮料想起就要。把需求列出来，少跑一趟，也少漏一件。',symbol:'bag',cta:'看看更多生活场景',target:'#moments',cards:[['周末宅家','先列零食饮品，再查看规格与组合。'],['临时缺货','确认品牌、型号、容量与适用范围。'],['家庭补给','查看常用商品库存，减少重复采购。']],checks:['不要只看主图，核对商品规格与单位。','检查可用优惠、起送条件与订单总价。','配送范围和营业状态以真实平台为准。'],faqs:[['会获取我的地址吗？','本作品不申请位置权限，不收集真实收货地址。'],['能查看真实库存吗？','本作品不连接商超库存，仅展示产品场景。']]},
    flowers:{label:'鲜花蛋糕',title:'把心意，送进这一刻。',description:'生日、纪念日，或者平常的一天。把想说的话安排好，让喜欢的人及时收到。',symbol:'flower',cta:'回到美味与生活',target:'#services',cards:[['生日惊喜','确认蛋糕尺寸、口味、贺卡与可选时间。'],['纪念日心意','查看花材、配色与实物说明。'],['日常小惊喜','核对收货人、地址和联系安排。']],checks:['定制文字、附件与规格要在付款前确认。','实际商品可能因库存调整，提前咨询商家。','如有时效需求，查看实际预约与配送规则。'],faqs:[['可以填写真实收货人吗？','此页不提供送礼下单或个人信息填写入口。'],['支持定时送到吗？','能否预约、时间区间与送达条件需在真实平台核实。']]},
    care:{label:'药品及日用品',title:'需要的时候，少一点慌张。',description:'生活用品临时需要时，先确认商品信息，再从官方平台寻找可用服务。此页面不提供诊断、用药推荐或药品交易。',symbol:'plus',cta:'返回服务入口',target:'#services',cards:[['日常用品','查看名称、规格和适用说明。'],['查询附近服务','服务范围与营业情况以真实平台为准。'],['专业问题专业确认','用药相关问题请咨询医生或药师。']],checks:['核对商品说明与实际需要。','药品相关问题以专业人员指导为准。','本原型不推荐药品，不提交药品订单。'],faqs:[['点餐助手会推荐药品吗？','不会。助手示例菜单仅包含餐饮与饮品。'],['页面会收集健康信息吗？','不会。此作品不包含健康信息收集与诊疗功能。']]},
    scenes:{label:'场景指南',title:'一天的节奏，各有一口答案。',description:'按场景开始，比漫无目的地刷菜单更轻松。午餐先看时间与预算，下午茶看口味，晚餐夜宵看此刻的需要。',photo:'rice',cta:'体验四个生活场景',target:'#moments',cards:[['12:00 · 工作日午休','确认收餐位置，把预算与口味先选好。'],['15:30 · 下午小休息','选杯喜欢的饮品，给自己一点闲。'],['18:30 / 22:00 · 晚餐夜宵','按食量、口味与营业状态安排这一餐。']],checks:['场景是选择入口，不替代个人偏好。','饮食需求要在真实下单前确认。','不把示例时间当作平台配送承诺。'],faqs:[['场景会自动读取时间吗？','不会。场景由用户主动选择，不收集位置或行为画像。'],['怎么进入点餐原型？','首页场景面板可把需求带入点餐助手，再修改预算与口味。']]},
    delivery:{label:'配送说明',title:'等待有进度，美好更安心。',description:'用四个关键阶段解释履约过程：商家备餐、骑手取餐、配送途中与送达。让进度服务理解，也尊重骑手安全。',symbol:'scooter',cta:'播放配送演示',target:'#delivery',cards:[['商家备餐与取餐','核对餐品、包装与收餐信息。'],['配送途中','预计时间会受交通、天气与备餐影响。'],['确认送达','在真实订单中查看送达信息，必要时联系平台客服。']],checks:['本地图是示意，不表示真实位置与线路。','送达时间以实际订单页面为准。','请支持安全骑行，不把演示速度当作现实要求。'],faqs:[['播放后会生成真实订单吗？','不会。这里只演示状态变化，不向平台发送订单请求。'],['订单遇到问题如何处理？','请在官方平台对应订单入口查看客服及售后说明。']]}
  };
  let currentRoute = '';
  function renderDetail(key) {
    const data = serviceDetails[key];
    if (!data) {
      $('#detailView').innerHTML = `<div class="wrap"><div class="breadcrumbs"><a href="#top">首页</a><span>/</span><span>页面未找到</span></div><h1 tabindex="-1">这条路暂时还没准备好。</h1><p class="detail-disclaimer">请选择首页里的服务或场景继续探索。</p><a class="button button-blue" href="#services">回到服务入口${icon('arrow')}</a></div>`;
      document.title = '页面未找到｜饿了么品牌概念'; return;
    }
    const art = data.photo ? `<div class="food-photo food-photo-${data.photo}" aria-hidden="true"></div>` : `<div class="detail-symbol">${icon(data.symbol)}</div>`;
    $('#detailView').innerHTML = `<div class="wrap"><nav class="breadcrumbs" aria-label="面包屑"><a href="#top">首页</a><span>/</span><span>${escape(data.label)}</span></nav><div class="detail-hero"><div><div class="eyebrow">ELE.ME / ${escape(data.label)}</div><h1 tabindex="-1">${escape(data.title)}</h1><p>${escape(data.description)}</p><a class="button button-blue" href="${data.target}">${escape(data.cta)}${icon('arrow')}</a></div><div class="detail-art" role="img" aria-label="${escape(data.label)}主题示意">${art}<span class="detail-art-label">这一口，就是现在 · 概念作品</span></div></div><div class="detail-block"><h2>刚好适合这些时刻。</h2><div class="detail-cards">${data.cards.map((card,index) => `<article><span>0${index+1} / MOMENT</span><h3>${escape(card[0])}</h3><p>${escape(card[1])}</p></article>`).join('')}</div></div><div class="detail-two"><div><h2>选择前，多看一眼。</h2><ol class="detail-checks">${data.checks.map(check => `<li>${escape(check)}</li>`).join('')}</ol></div><div><h2>你可能想知道。</h2>${data.faqs.map(faq => `<details><summary>${escape(faq[0])}</summary><p>${escape(faq[1])}</p></details>`).join('')}</div></div><p class="detail-disclaimer">由 AI 产品经理创作 · 非官方品牌概念作品。图片、餐品和场景为示例，真实商品与服务以官方平台为准。</p></div>`;
    document.title = `${data.label}｜饿了么 · AI 产品经理作品`;
  }
  function route() {
    const hash = location.hash;
    const isDetail = hash.startsWith('#/');
    if (isDetail) {
      stopDelivery(); closeMenu();
      const key = hash.replace(/^#\/(?:service\/)?/, '').split('?')[0];
      $('#homeView').hidden = true; $('#detailView').hidden = false;
      renderDetail(key); window.scrollTo({top:0,behavior:'instant'});
      $('#detailView h1').focus({preventScroll:true}); currentRoute = hash;
    } else {
      const wasDetail = $('#homeView').hidden;
      $('#detailView').hidden = true; $('#homeView').hidden = false;
      document.title = '饿了么 · 这一口，就是现在｜AI 产品经理作品';
      if (wasDetail || !currentRoute) {
        let target;
        try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (_) { target = null; }
        requestAnimationFrame(() => { (target || $('#top')).scrollIntoView({behavior:wasDetail ? 'instant' : 'auto'}); });
      }
      currentRoute = hash || '#top';
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();
