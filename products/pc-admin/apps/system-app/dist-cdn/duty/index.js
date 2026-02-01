
//transitionEnd-Polyfill for all browsers
function transitionEndEventName () {
  var i,
      undefined,
      el = document.createElement('div'),
      transitions = {
          'transition':'transitionend',
          'OTransition':'otransitionend',  // oTransitionEnd in very old Opera
          'MozTransition':'transitionend',
          'WebkitTransition':'webkitTransitionEnd'
      };

  for (i in transitions) {
      if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
          return transitions[i];
      }
  }


}

$(document).ready(function(){
  //initiate the menu toggle
  initiateToggleMenu();

  //target a nested element with hover class
  handleMenuHover();

  //use for storing the menuitems
  var $privacyNavMenu;
  var $privacyNavSubmenu;

  //scrollspy
  scrollSpy();
  scrollSpyJump();

  // 百度统计代码已移除（避免 Chrome 第三方 Cookie 警告）
  // 如需统计功能，请使用其他统计方案

  if(isMobile()){
    var matchURL = /\S+\/duty\/(\S+).html/.exec(window.location.href);
    var matchResURL = matchURL ? matchURL[1] : 'duty';
    jumpWise(matchResURL);
  }

  //drop the menu down and show page by clicking the button
  if (isIE() == 8 || isIE() == 9) {
    $('body').on('click','#隐私政策总则btn',function(event){
      event.preventDefault();
      window.location.href = '/duty/yinsiquan-policy.html';
    });

    $('body').on('click','#隐私问题报告btn',function(event){
      event.preventDefault();
      window.location.href = 'http://help.baidu.com/personalinformation';
    });

    $('body').on('click','#特定产品的隐私保护btn',function(event){
      event.preventDefault();
      window.location.href = '/duty/yinsiquan-sub.html';
    });

    $('a[href="mianze-shengming.html"]').on('click', function(e) {
      e.preventDefault();
      window.location.href = '/duty/';
    })

    $('a[href="yinsiquan-policy.html"]').on('click', function(e) {
      e.preventDefault();
      window.location.href = '/duty/yinsiquan.html';
    })

    $('li[id="百度隐私政策总则"]').on('click', function(e) {
      e.preventDefault();
      window.location.href = '/duty/yinsiquan-policy.html';
    })

    $('a[href="#"]').on('click', function(e) {
      e.preventDefault();
      window.location.href = '/duty/yinsiquan.html';
    })


  }else{
    $('body').on('click','#隐私政策总则btn',function(event){
      event.preventDefault();
      event.stopPropagation();
      e = $('#隐私权保护声明 > a');
      getResults(e);

      //handle the distance between submenu item and the end of the nestedmenu
      $('#特定产品的隐私保护').css({
        'margin-top':'26px'
      })

      ToggleSubmenu('on',50);
      setTimeout(ToggleNestedMenu('on',250),50);


      $('#百度隐私政策总则').addClass('active');
      pushStateToHis('/duty/' + e.attr('href'));
    });

    $('body').on('click','#隐私问题报告btn',function(event){
      event.preventDefault();
      window.location.href = 'http://help.baidu.com/personalinformation';
    });

    $('body').on('click','#特定产品的隐私保护btn',function(event){

      event.preventDefault();
      event.stopPropagation();


      e = $('#特定产品的隐私保护 > a');
      getResults(e);

      //reset the distance between submenu item and the end of the nestedmenu
      $('#特定产品的隐私保护').css({
        'margin-top':'40px'
      })

      ToggleSubmenu('on',300);


      $('#特定产品的隐私保护').addClass('active');
      pushStateToHis('/duty/' + e.attr('href'));
    });

    //show the corresponding content by clicking the menuitem
    $('.privacy-nav-menu-item > a').click(function (event) {
      event.preventDefault();
      event.stopPropagation();
      if($(this).attr('href')==='mianze-shengming.html'){
          var e = $('<a href="/"></a>');
          ToggleSubmenu('off',300);
          if(!$('#免责声明').hasClass('active')){
            getResults(e);
            pushStateToHis('/duty/');
          }

          return false;
      }else if($(this).attr('href')==='yinsiquan-policy.html'){
          var e = $(' <a href="yinsiquan.html"></a> ');
          ToggleSubmenu('off',300);
          if(location.pathname!=='/duty/yinsiquan.html'){
            getResults(e);
            pushStateToHis('/duty/' + e.attr('href'));
          }
          return false;
      }else{
          var e = $(this);
          ToggleSubmenu('off',300);
          if (!e.closest('li').hasClass('active')) {
            getResults(e);
            pushStateToHis('/duty/' + e.attr('href'));
          }
        //prevents the default browser functionality, i.e. loading the target URL.
          return false;
      }
    });

    //show the corresponding content by clicking the submenuitem
    $privacyNavSubmenu = $('.privacy-nav-submenu-item');
    $('body').on('click','.privacy-nav-submenu-item > a',function(event){
      event.preventDefault();
      event.stopPropagation();
      var e = $(this);

      //handle yinsi-report logic
      if(e.attr('href')==="#"){
        event.preventDefault();
        window.location.href = 'http://help.baidu.com/personalinformation';
      }else{
        if (!e.closest('li').hasClass('active')) {
          getResults(e);

          //toggle submenu
          var nested_menu = $('.privacy-nav-menu-primary > li >.privacy-nav-submenu .privacy-nav-nestedmenu');

          //handle the top margin
          if(e.closest('li').attr('id')==='特定产品的隐私保护'){
            $('#特定产品的隐私保护').css({
              'margin-top':'40px'
            })
          }else{
            $('#特定产品的隐私保护').css({
              'margin-top':'26px'
            })
          }

          nested_menu.slideToggle('fast');

          pushStateToHis('/duty/' + e.attr('href'));
        }
        //prevents the default browser functionality, i.e. loading the target URL.
      return false;
    }
    });

    //handle backwards logic
    window.addEventListener("popstate", function () {
      var url = location.pathname.split("/").pop();

      //backward undefined
      if(url===''){
        var e = $(' <a href="/"></a> ');
      }else if(url==='yinsiquan.html'){
        var e = $(' <a href="yinsiquan.html"></a> ');
      }else{
        var e = $('a[href="' + url +'"]');
      }

      //submenu backward logic
      if(e.attr('href').match(/yinsiquan-/)){
        //'yinsiquan-policy.html', 'yinsiquan-sub.html'
        ToggleSubmenu('on',300);
      }else{
        ToggleSubmenu('off',300);
      }

      //nestedmenu backward logic
      if(e.attr('href')==='yinsiquan-policy.html'){
        ToggleNestedMenu('on',300);
      }else{
        ToggleNestedMenu('off',300);
      }
      getResults(e);
      initiateMenu();
    });
  }




  function initiateMenu(){
    if(location.pathname==='/duty/') {
      $('#免责声明').addClass('active');//#免责声明 #隐私权保护声明
    }
  }


  //function zone
  $privacyNavMenu = $('.privacy-nav-menu-item');

  function handleMenuHover(){
    $('.privacy-nav-nestedmenu-item').hover(
      function(e){
        e.stopPropagation();
        $(this).addClass('privacy-menu-active').parents().removeClass('privacy-menu-active');
      },
      function(e){
        e.stopPropagation();
        $(this).removeClass('privacy-menu-active');

      }
    )

    $('.privacy-nav-menu-item > a').hover(
      function(e){
        e.stopPropagation();
        $(this).addClass('privacy-menu-active');
      },
      function(e){
        e.stopPropagation();
        $(this).removeClass('privacy-menu-active');
      }
    )
  }

  function jumpWise(matchResURL){
    switch (matchResURL) {
      case 'baozhang': window.location.href = 'https://m.baidu.com/sf?pd=sd_privacy_terms&ms=1&word=网民权益保障计划&title=网民权益保障计划&openapi=1&from_sf=1&resource_id=37483&dsp=iphone&tn=wisexmlnew&ext=%7B%22pid%22%3A%22wangminquanyi-baozhang-shengming%22%7D';
        break;
      case 'copyright':
        window.location.href = 'https://m.baidu.com/sf?pd=sd_privacy_terms&ms=1&word=知识产权声明&title=知识产权声明&openapi=1&from_sf=1&resource_id=37483&dsp=iphone&tn=wisexmlnew&ext=%7B%22pid%22%3A%22zhishi-chanquan-shengming%22%7D';
        break;
      case 'right':
        window.location.href = 'https://m.baidu.com/sf?pd=sd_privacy_terms&ms=1&word=权利保护声明&title=权利保护声明&openapi=1&from_sf=1&resource_id=37483&dsp=iphone&tn=wisexmlnew&ext=%7B%22pid%22%3A%22quanli-shengming%22%7D';
        break;
      case 'yinsiquan': window.location.href = 'https://m.baidu.com/sf?pd=sd_privacy_terms&ms=1&word=隐私权保护声明&title=隐私权保护声明&openapi=1&from_sf=1&resource_id=37483&dsp=iphone&tn=wisexmlnew&ext=%7B%22pid%22%3A%22front-page%22%7D';
        break;
      case 'yinsiquan-policy': window.location.href = 'https://m.baidu.com/sf?pd=sd_privacy_terms&ms=1&word=隐私政策总则&title=隐私政策总则&openapi=1&from_sf=1&resource_id=37483&dsp=iphone&tn=wisexmlnew&ext=%7B%22pid%22%3A%22baidu-yinsi-zhengce%22%7D';
        break;
      case 'yinsiquan-sub': window.location.href = 'https://m.baidu.com/sf?pd=sd_privacy_terms&ms=1&word=特定产品隐私保护&title=特定产品隐私保护&openapi=1&from_sf=1&resource_id=37483&dsp=iphone&tn=wisexmlnew&ext=%7B%22pid%22%3A%22teding-chanpin-yinsibaohu%22%7D';
        break;
      case 'privacysettings': window.location.href = 'https://m.baidu.com/sf?pd=sd_privacy_terms&ms=1&word=隐私设置&title=隐私设置Beta&openapi=1&from_sf=1&resource_id=37483&dsp=iphone&tn=wisexmlnew&ext=%7B%22pid%22%3A%22yinsi-shezhi%22%7D';
        break;
      default: window.location.href = 'https://m.baidu.com/sf?pd=sd_privacy_terms&ms=1&word=免责声明&title=免责声明&openapi=1&from_sf=1&resource_id=37483&dsp=iphone&tn=wisexmlnew&ext=%7B%22pid%22%3A%22mianze-shengming%22%7D';
        break;
    }
  }

  function pushStateToHis(url) {
    history.pushState(null, null, url);
    // 百度统计代码已移除
    // _hmt.push(['_trackPageview', url]);
  }

  function getResults(e) {
    $privacyNavMenu.removeClass('active');
    $privacyNavSubmenu.removeClass('active');

    e.closest('li').addClass('active');

    if( e.attr('href').match(/yinsiquan/)){
      //'yinsiquan-sub.html' , 'yinsiquan-policy.html' , 'yinsiquan.html'
      $('#隐私权保护声明').addClass('active');
    }
    if(e.attr('href')==='/'){
      $('#免责声明').addClass('active');
    }



    //restore the menu display state
    if(e.attr('href').match(/yinsiquan-/)){
      //'yinsiquan-sub.html', 'yinsiquan-policy.html'
      //continue
    }else{
      //restore the menu state after the animation
      setTimeout(function(){
        $('.privacy-nav-nestedmenu').css({
          "display": "none"
        });
        $('.privacy-nav-submenu').css({
          "display": "none"
        });
      },301)

    }

    $.ajax({
        url:'/duty/' + e.attr('href'),
        type:'GET',
        success: function(data){
          //set page title
          var title = data.match(/<title>(.*)</)[1];
          document.title = title;
          resultsAnimation(data);
        }
    });
  }

  // handle active, ative menu problem incase user refresh the page
  function  initiateToggleMenu(){
    switch (location.pathname) {
      case '/duty/':
        $('#免责声明').addClass('active');
        break;
      case '/duty/copyright.html':
        $('#知识产权声明').addClass('active');
        break;
      case '/duty/yinsiquan.html':
        $('#隐私权保护声明').addClass('active');
        break;
      case '/duty/right.html':
        $('#权利声明').addClass('active');
        break;
      case '/duty/baozhang.html':
        $('#网民权益保障计划').addClass('active');
        break;
      case '/duty/yinsiquan-policy.html':
        $('#隐私权保护声明').addClass('active');
        $('#百度隐私政策总则').addClass('active');
        ToggleSubmenu('on',50);
        ToggleNestedMenu('on',250);
        break;
      case '/duty/yinsiquan-sub.html':
        $('#隐私权保护声明').addClass('active');
        $('#特定产品的隐私保护').addClass('active');
        $('#特定产品的隐私保护').css({
          'margin-top':'40px'
        })
        ToggleSubmenu('on',300);
        break;
      default:
        break;
    }
  }



  function scrollSpyJump(){
    var nestedMenus = $('.privacy-nav-nestedmenu-item');
    nestedMenus.each(function(index){
      $(this).click(function(event){
        event.stopPropagation();
        var id 	= $(this).attr('id').slice(1);
        var target_top = $('section[id=' + id+ ']').offset().top-80;//jump to the title
        $("html,body").animate({scrollTop: target_top}, 400);
      });
    })
  }

  function scrollSpy(){
    $(window).bind('scroll', function() {
      var currentTop = $(window).scrollTop();
      var elems = $('.scrollspy');
      elems.each(function(index){
        var elemTop 	= $(this).offset().top-81;//larger than title gap to keep synchronized
        var elemBottom 	= elemTop + $(this).height();
        if(currentTop >= elemTop && currentTop <= elemBottom){
          var id 		= $(this).attr('id');
          var navElem = $('li[id="#' + id+ '"]');
          navElem.addClass('active').siblings().removeClass( 'active' );
        }
      })
    });
  }

  function ToggleSubmenu(show,speed){
    var sub_menu = $('.privacy-nav-menu-primary > li >.privacy-nav-submenu');
    var state = sub_menu.is(":hidden");

    if(!((show==='on' && state===false)||(show==='off' && state===true))){
      toggle();
    }
    function toggle(){
      sub_menu.slideToggle(speed);
    }
  }


  function ToggleNestedMenu(show,speed){
    var nested_menu = $('.privacy-nav-menu-primary > li >.privacy-nav-submenu .privacy-nav-nestedmenu');
    var state = nested_menu.is(":hidden");

    if(!((show==='on' && state===false)||(show==='off' && state===true))){
      toggle();
    }
    function toggle(){
      nested_menu.slideToggle(speed);
    }
  }

  function isIE () {
    var myNav = navigator.userAgent.toLowerCase();
    return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
  }

  function isMobile(){
    if(/Mobi/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent)){
      return true;
    }
    return false;
  }

  function resultsAnimation(data){
    //remove the original content and append new content
    //we need two container because the assigned opacity
    $('main').remove();
    var dataTobeAppended = $(data).find('#aboutToShow').html();
    $('.privacy-appendContainer').append(dataTobeAppended);

    window.scrollTo(0, 0);

    $('.privacy-appendContainer').css({
      "height":"800px",
      "opacity":"1",
      "transform":"translateY(0px)"
    });

    $('.privacy-appendContainer').on('transitionend webkitTransitionEnd oTransitionEnd', function () {
      $('.privacy-appendContainer').css({
        "height":"0px",
        "opacity":"0",
        "transform":"translateY(10%)"
      });

      //restore the domtree back to what it was before
      $('.privacy-main-container').append($('.privacy-appendContainer').html());
      $('.privacy-appendContainer > main').remove();
    });



  }


});
