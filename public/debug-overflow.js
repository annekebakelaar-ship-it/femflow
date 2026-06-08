// Debug script to find overflow issues
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('Checking for overflow issues...');

    let overflowing = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.offsetWidth > document.documentElement.clientWidth) {
        overflowing.push({
          element: el.tagName,
          class: el.className,
          width: el.offsetWidth,
          viewportWidth: document.documentElement.clientWidth,
          overflow: el.offsetWidth - document.documentElement.clientWidth
        });
        el.style.outline = '2px solid red';
      }
    });

    if (overflowing.length > 0) {
      console.log('Found overflowing elements:', overflowing);
    } else {
      console.log('✓ No overflow detected');
    }
  }, 1000);
});
