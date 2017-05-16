
var SmartGuides = function (params) {
    var self = this;
    self.elementPositions = [];
    self.mockGuides = [];

    // Params
    self.tolerance = 5;
    self.guideClass = 'guide mock-guide draggable';
    self.appendGuideTo = ':not(.selected):visible';
    self.vClass = 'guide-y';
    self.hClass = 'guide-x';

    for (var i in params) {
        self[i] = params[i] || self[i];
    }
};

SmartGuides.prototype.defineElementPositions = function (elements) {
    var self = this;
    self.elementPositions = [];

    if (!elements || elements.length == 0) {
        elements = $(self.appendGuideTo);
    }

    $.each(elements, function () {
        self.elementPositions.push(SmartGuides.getRect($(this)));
    });
}

SmartGuides.prototype.addGuides = function (element, directionObj) {
    var self = this;
    self.clear();

    var offsets = {
        left: 0, right: 2,
        top: 0, bottom: 2
    }

    if (directionObj == null) {
        directionObj = {
            left: true, top: true,
            right: true, bottom: true
        }
    }

    var container = element.parent();
    var rect = SmartGuides.getRect(element);
    for (var i = 0, lng = self.elementPositions.length; i < lng; i++) {
        var otherRect = self.elementPositions[i];
        var nearResults = self.near(rect, otherRect, directionObj);
        if (nearResults.length > 0) {
            for (var j = 0; j < nearResults.length; j++) {
                var nearResult = nearResults[j];
                var mockGuide = $('<div></div>')
                    .addClass(self.guideClass)
                    .appendTo(container);

                self.mockGuides.push(mockGuide);

                switch (nearResult.edge) {
                    case 'left': 
                    case 'right':
                        mockGuide.addClass(self.vClass).css({
                            height: Math.abs(nearResult.size),
                            left: otherRect[nearResult.edge] + offsets[nearResult.edge],
                            top: Math.min(rect.top, otherRect.top)
                        });
                        break;

                    case 'top':
                    case 'bottom':   
                        mockGuide.addClass(self.hClass).css({
                            width: Math.abs(nearResult.size),
                            left: Math.min(rect.left, otherRect.left),
                            top: otherRect[nearResult.edge] + offsets[nearResult.edge]
                        }); 
                        break;
                }
            }
        }
    }

    return self.mockGuides;
}

SmartGuides.prototype.near = function (rect, otherRect, directionObj) {
    return SmartGuides.near.call(this, rect, otherRect, directionObj);
}

SmartGuides.prototype.getClosestGuides = function (el, directionObj) {
    return SmartGuides.getClosestGuides.call(this, el, this.mockGuides, directionObj);
}

SmartGuides.prototype.clear = function () {
    $.each(this.mockGuides, function () {
        $(this).remove();
    });
    this.mockGuides = [];
}

/* static */
SmartGuides.getRect = function (element) {
    var left = parseFloat(element.css('left')),
        top = parseFloat(element.css('top')),
        width = parseFloat(getComputedStyle(element.get(0)).width),
        height = parseFloat(getComputedStyle(element.get(0)).height);

    return {
        left: left,
        right: left + width,
        top: top,
        bottom: top + height,
        width: width,
        height: height
    };
};

SmartGuides.near = function (rect, otherRect, directionObj) {
    var tolerance = this.tolerance || 5,
        result = [],
        opposites = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' };

    function inTolerance (num1, num2) {
        return num1 < num2 + tolerance && num1 > num2 - tolerance;
    }

    function getGuideLength (isVert) {
        return isVert ? 
            Math.max(otherRect.bottom - rect.top, rect.bottom - otherRect.top, otherRect.height, rect.height) : 
            Math.max(otherRect.right - rect.left, rect.right - otherRect.left, otherRect.width, rect.width);
    }

    for (var i in directionObj) {
        if ((directionObj[i] && inTolerance(rect[i], otherRect[i])) || (directionObj[opposites[i]] && inTolerance(rect[opposites[i]], otherRect[i]))) {
            result.push({ 
                edge: i, 
                size: getGuideLength(['left', 'right'].indexOf(i) >= 0) }
            );
        }
    }
    return result;
}
SmartGuides.getClosestGuides = function (el, mockGuides, directionObj) {
    var self = this,
        hClass = self.hClass || 'guide-x',
        vClass = self.vClass || 'guide-y';

    if (directionObj == null) {
        directionObj = { left: true, top: true, right: false, bottom: false };
    }

    // IE has no these constants. So I need define it here. 
    var MAX_SAFE_INTEGER = 9007199254740991,
        MIN_SAFE_INTEGER = -9007199254740991;
    
    // filter. We need max left and top elements.
    var minLeft = MAX_SAFE_INTEGER, minTop = MAX_SAFE_INTEGER,
        maxLeft = MIN_SAFE_INTEGER, maxTop = MIN_SAFE_INTEGER,
        vGuides = [], hGuides = [];

    var coords = SmartGuides.getRect(el);

    $.each(mockGuides, function () {
        var $this = $(this),
            mockRect = SmartGuides.getRect($this),
            leftDiff = Math.abs(directionObj.left ? (coords.left - mockRect.right) : (coords.right - mockRect.left)),
            topDiff = Math.abs(directionObj.top ? (coords.top - mockRect.bottom) : (coords.bottom - mockRect.top));

        $this.css('visibility', 'hidden');

        if ($this.hasClass(vClass)) {
            if (leftDiff < minLeft) {
                minLeft = leftDiff;
                if (vGuides[0]) {
                    vGuides[0].css('visibility', 'hidden');
                }
                vGuides[0] = $this.css('visibility', '');
                // .push($this) if limitless
            }
        }
        else if ($this.hasClass(hClass)) {
            if (topDiff < minTop) {
                minTop = topDiff;
                if (hGuides[0]) {
                    hGuides[0].css('visibility', 'hidden');
                }
                hGuides[0] = $this.css('visibility', '');
                // .push($this) if limitless
            }
        }
    });

    return vGuides.concat(hGuides);
}
