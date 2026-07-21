(() => {
  const narrowViewport = window.matchMedia("(max-width: 640px)");
  const plotIds = ["set_fig1", "set_fig2", "set_fig3"];

  function stylePlots() {
    for (const plotId of plotIds) {
      const plot = document.getElementById(plotId);
      if (!plot) continue;

      Object.assign(plot.style, {
        boxSizing: "border-box",
        height: "450px",
        marginTop: "25px",
        overflow: "hidden",
        border: "1px dashed rgba(17, 17, 17, 0.45)",
        borderRadius: "4px",
        breakInside: "avoid",
      });
      window.Plotly.Plots.resize(plot);
    }
  }

  function updateLegendLayout() {
    if (!window.Plotly) return;

    stylePlots();

    const layout = narrowViewport.matches
      ? {
          "legend.orientation": "h",
          "legend.x": 0,
          "legend.xanchor": "left",
          "legend.y": -0.22,
          "legend.yanchor": "top",
          "margin.r": 20,
          "margin.b": 115,
        }
      : {
          "legend.orientation": "v",
          "legend.x": 1.02,
          "legend.xanchor": "left",
          "legend.y": 1,
          "legend.yanchor": "top",
          "margin.r": 80,
          "margin.b": 80,
        };

    for (const plotId of plotIds) {
      const plot = document.getElementById(plotId);
      if (plot) window.Plotly.relayout(plot, layout);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateLegendLayout, { once: true });
  } else {
    updateLegendLayout();
  }

  narrowViewport.addEventListener("change", updateLegendLayout);
})();
