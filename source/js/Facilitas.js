/**
* Facilitas Player
* @version  1.1
* @url http://facilitasplayer.com 
* @author Bruno C. Ramos <bruno@weeag>
* @description Video player focused in providing a better accessibility
* @license BSD-3
*
* Copyright (c) 2014, Bruno C. Ramos, Johana María Rosas Villena, Renata Pontin M. Fortes, Rudinei Goularte
* All rights reserved.
* 
* Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
* 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* 
* 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* 
* 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
* 
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Document ready
;(function($){
    // Check if object.create is available in the browser
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {};
            F.prototype = o;
            return new F();
        };
    }
    // Defining a "Bridge" Function
    $.plugin = function(name, object) {
        $.fn[name] = function(options) {
            // Return init method for the app
            return this.each(function() {
                if (!$.data(this, name) ) {
                    $.data(this, name, Object.create(object).init(options, this));
                }
            });
        };
    };
    
    // Plugin Object
    var FacilitasPlayer = {
        init: function(options, elem) {
            // Mix options with default options
            this.options = $.extend({},this.options,options);

            // Save the element
            this.elem  = elem;
            this.$elem = $(elem);

            this._build();

            // return this => bridge
            return this;
        },
        // Default Options
        options: {
            // Configuration
                theme           : "facilitas_modern"
            ,   videoSpeed      : 1.0
            ,   fonts           : new Array("Trebuchet MS","Arial","Times New Roman","Verdana","Helvetica","Courier New")
            ,   initVolume      : 0.5
            ,   initAdVolume    : 0.8
            ,   baseLangFolder      : "js/"
            ,   language        : "en"
            ,   availableLanguages   : ["pt", "en", "es"]
            ,   enableKeyboard  : true
            ,   fullscreenToolbarSpeed : 2000
            ,   subtitleSrc     : null
            ,   audiodescription : null
            ,   transcripts      : null



            // About
            ,   version         : "1.0"
            ,   aboutUrl        : "www.facilitasplayer.com"

            // Auxiliar
            ,   init                : false
            ,   seekSliding         : false
            ,   bufferSliding       : false
            ,   currentBuffer       : 0
            ,   volumeSliding       : false
            ,   isFullscreen        : false
            ,   isLightOn           : false
            ,   oldVol              : null
            ,   oldAdVol            : null
            ,   hasTags             : false
            ,   debug               : true
            ,   subtitleCount       : 0
            ,   subtitleTotal       : 0
            ,   currentSubtitleLine : -1
            ,   newSubtitleLine     : null
            ,   fullscreenToolbarHidden : false
            ,   fullscreenToolbarHover : false
            ,   mouseX              : 0
            ,   mouseY              : 0
            ,   fullscreenTimer     : null

            // Support
            ,   browserPrefix           : null
            ,   browserPrefixes         : 'webkit moz o ms'.split(' ')
            ,   supportsFullScreen      : false
            ,   supportsSpeedChange     : false
            ,   loading                 : true
            ,   sidebar_captionsearch   : false
            ,   sidebar_settings        : false
            ,   sidebar_transcript      : false
            ,   helpIsOpen              : false
            ,   caption_list_height     : 0
            ,   lang                    : {}
            
            // Objects
            ,   body                        : null
            ,   video_parent                : null
            ,   video_container             : null
            ,   video_controls              : null
            ,   facilitas_play              : null
            ,   facilitas_stop              : null
            ,   facilitas_speedup           : null
            ,   facilitas_speeddown         : null
            ,   facilitas_speedwarning      : null
            ,   facilitas_audiodesc_btn     : null
            ,   facilitas_search_btn        : null
            ,   facilitas_settings_btn      : null
            ,   facilitas_help              : null
            ,   facilitas_help_btn          : null
            ,   facilitas_video_seek        : null
            ,   facilitas_video_buffer      : null
            ,   facilitas_video_timer       : null
            ,   facilitas_volume            : null
            ,   facilitas_volume_btn        : null
            ,   facilitas_volume_status     : null
            ,   facilitas_cc                : null
            ,   facilitas_cc_btn            : null
            ,   facilitas_volume_slider     : null
            ,   facilitas_viewport          : null
            ,   facilitas_tags              : null
            ,   facilitas_tags_goto         : null
            ,   facilitas_progress          : null
            ,   facilitas_toolbar           : null
            ,   facilitas_subtitle          : null
            ,   facilitas_light_bg          : null
            ,   facilitas_light_toggle      : null
            ,   facilitas_loading           : null
            ,   facilitas_search_form       : null
            ,   facilitas_search_result     : null
            ,   facilitas_search_input      : null
            ,   facilitas_search_inputbtn   : null
            ,   facilitas_language          : null
            ,   facilitas_toolbarposition   : null
            ,   facilitas_fontbackground    : null
            ,   facilitas_fontfamily        : null
            ,   facilitas_fontcolor         : null
            ,   facilitas_fontsize          : null
            ,   videoObject                 : null
            ,   facilitas_audiodesc         : null
            ,   facilitas_advolume          : null
            ,   facilitas_advolume_btn      : null
            ,   facilitas_advolume_status   : null
            ,   facilitas_advolume_slider     : null
            ,   facilitas_transcript_btn    : null
            ,   facilitas_transcript        : null
            
            // Features
            ,   subtitle: null
        },

        // Construct
        _build: function(){
            var e = this,
                el = this.$elem,
                op = this.options;

            op.parent = el.parent();
            op.body = $('body');

            /************ Create html structure to append */
            // Container to wrap the video
            var video_wrap = $('<div></div>').addClass('facilitas_player').addClass(op.theme);

            if(typeof(el.attr('width')) !== 'undefined')
                video_wrap.width(el.attr('width'));

            if(typeof(el.attr('width')) !== 'undefined')
                video_wrap.height(el.attr('height'));


            // Container to wrap light bg
            op.facilitas_light_bg = $('<div></div>').addClass('facilitas_light_bg').addClass(op.theme);

            // Load language file
            $.getJSON(op.baseLangFolder+"FacilitasLang/"+op.language+".js",function(data) {
                op.lang[op.language] = data;

                // Get tag list
                var tagList,
                    tagBody,
                    aux;
                if(typeof(el.attr('data-tagList')) !== 'undefined') {
                    aux = '#' + el.attr('data-tagList');
                    tagBody = $(aux);

                    if(tagBody.length > 0) {
                        tagList =  '<div class="facilitas_tags"><p class="facilitas_tags_goto">'+op.lang[op.language].tags.goTo+':</p></div>';
                        op.hasTags = true;
                    }
                } else {
                    tagList = "";            
                }

                // Get audio description
                if(typeof(el.attr('data-audiodescription')) !== 'undefined')
                    op.audiodescription = el.attr('data-audiodescription');
                
               // Get transcription
                if(typeof(el.attr('data-transcripts')) !== 'undefined')
                    op.transcripts = el.attr('data-transcripts');
                
                
                // Remove old tagList
                $(".facilitas_tags",el).remove();
                
                // Container to wrap the controls
                var video_controls = $(''
                    +'<div class="facilitas_progress">'
                    +'    <div class="facilitas_buffbar"></div>'
                    +'    <div class="facilitas_progbar">'
                    +'        <ul class="facilitas_stickers"></ul>'
                    +'    </div>'
                    +'</div>'
                    +'<div class="facilitas_toolbar">'
                    +'  <ul class="facilitas_controls" title="Toolbar">'
                    +'      <li><button class="facilitas_btn_play" title="'+op.lang[op.language].toolbar.play+'"><span class="fac-i-play"></span></button></li>'
                    +'      <li><button class="facilitas_btn_stop" title="'+op.lang[op.language].toolbar.stop+'"><span class="fac-i-stop"></span></button></li>'
                    +'      <li><button class="facilitas_btn_speeddown" title="'+op.lang[op.language].toolbar.rewind+'"><span class="fac-i-rewind"></span></button></li>'
                    +'      <li><button class="facilitas_btn_speedup" title="'+op.lang[op.language].toolbar.forward+'"><span class="fac-i-forward"></span></button></li>'
                    +'      <li title="'+op.lang[op.language].toolbar.time+'" class="facilitas_time"><div class="facilitas_timeupdate">00:00 / 00:00</div><div class="facilitas_speedwarning">2x</div></li>'
                    +'  </ul>'
                    +'  <ul class="facilitas_controls fr" title="Toolbar">'
                    +'      <li><button class="facilitas_btn_search" title="'+op.lang[op.language].toolbar.search+'"><span class="fac-i-search"></span></button></li>'
                    +'      <li><button class="facilitas_btn_cc" title="'+op.lang[op.language].toolbar.caption+'"><span class="fac-i-closedcaption"></span></button></li>'
                    +'      <li><button class="facilitas_transcript_btn" title="'+op.lang[op.language].toolbar.transcript+'"><span class="fac-i-transcript"></span></button></li>'
                    +'      <li><button class="facilitas_btn_settings" title="'+op.lang[op.language].toolbar.settings+'"><span class="fac-i-settings"></span></button></li>'
                    +'      <li>'
                    +'          <a href="javascript:void();" class="facilitas_btn_volume" title="'+op.lang[op.language].toolbar.volume+'">'
                    +'              <span class="vol_status fac-i-sound-half"></span>'
                    +'              <div class="facilitas_btn_container"></div>'
                    +'              <div class="facilitas_vol_container">'
                    +'                  <div class="facilitas_vol_wrapper">'
                    +'                      <div class="facilitas_control_volume_slider"></div>'
                    +'                  </div>'
                    +'              </div>'
                    +'          </a>'
                    +'      </li>'
                    +'      <li><button class="facilitas_btn_help" title="'+op.lang[op.language].toolbar.help+'"><span class="fac-i-help"></span></button></li>'
                    +'      <li><button class="facilitas_btn_viewport" title="'+op.lang[op.language].toolbar.viewport+'"><span class="fac-i-fullscreen-open"></span></button></li>'
                    +'  </ul>'
                    +'</div>'
                    +'<div class="facilitas_subtitle" aria-live="assertive"></div>'
                    +'<div class="facilitas_closedcaption"></div>'
                    + tagList
                    +'<div class="facilitas_help">'
                    +'  <span class="facilitas_help_title" title="'+op.lang[op.language].help.title+'">'+op.lang[op.language].help.title+'</span>'
                    +'  <div class="facilitas_help_content">'
                    +'      <ul>'
                    +'          <li title="'+op.lang[op.language].help.keyboard+'"><strong>'+op.lang[op.language].help.keyboard+'</strong></li>'
                    +'          <li title="P - '+op.lang[op.language].help.play+'"><strong>P</strong>'+op.lang[op.language].help.play+'</li>'
                    +'          <li title="Q - '+op.lang[op.language].help.stop+'"><strong>Q</strong>'+op.lang[op.language].help.stop+'</li>'
                    +'          <li title="S - '+op.lang[op.language].help.search+'"><strong>S</strong>'+op.lang[op.language].help.search+'</li>'
                    +'          <li title="E - '+op.lang[op.language].help.speeddown+'"><strong>E</strong>'+op.lang[op.language].help.speeddown+'</li>'
                    +'          <li title="R - '+op.lang[op.language].help.speedup+'"><strong>R</strong>'+op.lang[op.language].help.speedup+'</li>'
                    +'          <li title="Y - '+op.lang[op.language].help.rewind+'"><strong>Y</strong>'+op.lang[op.language].help.rewind+'</li>'
                    +'          <li title="U - '+op.lang[op.language].help.forward+'"><strong>U</strong>'+op.lang[op.language].help.forward+'</li>'
                    +'          <li title="T - '+op.lang[op.language].help.transcript+'"><strong>T</strong>'+op.lang[op.language].help.transcript+'</li>'
                    +'          <li title="C - '+op.lang[op.language].help.caption+'"><strong>C</strong>'+op.lang[op.language].help.caption+'</li>'
                    +'          <li title="M - '+op.lang[op.language].help.volume+'"><strong>M</strong>'+op.lang[op.language].help.volume+'</li>'
                    +'          <li title="V - '+op.lang[op.language].help.decreaseVol+'"><strong>V</strong>'+op.lang[op.language].help.decreaseVol+'</li>'
                    +'          <li title="B - '+op.lang[op.language].help.increaseVol+'"><strong>B</strong>'+op.lang[op.language].help.increaseVol+'</li>'
                    +'          <li title="A - '+op.lang[op.language].help.adVolume+'"><strong>A</strong>'+op.lang[op.language].help.adVolume+'</li>'
                    +'          <li title="Z - '+op.lang[op.language].help.adDecreaseVol+'"><strong>Z</strong>'+op.lang[op.language].help.adDecreaseVol+'</li>'
                    +'          <li title="X - '+op.lang[op.language].help.adIncreaseVol+'"><strong>X</strong>'+op.lang[op.language].help.adIncreaseVol+'</li>'
                    +'          <li title="F - '+op.lang[op.language].help.viewport+'"><strong>F</strong>'+op.lang[op.language].help.viewport+'</li>'
                    +'          <li title="H - '+op.lang[op.language].help.help+'"><strong>H</strong>'+op.lang[op.language].help.help+'</li>'
                    +'      </ul>'
                    +'  </div>'
                    +'  <div class="facilitas_help_content facilitas_help_about">'
                    +'      <ul>'
                    +'          <li>Facilitas Player v'+op.version+'</li>'
                    +'          <li><a href="'+op.aboutUrl+'" target="_blank" title="Facilitas Player">'+op.aboutUrl+'</a></li>'
                    +'      </ul>'
                    +'  </div>'
                    +'</div>'
                    +'<div class="facilitas_sidebar facilitas_caption_search">'
                    +'  <header>'
                    +'      <div class="facilitas_sidebar_title" title="'+op.lang[op.language].sidebarSearch.title+'"><span class="title">'+op.lang[op.language].sidebarSearch.title+'</span> <button data-type="search" class="facilitas_sidebar_close" title="'+op.lang[op.language].buttons.close+'"><span class="fac-i-close"></span></button></div>'
                    +'      <div class="facilitas_sidebar_search"><form class="facilitas_fsearch"><input type="text" class="facilitas_search_input" placeholder="'+op.lang[op.language].sidebarSearch.input+'" title="'+op.lang[op.language].sidebarSearch.input+'" /> <button class="facilitas_btn_inputsearch" title="'+op.lang[op.language].sidebarSearch.button+'"><span class="fac-i-search"></span></button></form></div>'
                    +'  </header>'
                    +'  <ol class="facilitas_search_result"></ol>'
                    +'</div>'
                    +'<div class="facilitas_sidebar facilitas_settings">'
                    +'  <header>'
                    +'      <div class="facilitas_sidebar_title" title="'+op.lang[op.language].sidebarSettings.title+'"><span class="title">'+op.lang[op.language].sidebarSettings.title+'</span> <button data-type="settings" class="facilitas_sidebar_close" title="'+op.lang[op.language].buttons.close+'"><span class="fac-i-close"></span></button></div>'
                    +'  </header>'
                    +'  <ul class="facilitas_sidebar_cont">'
                    +'      <li>'
                    +'          <label for="facilitas_language" title="'+op.lang[op.language].sidebarSettings.language.title+'">'+op.lang[op.language].sidebarSettings.language.title+'</label>'
                    +'          <select name="facilitas_language" class="facilitas_language" title="'+op.lang[op.language].sidebarSettings.language.title+'">'
                    +'              <option value="'+op.lang[op.language].about.file+'" title="'+op.lang[op.language].about.title+'" selected="selected">'+op.lang[op.language].about.title+'</option>'
                    +'          </select>'
                    +'      </li>'
                    +'      <li>'
                    +'          <label for="facilitas_toolbarPosition" title="'+op.lang[op.language].sidebarSettings.toolbar.position.title+'">'+op.lang[op.language].sidebarSettings.toolbar.position.title+'</label>'
                    +'          <select name="facilitas_toolbarPosition" class="facilitas_toolbarPosition" title="'+op.lang[op.language].sidebarSettings.toolbar.position.title+'">'
                    +'              <option value="bottom" title="'+op.lang[op.language].sidebarSettings.toolbar.position.posBottom+'" selected="selected">'+op.lang[op.language].sidebarSettings.toolbar.position.posBottom+'</option>'
                    +'          </select>'
                    +'      </li>'
                    +'      <li>'
                    +'          <label for="captionStyleTitle" title="'+op.lang[op.language].sidebarSettings.caption.captionStyle+'">'+op.lang[op.language].sidebarSettings.caption.captionStyle+'</label>'
                    +'          <label class="facilitas_label_subtitle" for="facilitas_fontbackground" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.title+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.title+'</label>'
                    +'          <select name="facilitas_fontbackground" class="facilitas_fontbackground" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.title+'">'
                    +'              <option value="none" selected="selected" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opNoBackground+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opNoBackground+'</option>'
                    +'              <option value="black" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opBlack+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opBlack+'</option>'
                    +'              <option value="halfblack" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opTransBlack+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opTransBlack+'</option>'
                    +'              <option value="white" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opWhite+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opWhite+'</option>'
                    +'              <option value="halfwhite" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opTransWhite+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opTransWhite+'</option>'
                    +'          </select>'
                    +'          <label class="facilitas_label_subtitle" for="facilitas_fontfamily" title="'+op.lang[op.language].sidebarSettings.caption.fontFamily+'">'+op.lang[op.language].sidebarSettings.caption.fontFamily+'</label>'
                    +'          <select name="facilitas_fontfamily" class="facilitas_fontfamily" title="'+op.lang[op.language].sidebarSettings.caption.fontFamily+'">'
                    +'          </select>'
                    +'          <div class="facilitas_settings_split">'
                    +'              <label class="facilitas_label_subtitle" for="facilitas_fontcolor" maxlength="7" title="'+op.lang[op.language].sidebarSettings.caption.fontColor+'">'+op.lang[op.language].sidebarSettings.caption.fontColor+'</label>'
                    +'              <input name="facilitas_fontcolor" class="facilitas_fontcolor" title="'+op.lang[op.language].sidebarSettings.caption.fontColor+'" value="E1EB1A" placeholder="E1EB1A" />'
                    +'          </div>'
                    +'          <div class="facilitas_settings_splitright">'
                    +'              <label class="facilitas_label_subtitle" for="facilitas_fontsize" title="'+op.lang[op.language].sidebarSettings.caption.fontSize+'">'+op.lang[op.language].sidebarSettings.caption.fontSize+'</label>'
                    +'              <select name="facilitas_fontsize" class="facilitas_fontsize" title="'+op.lang[op.language].sidebarSettings.caption.fontSize+'">'
                    +'                  <option value="8">8</option>'
                    +'                  <option value="10">10</option>'
                    +'                  <option value="12">12</option>'
                    +'                  <option value="14" selected="selected">14</option>'
                    +'                  <option value="16">16</option>'
                    +'                  <option value="18">18</option>'
                    +'                  <option value="20">20</option>'
                    +'                  <option value="24">24</option>'
                    +'                  <option value="30">30</option>'
                    +'                  <option value="36">36</option>'
                    +'                  <option value="40">40</option>'
                    +'              </select>'
                    +'          </div>'
                    +'      </li>'
                    +'  </ul>'
                    +'</div>'
                    +'<div class="facilitas_transcript"><header><span class="title">'+op.lang[op.language].sidebarTranscript.title+'</span> <button data-type="transcript" class="facilitas_sidebar_close" title="'+op.lang[op.language].buttons.close+'"><span class="fac-i-close"></span></button></header><ol></ol></div>'
                    +'<div class="facilitas_loading"><div class="facilitas_loading_img"></div></div>'
                    +'<button class="facilitas_btn_light" title="'+op.lang[op.language].lights.turnOn+'"><span class="fac-i-light"></span></button>'
                    );
                
                // Video class
                el.addClass("facilitas_video");
                
                
                // Add to the element
                el.wrap(video_wrap);
                el.after(video_controls);

                el.wrap($('<div/>')).parent().addClass('facilitas_player_video');

                // Append tags
                if(op.hasTags)
                    tagBody.appendTo($('.facilitas_tags'));

                
                // Add light bg to the body
                $("body").append(op.facilitas_light_bg);
                
                // Get video object
                op.videoObject = el[0];

                /************ Core methods */
                // Get instances
                e.getInstances();
               
                // Bind Actions
                e.bindControlActions();
                
                // Bind Video Actions
                e.bindVideoActions();
                
                // Bind Keyboard shortcuts
                if(op.enableKeyboard === true)
                    e.bindKeyboardShortcuts();
                
                // Disable caption button
                e.disableBtn(op.facilitas_cc);
                
                // Prepare Subtitle
                e.prepareSubtitle();

                // Prepare audio description
                e.prepareAudiodescription();
                
                // Prepare transcription
                e.prepareTranscripts();
                
                // Check supports
                e.checkSupport();

                // Check additional languages
                e.checkAdditionalLanguages();

                // Remove Default Controls
                el.removeAttr("controls");
                
                // Start Template
                e.startTemplate();    
            })
            .fail(function() {
                alert("Couldn't load language file!");
            });
        },
        /**
         * startTemplate
         * @desc Starts template after getting dimension and video properties
         */
        startTemplate: function() {
            var video = this,
                op = this.options,

                // Get toolbar height
                toolbar_height = this.options.facilitas_toolbar.height(),
            
                // Get progress bar height
                progbar_height = op.facilitas_progress.height(),
            
                // Get video width
                video_width = video.$elem.prop("width"),
            
                // Get video height
                video_height = video.$elem.prop("height"),

                // Get tags
                tags_height = op.facilitas_tags.height(),
            
                // Total height
                total_height = video_height+toolbar_height+progbar_height;


            if(tags_height) { total_height += tags_height; }
            
            // Change values
            // Container dimension
            op.video_container.height(total_height - 15);
            
            // Bars and Subtitle position
            if(!tags_height) {
                // Toolbar
                op.facilitas_toolbar.css("bottom",0);
                // Subtitle
                op.facilitas_subtitle.css("bottom",toolbar_height+17);
            } else {
                op.facilitas_subtitle.css("bottom",toolbar_height+tags_height+10);
            
            }

            // Progress
            if(tags_height)
                op.facilitas_progress.css('bottom',tags_height+toolbar_height-5);
            else
                op.facilitas_progress.css('bottom',toolbar_height);

            // Init colorpicker
            op.facilitas_fontcolor.minicolors({
                letterCase: 'uppercase',
                swatchPosition: 'right',
                change: function(hex,opacity) {
                    video.changeColor(hex);
                }
            });
            
            // Populate settings font-family select
            for(i=0,n=op.fonts.length;i<n;i++) {
                var selected = "";
                if(i == 0)
                    selected = ' selected="selected"';
                op.facilitas_fontfamily.append('<option value="'+op.fonts[i]+'" title="'+op.fonts[i]+'"'+selected+'>'+op.fonts[i]+'</option>');
            }


            // Update sidebar height
            op.facilitas_caption_search.height(total_height - 17);
            op.facilitas_search_result.height(total_height - op.facilitas_caption_search.find('header').height() - 12);

            // Enable mouse event to fullscreen
            if(op.supportsFullScreen) {
                $(window).on('mousemove', function(e) {
                    if(op.isFullscreen) {
                        if(op.fullscreenToolbarHidden) {
                            op.facilitas_progress.fadeIn(200);
                            op.facilitas_toolbar.fadeIn(200);
                            op.fullscreenToolbarHidden = false;
                        }

                        clearInterval(op.fullscreenTimer);
                        op.fullscreenTimer = setInterval(function() { video.hideFullscreenToolbar(); }, op.fullscreenToolbarSpeed);
                    }
                });

                op.facilitas_progress
                    .on('mouseenter', function() {
                        op.fullscreenToolbarHover = true;
                    }).on('mouseleave', function() {
                        op.fullscreenToolbarHover = false;
                    });

                op.facilitas_toolbar
                    .on('mouseenter', function() {
                        op.fullscreenToolbarHover = true;
                    }).on('mouseleave', function() {
                        op.fullscreenToolbarHover = false;
                    });
            }
        },
        /**
         * getInstances
         * @desc Get instances for this player
         */
        getInstances: function() {
            var op = this.options;
            op.video_container = this.$elem.parents('.facilitas_player');
            var c = op.video_container;
            op.video_controls               = $('.facilitas_controls',op.video_container);
            op.facilitas_play               = $('.facilitas_btn_play',op.video_container);
            op.facilitas_stop               = $('.facilitas_btn_stop',op.video_container);
            op.facilitas_speedup            = $('.facilitas_btn_speedup',op.video_container);
            op.facilitas_speeddown          = $('.facilitas_btn_speeddown',op.video_container);
            op.facilitas_speedwarning       = $('.facilitas_speedwarning',op.video_container);
            op.facilitas_search_btn         = $('.facilitas_btn_search',op.video_container);
            op.facilitas_settings_btn       = $('.facilitas_btn_settings',op.video_container);
            op.facilitas_video_seek         = $('.facilitas_progbar',op.video_container);
            op.facilitas_video_buffer       = $('.facilitas_buffbar',op.video_container);
            op.facilitas_video_timer        = $('.facilitas_timeupdate',op.video_container);
            op.facilitas_volume             = $('.facilitas_btn_volume',op.video_container);
            op.facilitas_volume_btn         = $('.facilitas_btn_container',op.video_container);
            op.facilitas_volume_status      = $('.vol_status',op.video_container);
            op.facilitas_cc                 = $('.facilitas_btn_cc',op.video_container);
            op.facilitas_volume_slider      = $('.facilitas_control_volume_slider',op.video_container);
            op.facilitas_volume_cont        = $('.facilitas_vol_container',op.video_container);
            op.facilitas_help               = $('.facilitas_help',op.video_container);
            op.facilitas_help_btn           = $('.facilitas_btn_help',op.video_container);
            op.facilitas_viewport           = $('.facilitas_btn_viewport',op.video_container);
            op.facilitas_tags               = $('.facilitas_tags',op.video_container);
            op.facilitas_tags_goto          = $('.facilitas_tags_goto',op.video_container);
            op.facilitas_stickers           = $('.facilitas_stickers',op.video_container);
            op.facilitas_progress           = $('.facilitas_progress',op.video_container);
            op.facilitas_toolbar            = $('.facilitas_toolbar',op.video_container);
            op.facilitas_subtitle           = $('.facilitas_subtitle',op.video_container);
            op.facilitas_light_toggle       = $('.facilitas_btn_light',op.video_container);
            op.facilitas_loading            = $('.facilitas_loading',op.video_container);
            op.facilitas_caption_search     = $('.facilitas_caption_search',op.video_container);
            op.facilitas_search_form        = $('.facilitas_fsearch',op.video_container);
            op.facilitas_search_result      = $('.facilitas_search_result',op.video_container);
            op.facilitas_search_input       = $('.facilitas_search_input',op.video_container);
            op.facilitas_search_inputbtn    = $('.facilitas_btn_inputsearch',op.video_container);
            op.facilitas_sidebar_close      = $('.facilitas_sidebar_close',op.video_container);
            op.facilitas_settings           = $('.facilitas_settings',op.video_container);
            op.facilitas_toolbarposition    = $('.facilitas_toolbarposition',op.video_container);
            op.facilitas_language           = $('.facilitas_language',op.video_container);
            op.facilitas_fontfamily         = $('.facilitas_fontfamily',op.video_container);
            op.facilitas_fontbackground     = $('.facilitas_fontbackground',op.video_container);
            op.facilitas_fontcolor          = $('.facilitas_fontcolor',op.video_container);
            op.facilitas_fontsize           = $('.facilitas_fontsize',op.video_container);
            op.facilitas_transcript         = $('.facilitas_transcript',op.video_container);
            op.facilitas_transcript_btn     = $('.facilitas_transcript_btn',op.video_container);
        },
        
        /**
         * initInstances
         * @desc Initialize all instances that require custom initialization
         */
        initInstances: function(elem) {
            // Get reference
            var video = this;
            var op = this.options;
            // Check if this has not been initialized
            if(op.init == false) {
                // Get duration
                var video_duration = op.videoObject.duration;
                // Initialize seek (progress bar) slider
                op.facilitas_video_seek.slider({
                    value: 0,
                    step: 0.01,
                    orientation: "horizontal",
                    range: "min",
                    max: video_duration,
                    animate: true,                  
                    slide: function(e,ui){
                        video.timeUpdate(ui.value);
                        op.seekSliding = true;
                    },
                    stop:function(e,ui){
                        op.seekSliding = false;
                    },
                    change: function(e,ui) {
                        video.updateBufferRange();
                    }
                });
                op.facilitas_video_seek.val(30);
                
                
                // Initialize buffer bar slider
                op.facilitas_video_buffer.slider({
                    range: true,
                    disabled:true,
                    min: 0,
                    max: 100,
                    values: [0,100]
                });
            
                // Initialize volume slider
                op.facilitas_volume_slider.slider({
                    // Default initial volume
                    value: op.initVolume,
                    orientation: "vertical",
                    range: "min",
                    max: 1,
                    step: 0.1,
                    animate: true,
                    slide:function(e,ui){
                        video.toggleMute(ui.value);
                    }
                });

                // Sets initial speed
                video.playbackRate = op.videoSpeed;
                
                // Sets initial volume
                video.$elem.prop("volume",op.initVolume);

                // Add tag stickers
                if(op.hasTags) {
                    
                    // Get video max bar value
                    var maxLength = op.facilitas_video_seek.slider("option","max");
                    
                    $("a",op.facilitas_tags).each(function() {
                        // Get time position
                        var time = $(this).attr("href").substr(1);

                        // Transform into seconds
                        time = video.secondsTimeFormat(time);

                        // Calculate left position
                        var leftPos = time*100/maxLength,
                            title = $(this).attr('title');
                        
                        // Append new sticker
                        op.facilitas_stickers.append('<li style="left:'+leftPos+'%"><a href="#" title="'+title+'"><span class="fac-sr-only">'+title+'</span></a></li>');
                    })
                }
                
                
                // Sets initialized as true
                op.init = true;
            }
        },
        /**
         * bindControlActions
         * @desc Binds all actions to enable all controllers
         */
        bindControlActions: function() {
            // Get reference
            var video = this;
            var op = this.options;
            
            // Play button
            op.facilitas_play.on("click", function(e) {
                video.play();
                e.preventDefault();
                return false;
            });


            // Toggle play on video click
            this.$elem.on("click", function(e) {
                video.play();
                e.preventDefault();
                return false;
            });

            // Stop button
            op.facilitas_stop.on("click", function(e) {
                video.stop();
                e.preventDefault();
                return false;
            });
            
            // Speed Down Button
            op.facilitas_speeddown.on("click", function(e) {
                video.rewind();
                e.preventDefault();
                return false;
            });
            
            // Speed Up Button
            op.facilitas_speedup.on("click", function(e) {
                video.forward();
                e.preventDefault();
                return false;
            });
            
            // Fullscreen (Viewport) Button
            op.facilitas_viewport.on("click", function(e) {
                video.toggleFullScreen();
                e.preventDefault();
                return false;
            });
            
            // Light toggle
            op.facilitas_light_toggle.on("click", function(e) {
               video.toggleLight();
               
               e.preventDefault();
               return false;
            });
            
            // Search sidebar toggle
            op.facilitas_search_btn.on("click", function(e) {
                video.toggleCaptionSearchSidebar();

                e.preventDefault();
                return false;
            });
            // Settings sidebar toggle
            op.facilitas_settings_btn.on("click", function(e) {
                video.toggleSettingsSidebar();    
               
                e.preventDefault();
                return false;
            });

            // Settings sidebar toggle
            op.facilitas_transcript_btn.on("click", function(e) {
                video.toggleTranscriptSidebar();    
                e.preventDefault();
                return false;
            });

            // Help
            op.facilitas_help_btn.on("click", function(e) {
                video.toggleHelp();
               
                e.preventDefault();
                return false;
            });
            
            // Sidebar close
            op.facilitas_sidebar_close.on("click", function(e) {
                var type = $(this).attr('data-type');
                video.closeSidebar(type);
               
               e.preventDefault();
               return false;
            });
            
            
            // Mute button
            op.facilitas_volume_btn
                .on("click", function(e) {
                    video.toggleMute(null);
                    
                    e.preventDefault();
                    return false;
                });

            op.facilitas_volume
                // Volume enter
                .on("mouseenter", function() {
                    video.showVolumeBar();
                })
                // Volume leave
                .on("mouseleave", function() {
                    video.hideVolumeBar();
                });
            
            // Search result
            op.facilitas_search_result.on("click","a",function(e) {
                // Get time position
                var time = $(this).attr("href").substr(1);
                
                video.goTo(time);
                
                // Prevent anchor
                e.preventDefault();
                return false;
            });
            
            // Tags
            op.facilitas_tags.on("click", "a", function(e) {
                // Get time position
                var time = $(this).attr("href").substr(1);
                
                // Get seconds
                var time = video.secondsTimeFormat(time);
                
                // Update
                video.timeUpdate(time);
                
                // Prevent anchor
                e.preventDefault();
                return false;
            })
            // Tags hover
            .on("mouseenter","li", function(a) {
                // Get index
                var index = $(this).index();
                
                // Highlight tag element
                op.facilitas_stickers.find("li:nth-child("+(index+1)+") a").addClass("facilitas_selected");
                
            }).on("mouseleave","li",function() {
                // Highlight tag element
                $(".facilitas_selected",op.facilitas_stickers).removeClass("facilitas_selected");
                
            });
            // Stickers hover
            op.facilitas_stickers.on("mouseenter","li", function(a) {
                // Get index
                var index = $(this).index();
                
                // Highlight tag element
                op.facilitas_tags.find("li:nth-child("+(index+1)+") a").addClass("facilitas_selected");
            }).on("mouseleave","li", function() {
                // Highlight tag element
                $(".facilitas_selected",op.facilitas_tags).removeClass("facilitas_selected");
            }).on("click", function(e) {
                // Do nothing
                e.preventDefault();
                return false;
            });
            
            
            // Toggle Light Button
            op.video_container.on({
               "mouseenter": function() {
                   // Show Light Button if not in fullscreen
                    if(!op.isFullscreen)
                        video.showLightBtn();
               },
               "mouseleave": function() {
                   // Hide Light Button
                   if(!op.isFullscreen)
                        video.hideLightBtn();
               }
            });
            
            // Search form
            op.facilitas_search_form.on("submit", function() {
               video.searchSubtitle();
               return false;
            });
            
            // Search form input
            op.facilitas_search_inputbtn.on("click",function(e) {
                // Submit parent form
                video.searchSubtitle();
               
                // Prevent anchor
                e.preventDefault();
                return false;
            });
            
            // Change Light Bg on resize
            $(window).resize(function() {
                video.updateLightPos(false);
            });
            

            // Subtitle font-family change
            op.facilitas_language.on("change", function() {
                $("option:selected",$(this)).each(function() {
                    // Get language
                    var val = $(this).val();

                    // Check if it's not the current language
                    if(val != op.language) {
                        // Updates current language
                        op.language = val;

                        // Render language
                        video.renderLanguage();
                    }
               }) 
            });

            // Subtitle background change
            op.facilitas_fontbackground.on("change", function() {
                $("option:selected",$(this)).each(function() {
                    var val = $(this).val(),
                        bg = null,
                        classes = 'nobackground black halfblack white halfwhite';

                    op.facilitas_subtitle.removeClass(classes);
                    switch(val) {
                        case "none":
                            op.facilitas_subtitle.addClass('nobackground');
                            break;
                        case "black":
                            op.facilitas_subtitle.addClass('black');
                            break;
                        case "halfblack":
                            op.facilitas_subtitle.addClass('halfblack');
                            break;
                        case "white":
                            op.facilitas_subtitle.addClass('white');
                            break;
                        case "halfwhite":
                            op.facilitas_subtitle.addClass('halfwhite');
                            break;
                        default:
                            op.facilitas_subtitle.addClass('nobackground');
                            break;
                   }
                   
               }) 
            });

            // Subtitle font-family change
            op.facilitas_fontfamily.on("change", function() {
               $("option:selected",$(this)).each(function() {
                   var val = $(this).val();
                   op.facilitas_subtitle.css("font-family",val);
               }) 
            });
            
            // Subtitle font-color keyup
            op.facilitas_fontcolor.on("keyup", function() {
               var val = $(this).val();
               video.changeColor(val);
            });
            
            // Subtitle font-size change
            op.facilitas_fontsize.on("change", function() {
               $("option:selected",$(this)).each(function() {
                   var val = $(this).val();
                   op.facilitas_subtitle.css({
                       "font-size": (val+"pt"),
                       "line-height" : (val+"pt")
                   });
                   video.subtitleFontUpdate();
               }) 
            });
            
            
        }, 
        
        /**
         * bindVideoActions
         * @desc Binds all actions provided by video usage
         */
        bindVideoActions: function() {
            // Reference
            var video = this;
            var op = this.options;

            // Add Play Class
            video.$elem.bind("play", function() {
                video.hideLoading();
                op.facilitas_play.removeClass("facilitas_btn_play").addClass("facilitas_btn_pause").html('<span class="fac-i-pause"></span>');
            })
            // Add Pause Class 
            .bind("pause", function() {
                op.facilitas_play.removeClass("facilitas_btn_pause").addClass("facilitas_btn_play").html('<span class="fac-i-play"></span>');
            })
            
            // Change state Class
            .bind("playing loadedmetadata updateMediaState canplay", function() {
                video.initInstances();
            })
            
            // Start looking for media data
            .bind("loadstart", function() {
                video.showLoading();
            })
            
            // Loaded data
            .bind("canplay canplaythrough loadeddata", function() {
                video.hideLoading();
            })
            
            // Watining
            .bind("stalled waiting", function() {
                video.showLoading();
            })
            
            
            // Update time
            .bind('timeupdate', function() {
                 // Update bar
                 video.seekUpdate();
                 
                 // Update subtitle
                 if(op.subtitle) {
                    video.subtitleUpdate();
                 }
                 // Update closed caption
                 if(op.closedCaption) {
                     video.closedCaptionUpdate();
                 }
            })
            
            // Update volume
            .bind('volumechange', function() {
                 video.volumeUpdate();
            })
            
            // Update buffer
            .bind('progress', function() {
                 video.bufferUpdate();
            });
            
        },
        
        /**
         * bindKeyboardShortcuts
         * @desc Bind all keyboard related shortcuts
         */
        bindKeyboardShortcuts: function() {
            var video = this;
            var op = this.options;
            $(document).on("keyup",function(e) {
                // Check if anything has focus
                if($("input").is(":focus") || $("textarea").is(":focus"))
                    return false;

                switch(e.which) {
                    // P - Play/Stop
                    case 80:
                        video.play();
                        break;

                    // T - Transcript
                    case 84:
                        video.toggleTranscriptSidebar();
                        break;

                    // C - Toggle Subtitle (Closed Caption)
                    case 67:
                        video.toggleSubtitle();
                        break;

                    // A - Toggle Audio Description
                    case 65:
                        if(op.facilitas_audiodesc)
                            video.toggleAdMute(null);

                        break;

                    // M - Toggle Mute
                    case 77:
                        video.toggleMute(null);
                        break;

                    // V - Volume - 20%
                    case 66:
                        if(op.init)
                            video.increaseVolume();
                        break;

                    // B - Volume + 20%
                    case 86:
                        if(op.init)
                            video.decreaseVolume();
                        break;

                    // Z - AD Volume - 20%
                    case 88:
                        if(op.init)
                            video.increaseAdVolume();
                        break;

                    // X - AD Volume + 20%
                    case 90:
                        if(op.init)
                            video.decreaseAdVolume();
                        break;

                    // S - Show Caption Search Sidebar
                    case 83:
                        video.toggleCaptionSearchSidebar();
                        break;

                    // F - Toggle Fullscreen
                    case 70:
                        video.toggleFullScreen();
                        break;

                    // H - Show Help Sidebar
                    case 72:
                        video.toggleHelp();
                        break;

                    // E - Speed Down
                    case 69:
                        video.speedDown();
                        break;

                    // R - Speed Up
                    case 82:
                        video.speedUp();
                        break;

                    // Q - Stop
                    case 81:
                        video.stop();
                        break;

                    // Y - Rewind
                    case 89:
                        video.rewind();
                        break;

                    // U - Forward
                    case 85:
                        video.forward();
                        break;

                    default:
                        break;
                }                
            });
        },
        
        /**
         * checkSupport
         * @desc Check needed browser support
         */
        checkSupport:function() {
            var video = this;
            var op = this.options;
            if (typeof document.cancelFullScreen != 'undefined') {
                video.supportsFullScreen = true;
            } else {
                // check for fullscreen support by vendor prefix
                for (var i = 0; i < op.browserPrefixes.length; i++ ) {
                    op.browserPrefix = op.browserPrefixes[i];
                    if (typeof document[op.browserPrefix + 'CancelFullScreen' ] != 'undefined' ) {
                        op.supportsFullScreen = true;
                        break;
                    }
                }
                
                // Check for speed change support
                if(op.browserPrefix!="webkit") {
                    video.disableBtn(op.facilitas_speedup);
                    video.disableBtn(op.facilitas_speeddown);
                    op.supportsSpeedChange = false;
                } else {
                    op.supportsSpeedChange = true;
                }
            }
        },

        /**
         * checkAdditionalLanguages
         * @desc Checks if any additional language is available
         */
        checkAdditionalLanguages : function() {
            var op = this.options;
            // Try to load all languages
            for(var i=0, n=op.availableLanguages.length;i<n;i++) {
                var current = op.availableLanguages[i];
                // Check if current position in array is not the default language
                if(current != op.language) {
                    // Load language
                    this.getLanguage(current);
                }
            }
        },

        /**
         * getLanguage
         * @desc Get language from a file and append to settings
         */
        getLanguage : function(language) {
            var op = this.options;
            $.getJSON(op.baseLangFolder+"FacilitasLang/"+language+".js",function(data) {
                // Append to array
                op.lang[language] = data;

                // Append to Settings
                op.facilitas_language.append('<option value="'+data.about.file+'" title="'+data.about.title+'">'+data.about.title+'</option>')
            });
        },
        
        /**
         * renderLanguage
         * @desc Renders template translating to the language assigned
         */
        renderLanguage : function () {
            var op = this.options;
            var e = op.video_container;

            /*************************************  
             * Caption Search Sidebar
             */
            var parentTag = $(".facilitas_caption_search",e); 
            // Title
            parentTag.find(".facilitas_sidebar_title")
                .attr("title",op.lang[op.language].sidebarSearch.title)
                .find("span.title").html(op.lang[op.language].sidebarSearch.title)
                .siblings("button")
                    .attr("title",op.lang[op.language].buttons.close);

            // Input
            parentTag.find(".facilitas_search_input")
                .attr("title",op.lang[op.language].sidebarSearch.input)
                .attr("title",op.lang[op.language].sidebarSearch.input);

            // Input Submit
            parentTag.find(".facilitas_btn_inputsearch")
                .attr("title",op.lang[op.language].sidebarSearch.button);

            /*************************************  
             * Transcript Sidebar
             */
            op.facilitas_transcript
                .find('span.title').html(op.lang[op.language].sidebarTranscript.title)
                .siblings('button')
                    .attr('title',op.lang[op.language].buttons.close);
            /*************************************  
             * Settings Sidebar
             */
            parentTag = $(".facilitas_settings",e); 
            // Title
            parentTag.find(".facilitas_sidebar_title")
                .attr("title",op.lang[op.language].sidebarSettings.title)
                .find("span.title").html(op.lang[op.language].sidebarSettings.title)
                .siblings("button")
                    .attr("title",op.lang[op.language].buttons.close);

            // Language Select
            parentTag.find("label[for=facilitas_language]")
                .attr("title",op.lang[op.language].sidebarSettings.language.title)
                .html(op.lang[op.language].sidebarSettings.language.title)
                .siblings("select")
                .attr("title",op.lang[op.language].sidebarSettings.language.title);
                
            // Toolbar
            parentTag.find("label[for=facilitas_toolbarPosition]")
                .attr("title",op.lang[op.language].sidebarSettings.toolbar.position.title)
                .html(op.lang[op.language].sidebarSettings.toolbar.position.title)
                .siblings("select")
                .attr("title",op.lang[op.language].sidebarSettings.toolbar.position.title)
                .find("option")
                .attr("title",op.lang[op.language].sidebarSettings.toolbar.position.posBottom)
                .html(op.lang[op.language].sidebarSettings.toolbar.position.posBottom);
                
            // Font style
            parentTag.find("label[for=captionStyleTitle]")
                .attr("title",op.lang[op.language].sidebarSettings.caption.captionStyle)
                .html(op.lang[op.language].sidebarSettings.caption.captionStyle)

            // Background-Color
            .siblings("label[for=facilitas_fontbackground]")
                .attr("title",op.lang[op.language].sidebarSettings.caption.backgroundColor.title)
                .html(op.lang[op.language].sidebarSettings.caption.backgroundColor.title)
            
            .siblings(".facilitas_fontbackground")
                .attr("title",op.lang[op.language].sidebarSettings.caption.backgroundColor.title)
                .html(
                    '<option value="none" selected="selected" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opNoBackground+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opNoBackground+'</option>'
                    +'<option value="black" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opBlack+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opBlack+'</option>'
                    +'<option value="halfblack" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opTransBlack+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opTransBlack+'</option>'
                    +'<option value="white" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opWhite+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opWhite+'</option>'
                    +'<option value="halfwhite" title="'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opTransWhite+'">'+op.lang[op.language].sidebarSettings.caption.backgroundColor.opTransWhite+'</option>'
                    )

            // Font-Family
            .siblings("label[for=facilitas_fontfamily]")
                .attr("title",op.lang[op.language].sidebarSettings.caption.fontFamily)
                .html(op.lang[op.language].sidebarSettings.caption.fontFamily)
            .siblings(".facilitas_fontfamily")
                .attr("title",op.lang[op.language].sidebarSettings.caption.fontFamily);

            // Font-color
            parentTag.find("label[for=facilitas_fontcolor]")
                .attr("title",op.lang[op.language].sidebarSettings.caption.fontColor)
                .html(op.lang[op.language].sidebarSettings.caption.fontColor)
            
            // Font-Size
            parentTag.find("label[for=facilitas_fontsize]")
                .attr("title",op.lang[op.language].sidebarSettings.caption.fontSize)
                .html(op.lang[op.language].sidebarSettings.caption.fontSize)
            .siblings (".facilitas_fontsize")
                .attr("title",op.lang[op.language].sidebarSettings.caption.fontSize)
                
            /*************************************  
             * Lights
             */
            var parentTag = $(".facilitas_btn_light",e); 
            if(op.isLightOn)
                parentTag
                    .attr("title",op.lang[op.language].lights.turnOn).removeClass('active');
            else
                parentTag
                    .attr("title",op.lang[op.language].lights.turnOff).addClass('active');

            /*************************************  
             * Toolbar
             */
            // Play
            op.facilitas_play
                .attr("title",op.lang[op.language].toolbar.play);

            // Stop
            op.facilitas_stop
                .attr("title",op.lang[op.language].toolbar.stop);
            
            // Speed Down
            op.facilitas_speeddown
                .attr("title",op.lang[op.language].toolbar.speeddown);
            
            // Speed Up
            op.facilitas_speedup
                .attr("title",op.lang[op.language].toolbar.speedup);
            
            // Time
            op.facilitas_video_timer
                .attr("title",op.lang[op.language].toolbar.time);
                
            // Search
            op.facilitas_search_btn
                .attr("title",op.lang[op.language].toolbar.search);
            
            // Caption
            op.facilitas_cc
                .attr("title",op.lang[op.language].toolbar.caption);
            
            // Transcript
            op.facilitas_transcript_btn
                .attr("title",op.lang[op.language].toolbar.transcript);
            
            // Settings
            op.facilitas_settings_btn
                .attr("title",op.lang[op.language].toolbar.settings);

            // Volume
            op.facilitas_volume
                .attr("title",op.lang[op.language].toolbar.volume);
            
            // Viewport
            op.facilitas_viewport
                .attr("title",op.lang[op.language].toolbar.viewport);
            
            /*************************************  
             * Help
             */
            op.facilitas_help
                // Title
                .find(".facilitas_help_title")
                    .attr("title",op.lang[op.language].help.title)
                    .html(op.lang[op.language].help.title)
                // Shortcuts
                .siblings(".facilitas_help_content").first()
                .find("ul")
                .html('<li title="'+op.lang[op.language].help.keyboard+'"><strong>'+op.lang[op.language].help.keyboard+'</strong></li>'
                    +'          <li title="P - '+op.lang[op.language].help.play+'"><strong>P</strong>'+op.lang[op.language].help.play+'</li>'
                    +'          <li title="Q - '+op.lang[op.language].help.stop+'"><strong>Q</strong>'+op.lang[op.language].help.stop+'</li>'
                    +'          <li title="S - '+op.lang[op.language].help.search+'"><strong>S</strong>'+op.lang[op.language].help.search+'</li>'
                    +'          <li title="E - '+op.lang[op.language].help.speeddown+'"><strong>E</strong>'+op.lang[op.language].help.speeddown+'</li>'
                    +'          <li title="R - '+op.lang[op.language].help.speedup+'"><strong>R</strong>'+op.lang[op.language].help.speedup+'</li>'
                    +'          <li title="T - '+op.lang[op.language].help.rewind+'"><strong>T</strong>'+op.lang[op.language].help.rewind+'</li>'
                    +'          <li title="Y - '+op.lang[op.language].help.forward+'"><strong>Y</strong>'+op.lang[op.language].help.forward+'</li>'
                    +'          <li title="T - '+op.lang[op.language].help.transcript+'"><strong>T</strong>'+op.lang[op.language].help.transcript+'</li>'
                    +'          <li title="C - '+op.lang[op.language].help.caption+'"><strong>C</strong>'+op.lang[op.language].help.caption+'</li>'
                    +'          <li title="M - '+op.lang[op.language].help.volume+'"><strong>M</strong>'+op.lang[op.language].help.volume+'</li>'
                    +'          <li title="V - '+op.lang[op.language].help.decreaseVol+'"><strong>V</strong>'+op.lang[op.language].help.decreaseVol+'</li>'
                    +'          <li title="B - '+op.lang[op.language].help.increaseVol+'"><strong>B</strong>'+op.lang[op.language].help.increaseVol+'</li>'
                    +'          <li title="A - '+op.lang[op.language].help.adVolume+'"><strong>A</strong>'+op.lang[op.language].help.adVolume+'</li>'
                    +'          <li title="Z - '+op.lang[op.language].help.adDecreaseVol+'"><strong>Z</strong>'+op.lang[op.language].help.adDecreaseVol+'</li>'
                    +'          <li title="X - '+op.lang[op.language].help.adIncreaseVol+'"><strong>X</strong>'+op.lang[op.language].help.adIncreaseVol+'</li>'
                    +'          <li title="F - '+op.lang[op.language].help.viewport+'"><strong>F</strong>'+op.lang[op.language].help.viewport+'</li>'
                    +'          <li title="H - '+op.lang[op.language].help.help+'"><strong>H</strong>'+op.lang[op.language].help.help+'</li>');
            
            // About
            op.facilitas_help
                .find(".facilitas_help_about ul")
                .html('<li>Facilitas Player v'+op.version+'</li>'
                    +'          <li>'+op.lang[op.language].help.developed+' <a href="mailto:contato@brunoramos.eti.br" title="Bruno Ramos">Bruno Ramos</a></li>'
                    +'          <li><a href="'+op.aboutUrl+'" target="_blank" title="Facilitas Player">'+op.aboutUrl+'</a></li>');

             /*************************************  
             * Tags
             */
            if(op.hasTags)
                op.facilitas_tags_goto
                    .attr("title",op.lang[op.language].tags.goTo)
                    .html(op.lang[op.language].tags.goTo+":");

        },

        /**
         * prepareSubtitle
         * @desc Loads subtitle and prepare to execute
         */
        prepareSubtitle: function() {
            var video = this,
                op = this.options,
            // Initialize src
                subtitleSrc = op.subtitleSrc;
            
            // Find all tracks
            video.$elem.children().each(function() {
                var el = $(this).get(0);
                if(el.nodeName.toLowerCase() == "track" && el.getAttribute("kind") == "subtitle") {
                    // Get source
                    subtitleSrc = el.getAttribute("src");
                }
            });
            

            // Check if any src has been found
            if(subtitleSrc) {
                // Check if it's a srt file
                if(subtitleSrc.indexOf(".srt") != -1) {
                    // Start preparing subtitle
                    
                    // Update font size
                    video.subtitleFontUpdate();
                    
                    // Load subtitle
                    $.get(subtitleSrc, function(data) {
                        if(data.length > 0) {
                            // Initialize
                            op.subtitle = new Array();
                            
                            // Get all entries
                            var entries = data.split('\n\n');
                            var n = entries.length;
                            // For each entry, split it into lines
                            for(var i=0;i<n;i++) {
                                // Adds to the subtitle var
                                op.subtitle[i] = entries[i].split('\n');
                            }
                            
                            // Store total
                            op.subtitleTotal = n;
                            
                            // Enable subtitle button
                            video.enableSubtitleBtn();

                        } else {
                            video.disableBtn(op.facilitas_search_btn);
                            if (op.debug) video.trace("Invalid subtitle source. Maybe using a cross-domain source?"); 
                        }
                    });
                } else {
                    video.disableBtn(op.facilitas_search_btn);
                    if(op.debug) video.trace("Not a valid subtitle source. File must be \".srt\"."); 
                }
            } else {
                video.disableBtn(op.facilitas_search_btn);
                if(op.debug) video.trace("No subtitle track found."); 
            }
            
        },
        
        /**
         * Prepare to load audio description file
         */
        prepareAudiodescription: function() {
            var video = this,
                op = this.options,
                audioList,
                type,
                ext;

            if(op.audiodescription) {
                // Get list of audios
                audioList = op.audiodescription.split(';');

                op.facilitas_audiodesc = $('<audio class="facilitas_audiodesc" preload="auto"></audio>');
                for(var i in audioList) {
                    ext = audioList[i].split('.');
                    ext = ext[ext.length-1];
                    switch(ext) {
                        case "ogg":
                            type = 'audio/ogg';
                            break;
                        case "mp3":
                            type = 'audio/mpeg';
                            break;
                    }

                    op.facilitas_audiodesc.append('<source src="'+audioList[i]+'" type="'+type+'"></source>');
                }
                op.video_container.append(op.facilitas_audiodesc);

                // Append button
                op.facilitas_search_btn.parent().before(+''
                    +'          <li>'
                    +'            <a href="javascript:void();" class="facilitas_btn_audiodesc" title="'+op.lang[op.language].toolbar.audiodesc+'">'
                    +'              <span class="advol_status fac-i-audio-desc"></span>'
                    +'              <div class="facilitas_btn_container ad"></div>'
                    +'              <div class="facilitas_advol_container">'
                    +'                  <div class="facilitas_advol_wrapper">'
                    +'                      <div class="facilitas_control_advolume_slider"></div>'
                    +'                  </div>'
                    +'              </div>'
                    +'            </a>'
                    +'          </li>');
                    // <li><button class="facilitas_btn_audiodesc" title="'+op.lang[op.language].toolbar.audiodesc+'"><span class="fac-i-audio-desc"></span></button></li>');
                op.facilitas_audiodesc_btn = op.video_container.find('.facilitas_btn_audiodesc');


                // Get Instances
                op.facilitas_advolume             = $('.facilitas_btn_audiodesc',op.video_container);
                op.facilitas_advolume_btn         = $('.facilitas_btn_container.ad',op.video_container);
                op.facilitas_advolume_status      = $('.advol_status',op.video_container);
                op.facilitas_advolume_slider      = $('.facilitas_control_advolume_slider',op.video_container);
                op.facilitas_advolume_cont        = $('.facilitas_advol_container',op.video_container);

                // Initialize volume slider
                op.facilitas_advolume_slider.slider({
                    // Default initial volume
                    value: op.initAdVolume,
                    orientation: "vertical",
                    range: "min",
                    max: 1,
                    step: 0.1,
                    animate: true,
                    slide:function(e,ui){
                        video.toggleAdMute(ui.value);
                    }
                });

                // Sets initial volume
                op.facilitas_audiodesc.prop("volume",op.initAdVolume);

                // Bind events
                op.facilitas_advolume
                    // Volume enter
                    .on("mouseenter", function() {
                        video.showAdVolumeBar();
                    })
                    // Volume leave
                    .on("mouseleave", function() {
                        video.hideAdVolumeBar();
                    })
                    .on("click", function(e) {
                        video.toggleAdMute(null);
                        
                        e.preventDefault();
                        return false;
                    });

                // Update volume
                op.facilitas_audiodesc.bind('volumechange', function() {
                     video.adVolumeUpdate();
                })

                // Start Listeners
                video.startAudiodescListeners();
            }
        },

        /**
         * Load and prepare video transcript file
         */
        prepareTranscripts: function() {
            var video = this,
                op = this.options,
                transcriptSrc;

            // Find all tracks
            video.$elem.children().each(function() {
                var el = $(this).get(0);
                if(el.nodeName.toLowerCase() == "track" && el.getAttribute("kind") == "transcript") {
                    // Get source
                    transcriptSrc = el.getAttribute("src");
                }
            });


            // Check if any src has been found
            if(transcriptSrc) {
                // Check if it's a srt file
                if(transcriptSrc.indexOf(".txt") != -1) {
                    // Load transcript
                    $.get(transcriptSrc, function(data) {
                        if(data.length > 0) {
                            // Initialize
                            op.transcripts = new Array();
                            
                            // Get all entries
                            var entries = data.split('\n'),
                                n = entries.length,
                                parent = op.facilitas_transcript.find('ol'),
                                id = 'fac-'+Date.now();

                            op.facilitas_transcript.attr('id', id);

                            // Store total
                            op.transcriptTotal = n;

                            // Append to DOM
                            for(var i in entries)
                                parent.append('<li>'+entries[i]+'</li>');
                            
                            // Enable transcript button
                            video.enableTranscriptBtn();

                            // Start weblibras, if available
                            if(typeof(WebLibras) == 'function')
                                new WebLibras('#'+id);

                        } else {
                            video.disableBtn(op.facilitas_transcript_btn);
                            if (op.debug) video.trace("Invalid transcript source. Maybe using a cross-domain source?"); 
                        }
                    });
                } else {
                    video.disableBtn(op.facilitas_transcript_btn);
                    if(op.debug) video.trace("Not a valid subtitle source. File must be \".srt\"."); 
                }
            } else {
                video.disableBtn(op.facilitas_transcript_btn);
                if(op.debug) video.trace("No transcript track found."); 
            }
        },

        /**
         * Create listeners to sync video and audio description
         */
        startAudiodescListeners: function() {
            var $video = this.$elem,
                $ad = this.options.facilitas_audiodesc,
                video = this,
                videoElem = this.$elem[0],
                audio = $ad[0],
                handler = null; // Handler will be used so it doesn't end in a infinite event loop

            // Video listeners
            $video
                .on('play', function() {
                    audio.play();

                    if(handler == 'ad')
                        handler = null;
                    else
                        handler = 'video';
                })
                .on('pause', function(){
                    audio.pause();

                    if(handler == 'ad')
                        handler = null;
                    else
                        handler = 'video';
                });

            // Detect time update through slidebar
            $(window).on('fac-ad-updateTime', function() {
                $ad.prop('currentTime', $video.prop('currentTime'));
            });

            // Audio Description Listeners - in case audio stops to buffer
            $ad
                .on('play', function() {
                    if(handler == 'video') {
                        handler = null;
                    } else {
                        handler = 'ad';
                        videoElem.play();
                        video.hideLoading();
                    }
                })
                .on('pause', function(){
                    if(handler == 'video') {
                        handler = null;
                    } else {
                        handler = 'ad';
                        videoElem.pause();
                        video.showLoading();
                    }
                });
        },

        /**
         * Play
         * @desc Toggle between Play/Stop the video
         */
        play: function() {
            // Get reference
            var video = this.options.videoObject;
            
            // Check video state and then change it
            if(video.paused) {
                video.play();
            } else {
                video.pause();
            }
        },

        /**
         * Stop
         * @desc Stops video, moving current cursor to position 0 and pausing the video
         */
        stop: function() {
            // Get reference
            var video = this.options.videoObject;
            
            video.pause();
            video.currentTime = 0;

            if(this.options.audiodescription)
                this.options.facilitas_audiodesc[0].currentTime = 0;
        },

        /**
         * toggleCCBtn
         * @desc Toggles CC inner button
         */
        toggleCCBtn: function(type) {
            var video = this;
            var op = this.options;
            switch(type) {
                case "CC":
                    video.toggleClosedCaption();
                    break;
                case "SE":
                    video.toggleSubtitle();
                    break;
                default:
                    if(op.debug) video.trace("Invalid type. => " + type);
                    break;
            }
        },
        
        /**
         * toggleSubtitle
         * @desc Toggles subtitle visibility
         */
        toggleSubtitle: function() {
            var op = this.options;
            var tag = op.facilitas_cc;
            
            // Check if it's disabled
            if(tag.hasClass("disabled")) {
                // Show
                tag.removeClass("disabled");
                op.facilitas_subtitle.show();
            } else {
                // Hide
                tag.addClass("disabled");
                op.facilitas_subtitle.hide();
            }
        },
        
        /**
         * Toggles mute/unmute on volume bar
         */
        toggleMute: function(val) {
            var video = this,
                op = this.options;
            if (val > 0){
                // Remove class
                op.facilitas_volume_status.removeClass('fac-i-sound-muted');
                (val >= .9)? op.facilitas_volume_status.removeClass('fac-i-sound-half').addClass('fac-i-sound-full') : op.facilitas_volume_status.removeClass('fac-i-sound-full').addClass('fac-i-sound-half');


                // Unmute
                video.$elem.prop('muted',false);

                video.$elem.prop("volume",val);
                
            } else {
                if(video.$elem.prop("muted") == true) {
                    // Remove class
                    op.facilitas_volume_status.removeClass('fac-i-sound-muted');
                    (val >= .9)? op.facilitas_volume_status.removeClass('fac-i-sound-half').addClass('fac-i-sound-full') : op.facilitas_volume_status.removeClass('fac-i-sound-full').addClass('fac-i-sound-half');

                    // Unmute
                    video.$elem.prop('muted',false);
                    
                    // Check if it has an old value
                    if(op.oldVol != null) {
                        video.$elem.prop("volume",op.oldVol);
                        op.oldVol = null;
                    }
                    
                } else {
                    // Store old value
                    op.oldVol = op.facilitas_volume_slider.slider('value');
                    
                     // Add class
                    op.facilitas_volume_status.removeClass('fac-i-sound-full fac-i-sound-half').addClass('fac-i-sound-muted');
                    
                    // Mute
                    video.$elem.prop('muted',true);
                    
                    // Zero volume
                    video.$elem.prop('volume',0);
                }
            }
        },
        
        /**
         * Toggles mute/unmute on ad volume bar
         */
        toggleAdMute: function(val) {
            var video = this,
                op = this.options
                $ad = op.facilitas_audiodesc;

            if (val > 0){
                // Remove class
                op.facilitas_advolume_status.removeClass('fac-i-audio-desc-mute').addClass('fac-i-audio-desc');
                
                // Unmute
                $ad
                    .prop('muted',false)
                    .prop("volume",val);
                
            } else {
                if($ad.prop("muted") == true) {
                    // Remove class
                    op.facilitas_advolume_status
                        .removeClass('fac-i-audio-desc-mute')
                        .addClass('fac-i-audio-desc');

                    // Unmute
                    $ad.prop('muted',false);
                    
                    // Check if it has an old value
                    if(op.oldAdVol != null) {
                        $ad.prop("volume",op.oldAdVol);
                        op.oldAdVol = null;
                    }
                    
                } else {
                    // Store old value
                    op.oldAdVol = op.facilitas_advolume_slider.slider('value');
                    
                     // Add class
                    op.facilitas_advolume_status
                        .removeClass('fac-i-audio-desc')
                        .addClass('fac-i-audio-desc-mute');
                    
                    // Mute
                    $ad.prop('muted',true);
                    
                    // Zero volume
                    $ad.prop('volume',0);
                }
            }
        },
        
        /**
         * Rewind
         * @desc Rewind video 10s
         */
        rewind : function() {
            var video = this.options.videoObject;
            var time = video.currentTime;

            // Reduce time
            time = ((time - 10) < 0) ? 0 : time - 10;
            
            // Update time
            this.timeUpdate(time);
        },
        /**
         * Forward
         * @desc Forward video 10s
         */
        forward : function() {
            var video = this.options.videoObject;
            var time = video.currentTime;
            var duration = video.duration;

            // Raise time
            time = ((time + 10) > duration) ? duration : time + 10;
            
            // Update time
            this.timeUpdate(time);
        },

        /**
         * speedDown
         * @desc Speeds video down
         */
        speedDown : function() {
            var op = this.options;
            if(op.supportsSpeedChange) {
                // Changes current speed
                if(op.videoSpeed != 0.0625)
                    op.videoSpeed = op.videoSpeed / 2;
                
                // Update speed
                this.$elem.prop("playbackRate",op.videoSpeed);
                
                // Update speed display
                this.updateSpeedDisplay();
            }
        },
        /**
         * speedUp
         * @desc Speeds video up
         */
        speedUp : function() {
            var op = this.options;
            if(op.supportsSpeedChange) {
                // Changes current speed
                if(op.videoSpeed != 16)
                    op.videoSpeed = op.videoSpeed * 2;
                
                // Update speed
                this.$elem.prop("playbackRate",op.videoSpeed);
                
                // Update speed display
                this.updateSpeedDisplay();
            }
        },


        /**
         * updateSpeedDisplay
         * @desc Updates display showing current video's playback speed
         */
         updateSpeedDisplay: function() {
            var op = this.options;
            if(op.videoSpeed == 1)
                op.facilitas_speedwarning.hide();
            else
                op.facilitas_speedwarning.html(op.videoSpeed + "x").show();
         },

         /**
         * updateLightPos
         * @desc Updates light btn and bg position, setting it to the center of the screen
         * @params init Shows it's the first time it's called, therefore it animates
         */
        updateLightPos: function(init){
            var video   = this,
                op      = this.options,
            
                // Get video width and height
                v_width = (-1)*video.options.video_container.width()/2,
                v_height = (-1)*video.options.video_container.height()/2,
                // Get window width and height
                w_width = $(window).width(),
                w_height = $(window).height(),

                // Get top offset
                top = $(window).height()/2 - video.options.facilitas_toolbar.height();
            

            if(video.options.isLightOn || init) {
                op.video_container.appendTo(op.body);
                op.video_container.css({
                    position    :"fixed",
                    left        :"50%",
                    top         : top,
                    "margin-left"   :v_width,
                    "margin-top"    :v_height,
                });
                op.facilitas_light_bg.addClass('active');
            } else {
                op.facilitas_light_bg.removeClass('active');
            }
        },
        /**
         * toggleLight
         * @desc Toggles light
         */
        toggleLight: function() {
            var video = this;
            var op = this.options;
            // Light is on, turn it off
            if(!op.isLightOn) {
                //Display with opacity 0
                op.facilitas_light_bg.addClass('active');
                op.video_container.addClass('lightson');
                
                //Update Light position
                video.updateLightPos(true);
                
                // Add class
                op.facilitas_light_toggle.addClass("active");

                // Change Text
                op.facilitas_light_toggle.attr("title",op.lang[op.language].lights.turnOn);

                op.isLightOn = true;
            } else {
                // Light if off, turn it on
                // Animate
                op.video_container.css({
                    position:"relative",
                    left: 0,
                    top: 0,
                    "margin-left":0,
                    "margin-top":0
                }).appendTo(op.parent);

                // Animate bg
                op.facilitas_light_bg.removeClass('active');
                op.video_container.removeClass('lightson');
                
                // Remove class
                op.facilitas_light_toggle.removeClass("active");
                
                // Change Text
                op.facilitas_light_toggle.attr("title",op.lang[op.language].lights.turnOff);

                op.isLightOn = false;
            }
        },
        /**
         * toggleHelp
         * @desc Toggles help window
         */
         toggleHelp : function () {
            var op = this.options;
            if(op.helpIsOpen) {
                op.facilitas_help.fadeOut(100);
                op.helpIsOpen = false;
            } else {
                op.facilitas_help.fadeIn(100);
                op.helpIsOpen = true;
            }
         },

         /**
         * showVolumeBar
         * @desc Shows Volume Bar
         */
        showVolumeBar: function() {
            // Show
            this.options.facilitas_volume_cont.show();
        },
        
        /**
         * hideVolumeBar
         * @desc Hides Volume Bar
         */
        hideVolumeBar: function() {
            // Hide bar
            this.options.facilitas_volume_cont.hide();
        },

         /**
         * Show ad volume bar
         */
        showAdVolumeBar: function() {
            // Show
            this.options.facilitas_advolume_cont.show();
        },
        
        /**
         * Hide ad volume bar
         */
        hideAdVolumeBar: function() {
            // Hide bar
            this.options.facilitas_advolume_cont.hide();
        },

        /**
         * increaseVolume
         * @desc Increases volume in 20%
         */
        increaseVolume: function() {
            var op = this.options;
            // Get current volume
            var vol = op.facilitas_volume_slider.slider('value');
            // Increase 20%
            if(vol == 0) {
                this.toggleMute();
                vol = 0.2;
            } else {
                vol = (vol+0.2 > 1)? 1 : vol+0.2;    
            }
            // Update volume
            this.$elem.prop("volume",vol);
        },

        /**
         * decreaseVolume
         * @desc Decreases volume in 20%
         */
        decreaseVolume: function() {
            var op = this.options;
            // Get current volume
            var vol = op.facilitas_volume_slider.slider('value');
            // Decrease 20%
            if(vol-0.2 <= 0) {
                // Mute
                this.toggleMute();
            } else {
                // Update volume
                this.$elem.prop("volume",vol-0.2);
            }
        },
        
        /**
         * Increases ad volume in 20%
         */
        increaseAdVolume: function() {
            var op = this.options,
            // Get current volume
                vol = op.facilitas_advolume_slider.slider('value'),
                $ad = op.facilitas_audiodesc;

            // Increase 20%
            if(vol == 0) {
                this.toggleAdMute();
                vol = 0.2;
            } else {
                vol = (vol+0.2 > 1)? 1 : vol+0.2;    
            }
            // Update volume
            $ad.prop("volume",vol);
        },

        /**
         * Decreases ad volume in 20%
         */
        decreaseAdVolume: function() {
            var op = this.options,
            // Get current volume
                vol = op.facilitas_advolume_slider.slider('value'),
                $ad = op.facilitas_audiodesc;

            // Decrease 20%
            if(vol-0.2 <= 0) {
                // Mute
                this.toggleAdMute();
            } else {
                // Update volume
                $ad.prop("volume",vol-0.2);
            }
        },
        
        
        /**
         * cancelFullScreen
         * @desc Cancels fullscreen mode
         */
        cancelFullScreen: function() {
            var video = this,
                op = video.options;
            if(op.isFullscreen) {
                // Return to normal width
                video.$elem.width(video.$elem.prop("width"));

                // Disable fullscreen
                if(op.Prefix === '') {
                    video.cancelFullScreen();
                } else {
                    var pref = op.browserPrefix;
                    document[op.browserPrefix+"CancelFullScreen"]();
                }
                // Defines it's not in fullscreen mode
                op.isFullscreen = false;

                // Change button class, title and value
                op.facilitas_viewport
                    .removeClass("facilitas_btn_viewport_close")
                    .attr("title",op.lang[op.language].toolbar.viewport)
                    .html('<span class="fac-i-fullscreen-open"></span>');

                video.cancelFullscreenTimer();

                if(op.fullscreenToolbarHidden) {
                    op.facilitas_progress.fadeIn(200);
                    op.facilitas_toolbar.fadeIn(200);
                    op.fullscreenToolbarHidden = false;
                }
            }
        },
        
        
        /**
         * toggleFullScreen
         * @desc Toggles Fullscreen if it's available
         */
        toggleFullScreen : function() {
            var op = this.options;
            if(op.supportsFullScreen) {
                if(op.isFullscreen) {
                    this.cancelFullScreen();
                } else {
                    this.enableFullScreen();
                }
            } else {
                // No support for fullscreen
                alert("Seu navegador não suporta fullscreen!");
            }
        },

        /**
         * Hide progress bar and toolbar on full screen
         */
        hideFullscreenToolbar: function() {
            var op = this.options;


            if(op.isFullscreen && !op.fullscreenToolbarHidden && !op.fullscreenToolbarHover) {
                op.facilitas_progress.fadeOut(200);
                op.facilitas_toolbar.fadeOut(200);
                op.fullscreenToolbarHidden = true;
            }
        },

        /**
         * Set interval to display progress bar and toolbar on mouse movement while in fullscreen
         */
        startFullscreenTimer: function() {
            var video = this,
                op = video.options;

            op.fullscreenTimer = setInterval(function() { video.hideFullscreenToolbar(); }, op.fullscreenToolbarSpeed);
        },

        /**
         * Remove timer from fullscreen mode
         */
        cancelFullscreenTimer: function() {
            clearInterval(this.options.fullscreenTimer);
        },

        /**
         * enableSubtitleBtn
         * @desc Enables subtitle (closed caption) button if subtitle was successfully loaded
         */
        enableSubtitleBtn: function() {
            var video = this,
                op = video.options;
            
            // Remove opacity
            op.facilitas_cc.removeClass('disabled');

            // Add subtitle event
            op.facilitas_cc.off().on("click", function(e) {
                video.toggleSubtitle();

                e.preventDefault(); return false;
            })
        },

        /**
         * enableTranscriptBtn
         * @desc Enables transcript button if transcript was successfully loaded
         */
        enableTranscriptBtn: function() {
            var video = this,
                op = video.options;
            
            // Remove opacity
            op.facilitas_transcript_btn.removeClass('disabled');

            // Add subtitle event
            op.facilitas_transcript_btn.off().on("click", function(e) {
                video.toggleTranscriptSidebar();

                e.preventDefault(); return false;
            })
        },

        /**
         * enableFullScreen
         * @desc Enables fullscreen mode
         */
        enableFullScreen: function() {
            var video = this,
                op = video.options;
            if(!op.isFullscreen) {
                // Enable 100% width
                video.$elem.width("100%");
                
                // Enable fullscreen
                if(op.Prefix === '') {
                    video.requestFullScreen();
                } else {
                    var pref = op.browserPrefix;
                    op.video_container[0][op.browserPrefix+"RequestFullScreen"]();
                }
                // Defines it's in fullscreen mode
                op.isFullscreen = true;

                // Change button class, title and value
                op.facilitas_viewport
                    .addClass("facilitas_btn_viewport_close")
                    .attr("title",op.lang[op.language].toolbar.viewportClose)
                    .html('<span class="fac-i-fullscreen-close"></span>');

                // Enable fullscreen change event
                $(document).on("fullscreenchange mozfullscreenchange webkitfullscreenchange", function() {
                    // Hide light button
                    video.hideLightBtn();
                    
                    // Check if it's no longer in fullscreen
                    if(!video.fullScreenStatus()) {
                        op.isFullscreen = false;
                        video.cancelFullscreenTimer();
                        if(op.fullscreenToolbarHidden) {
                            op.facilitas_progress.fadeIn(200);
                            op.facilitas_toolbar.fadeIn(200);
                            op.fullscreenToolbarHidden = false;
                        }
                        video.$elem.width(video.$elem.prop("width"));
                    }
                    // Update subtitle font size
                    video.subtitleFontUpdate()
                });

                video.startFullscreenTimer();
            }
        },

        /**
         * showLightBtn
         * @desc Shows light toggle button
         */
        showLightBtn: function() {
            this.options.facilitas_light_toggle.fadeIn(100);
        },
        /**
         * hideLightBtn
         * @desc Hides light toggle button
         */
        hideLightBtn: function() {
            this.options.facilitas_light_toggle.fadeOut(100);
        },
        
        /**
         * showLoading
         * @desc Displays loading box
         */
        showLoading: function() {
            var op = this.options;
            if (!op.loading) {
                op.facilitas_loading.show();
                op.loading = true;
            }
        },
        /**
         * hideLoading
         * @desc Hides loading box
         */
        hideLoading: function() {
            var op = this.options;
            if(op.loading) {
                op.facilitas_loading.hide();
                op.loading = false;
            }
        },
        /**
         * closeSidebar
         * @desc Closes any sidebar
         */
        closeSidebar: function(type,callback) {
            if(this.options.sidebar_captionsearch && type == "search")
                this.hideCaptionSearchSidebar(function() { if(callback) callback(); });
            else if (this.options.sidebar_settings && type == "settings")
                this.hideSettingsSidebar(function() { if(callback) callback(); });
            else if (this.options.sidebar_transcript && type == "transcript")
                this.hideTranscriptSidebar(function() { if(callback) callback(); });
            
            else if(callback) callback();
        },
        
        /**
         * toggleCaptionSearchSidebar
         * @desc Toggles caption search sidebar
         */
        toggleCaptionSearchSidebar: function(callback) {
            // Cancel fullscreen
            this.cancelFullScreen();

            if(this.options.sidebar_captionsearch)
                this.hideCaptionSearchSidebar(function() { if(callback) callback();});
            else
                this.showCaptionSearchSidebar(function() { if(callback) callback();});
            
            
        },
        
        /**
         * showCaptionSearchSidebar
         * @desc Displays caption search sidebar
         */
        showCaptionSearchSidebar: function(callback) {
            this.hideSettingsSidebar();
            var op = this.options;
            var width = this.options.facilitas_caption_search.width()*(-1) -2;
            op.facilitas_caption_search.animate({right: width},200, function() {
                op.sidebar_captionsearch = true;
                op.facilitas_search_input.focus();
                if(callback) callback();
            });
        },
        /**
         * Hides settings sidebar
         */
        hideCaptionSearchSidebar: function(callback) {
            var op = this.options;
            op.facilitas_caption_search.animate({right:0},200, function() {
                op.sidebar_captionsearch = false;
                op.facilitas_search_btn.focus();
                if(callback) callback();
            });
        },
        
        /**
         * Toggles settings sidebar
         */
        toggleSettingsSidebar: function(callback) {
            this.cancelFullScreen();

            if(this.options.sidebar_settings)
                this.hideSettingsSidebar(function() {if(callback) callback();});
            else
                this.showSettingsSidebar(function() {if(callback) callback();});
        },

        /**
         * Toggles Transcript sidebar
         */
        toggleTranscriptSidebar: function(callback) {
            this.cancelFullScreen();

            if(this.options.sidebar_transcript)
                this.hideTranscriptSidebar(function() {if(callback) callback();});
            else
                this.showTranscriptSidebar(function() {if(callback) callback();});
        },
        
        /**
         * Displays settings sidebar
         */
        showSettingsSidebar: function(callback) {
            this.hideCaptionSearchSidebar();
            var op = this.options,
                width = this.options.facilitas_settings.width()*(-1) -2;
            op.facilitas_settings.animate({right: width},200, function() {
                op.sidebar_settings = true;
                op.facilitas_settings.find('select').first().focus();    
                if(callback) callback();
            });
        },
        
        /**
         * Hides settings sidebar
         */
        hideSettingsSidebar: function(callback) {
            var op = this.options;
            op.facilitas_settings.animate({right:0},200, function(){
                op.sidebar_settings = false;
                op.facilitas_settings_btn.focus();
                if(callback) callback();
            });
        },


        /**
         * Displays settings sidebar
         */
        showTranscriptSidebar: function(callback) {
            var op = this.options,
                width = this.options.facilitas_transcript.width()*(-1) -2;

            op.facilitas_transcript.animate({left: width},200, function() {
                op.sidebar_transcript = true;
                if(callback) callback();
            });
        },
        /**
         * Hides transcript sidebar
         */
        hideTranscriptSidebar: function(callback) {
            var op = this.options;
            op.facilitas_transcript.animate({left:0},200, function(){
                op.sidebar_transcript = false;
                op.facilitas_transcript_btn.focus();
                if(callback) callback();
            });
        },
        
        /**
         * searchSubtitle
         * @desc Searches for a word within the subtitle
         */
        searchSubtitle: function() {
            var video = this;
            var op = this.options;
            var word = op.facilitas_search_input.val();
            var found = false;
            if(op.subtitle) {
                if(word.length > 0) {
                    op.facilitas_search_result.empty();
                    for(i=0,n=op.subtitle.length;i<n;i++) {
                        if(op.subtitle[i][2].toLowerCase().indexOf(word.toLowerCase()) != -1) {
                            found = true;
                            // Parse time
                            var timeEntries = video.getSearchResultTime(op.subtitle[i][1]);
                            // Append to the list
                            op.facilitas_search_result.append(''
                            +'<li>'
                            +'  <a href="#'+timeEntries[0]+'" title="'+timeEntries[0]+'">'
                            +'      <span class="facilitas_search_time">['+timeEntries[0]+' - '+timeEntries[1]+']</span>'
                            +'      <p class="facilitas_search_description">'+op.subtitle[i][2]+'</p>'
                            +'  </a>'
                            +'</li>');
                        }
                    }
                    if(!found)
                        op.facilitas_search_result.empty().append("<li>"+op.lang[op.language].sidebarSearch.notfound+"</li>");
                } else if (video.options.debug) {video.trace("Empty input, cannot search!");}
                
                
            } else if (video.options.debug) {video.trace("No subtitle file loaded.");}
        },
        
        /**
         * disableBtn
         * @desc Disables a button in case of non-support
         */
        disableBtn: function(dom) {
            var v = this;
            dom.addClass('disabled');
            dom.off().on("click", function(e) {
                if(v.options.debug)
                    v.trace("No file provided or your browser doesn't support this feature.");

                e.preventDefault();
                return false;
            });
        },
        
        /**
         * changeColor
         * @desc Changes subtitle color
         * @params val New value for color
         */
        changeColor: function(val) {
            var video = this;
            var op = this.options;
            if(val.length >= 6) {
                if(val.length == 6 && val.substr(0,1) != "#") {
                    op.facilitas_fontcolor.val("#"+val);
                    val = "#" + val;
                }                    
                
                op.facilitas_subtitle.css("color",val);
            } else if (op.debug) {video.trace("Invalid color");}
        },
        
        /**************************************************
         * Update methods
         */
        
        /**
         * timeUpdate
         * @desc Updates current time using ms
         */
        timeUpdate: function(target) {
            // Get Object
            var video = this.options.videoObject;
            
            // Get target time
            video.currentTime = target;

            // Update audiodescription
            $.event.trigger('fac-ad-updateTime');
        },
        /**
         * goTo
         * @desc Updates current time using hh:mm:ss format
         */
        goTo: function(target) {
            // Transform into seconds
            var target = this.secondsTimeFormat(target);

            // Go to position
            this.timeUpdate(target);
        },
        
        /**
         * seekUpdate
         * @desc Updates seek bar position
         */
        seekUpdate: function() {
            // Get Object
            var video = this.options.videoObject;
            
            // Check if object has been initialized
            if(this.options.init) {
                // Get current time
                var currenttime = video.currentTime;
                // Check if slider has been initialized
                if(!this.options.seekSliding) {
                    // Update slider
                    this.options.facilitas_video_seek.slider('value', currenttime);
                }
                
                
                // Update text
                var curtime = this.videoTimeFormat(currenttime);
                var duration = this.videoTimeFormat(video.duration);
                this.options.facilitas_video_timer.text(curtime+" / "+duration);    
            }
        },
        /**
         * updateBufferRange
         * @desc Updates current buffer position in array
         */
        updateBufferRange: function() {
            var video = this.options.videoObject;
            var buff = video.buffered;
            // Check all buffered values
            for(var i=0;i<buff.length;i++) {
                var start = buff.start(i);
                var end = buff.end(i);
                // Check if time is within current buffer range
                if(video.currentTime >= start && video.currentTime <= end) {
                    this.options.currentBuffer = i;
                }
            }
        },
        
        /**
         * bufferUpdate
         * @desc Updates buffer bar position
         */
        bufferUpdate: function() {
            // Get Object
            var video = this.options.videoObject;
            
            // Check if object has been initialized
            if(this.options.init) {
                var percent=0;
                var r = video.buffered;
                
                // Check valid buffer
                if(r && r.length > 0 && r.end && video.duration){
                    percent = r.end(this.options.currentBuffer) / video.duration;
                } else {
                    // Or calculate through bytes
                    percent = video.bufferedBytes / video.bytesTotal;
                }
                percent *= 100;
                
                // Get position to start buffering
                var pos = (r.start(this.options.currentBuffer) < 0)? 0 : (r.start(this.options.currentBuffer) / video.duration)*100;

                // Update slider;
                this.options.facilitas_video_buffer.slider('values', [pos,percent]);
            }
            
        },
        /**
         * Volume Update
         */
        volumeUpdate: function() {
            var video = this.options.videoObject;
            // Reference
            this.options.facilitas_volume_slider.slider('value', video.volume);
        },
        /**
         * Ad Volume Update
         */
        adVolumeUpdate: function() {
            var $ad = this.options.facilitas_audiodesc;
            // Reference
            this.options.facilitas_advolume_slider.slider('value', $ad[0].volume);
        },
        
        /**
         * subtitleUpdate
         * @desc Updates subtitle entry
         */
        subtitleUpdate: function() {
            var video = this,
                op = this.options,
                currentTime = video.$elem.prop("currentTime"),
                text = "",
                transcript = null,
                li,
                current = op.currentSubtitleLine, 
                now = op.newSubtitleLine,
                tmp = null,
                oldPos = 0, 
                pos;


            if(op.transcripts)
                transcript = op.facilitas_transcript.find('li');
            
            // Check if current subtitle is within time
            for(i=0;i<op.subtitleTotal;i++) {
                if(video.subtitleGetTime(op.subtitle[i][1],"min") < currentTime
                   && video.subtitleGetTime(op.subtitle[i][1],"max") > currentTime) {
                    text = op.subtitle[i][2];
                    op.newSubtitleLine = i;
                    tmp = i;
                }

                if(op.currentSubtitleLine != op.newSubtitleLine) {
                    op.facilitas_transcript.find('li.highlight').removeClass('highlight');

                    if(typeof(transcript[op.newSubtitleLine]) !== 'undefined') {
                        pos = $(transcript[op.newSubtitleLine]).position().top;

                        if(pos != oldPos) {
                            op.facilitas_transcript.animate({scrollTop: pos},200);
                            oldPos = pos;
                        }
                        transcript[op.newSubtitleLine].className = 'highlight';

                    }
                    if(typeof(op.newSubtitleLine) !== 'undefined') {
                        op.currentSubtitleLine = op.newSubtitleLine;

                        // Update text
                        op.facilitas_subtitle.html(text).attr('title',text);
                    }
                }
            }
            
            if(tmp == null)
                op.facilitas_subtitle.html('').attr('title', '');
        },
        
        /**
         * subtitleFontUpdate
         * @desc Updates font size according to window width
         */
        subtitleFontUpdate: function() {
            var video = this;
            
            // Prepare font size
            var fontsize = video.options.facilitas_subtitle.css("font-size");
            var bottom = video.options.facilitas_subtitle.css("bottom");

            // Raise font size if width > 400
            if(video.$elem.width() > 400) {
                // New font size
                fontsize = fontsize + Math.ceil((video.$elem.width()-400)/100);
                bottom = bottom + Math.ceil((video.$elem.width()-400)/100);
            }
            var lineheight = parseInt(fontsize)+4;
            
            // Update font
            video.options.facilitas_subtitle.css({"font-size":fontsize+"px","line-height":(lineheight)+"px",bottom: bottom+"px"});
        },
        
        
        /**************************************************
         * Format methods
         */
        
        /**
         * videoTimeFormat
         * @desc Format seconds to display in video container
         */
        videoTimeFormat: function(seconds) {
            var m=Math.floor(seconds/60)<10?"0"+Math.floor(seconds/60):Math.floor(seconds/60);
            var s=Math.floor(seconds-(m*60))<10?"0"+Math.floor(seconds-(m*60)):Math.floor(seconds-(m*60));
            return m+":"+s;
        },
        /**
         * secondsTimeFormat
         * @desc Transforms time in seconds
         */
        secondsTimeFormat: function(time) {
            var split = time.split(":");
            if(split.length == 2)
                var total = parseInt(split[1]) + parseInt(split[0])*60;
            else if (split.length == 3)
                var total = parseInt(split[2]) + parseInt(split[1])*60 + parseInt(split[0])*60*60;
            
            return total;
        },
        /**
         * subtitleTimeFix
         * @desc Return subtitle time format in seconds
         */
        subtitleTimeFix: function(time) {
            // Ignore ms and split
            var split = time.split(",")[0].split(":");
            
            // Return seconds
            return Math.floor(split[0]*60*60) + Math.floor(split[1]*60) + Math.floor(split[2]) + parseFloat("."+time.split(",")[1]);
        },
        
        /**
         * subtitleGetMin
         * @desc Gets min time value from subtitle file
         */
        subtitleGetTime: function(line, type) {
            // Type = min => return min time. Otherwise, return max value
            return (type == "min")? this.subtitleTimeFix(line.split(' --> ')[0]) : this.subtitleTimeFix(line.split(' --> ')[1]);
        },
        /**
         * getSearchResultTime
         * @desc Splits time and return an array with min and max values, without ms
         */
        getSearchResultTime: function(time) {
            // Split
            var split = time.split(' --> ');
            // Remove ms
            var min = split[0].split(",")[0];
            var max = split[1].split(",")[0];
            var result = new Array(2);
            result[0] = min; result[1] = max; 
            return result;
        },
        
        
        /**************************************************
         * Auxiliar methods
         */
        
        /**
         * Trace
         * @desc Log debug events
        */
        trace: function(s) {
            try { console.log(s) } catch (e) { alert(s) }
            return;
        },
        
        /**
         * fullScreenStatus
         * @desc returns if document is in fullscreen
         */
        fullScreenStatus: function() {
            return (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || false);
        }
    };
    
    
    
    /**
     * Plugins Extend
     */
    $.fn.extend = function(options) {
        // Don't act on absent elements
        if ( this.length ) {
            return this.each(function(){
                /**
                 * Facilitas Player
                 */
                // Create a new object via the Prototypal Object.create
                var myFacilitasPlayer = Object.create(FacilitasPlayer);

                // Run the initialization function
                FacilitasPlayer.init(options, this); // `this` refers to the element

                // Save the instance
                $.data(this,'FacilitasPlayer',myFacilitasPlayer); 
            });
        }
    };
    
    // Defining the plugin
    $.plugin('facilitas', FacilitasPlayer);
})(jQuery);