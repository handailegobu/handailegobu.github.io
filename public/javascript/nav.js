/* nav.js — jQuery/Skel/dropotron 非依存のナビ挙動
   - デスクトップのドロップダウンは nav.css（CSSホバー）で対応。
   - ここではモバイル用の off-canvas パネル(#titleBar / #navPanel)を生成し、
     既存 main.css のクラス（.toggle / .link / .depth-N / .indent-N /
     body.navPanel-visible）を再利用する。 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  // ネストした <ul>/<li> を skel の navList 相当（.link.depth-N）にフラット化
  function buildNavList(ul, depth) {
    if (!ul) return '';
    var html = '';
    var children = ul.children;
    for (var i = 0; i < children.length; i++) {
      var li = children[i];
      if (li.tagName !== 'LI') continue;
      var a = li.querySelector(':scope > a');
      var label = a ? a.textContent.trim() : '';
      var href = a ? a.getAttribute('href') : '#';
      var indent = depth > 0 ? '<span class="indent-' + depth + '"></span>' : '';
      html += '<a class="link depth-' + depth + '" href="' + href + '">' + indent + label + '</a>';
      var childUl = li.querySelector(':scope > ul');
      if (childUl) html += buildNavList(childUl, depth + 1);
    }
    return html;
  }

  ready(function () {
    var nav = document.getElementById('nav');
    var body = document.body;
    if (!nav || !body) return;

    // ---- titleBar（ハンバーガー） ----
    var titleBar = document.createElement('div');
    titleBar.id = 'titleBar';
    var toggle = document.createElement('a');
    toggle.href = '#navPanel';
    toggle.className = 'toggle';
    toggle.setAttribute('aria-label', 'メニューを開閉');
    titleBar.appendChild(toggle);
    body.appendChild(titleBar);

    // ---- navPanel（off-canvas） ----
    var navPanel = document.createElement('div');
    navPanel.id = 'navPanel';
    var panelNav = document.createElement('nav');
    panelNav.innerHTML = buildNavList(nav.querySelector('ul'), 0);
    navPanel.appendChild(panelNav);
    body.appendChild(navPanel);

    function closePanel() {
      body.classList.remove('navPanel-visible');
    }
    function togglePanel(e) {
      if (e) e.preventDefault();
      body.classList.toggle('navPanel-visible');
    }

    toggle.addEventListener('click', togglePanel);

    // パネル内リンクを踏んだら閉じる
    panelNav.addEventListener('click', function (ev) {
      var t = ev.target;
      if (t && t.closest && t.closest('a.link')) closePanel();
    });

    // 本文側クリックで閉じる
    var pageWrapper = document.getElementById('page-wrapper');
    if (pageWrapper) {
      pageWrapper.addEventListener('click', function () {
        if (body.classList.contains('navPanel-visible')) closePanel();
      });
    }

    // Escで閉じる
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closePanel();
    });
  });
})();
