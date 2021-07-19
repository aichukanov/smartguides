$(document).ready(function () {
    // common listeners
    $(document)
        .on('click', '.container', function (e) {
            $(this).find('.selected').removeClass('selected');
        })
        .on('click', '.drag', function (e) {
            $(this).addClass('selected');
            e.stopPropagation();
        });

    // set random position for all elements
    $('.container').each(function () {
        $(this).find('.drag').each(function (i) {
            $(this).css({
                left: Math.random() * 50 + i * 100,
                top: Math.random() * 150 + 50
            });
        });
    });

    var opts = {
        containment: "parent",
        snapTolerance: 10,
        smartGuides: '#c1 .drag:not(".selected")',
        beforeStart: function () {
            var $this = $(this);
            if (!$this.hasClass('selected')) {
                $this.siblings('.selected').removeClass('selected');
                $this.addClass('selected');
            }
        }
    };

    $('#c1 .drag')
        .draggable($.extend({}, opts))
        .resizable($.extend({ 
            handles: 'all' 
        }, opts ));

    var opts2 = $.extend({}, opts, {
        smartGuides: '#c2 .drag:not(".selected")',
    });
    // with custom class
    $('#c2 .drag')
        .draggable($.extend(opts2, {
            multiple: true,
            selected: '#c2 .selected'
        }))
        .resizable($.extend(opts2, {
            handles: 'all'
        }));

    var opts3 = $.extend({}, opts, {
        smartGuides: '#c3 .drag:not(".selected")',
        snap: '.snap-container',
        guideClass: 'guide'
    });

    $('#c3 .drag')
        .draggable(opts3)
        .resizable($.extend(opts3, {
            handles: 'all'
        }));
});