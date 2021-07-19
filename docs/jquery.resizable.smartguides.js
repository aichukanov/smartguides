/**
 * "jQuery UI Intellectual guides".
 *
 * @copyright       Copyright 2017, Anton Chukanov
 * @version         0.0.1
 */

(function ($) {
    var oldMouseStart = $.ui.resizable.prototype._mouseStart;
    $.ui.resizable.prototype._mouseStart = function (event, overrideHandle, noActivation) {
        this._trigger("beforeStart", event);
        oldMouseStart.apply(this, [event, overrideHandle, noActivation]);
    };
    var defaultGuideClass = 'smart-guide';
    $.extend($.ui.resizable.prototype.options, {
        guideClass: defaultGuideClass,
        snap: '.' + defaultGuideClass,
        smartGuides: false
    });

    var smartGuides;
    $.ui.plugin.add('resizable', 'smartGuides', {
        start: function (evt, ui) {
            var $this = $(this),
                inst = $this.data('ui-resizable'),
                settings = inst.options;

            if (inst.options.smartGuides) {
                if (settings.guideClass.indexOf(defaultGuideClass) < 0) {
                    settings.guideClass += ' ' + defaultGuideClass;
                }
                var snapAdd = settings.guideClass.replace(/^|\s/g, '.');
                settings.snap = settings.snap ? settings.snap + ', ' + snapAdd : snapAdd;
                settings.snapMode = 'outer'; // doesn't work with 'inner'

                smartGuides = new SmartGuides({
                    tolerance: settings.snapTolerance,
                    guideClass: settings.guideClass,
                    appendGuideTo: settings.smartGuides
                });

                smartGuides.defineElementPositions();
            }
        },
        resize: function (evt, ui) {
            // snap fields
            var $this = ui.helper,
                inst = $(this).data('ui-resizable');

            if (inst.options.smartGuides && !evt.ctrlKey) {
                var directionObj = getDirection(ui, true);
                smartGuides.addGuides($this, directionObj);
                
                if (smartGuides.mockGuides.length > 0) {
                    $.each(smartGuides.getClosestGuides($this, directionObj), function () {
                        var mockGuide = $(this),
                            mockPosition = mockGuide.position(),
                            l = mockPosition.left + (parseInt(mockGuide.css('margin-left'), 10) || 0),
                            t = mockPosition.top + (parseInt(mockGuide.css('margin-top'), 10) || 0);

                        inst.coords.push({
                            l: l, t: t,
                            r: l + mockGuide.outerWidth(),
                            b: t + mockGuide.outerHeight()
                        });
                    });
                }
            }            
            else {
                smartGuides.clear();
            }
        },
        stop: function (evt, ui) {
            var $this = $(this),
                inst = $this.data('ui-resizable');

            if (inst.options.smartGuides) {
                smartGuides.clear();
            }
        }
    });

    var getDirection = function (ui, asObject) {
        var oPos = ui.originalPosition,
            oSize = ui.originalSize,
            pos = ui.position,
            size = ui.size;

        var w = oSize.width != size.width,
            h = oSize.height != size.height,
            l = oPos.left != pos.left,
            t = oPos.top != pos.top,
            direction = '';

        var handles = ['n, e, s, w, ne, se, sw, nw'];

        if (l && t) {
            direction = w && h ? 'nw' : w ? 'w' : 'n';
        }
        else if (l) {
            direction = w && h ? 'sw' : w ? 'w' : 's';
        }
        else if (t) {
            direction = w && h ? 'ne' : w ? 'e' : 'n';
        }
        else {
            direction = w && h ? 'se' : w ? 'e' : 's';
        }

        if (asObject) {
            return {
                left: direction.indexOf('w') >= 0,
                right: direction.indexOf('e') >= 0,
                top: direction.indexOf('n') >= 0,
                bottom: direction.indexOf('s') >= 0
            };
        }
        else {
            return direction;
        }
    }
})(jQuery);