(function($) {
    $.imgplay = function(element, options) {
        var defaults = {
            name: 'imgplay',
            rate: 1,
            controls: true,
            pageSize: 5
        };

        var plugin = this;
        var el = element;
        var $el = $(element);
        var $canvas = null;
        var screen = null;
        var playing = false;
        var direction = 'forward';
        var page = 1;
        var total = 0;
        var index = 0;
        var buffer = [];
        var playTimer = null;
        var bufferLoading = [];

        plugin.settings = {};

        plugin.getTotalFrames = function() {
            return total;
        };

        plugin.controls = {
            play: null,
            pause: null,
            stop: null,
            rewind: null,
            forward: null,
            previousFrame: null,
            nextFrame: null,
            fullscreen: null
        };

        plugin.frames = [];

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);

            // max rate is 100 fps and min rate is 0.001 fps
            plugin.settings.rate = (plugin.settings.rate < 0.001) ? 0.001 : plugin.settings.rate;
            plugin.settings.rate = (plugin.settings.rate > 100) ? 100 : plugin.settings.rate;

            $el.addClass('imgplay');
            $canvas = $('<canvas class="imgplay-canvas">');
            screen = $canvas.get(0).getContext('2d');
            $el.append($canvas);
            initControls();

            // prepare images list
            $el.find('img').each(function(j, img) {
                if($(img).prop('src') != '') {
                    plugin.frames[j] = img;
                } else {
                    buffer[j] = img;
                }

                total++;
            }).detach();

            $(window).resize(resize);
            resize();
        };

        plugin.isPlaying = function() {
            return playing;
        };

        plugin.getCurrentFrame = function() {
            return index;
        };

        plugin.play = function() {
            playing = true;
            direction = 'forward';
            drawFrame();

            if (plugin.settings.controls) {
                plugin.controls.play.addClass('active');
                plugin.controls.stop.removeClass('active');
                plugin.controls.pause.removeClass('active');
                plugin.controls.rewind.removeClass('active');
                plugin.controls.forward.removeClass('active');
            }
        };

        plugin.pause = function() {
            playing = false;
            if(playTimer != null) {
                clearTimeout(playTimer);
            }

            if (plugin.settings.controls) {
                plugin.controls.pause.addClass('active');
                plugin.controls.play.removeClass('active');
                plugin.controls.stop.removeClass('active');
                plugin.controls.rewind.removeClass('active');
                plugin.controls.forward.removeClass('active');
            }
        };

        plugin.stop = function() {
            playing = false;
            index = 0;

            if (plugin.settings.controls) {
                plugin.controls.stop.addClass('active');
                plugin.controls.play.removeClass('active');
                plugin.controls.pause.removeClass('active');
                plugin.controls.rewind.removeClass('active');
                plugin.controls.forward.removeClass('active');
            }
        };

        plugin.rewind = function(frames) {
            var frames = parseInt(frames);
            if(frames > 0 && index >= frames) {
                direction = 'backward';
                index -= frames;
                drawFrame();
            }

            if (plugin.settings.controls) {
                plugin.controls.rewind.addClass('active');
                plugin.controls.forward.removeClass('active');
                plugin.controls.stop.removeClass('active');
                plugin.controls.play.removeClass('active');
                plugin.controls.pause.removeClass('active');
            }
        };

        plugin.forward = function(frames) {
            var frames = parseInt(frames);
            if(frames > 0 && total >= index + frames) {
                direction = 'forward';
                index += frames;
                drawFrame();
            }

            if (plugin.settings.controls) {
                plugin.controls.forward.addClass('active');
                plugin.controls.rewind.removeClass('active');
                plugin.controls.stop.removeClass('active');
                plugin.controls.play.removeClass('active');
                plugin.controls.pause.removeClass('active');
            }
        };

        plugin.fastRewind = function(rate) {
            var rate = parseInt(rate);
            if(rate > 0) {
                direction = 'backward';
                plugin.settings.rate = rate;
            }
            drawFrame();
        };

        plugin.fastForward = function(rate) {
            var rate = parseInt(rate);
            if(rate > 0) {
                direction = 'forward';
                plugin.settings.rate = rate;
            }
            drawFrame();
        };

        plugin.previous = function() {
        };

        plugin.next =  function() {
        };

        plugin.previousFrame = function() {
            playing = false;
            direction = 'backward';
            index--;
            drawFrame();
        };

        plugin.nextFrame = function() {
            playing = false;
            direction = 'forward';
            index++;
            drawFrame();
        };

        plugin.toFrame = function(i) {
            i = i < 0 ? 0 : i;

            if (plugin.frames[i]) {
                index = i;
                drawFrame();
                if (index > plugin.frames.length - plugin.settings.pageSize / 2) {
                    loadMore();
                }
                return jQuery.Deferred().resolve();
            }
            else {
                // tell caller we are loading their requested frame
                if (plugin.settings.onLoading)
                    plugin.settings.onLoading(true);

                index = i;
                // load more but start a few frames back to make sure those a buffered
                loadFrom = i - plugin.settings.pageSize * 0.1;
                if (loadFrom < 0)
                    loadFrom = 0;

                // skip our back load if we already have them
                while (plugin.frames[loadFrom])
                    loadFrom++;

                return loadMore(loadFrom).then(function() {
                    // we have loaded their requested frame
                    if (plugin.settings.onLoading)
                        plugin.settings.onLoading(false);

                    // while loading we may have drawn/requested another frame
                    if (index != i)
                        return;

                    drawFrame();
                });
            }
        };

        plugin.fullscreen = function(options) {
            if (!document.fullscreenElement &&    // alternative standard method
                !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
                if (el.requestFullscreen) {
                    el.requestFullscreen();
                } else if (el.msRequestFullscreen) {
                    el.msRequestFullscreen();
                } else if (el.mozRequestFullScreen) {
                    el.mozRequestFullScreen();
                } else if (el.webkitRequestFullscreen) {
                    el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                }
                if (plugin.settings.controls) {
                    plugin.controls.fullscreen.addClass('active');
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                if (plugin.settings.controls) {
                    plugin.controls.fullscreen.removeClass('active');
                }
            }

            setTimeout(function() {
                resize();
            }, 2000);
        };

        var initControls = function() {
            if (!plugin.settings.controls) {
                return;
            }
            if ($el.find('.imgplay-controls').length == 0) {
                var controls = $('<div class="imgplay-controls"></div>');
                var progress = $('<div class="imgplay-progress">');
                var buttons = $('<div class="imgplay-buttons">');
                var loadBar = $('<div class="imgplay-load-bar">');
                var playBar = $('<div class="imgplay-play-bar">');

                var play = $('<div class="imgplay-button imgplay-play"><i class="material-icons">play_arrow</i></div>');
                var pause = $('<div class="imgplay-button imgplay-pause"><i class="material-icons">pause</i></div>');
                var stop = $('<div class="imgplay-button imgplay-stop"><i class="material-icons">stop</i></div>');
                //var rewind = $('<div class="imgplay-button imgplay-rewind"><i class="material-icons">fast_rewind</i></div>');
                //var forward = $('<div class="imgplay-button imgplay-forward"><i class="material-icons">fast_forward</i></div>');
                var previousFrame = $('<div class="imgplay-button imgplay-previous-frame"><i class="material-icons">skip_previous</i></div>');
                var nextFrame = $('<div class="imgplay-button imgplay-next-frame"><i class="material-icons">skip_next</i></div>');
                var fullscreen = $('<div class="imgplay-button imgplay-fullscreen"><i class="material-icons">fullscreen</i></div>');

                play.on('click', function() { plugin.play(); });
                pause.on('click', function() { plugin.pause(); });
                stop.on('click', function() { plugin.stop(); });
                //rewind.on('click', function() { plugin.rewind(); })
                //forward.on('click', function() { plugin.forward(); })
                previousFrame.on('click', function() { plugin.previousFrame(); });
                nextFrame.on('click', function() { plugin.nextFrame(); });
                fullscreen.on('click', function() { plugin.fullscreen(); });
                progress.on('click', function(evt) {
                    var target = $(this);
                    var posX = evt.pageX - target.offset().left;
                    var width = target.width();
                    var frame = Math.floor(posX / width * total);

                    plugin.toFrame(frame);
                });

                loadBar.append(playBar);
                progress.append(loadBar);
                buttons.append([play, pause, previousFrame, stop, nextFrame, fullscreen]);
                controls.append([progress, buttons]);
                $el.append(controls);

                plugin.controls.play = play;
                plugin.controls.pause = pause;
                plugin.controls.stop = stop;
                //plugin.controls.rewind = rewind;
                //plugin.controls.forward = forward;
                plugin.controls.previousFrame = previousFrame;
                plugin.controls.nextFrame = nextFrame;
                plugin.controls.fullscreen = fullscreen;
            }
        };

        var drawFrame = function() {
            if (screen != null) {
                var img = plugin.frames[index];
                var $img = $(img);

                if (img) {
                    if ($img.prop('naturalHeight') > 0) {
                        var cw = $canvas.width();
                        var ch = $canvas.height();
                        var iw = img.width;
                        var ih = img.height;
                        var vw = 0;
                        var vh = 0;

                        if (cw >= ch) {
                            vw = iw * (ch/ih);
                            vh = ch;
                        } else {
                            vw = cw;
                            vh = ih * (cw/iw);
                        }
                        screen.clearRect(0, 0, cw, ch);
                        screen.drawImage(img, (cw - vw) / 2, (ch - vh) / 2, vw, vh);
                    }
                } else if (buffer.length) {
                    var wasPlaying = playing;
                    plugin.pause();

                    if (wasPlaying && plugin.settings.onLoading)
                        plugin.settings.onLoading(true);

                    loadMore(index, wasPlaying);
                    return;
                }

                if (index < 0 || index > plugin.frames.length) {
                    plugin.stop();
                    return;
                }

                if (playing) {
                    if (direction == 'forward') {
                        index++;
                        if (index > plugin.frames.length -  plugin.settings.pageSize / 2) {
                            loadMore();
                        }
                    } else {
                        index--;
                    }

                    playTimer = setTimeout(drawFrame, Math.ceil(1000 / plugin.settings.rate));
                }

                drawProgress();
            }
        };

        var loadMore = function(fromIdx, beginPlaying) {
            var deferred;
            var loadFrom = fromIdx != undefined ? fromIdx : index;
            if (buffer.length) {
                for(var i = loadFrom; (i < plugin.settings.pageSize + loadFrom && i < buffer.length); i++) {
                    var p = loadFrame(i, beginPlaying);
                    if (i == fromIdx) {
                        deferred = p; // return the promise of the frame they asked for
                    }
                }
            }
            return deferred;
        };

        var loadFrame = function(i, beginPlaying) {
            // are we already loading this frame?
            if (bufferLoading[i])
                return bufferLoading[i];

            var deferred = jQuery.Deferred();
            bufferLoading[i] = deferred;

            if (i < buffer.length) {
                var img = buffer[i];
                var $img = $(img);

                if ($img.data('src')) {
                    $img.prop('src', $img.data('src'));
                    $img.on('load', function() {
                        plugin.frames[i] = img;
                        //buffer.splice(buffer.indexOf(img), 1);
                        drawProgress();
                        if (beginPlaying && i == (index + (plugin.settings.pageSize / 2)) && playing == false) {
                            if (plugin.settings.onLoading)
                                plugin.settings.onLoading(false);

                            plugin.play();
                        }
                        delete bufferLoading[i];
                        deferred.resolve();
                    });
                }
            }
            return deferred;
        };

        var drawProgress = function() {
            if (!plugin.settings.controls) {
                return;
            }
            var loadProgress = ((plugin.frames.length / total) * 100);
            var playProgress = ((index / plugin.frames.length) * 100);

            loadProgress = loadProgress > 100 ? 100 : loadProgress;
            playProgress = playProgress > 100 ? 100 : playProgress;

            $el.find('.imgplay-load-bar').css('width', loadProgress + '%');
            $el.find('.imgplay-play-bar').css('width',  playProgress + '%');
        };

        var resize = function() {
            $canvas.prop({height: $el.height(), width: $el.width()});
            drawFrame();
        };

        plugin.fitCanvas = function() {
            resize();
        };


        plugin.init();
    };

    $.fn.imgplay = function(options) {
        return this.each(function() {
            if($(this).data('imgplay') == undefined) {
                var plugin = new $.imgplay(this, options);
                $(this).data('imgplay', plugin);
            }
        });
    };
})(jQuery);
