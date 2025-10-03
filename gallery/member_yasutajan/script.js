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