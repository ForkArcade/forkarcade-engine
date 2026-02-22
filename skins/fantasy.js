// ForkArcade Skin — Fantasy
// Warm gold on dark brown, ornate borders, parchment feel
// For: strategy-rpg, orc-crusade
(function(FA) {
  'use strict';

  function ornateFrame(ctx, x, y, w, h, gold, border) {
    // Outer border
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    // Inner border (gold)
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
    // Corner dots
    var cs = 6;
    ctx.fillStyle = gold;
    ctx.fillRect(x + 2, y + 2, cs, cs);
    ctx.fillRect(x + w - cs - 2, y + 2, cs, cs);
    ctx.fillRect(x + 2, y + h - cs - 2, cs, cs);
    ctx.fillRect(x + w - cs - 2, y + h - cs - 2, cs, cs);
  }

  function divider(ctx, x, y, w, gold) {
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = gold;
    ctx.fillRect(x + 20, y, w - 40, 1);
    // Center diamond
    ctx.fillRect(x + w / 2 - 3, y - 3, 6, 6);
    ctx.globalAlpha = 1;
  }

  FA.ui.useSkin({
    name: 'fantasy',

    theme: {
      bg:           '#1a1008',
      accent:       '#daa520',
      accentDim:    '#c8a040',
      text:         '#e8dcc8',
      textDim:      '#8a7a5a',
      textMuted:    '#5a4a3a',
      success:      '#44cc44',
      danger:       '#cc4444',
      warning:      '#ddaa00',
      panelBg:      '#2a1f0e',
      panelBorder:  '#5a4a3a',
      btnBg:        '#3a2e1e',
      btnBorder:    '#5a4a3a',
      btnHoverBg:   '#4a3e2e',
      selectedBg:   '#4a3a1a',
      selectedBorder: '#daa520',
      lockBg:       '#1a1510',
      lockText:     '#3a3020',
      overlayAlpha: 0.8,
      fontFamily:   'Georgia, serif',
      titleSize:    38,
      subtitleSize: 16,
      bodySize:     14,
      smallSize:    12
    },

    screens: {
      startScreen: function(data, T) {
        var ctx = FA.getCtx();
        var W = FA.getCanvas().width;
        var H = FA.getCanvas().height;
        var cx = W / 2;

        FA.draw.clear(T.bg);

        // Subtle parchment texture
        ctx.globalAlpha = 0.03;
        for (var i = 0; i < 200; i++) {
          ctx.fillStyle = '#fff';
          ctx.fillRect((i * 37 + 13) % W, (i * 53 + 7) % H, 1, 1);
        }
        ctx.globalAlpha = 1;

        // Frame
        var pw = Math.min(580, W - 40);
        var ph = Math.min(480, H - 40);
        var px = (W - pw) / 2;
        var py = (H - ph) / 2;
        FA.draw.rect(px, py, pw, ph, T.panelBg);
        ornateFrame(ctx, px, py, pw, ph, T.accent, T.panelBorder);

        // Chapter
        ctx.fillStyle = T.accent;
        ctx.font = (T.smallSize + 2) + 'px ' + T.fontFamily;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('~ Chapter One ~', cx, py + 40);

        // Title
        ctx.fillStyle = T.accent;
        ctx.font = 'bold ' + T.titleSize + 'px ' + T.fontFamily;
        ctx.fillText(data.title || 'GAME', cx, py + 90);

        // Divider
        divider(ctx, px, py + 120, pw, T.accent);

        // Subtitle
        if (data.subtitle) {
          ctx.fillStyle = T.textDim;
          ctx.font = T.subtitleSize + 'px ' + T.fontFamily;
          ctx.fillText(data.subtitle, cx, py + 155);
        }

        // Controls
        var controls = data.controls || [];
        var cy = py + 200;
        ctx.font = T.smallSize + 'px ' + T.fontFamily;
        for (var i = 0; i < controls.length; i++) {
          ctx.fillStyle = T.textMuted;
          ctx.fillText(controls[i], cx, cy + i * 24);
        }

        // Divider before prompt
        divider(ctx, px, py + ph - 75, pw, T.accent);

        // Prompt
        ctx.fillStyle = T.text;
        ctx.font = 'bold ' + (T.subtitleSize + 2) + 'px ' + T.fontFamily;
        ctx.fillText(data.prompt || '~ Click to Begin ~', cx, py + ph - 40);

        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      }
    },

    decorate: null
  });

})(window.FA);
