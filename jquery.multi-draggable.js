/**
 * "jQuery UI Mult-draggable".
 *
 * @copyright       Copyright 2017, Anton Chukanov
 * @version         0.1
 */

(function ($) {
    var oldMouseStart = $.ui.draggable.prototype._mouseStart;
    $.ui.draggable.prototype._mouseStart = function (event, overrideHandle, noActivation) {
        this._trigger("beforeStart", event, this._uiHash());
        this._trigger("prepare", event, this._uiHash());
        oldMouseStart.apply(this, [event, overrideHandle, noActivation]);
    };

    $.extend($.ui.draggable.prototype.options, {
        multiple: false,
        cloneHelper: false,
        selected: '.selected'
    });

    $.ui.plugin.add('draggable', 'multiple', {
        prepare: function (evt) {
            var $this = $(this),
                inst = $this.data('ui-draggable');

            if (inst.options.multiple == true) {
                inst.options._selected = $(inst.options.selected);
                inst.options.cloneHelper = inst.options.cloneHelper || inst.options.helper == 'clone';

                var helper = createHelper(inst.options._selected);
                inst.options.helper = function () {
                    return helper;
                }

                inst.options.cursorAt = getCursorAt(evt, $this, helper.data('startPosition'));

                var hiddenSelector = ':not(".ui-draggable-hidden"):not(".ui-draggable-clone")';
                if (typeof inst.options.snap === "string") {
                    var snapSelectors = inst.options.snap.split(',');
                    for (var i in snapSelectors) {
                        if (snapSelectors[i].indexOf(hiddenSelector) < 0) {
                            snapSelectors[i] = snapSelectors[i].trim() + hiddenSelector;
                        }
                    }
                    inst.options.snap = snapSelectors.join(',');
                }

                if (inst.options.multiple == true && !inst.options.cloneHelper) {
                    inst.options._selected.addClass('ui-draggable-hidden');
                }
            }
        },
        stop: function (evt, ui) {
            var inst = $(this).data('ui-draggable');

            if (inst.options.multiple == true) {
                var helperStartPos = ui.helper.data('startPosition'),
                    leftDif = getLeft(ui.helper) - helperStartPos.left,
                    topDif = getTop(ui.helper) - helperStartPos.top;
                
                $.each(inst.options._selected, function () {
                    var $this = $(this);
                    var l = getLeft($this),
                        t = getTop($this);

                    $this.css({
                        left: l + leftDif - 1,
                        top: t + topDif - 1
                    });
                    $this.removeClass('ui-draggable-hidden');
                });
            }
        }
    });

    function getCursorAt(evt, $this, helperStartPos) {
        var offset = $this.offset(),
        	$body = $('body'),
            targetLeft = evt.clientX - offset.left - helperStartPos.left + getLeft($this) + $body.scrollLeft(),
            targetTop = evt.clientY - offset.top - helperStartPos.top + getTop($this) + $body.scrollTop();

        return {
            left: targetLeft,
            top: targetTop
        };
    }

    function createHelper(selected) {
        var selContainer = $('<div></div>').addClass('ui-draggable-container');
        var l = Number.MAX_SAFE_INTEGER, t = Number.MAX_SAFE_INTEGER,
            r = Number.MIN_SAFE_INTEGER, b = Number.MIN_SAFE_INTEGER;
        $.each(selected, function () {
            var $this = $(this),
                left = getLeft($this),
                top = getTop($this),
                right = left + getWidth($this),
                bottom = top + getHeight($this);

            l = left < l ? left : l;
            r = right > r ? right : r;
            t = top < t ? top : t;
            b = bottom > b ? bottom : b;
        });

        selContainer.css({
            width: r - l + 2,
            height: b - t + 2
        });

        $.each(selected, function () {
            var $this = $(this),
                clone = $this.clone();

            var left = getLeft($this) - l,
                top = getTop($this) - t;

            clone.addClass('ui-draggable-clone').css({
                left: left,
                top: top
            })

            selContainer.append(clone);
        });

        selContainer.data('startPosition', {
            left: l - 1,
            top: t - 1
        })

        return selContainer;
    }

    function getLeft(element) {
        return parseFloat(element.css('left'));
    }

    function getTop(element) {
        return parseFloat(element.css('top'));
    }

    function getWidth(element) {
        return parseFloat(getComputedStyle(element.get(0)).width);
    }

    function getHeight(element) {
        return parseFloat(getComputedStyle(element.get(0)).height);
    }
})(jQuery);