function setupNewTaskAnimation() {
  const scenes = document.querySelectorAll("[data-new-task]");

  if (!scenes.length) {
    return () => {};
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    scenes.forEach((scene) => {
      scene.dataset.animate = "true";
    });

    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const scene = entry.target;

        if (entry.isIntersecting) {
          scene.dataset.animate = "true";
          observer.unobserve(scene);
        }
      });
    },
    {
      threshold: 0.45,
    }
  );

  scenes.forEach((scene) => {
    observer.observe(scene);
  });

  return () => {
    observer.disconnect();
  };
}

const destroyNewTaskAnimation = setupNewTaskAnimation();

/*
  Optional SPA cleanup:
  Call destroyNewTaskAnimation() before removing this page/component.
*/