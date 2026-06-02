function setupTaskNotebookAnimation() {
  const notebooks = document.querySelectorAll("[data-task-notebook]");

  if (!notebooks.length) {
    return () => {};
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    notebooks.forEach((notebook) => {
      notebook.dataset.animate = "true";
    });

    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const notebook = entry.target;

        if (entry.isIntersecting) {
          notebook.dataset.animate = "true";
          observer.unobserve(notebook);
        }
      });
    },
    {
      threshold: 0.45,
    }
  );

  notebooks.forEach((notebook) => {
    observer.observe(notebook);
  });

  return () => {
    observer.disconnect();
  };
}

const destroyTaskNotebookAnimation = setupTaskNotebookAnimation();

/*
  Optional SPA cleanup:
  Call destroyTaskNotebookAnimation() before removing this page/component.
*/