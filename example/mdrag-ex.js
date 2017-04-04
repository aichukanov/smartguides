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
        iGuides: true,
        guideClass: 'guide',
        snapTolerance: 10,
        snap: ".i-guide",
        appendGuideTo: '#c1 .drag:not(".selected")',
        beforeStart: function () {
            var $this = $(this);
            if (!$this.hasClass('selected')) {
                $this.siblings('.selected').removeClass('selected');
                $this.addClass('selected');
            }
        }
    }
    $('.drag')
        .draggable($.extend(opts, {
            //multiple: true
        }))
        .resizable($.extend(opts, {
            handles: 'all'
        }));

    // with custom class
    // $('#c2 .drag').draggable({
    //     containment: "parent",
    //     multiple: true,
    //     selected: '#c2 .selected',
    //     helper: 'clone',
    //     beforeStart: function () {
    //         var $this = $(this);
    //         if (!$this.hasClass('selected')) {
    //             $this.siblings('.selected').removeClass('selected');
    //             $this.addClass('selected');
    //         }
    //     }
    // });

    // // with snap
    // $('#c3 .drag').draggable({
    //     containment: "parent",
    //     multiple: true,
    //     selected: '#c3 .selected',
    //     snap: '#c3 .drag',
    //     beforeStart: function () {
    //         var $this = $(this);
    //         if (!$this.hasClass('selected')) {
    //             $this.siblings('.selected').removeClass('selected');
    //             $this.addClass('selected');
    //         }
    //     }
    // });
});