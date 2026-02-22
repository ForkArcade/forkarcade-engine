// ForkArcade Skin — Cyber
// Neon cyan on dark, scanlines, glow effects
// For: roguelike, space-combat, space-trader
(function(FA) {
  'use strict';

  var _scanCache = null;
  var _scanW = 0, _scanH = 0;
  FA.on('state:reset', function() { _scanCache = null; _scanW = 0; _scanH = 0; });

  function scanlines(ctx, W, H) {
    if (!_scanCache || _scanW !== W || _scanH !== H) {
      _scanCache = document.createElement('canvas');
      _scanCache.width = W; _scanCache.height = H;
      var sc = _scanCache.getContext('2d');
      sc.fillStyle = '#000';
      for (var y = 0; y < H; y += 2) sc.fillRect(0, y, W, 1);
      _scanW = W; _scanH = H;
    }
    ctx.globalAlpha = 0.04;
    ctx.drawImage(_scanCache, 0, 0);
    ctx.globalAlpha = 1;
  }

  FA.ui.useSkin({
    name: 'cyber',

    theme: {
      bg:           '#000812',
      accent:       '#0ff',
      accentDim:    '#4ef',
      text:         '#e0f0ff',
      textDim:      '#6688aa',
      textMuted:    '#334455',
      success:      '#00ff88',
      danger:       '#ff2244',
      warning:      '#ffaa00',
      panelBg:      '#060a14',
      panelBorder:  '#1a3a5a',
      btnBg:        '#0a1a2e',
      btnBorder:    '#1a4a6a',
      btnHoverBg:   '#122a3e',
      selectedBg:   '#0a2a3e',
      selectedBorder: '#0ff',
      lockBg:       '#080810',
      lockText:     '#223344',
      overlayAlpha: 0.85,
      fontFamily:   'monospace',
      titleSize:    40,
      subtitleSize: 16,
      bodySize:     14,
      smallSize:    11
    },

    screens: {
      startScreen: function(data, T) {
        var ctx = FA.getCtx();
        var W = FA.getCanvas().width;
        var H = FA.getCanvas().height;
        var cx = W / 2;

        FA.draw.clear(T.bg);
        scanlines(ctx, W, H);

        // Glitch line (rare)
        if (Math.random() < 0.03) {
          ctx.globalAlpha = 0.06;
          ctx.fillStyle = T.accent;
          ctx.fillRect(0, Math.random() * H, W, 1);
          ctx.globalAlpha = 1;
        }

        // Dark band behind title
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#020610';
        ctx.fillRect(0, H * 0.28 - 40, W, 100);
        ctx.globalAlpha = 1;

        // Title with glow
        ctx.shadowColor = T.accent;
        ctx.shadowBlur = 20;
        ctx.fillStyle = T.accent;
        ctx.font = 'bold ' + T.titleSize + 'px ' + T.fontFamily;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(data.title || 'GAME', cx, H * 0.3);
        ctx.shadowBlur = 0;

        // Accent line
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = T.accent;
        ctx.fillRect(cx - 90, H * 0.3 + T.titleSize / 2 + 4, 180, 1);
        ctx.globalAlpha = 1;

        // Subtitle
        if (data.subtitle) {
          ctx.fillStyle = T.textDim;
          ctx.font = T.subtitleSize + 'px ' + T.fontFamily;
          ctx.fillText(data.subtitle, cx, H * 0.3 + T.titleSize / 2 + 24);
        }

        // Controls
        var controls = data.controls || [];
        var cy = H * 0.55;
        ctx.font = T.smallSize + 'px ' + T.fontFamily;
        for (var i = 0; i < controls.length; i++) {
          ctx.fillStyle = T.textMuted;
          ctx.fillText(controls[i], cx, cy + i * 20);
        }

        // Pulsing prompt
        var pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = T.accent;
        ctx.font = 'bold ' + (T.subtitleSize + 2) + 'px ' + T.fontFamily;
        ctx.fillText(data.prompt || '[ SPACE ]', cx, H * 0.82);
        ctx.globalAlpha = 1;

        // Bottom glow line
        ctx.shadowColor = T.accent;
        ctx.shadowBlur = 8;
        ctx.fillStyle = T.accent;
        ctx.fillRect(W * 0.25, H - 2, W * 0.5, 2);
        ctx.shadowBlur = 0;

        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      }
    },

    decorate: function(ctx, W, H, screen) {
      if (screen !== 'startScreen') scanlines(ctx, W, H);
    }
  });

})(window.FA);
