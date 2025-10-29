const triggers = document.querySelectorAll('.note-trigger');
const tooltip = document.getElementById('tooltip');
let activeTrigger = null;

function updateTooltipPosition(trigger){
    // desktop: position near trigger
    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = Math.min(window.innerWidth - 32, 360);
    tooltip.style.maxWidth = tooltipWidth + 'px';
    // check if tooltip would overflow to the right
    if(rect.left + tooltipWidth > window.innerWidth - 16){
        // place to the left side
        tooltip.style.left = (rect.right + window.scrollX - tooltipWidth) + 'px';
        tooltip.style.top = rect.bottom + window.scrollY + 8 + 'px';
    } else {
        // default: place from left
        tooltip.style.left = rect.left + window.scrollX + 'px';
        tooltip.style.top = rect.bottom + window.scrollY + 8 + 'px';
    }
    // ensure tooltip doesn't overflow right edge
    tooltip.style.maxWidth = Math.min(window.innerWidth - 32, 360) + 'px';
}

function showTooltip(trigger){
    tooltip.innerHTML = trigger.dataset.note.replace(/\n/g,'<br>');
    tooltip.style.display = 'block';
    tooltip.setAttribute('aria-hidden','false');
    activeTrigger = trigger;

    if(window.innerWidth <= 800){
    // mobile: fixed at bottom
    tooltip.classList.add('mobile');
    // remove absolute position values to avoid jumps
    tooltip.style.left = '';
    tooltip.style.top = '';
    } else {
    tooltip.classList.remove('mobile');
    updateTooltipPosition(trigger);
    }
}

function hideTooltip(){
    tooltip.style.display = 'none';
    tooltip.setAttribute('aria-hidden','true');
    tooltip.classList.remove('mobile');
    tooltip.style.left = '';
    tooltip.style.top = '';
    activeTrigger = null;
}

triggers.forEach(trigger => {
    // pointer events: only react to mouse hover when pointerType === 'mouse'
    trigger.addEventListener('pointerenter', e => {
    if(e.pointerType === 'mouse'){
        showTooltip(trigger);
    }
    });
    trigger.addEventListener('pointerleave', e => {
    if(e.pointerType === 'mouse'){
        hideTooltip();
    }
    });

    // click / tap: toggle based on activeTrigger state
    trigger.addEventListener('click', e => {
    e.stopPropagation();
    // if this trigger is already active, hide it
    if(activeTrigger === trigger){
        hideTooltip();
        return;
    }
    // otherwise show this trigger's tooltip
    showTooltip(trigger);
    });

    // keyboard accessibility
    trigger.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        if(activeTrigger === trigger){
        hideTooltip();
        } else {
        showTooltip(trigger);
        }
    }
    });
});

// clicking/tapping anywhere else closes the tooltip
document.addEventListener('click', e => {
    if(!e.target.classList.contains('note-trigger')){
    hideTooltip();
    }
});

// close on escape
document.addEventListener('keydown', e => {
    if(e.key === 'Escape') hideTooltip();
});

// reposition tooltip on resize if visible
window.addEventListener('resize', () => {
    if(activeTrigger && window.innerWidth > 800){
    updateTooltipPosition(activeTrigger);
    }
});


// 目次自動生成
document.addEventListener("DOMContentLoaded", () => {
  const tocContainer = document.getElementById("table-of-contents");
  if (!tocContainer) return;

  const headings = document.querySelectorAll("main h1, main h2");
  if (!headings.length) return;

  const ul = document.createElement("ul");

  headings.forEach((heading, index) => {
    // idがなければ自動生成
    if (!heading.id) heading.id = "section-" + index;

    // --- ルビ対応部分 ---
    // heading内のテキストを複製し、<rt>だけ削除してから文字列化
    const clone = heading.cloneNode(true);
    clone.querySelectorAll("rt").forEach(rt => rt.remove());
    const cleanText = clone.textContent.trim();
    // ---------------------

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = cleanText;
    a.classList.add("toc-" + heading.tagName.toLowerCase());
    li.appendChild(a);
    ul.appendChild(li);
  });

  tocContainer.appendChild(ul);

  // スムーズスクロール
  document.querySelectorAll('#table-of-contents a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 60,
          behavior: 'smooth'
        });
      }
    });
  });
});
