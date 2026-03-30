/**
 * Crown Money Chart Helpers
 * Wraps Chart.js with consistent branding
 */
const CrownCharts = (() => {
  const instances = {};

  const brandColors = [
    '#D4A843', '#3498DB', '#27AE60', '#E74C3C',
    '#9B59B6', '#F39C12', '#1ABC9C', '#E67E22'
  ];

  const defaultFont = {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    size: 12
  };

  function destroy(canvasId) {
    if (instances[canvasId]) {
      instances[canvasId].destroy();
      delete instances[canvasId];
    }
  }

  function getCtx(canvasId) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    return canvas.getContext('2d');
  }

  function line(canvasId, labels, datasets, options = {}) {
    const ctx = getCtx(canvasId);
    if (!ctx) return null;

    datasets.forEach((ds, i) => {
      ds.borderColor = ds.borderColor || brandColors[i % brandColors.length];
      ds.backgroundColor = ds.backgroundColor || ds.borderColor + '20';
      ds.borderWidth = ds.borderWidth || 2;
      ds.fill = ds.fill !== undefined ? ds.fill : true;
      ds.tension = ds.tension || 0.3;
      ds.pointRadius = ds.pointRadius !== undefined ? ds.pointRadius : 0;
      ds.pointHoverRadius = ds.pointHoverRadius || 4;
    });

    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: defaultFont, usePointStyle: true, padding: 16 } },
          tooltip: {
            backgroundColor: '#1A1A2E',
            titleFont: { ...defaultFont, weight: 'bold' },
            bodyFont: defaultFont,
            padding: 12,
            cornerRadius: 8,
            callbacks: options.tooltipCallbacks || {}
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultFont, maxTicksLimit: 12 } },
          y: {
            grid: { color: '#f0f0f0' },
            ticks: {
              font: defaultFont,
              callback: options.yFormat || (val => '$' + val.toLocaleString())
            }
          }
        },
        ...options.chartOptions
      }
    });

    return instances[canvasId];
  }

  function bar(canvasId, labels, datasets, options = {}) {
    const ctx = getCtx(canvasId);
    if (!ctx) return null;

    datasets.forEach((ds, i) => {
      ds.backgroundColor = ds.backgroundColor || brandColors[i % brandColors.length];
      ds.borderRadius = ds.borderRadius || 4;
    });

    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: defaultFont, usePointStyle: true, padding: 16 } },
          tooltip: {
            backgroundColor: '#1A1A2E',
            padding: 12,
            cornerRadius: 8,
            callbacks: options.tooltipCallbacks || {}
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultFont } },
          y: {
            grid: { color: '#f0f0f0' },
            ticks: {
              font: defaultFont,
              callback: options.yFormat || (val => '$' + val.toLocaleString())
            }
          }
        },
        ...options.chartOptions
      }
    });

    return instances[canvasId];
  }

  function doughnut(canvasId, labels, data, options = {}) {
    const ctx = getCtx(canvasId);
    if (!ctx) return null;

    instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: options.colors || brandColors.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: options.cutout || '65%',
        plugins: {
          legend: {
            position: options.legendPosition || 'bottom',
            labels: { font: defaultFont, usePointStyle: true, padding: 12 }
          },
          tooltip: {
            backgroundColor: '#1A1A2E',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${ctx.label}: $${val.toLocaleString()} (${pct}%)`;
              },
              ...options.tooltipCallbacks
            }
          }
        },
        ...options.chartOptions
      }
    });

    return instances[canvasId];
  }

  function stackedBar(canvasId, labels, datasets, options = {}) {
    const ctx = getCtx(canvasId);
    if (!ctx) return null;

    datasets.forEach((ds, i) => {
      ds.backgroundColor = ds.backgroundColor || brandColors[i % brandColors.length];
      ds.borderRadius = ds.borderRadius || 2;
    });

    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: defaultFont, usePointStyle: true, padding: 16 } },
          tooltip: { backgroundColor: '#1A1A2E', padding: 12, cornerRadius: 8 }
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: defaultFont } },
          y: {
            stacked: true,
            grid: { color: '#f0f0f0' },
            ticks: {
              font: defaultFont,
              callback: options.yFormat || (val => '$' + val.toLocaleString())
            }
          }
        },
        ...options.chartOptions
      }
    });

    return instances[canvasId];
  }

  function destroyAll() {
    Object.keys(instances).forEach(destroy);
  }

  return { line, bar, doughnut, stackedBar, destroy, destroyAll, brandColors };
})();
