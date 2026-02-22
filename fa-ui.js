// ForkArcade Engine v2 — Immediate-Mode UI + Skins
// ENGINE FILE — do not modify in game repos
(function(window) {
  'use strict';
  var FA = window.FA;

  // =====================
  // LAYER 2: THEME
  // =====================

  var _theme = {
    bg:           '#0a0a12',
    accent:       '#ffd700',
    accentDim:    '#4ef',
    text:         '#ffffff',
    textDim:      '#888888',
    textMuted:    '#555555',
    success:      '#44ff44',
    danger:       '#ff4444',
    warning:      '#ffaa00',
    panelBg:      '#111118',
    panelBorder:  '#333333',
    btnBg:        '#2a2a3e',
    btnBorder:    '#444466',
    btnHoverBg:   '#3a3a4e',
    selectedBg:   '#4a6a2a',
    selectedBorder: '#ffd700',
    lockBg:       '#222222',
    lockText:     '#555555',
    overlayAlpha: 0.75,
    fontFamily:   'monospace',
    titleSize:    36,
    subtitleSize: 16,
    bodySize:     14,
    smallSize:    11
  };

  var _skinName = 'default';
  var _screens = {};
  var _decorate = null;

  // =====================
  // LAYER 1: IMMEDIATE-MODE PRIMITIVES
  // =====================

  var _stack = [];
  var _pendingClick = null;
  var _frameClick = null;
  var _clickConsumed = false;
  var _lastClicked = null;
  var _hover = {};
  var _mousePos = null;

  function _current() {
    return _stack.length > 0 ? _stack[_stack.length - 1] : null;
  }

  function _advance(w, h) {
    var c = _current();
    if (!c) return;
    if (c.layout === 'horizontal') {
      c.curX += w + c.gap;
    } else {
      c.curY += h + c.gap;
    }
  }

  function _hitTest(x, y, w, h) {
    if (!_frameClick || _clickConsumed) return false;
    return _frameClick.x >= x && _frameClick.x < x + w &&
           _frameClick.y >= y && _frameClick.y < y + h;
  }

  function _checkHover(x, y, w, h) {
    if (!_mousePos) return false;
    return _mousePos.x >= x && _mousePos.x < x + w &&
           _mousePos.y >= y && _mousePos.y < y + h;
  }

  function _lighten(hex, amount) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = Math.min(255, parseInt(h.substr(0, 2), 16) + Math.round(amount * 255));
    var g = Math.min(255, parseInt(h.substr(2, 2), 16) + Math.round(amount * 255));
    var b = Math.min(255, parseInt(h.substr(4, 2), 16) + Math.round(amount * 255));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function _textWidth(text, size, bold) {
    var ctx = FA.getCtx();
    var prev = ctx.font;
    ctx.font = (bold ? 'bold ' : '') + size + 'px ' + _theme.fontFamily;
    var w = ctx.measureText(text).width;
    ctx.font = prev;
    return w;
  }

  function _font(size, bold) {
    return (bold ? 'bold ' : '') + size + 'px ' + _theme.fontFamily;
  }

  // =====================
  // PUBLIC API
  // =====================

  var ui = {};

  // --- Skin ---

  ui.useSkin = function(skin) {
    _skinName = skin.name || 'custom';
    if (skin.theme) {
      for (var k in skin.theme) {
        if (skin.theme.hasOwnProperty(k)) _theme[k] = skin.theme[k];
      }
    }
    if (skin.screens) {
      for (var s in skin.screens) {
        if (skin.screens.hasOwnProperty(s)) _screens[s] = skin.screens[s];
      }
    }
    if (skin.decorate) _decorate = skin.decorate;
  };

  ui.getTheme = function() { return _theme; };
  ui.getSkinName = function() { return _skinName; };

  // --- Frame lifecycle ---

  ui.frame = function() {
    _frameClick = _pendingClick;
    _pendingClick = null;
    _clickConsumed = false;
    _lastClicked = null;
    _hover = {};
    _stack = [];
    _mousePos = FA.getMouse ? FA.getMouse() : null;
  };

  // --- Containers ---

  ui.begin = function(id, opts) {
    opts = opts || {};
    var parent = _current();
    var padding = opts.padding || 0;
    var x = opts.x != null ? opts.x : (parent ? parent.curX : 0);
    var y = opts.y != null ? opts.y : (parent ? parent.curY : 0);
    var w = opts.w != null ? opts.w : (parent ? parent.contentW : (FA.getCanvas ? FA.getCanvas().width : 800));
    var h = opts.h || 0;

    if (opts.bg) FA.draw.rect(x, y, w, h, opts.bg);
    if (opts.border) FA.draw.strokeRect(x, y, w, h, opts.border, opts.borderWidth || 1);

    _stack.push({
      id: id, x: x, y: y, w: w, h: h,
      padding: padding,
      layout: opts.layout || 'vertical',
      gap: opts.gap || 0,
      align: opts.align || 'left',
      curX: x + padding,
      curY: y + padding,
      contentW: w - padding * 2,
      startY: y + padding
    });
  };

  ui.end = function() {
    var popped = _stack.pop();
    if (!popped) return;
    var parent = _current();
    if (parent) {
      var consumed = popped.curY - popped.startY;
      _advance(popped.w, consumed);
    }
  };

  // --- Components ---

  ui.label = function(text, opts) {
    var c = _current();
    if (!c) return;
    opts = opts || {};
    var size = opts.size || _theme.bodySize;
    var color = opts.color || _theme.text;
    var bold = opts.bold || false;
    var align = opts.align || c.align;
    var h = size + 4;
    var tx = c.curX;
    if (align === 'center') tx = c.curX + c.contentW / 2;
    else if (align === 'right') tx = c.curX + c.contentW;

    var ctx = FA.getCtx();
    ctx.fillStyle = color;
    ctx.font = _font(size, bold);
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillText(text, tx, c.curY);
    ctx.textAlign = 'left';

    var advW = c.layout === 'horizontal' ? _textWidth(text, size, bold) + 4 : c.contentW;
    _advance(advW, h);
  };

  ui.stat = function(label, value, opts) {
    var c = _current();
    if (!c) return;
    opts = opts || {};
    var size = opts.size || _theme.bodySize;
    var labelColor = opts.labelColor || _theme.textDim;
    var valueColor = opts.valueColor || _theme.text;
    var bold = opts.bold !== false;
    var h = size + 4;

    var labelText = label + ': ';
    var valueText = String(value);
    var labelW = _textWidth(labelText, size, false);

    var ctx = FA.getCtx();
    ctx.textBaseline = 'top';
    ctx.font = _font(size, false);
    ctx.fillStyle = labelColor;
    ctx.fillText(labelText, c.curX, c.curY);
    ctx.font = _font(size, bold);
    ctx.fillStyle = valueColor;
    ctx.fillText(valueText, c.curX + labelW, c.curY);

    var advW = c.layout === 'horizontal' ? labelW + _textWidth(valueText, size, bold) + 4 : c.contentW;
    _advance(advW, h);
  };

  ui.button = function(id, text, opts) {
    var c = _current();
    opts = opts || {};
    var x = c ? c.curX : (opts.x || 0);
    var y = c ? c.curY : (opts.y || 0);
    var w = opts.w || (c ? c.contentW : 100);
    var h = opts.h || 32;
    var locked = opts.locked || false;
    var selected = opts.selected || false;
    var subtitle = opts.subtitle || null;
    var size = opts.size || _theme.bodySize;
    var bold = opts.bold !== false;
    var align = opts.align || 'center';

    var hovered = !locked && _checkHover(x, y, w, h);
    if (hovered) _hover[id] = true;

    var bg, borderColor, borderW, textColor, subColor;
    if (locked) {
      bg = _theme.lockBg; textColor = _theme.lockText;
      subColor = _theme.lockText; borderColor = null; borderW = 0;
    } else if (selected) {
      bg = opts.bg || _theme.selectedBg;
      borderColor = _theme.selectedBorder; borderW = 2;
      textColor = opts.color || _theme.text; subColor = _theme.textDim;
    } else {
      bg = opts.bg || _theme.btnBg;
      borderColor = opts.border || _theme.btnBorder;
      borderW = opts.borderWidth || 1;
      textColor = opts.color || _theme.text;
      subColor = _theme.textDim;
      if (hovered) bg = _lighten(bg, 0.12);
    }

    FA.draw.rect(x, y, w, h, bg);
    if (borderColor) FA.draw.strokeRect(x, y, w, h, borderColor, borderW);

    var tx;
    if (align === 'center') tx = x + w / 2;
    else if (align === 'right') tx = x + w - 8;
    else tx = x + 8;

    var ctx = FA.getCtx();
    ctx.textAlign = align;
    if (subtitle) {
      var mainY = y + h / 2 - size / 2 - 4;
      var subY = y + h / 2 + 4;
      ctx.textBaseline = 'top';
      ctx.font = _font(size, bold); ctx.fillStyle = textColor;
      ctx.fillText(text, tx, mainY);
      ctx.font = _font(Math.max(9, size - 3), false); ctx.fillStyle = subColor;
      ctx.fillText(subtitle, tx, subY);
    } else {
      ctx.textBaseline = 'top';
      ctx.font = _font(size, bold); ctx.fillStyle = textColor;
      ctx.fillText(text, tx, y + (h - size) / 2 - 1);
    }
    ctx.textAlign = 'left';

    if (c) _advance(w, h);

    if (!locked && _hitTest(x, y, w, h)) {
      _clickConsumed = true;
      _lastClicked = id;
      return true;
    }
    return false;
  };

  ui.bar = function(value, max, opts) {
    var c = _current();
    if (!c) return;
    opts = opts || {};
    var x = c.curX, y = c.curY;
    var w = opts.w || c.contentW;
    var h = opts.h || 8;
    var fg = opts.fg || _theme.success;
    var bg = opts.bg || _theme.panelBg;
    var ratio = max > 0 ? FA.clamp(value / max, 0, 1) : 0;

    FA.draw.rect(x, y, w, h, bg);
    if (ratio > 0) FA.draw.rect(x, y, Math.round(w * ratio), h, fg);
    if (opts.border) FA.draw.strokeRect(x, y, w, h, opts.border, 1);
    if (opts.label) {
      var ctx = FA.getCtx();
      ctx.fillStyle = opts.labelColor || _theme.text;
      ctx.font = _font(opts.labelSize || 10, false);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(opts.label, x + w / 2, y + (h - 10) / 2);
      ctx.textAlign = 'left';
    }
    _advance(w, h);
  };

  ui.separator = function(opts) {
    var c = _current();
    if (!c) return;
    opts = opts || {};
    FA.draw.rect(c.curX, c.curY, c.contentW, opts.h || 1, opts.color || _theme.panelBorder);
    _advance(c.contentW, opts.h || 1);
  };

  ui.space = function(px) {
    var c = _current();
    if (!c) return;
    _advance(px, px);
  };

  // --- Overlays ---

  ui.overlay = function(alpha, color) {
    alpha = alpha != null ? alpha : _theme.overlayAlpha;
    color = color || '#000';
    var canvas = FA.getCanvas();
    FA.draw.withAlpha(alpha, function() {
      FA.draw.rect(0, 0, canvas.width, canvas.height, color);
    });
  };

  // --- Queries ---

  ui.clicked = function() { return _lastClicked; };
  ui.isHover = function(id) { return !!_hover[id]; };
  ui.hitTest = function(x, y, w, h) { return _hitTest(x, y, w, h); };
  ui.checkHover = function(x, y, w, h) { return _checkHover(x, y, w, h); };

  // =====================
  // LAYER 3: SCREEN WIDGETS
  // =====================

  function _drawText(text, x, y, opts) {
    var ctx = FA.getCtx();
    ctx.fillStyle = opts.color || _theme.text;
    ctx.font = _font(opts.size || _theme.bodySize, opts.bold);
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.baseline || 'middle';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  }

  // --- Default: Start Screen ---

  function _defaultStartScreen(data, T) {
    var W = FA.getCanvas().width;
    var H = FA.getCanvas().height;
    var cx = W / 2;

    FA.draw.clear(T.bg);

    _drawText(data.title || 'GAME', cx, H * 0.3, { color: T.accent, size: T.titleSize, bold: true });

    if (data.subtitle) {
      _drawText(data.subtitle, cx, H * 0.3 + T.titleSize + 12, { color: T.textDim, size: T.subtitleSize });
    }

    var controls = data.controls || [];
    var cy = H * 0.55;
    for (var i = 0; i < controls.length; i++) {
      _drawText(controls[i], cx, cy + i * 22, { color: T.textMuted, size: T.smallSize });
    }

    var pulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
    var ctx = FA.getCtx();
    ctx.globalAlpha = pulse;
    _drawText(data.prompt || '[ SPACE ]', cx, H * 0.82, { color: T.text, size: T.subtitleSize, bold: true });
    ctx.globalAlpha = 1;
  }

  // --- Default: Game Over ---

  function _defaultGameOver(data, T) {
    var W = FA.getCanvas().width;
    var H = FA.getCanvas().height;
    var cx = W / 2;

    ui.overlay(T.overlayAlpha);

    var title = data.title || (data.victory ? 'VICTORY' : 'DEFEAT');
    var titleColor = data.victory ? T.success : T.danger;
    _drawText(title, cx, H * 0.25, { color: titleColor, size: T.titleSize, bold: true });

    if (data.score != null) {
      _drawText('SCORE: ' + data.score, cx, H * 0.25 + T.titleSize + 20, { color: T.text, size: 22, bold: true });
    }

    var stats = data.stats || [];
    var sy = H * 0.5;
    for (var i = 0; i < stats.length; i++) {
      var s = stats[i];
      _drawText(s.label + ': ' + s.value, cx, sy + i * 22, { color: s.color || T.textDim, size: T.bodySize });
    }

    if (data.message) {
      _drawText(data.message, cx, sy + stats.length * 22 + 20, { color: T.accentDim, size: T.bodySize });
    }

    var promptY = H * 0.85;
    _drawText(data.prompt || '[ R ] Restart', cx, promptY, { color: T.textMuted, size: T.bodySize });
  }

  // --- Default: Choice Box ---

  function _defaultChoiceBox(data, T) {
    var W = FA.getCanvas().width;
    var H = FA.getCanvas().height;
    var options = data.options || [];

    ui.overlay(T.overlayAlpha);

    var boxW = Math.min(500, W - 60);
    var optH = data.optionHeight || 56;
    var gap = 8;
    var boxH = 60 + options.length * (optH + gap);
    var bx = (W - boxW) / 2;
    var by = Math.max(20, (H - boxH) / 2);

    FA.draw.rect(bx, by, boxW, boxH, T.panelBg);
    FA.draw.strokeRect(bx, by, boxW, boxH, T.panelBorder, 1);

    _drawText(data.title || '', bx + boxW / 2, by + 20, { color: T.accent, size: T.subtitleSize + 2, bold: true });

    if (data.text) {
      _drawText(data.text, bx + boxW / 2, by + 42, { color: T.textDim, size: T.smallSize });
    }

    var clicked = null;
    var oy = by + 56;

    ui.frame(); // capture click state for buttons

    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      var ox = bx + 10;
      var ow = boxW - 20;
      var hovered = _checkHover(ox, oy, ow, optH);

      var bg = opt.locked ? T.lockBg : (hovered ? _lighten(T.btnBg, 0.12) : T.btnBg);
      var border = hovered ? T.accent : T.btnBorder;
      var textCol = opt.locked ? T.lockText : (hovered ? T.accent : T.text);

      FA.draw.rect(ox, oy, ow, optH, bg);
      FA.draw.strokeRect(ox, oy, ow, optH, border, hovered ? 2 : 1);

      _drawText(opt.label || '', ox + ow / 2, oy + (opt.desc ? 16 : optH / 2), {
        color: textCol, size: T.bodySize, bold: true
      });

      if (opt.desc) {
        _drawText(opt.desc, ox + ow / 2, oy + 36, { color: T.textDim, size: T.smallSize });
      }

      if (!opt.locked && _hitTest(ox, oy, ow, optH)) {
        _clickConsumed = true;
        clicked = opt.id != null ? opt.id : i;
      }

      oy += optH + gap;
    }

    return clicked;
  }

  // --- Default: Message Bar ---

  function _defaultMessageBar(data, T) {
    var W = FA.getCanvas().width;
    var alpha = data.alpha != null ? data.alpha : 1;
    var color = data.color || T.accentDim;
    var barH = 36;

    var ctx = FA.getCtx();
    ctx.globalAlpha = alpha * 0.8;
    FA.draw.rect(0, 0, W, barH, T.panelBg);
    ctx.globalAlpha = alpha;
    _drawText(data.text || '', W / 2, barH / 2, { color: color, size: T.bodySize });
    ctx.globalAlpha = 1;
  }

  // --- Screen Widget Public API ---

  ui.startScreen = function(data) {
    var fn = _screens.startScreen || _defaultStartScreen;
    fn(data, _theme);
    if (_decorate) _decorate(FA.getCtx(), FA.getCanvas().width, FA.getCanvas().height, 'startScreen');
  };

  ui.gameOver = function(data) {
    var fn = _screens.gameOver || _defaultGameOver;
    fn(data, _theme);
    if (_decorate) _decorate(FA.getCtx(), FA.getCanvas().width, FA.getCanvas().height, 'gameOver');
  };

  ui.choiceBox = function(data) {
    var fn = _screens.choiceBox || _defaultChoiceBox;
    var result = fn(data, _theme);
    if (_decorate) _decorate(FA.getCtx(), FA.getCanvas().width, FA.getCanvas().height, 'choiceBox');
    return result;
  };

  ui.messageBar = function(data) {
    var fn = _screens.messageBar || _defaultMessageBar;
    fn(data, _theme);
    if (_decorate) _decorate(FA.getCtx(), FA.getCanvas().width, FA.getCanvas().height, 'messageBar');
  };

  // =====================
  // EVENT HOOKS
  // =====================

  FA.on('input:click', function(pos) {
    if (pos && pos.x != null) {
      _pendingClick = { x: pos.x, y: pos.y };
    }
  });

  FA.on('state:reset', function() {
    _stack = [];
    _pendingClick = null;
    _frameClick = null;
    _clickConsumed = false;
    _lastClicked = null;
    _hover = {};
  });

  FA.ui = ui;

})(window);
