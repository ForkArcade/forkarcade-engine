// ForkArcade Skin — Terminal
// Green-on-black, monospace, blinking cursor, terminal boxes
// For: city-builder, hacker/dystopian themes
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
      for (var y = 0; y < H; y += 3) sc.fillRect(0, y, W, 1);
      _scanW = W; _scanH = H;
    }
    ctx.globalAlpha = 0.05;
    ctx.drawImage(_scanCache, 0, 0);
    ctx.globalAlpha = 1;
  }

  function termBox(ctx, x, y, w, h, title, T) {
    ctx.fillStyle = T.panelBg;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = T.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    if (title) {
      ctx.fillStyle = '#0a2a0a';
      ctx.fillRect(x + 2, y + 2, w - 4, 20);
      ctx.fillStyle = T.accent;
      ctx.font = '14px ' + T.fontFamily;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(title, x + 8, y + 5);
    }
  }

  FA.ui.useSkin({
    name: 'terminal',

    theme: {
      bg:           '#0a0a0a',
      accent:       '#39ff14',
      accentDim:    '#1a8a0a',
      text:         '#a0a0a0',
      textDim:      '#505050',
      textMuted:    '#303030',
      success:      '#39ff14',
      danger:       '#ff4444',
      warning:      '#ff6a00',
      panelBg:      '#0d1a0d',
      panelBorder:  '#1a4a1a',
      btnBg:        '#0d1a0d',
      btnBorder:    '#1a4a1a',
      btnHoverBg:   '#1a2a1a',
      selectedBg:   '#1a3a1a',
      selectedBorder: '#39ff14',
      lockBg:       '#0a0a0a',
      lockText:     '#222',
      overlayAlpha: 0.85,
      fontFamily:   'VT323, monospace',
      titleSize:    36,
      subtitleSize: 20,
      bodySize:     18,
      smallSize:    14
    },

    screens: {
      startScreen: function(data, T) {
        var ctx = FA.getCtx();
        var W = FA.getCanvas().width;
        var H = FA.getCanvas().height;

        FA.draw.clear(T.bg);
        scanlines(ctx, W, H);

        // Terminal box
        var bw = Math.min(620, W - 40);
        var bh = Math.min(460, H - 40);
        var bx = (W - bw) / 2;
        var by = (H - bh) / 2;
        termBox(ctx, bx, by, bw, bh, '  ' + (data.title || 'GAME').toUpperCase() + '.exe', T);

        var lx = bx + 24;
        var ly = by + 36;
        var lh = 26;

        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.font = T.subtitleSize + 'px ' + T.fontFamily;

        // Boot sequence
        ctx.fillStyle = T.accent;
        ctx.fillText('> Initializing...', lx, ly); ly += lh;
        ctx.fillText('> Module: ' + (data.title || 'GAME'), lx, ly); ly += lh;

        ctx.fillStyle = T.warning;
        ctx.font = 'bold ' + T.subtitleSize + 'px ' + T.fontFamily;
        ctx.fillText('> Status: OPERATIONAL', lx, ly); ly += lh * 1.5;

        // Subtitle
        if (data.subtitle) {
          ctx.fillStyle = T.text;
          ctx.font = T.bodySize + 'px ' + T.fontFamily;
          ctx.fillText('> ' + data.subtitle, lx, ly); ly += lh;
        }

        ly += lh * 0.5;
        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold ' + T.subtitleSize + 'px ' + T.fontFamily;
        ctx.fillText('CONTROLS:', lx, ly); ly += lh;

        // Controls
        var controls = data.controls || [];
        ctx.font = T.bodySize + 'px ' + T.fontFamily;
        for (var i = 0; i < controls.length; i++) {
          ctx.fillStyle = T.text;
          ctx.fillText('  ' + controls[i], lx, ly);
          ly += lh - 2;
        }

        ly += lh;

        // Blinking prompt
        var cursor = Math.floor(Date.now() / 500) % 2 ? '_' : ' ';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px ' + T.fontFamily;
        ctx.fillText('> ' + (data.prompt || 'CLICK TO INITIALIZE') + cursor, lx, ly);

        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      }
    },

    decorate: function(ctx, W, H, screen) {
      if (screen !== 'startScreen') scanlines(ctx, W, H);
    }
  });

})(window.FA);
