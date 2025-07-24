function slider() {
  const slider = document.getElementById('gamesSlider');
  if (!slider) return;

  const updateScroll = () => {
    const items = slider.querySelectorAll('.games__slider__item');
    if (!items.length) return;

    const middleIndex = Math.floor(items.length / 2);
    const middleItem = items[middleIndex];

    if (middleItem) {
      const sliderRect = slider.getBoundingClientRect();
      const itemRect = middleItem.getBoundingClientRect();

      const offset =
        itemRect.left -
        sliderRect.left -
        slider.clientWidth / 2 +
        itemRect.width / 2;

      slider.scrollLeft += offset;
    }
  };

  // при загрузке
  updateScroll();

  // при ресайзе (включая смену режима мобильный/десктоп)
  window.addEventListener('resize', () => {
    requestAnimationFrame(updateScroll);
  });
}

export default slider;
