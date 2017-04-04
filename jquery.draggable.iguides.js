/**
 * "jQuery UI Intellectual guides".
 *
 * @copyright       Copyright 2017, Anton Chukanov
 * @version         0.0.1
 */

(function ($) {
    var oldMouseStart = $.ui.draggable.prototype._mouseStart;
    $.ui.draggable.prototype._mouseStart = function (event, overrideHandle, noActivation) {
        this._trigger("beforeStart", event, this._uiHash());
        this._trigger("prepare", event, this._uiHash());
        oldMouseStart.apply(this, [event, overrideHandle, noActivation]);
    };
    
    var defaultGuideClass = 'i-guide';
    $.extend($.ui.draggable.prototype.options, {
        appendGuideTo: ':not(.selected):visible',
        guideClass: defaultGuideClass,
        iGuides: false
    });

	var iGuides;
    $.ui.plugin.add('draggable', 'iGuides', {
		prepare: function (evt) {
            var $this = $(this),
                inst = $this.data('ui-draggable'),
                settings = inst.options;

            if (inst.options.iGuides == true) {
                if (settings.guideClass.indexOf(defaultGuideClass) < 0) {
                    settings.guideClass += ' ' + defaultGuideClass;
                }
                var snapAdd = settings.guideClass.replace(/^|\s/g, '.');
    	        settings.snap = settings.snap ? settings.snap + ', ' + snapAdd : snapAdd;
                settings.snapMode = 'outer'; // doesn't work with 'inner'

    		    iGuides = new IGuides({
    		        tolerance: settings.snapTolerance,
    		        guideClass: settings.guideClass,
                    appendGuideTo: inst.options.appendGuideTo
    		    });
            }
		},
		start: function (evt, ui) {
            var $this = $(this),
                inst = $this.data('ui-draggable');

            if (inst.options.iGuides == true) {
                iGuides.defineElementPositions();
            }
        },
        drag: function (evt, ui) {
            var $this = ui.helper,
                inst = $(this).data('ui-draggable');

            // snap fields
            if (inst.options.iGuides == true && !evt.ctrlKey) {
                iGuides.addGuides($this);

                if (iGuides.mockGuides.length > 0) {
                    $.each(iGuides.getClosestGuides($this), function () {
                        var mockGuide = $(this),
                            mockOffset = mockGuide.offset();

                        inst.snapElements.push({
                            height: mockGuide.height(),
                            width: mockGuide.width(),
                            item: mockGuide.get(0),
                            snapping: false,
                            left: mockOffset.left,
                            top: mockOffset.top
                        });
                    });
                }
            }
            else {
                iGuides.clear();
            }
        },
        stop: function (evt, ui) {
            var $this = $(this),
                inst = $this.data('ui-draggable');

            if (inst.options.iGuides == true) {
                iGuides.clear();
            }
        }
    });
})(jQuery);