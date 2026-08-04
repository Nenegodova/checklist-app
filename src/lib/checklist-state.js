export const buildCollapsed = (data, prev = {}) => {
  const next = {};
  Object.keys(data).forEach((cat) => {
    next[cat] = prev?.[cat] ?? false;
  });
  return next;
};
export const buildTasks = (data) => {
  const initial = {};
  Object.keys(data).forEach((cat) => {
    initial[cat] = data[cat].map((item, index) => {
      const task = typeof item === "string" ? { text: item } : item;
      const linkId = task.links?.map((link) => link.url).join("|");
      return {
        id: task.id || task.text || linkId || `${cat}-${index}`,
        text: task.text,
        links: task.links || [],
        feature: task.feature || null,
        done: false,
      };
    });
  });
  return initial;
};

export function getRelevantTasks(tasks, filters) {
  return Object.fromEntries(
    Object.entries(tasks).map(([category, categoryTasks]) => [
      category,
      categoryTasks.filter(
        (task) =>
          !(category === "Таблицы" && !filters.tables) &&
          !(task.feature && !filters[task.feature]),
      ),
    ]),
  );
}

export function getHiddenByFiltersCount(tasks, relevantTasks) {
  const total = Object.values(tasks).reduce(
    (count, category) => count + category.length,
    0,
  );
  const relevant = Object.values(relevantTasks).reduce(
    (count, category) => count + category.length,
    0,
  );
  return total - relevant;
}

export function getCategoryProgress(relevantTasks, category) {
  const tasks = relevantTasks[category] ?? [];
  return {
    done: tasks.filter((task) => task.done).length,
    total: tasks.length,
  };
}

export function getOverallProgress(relevantTasks) {
  const tasks = Object.values(relevantTasks).flat();
  const done = tasks.filter((task) => task.done).length;
  return {
    done,
    total: tasks.length,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}

export function getVisibleTasks(relevantTasks, focusMode) {
  if (!focusMode) return relevantTasks;
  return Object.fromEntries(
    Object.entries(relevantTasks).map(([category, tasks]) => [
      category,
      tasks.filter((task) => !task.done),
    ]),
  );
}
