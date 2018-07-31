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
    
    var defaultGuideClass = 'smart-guide';
    $.extend($.ui.draggable.prototype.options, {
        guideClass: defaultGuideClass,
        snap: '.' + defaultGuideClass,
        smartGuides: false
    });

	var smartGuides;
    $.ui.plugin.add('draggable', 'smartGuides', {
		prepare: function (evt) {
            var $this = $(this),
                inst = $this.data('ui-draggable'),
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
                    appendGuideTo: $this.siblings(inst.options.smartGuides)
    		    });
            }
		},
		start: function (evt, ui) {
            var $this = $(this),
                inst = $this.data('ui-draggable');

            if (inst.options.smartGuides) {
                smartGuides.defineElementPositions();
            }
        },
        drag: function (evt, ui) {
            var $this = ui.helper,
                inst = $(this).data('ui-draggable');

            // snap fields
            if (inst.options.smartGuides && !evt.ctrlKey) {
                smartGuides.addGuides($this);

                if (smartGuides.mockGuides.length > 0) {
                    $.each(smartGuides.getClosestGuides($this), function () {
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
                smartGuides.clear();
            }
        },
        stop: function (evt, ui) {
            var $this = $(this),
                inst = $this.data('ui-draggable');

            if (inst.options.smartGuides) {
                smartGuides.clear();
            }
        }
    });
})(jQuery);
