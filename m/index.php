<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Travel Online</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  <meta name="author" content="">

  <link rel="stylesheet" type="text/css" href="/css/sliderkit-core.css" rel="stylesheet"/>
  <link rel="stylesheet" type="text/css" href="/css/sliderkit-demos.css" rel="stylesheet"/>
  <link rel="stylesheet" type="text/css" href="/css/sliderkit-demos-ie8.css" rel="stylesheet"/>
  
  <link href="/css/bootstrap.css" rel="stylesheet">  
  <link href="/css/jquery-ui-1.10.2.custom.min.css" rel="stylesheet">
  <!-- <link href="/css/responsive.css" rel="stylesheet"> -->
  <link href="/css/browser-hack.css" rel="stylesheet">
  
  <link rel="stylesheet" type="text/css" href="/css/calendar.css">

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    
<? include 'scripts.html'; ?>
    

<link rel="stylesheet" type="text/css" href="/ott-fixed.css">  
<link rel="stylesheet" type="text/css" href="/fixer2.css">  

</head>


<body>


  <? include 'templates.html'; ?>




  <!-- Modal -->

  <div class="h-popupSide">
  <!-- popupSideHelp -->
    <div class="popupSide text-center" id="popupSideHelp">
      <a href="javascript:;" class="popupSideBtn"><img src="/i/popupSideHelp-btn.png" alt="Помощь"></a>
      <button type="button" class="close">×</button>
      <h3>Выберите раздел в котором Вам нужна помощь</h3>
      <table class="popupSideTable">
        <tr>
          <th><a href="javascript:;"><img src="/i/popupSideHelpFly.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="/i/popupSideHelpHotel.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="/i/popupSideHelpTour.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="/i/popupSideHelpTrip.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="/i/popupSideHelpCruise.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="/i/popupSideHelpRent.png" alt=""></a></th>
        </tr>
        <tr>
          <td><a href="javascript:;">АВИАБИЛЕТЫ</a></td>
          <td><a href="javascript:;">ОТЕЛИ</a></td>
          <td><a href="javascript:;">ТУРЫ</a></td>
          <td><a href="javascript:;">ПУТЕШЕСТВИЯ</a></td>
          <td><a href="javascript:;">КРУИЗЫ</a></td>
          <td><a href="javascript:;">АРЕНДА НЕДВИЖИМОСТИ</a></td>
        </tr>
      </table>
      <a href="mailto:hello@travelonline.ru" class="popupEmail">hello@travelonline.ru</a>
      <span class="popupPhone">тел: +7 926 426 68 55</span>
    </div>  <!-- /popupSideHelp -->
  <!-- /popupSideHelp -->
  </div>


<!-- modalEnter -->
  <div class="modal hide" id="modalEnter" tabindex="-1" role="dialog" aria-labelledby="modalEnter" aria-hidden="true">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    </div>
    <div class="modal-body">
      <a class="ent" href="javascript:;"><img src="/i/modalEnter1.png" alt=""></a>
      <a class="ent" href="javascript:;"><img src="/i/modalEnterFb.png" alt=""></a>
    </div>
    <div class="modal-footer">
      <form action="">
        <input type="text" placeholder="Эл.почта:">
        <input type="text" placeholder="Пароль">
        <div class="controls-row">
          <input type="submit" class="btn btn-danger" value="войти" data-dismiss="modal" aria-hidden="true">
          <label class="checkbox inline">
            <input id="" type="checkbox" value="option1">Запомнить меня
          </label>
        </div>
      </form>
      <a class="btn btn-link" href="javascript:;">Забыли пароль?</a>
      <a class="btn btn-link" href="javascript:;">Хотите завести аккаунт?</a>
    </div>
  </div>
<!-- /modalEnter -->


<!-- modalReg -->
  <div class="modal hide" id="modalReg" tabindex="-1" role="dialog" aria-labelledby="modalEnter" aria-hidden="true">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    </div>
    <div class="modal-body">
      <a class="ent" href="javascript:;"><img src="/i/modalEnter1.png" alt=""></a>
      <a class="ent" href="javascript:;"><img src="/i/modalEnterFb.png" alt=""></a>
    </div>
    <div class="modal-footer text-center">
      <form action="">
        <input type="text" placeholder="Эл.почта:">
        <input type="text" placeholder="Пароль">
        <input type="text" placeholder="Повторите пароль">
        <input type="submit" id="regOpen" class="btn btn-danger" value="зарегистрироваться" data-dismiss="modal" aria-hidden="true">
      </form>
      <p>Регистрируясь на travelonline.ru <br>вы принимаете условия <a href="javascript:;">пользовательского соглашения</a></p>
    </div>
  </div>
<!-- /modalReg -->


  <nav class="navbar navbar-inverse navbar-static-top">  <!-- .navbar-static-top, navbar-fixed-top, navbar-fixed-bottom -->
    <div class="navbar-inner">
      <div class="container">
        <a class="brand" href="./index.html"><img src="/i/brand.png" alt="TravelOnline"></a>
        <ul class="nav">
          <li class="active"><a href="./tickets.html">Авиабилеты</a></li>
          <li><a href="./hotels.hmtl">Отели</a></li>
          <li><a href="./tour.html">Туры</a></li>
          <li><a href="./travel.html">ПУТЕШЕСТВИЯ</a></li>
          <li><a href="./marsh.html">МАРШРУТЫ</a></li>
          <li><a href="./rent.html">АРЕНДА недвижимости</a></li>
          <li><a href="./aboutTrip.html">ВСЕ О ПУТЕШЕСТВИЯХ</a></li>
        </ul>

        <ul class="nav navAdd unReg">
          <li class="navEnter"><a href="#modalEnter" data-toggle="modal">вход</a></li>
          <li class="navReg"><a href="#modalReg" data-toggle="modal">регистрация</a></li>
          <li class="navCurr dropdown">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">usd</a>
            <ul class="dropdown-menu" role="menu">
              <li><a tabindex="-1" href="#">РУБЛИ (RUB)</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">ДОЛЛАРЫ (USD)</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">ЕВРО (EUR)</a></li>
            </ul>
          </li>
          <li class="navLang dropdown">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">рус</a>
            <ul class="dropdown-menu" role="menu">
              <li><a tabindex="-1" href="#">русский</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">английский</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">немецкий</a></li>
            </ul>
          </li>
        </ul>

        <ul class="nav navAdd regOn">
          <li class="navPersPhoto"><img src="/i/navPersPhoto.jpg" alt=""></li>
          <li class="navPers dropdown">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">ФЕДОР БЕЛЬТЮГОВ</a>
            <ul class="dropdown-menu" role="menu">
              <li><a tabindex="-1" href="#">панель управления</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">ваши блоги</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">ваши маршруты</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">изображения</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">редактировать профиль</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">аккаунт</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">выход</a></li>
            </ul>
          </li>
          <li class="navMsg dropdown">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">сообщения <span>2</span></a>
            <ul class="dropdown-menu" role="menu">
              <li class="media">
                <a class="mediaMsg" href="javascript:;">
                  <img class="media-object pull-left" src="/i/mediaMsg.png">
                  <div class="media-body">
                    <h5 class="media-heading">ФЕДОР БЕЛЬТЮГОВ</h5>
                    <p>Федор, меня так достал твой... </p>
                    <time>18 Марта 2013</time>
                  </div>
                </a>
              </li>
              
              <li class="divider"></li>

              <li class="media">
                <a class="mediaMsg" href="javascript:;">
                  <img class="media-object pull-left" src="/i/mediaMsg.png">
                  <div class="media-body">
                    <h5 class="media-heading">ФЕДОР БЕЛЬТЮГОВ</h5>
                    <p>Федор, когда запустищь свой...</p>
                    <time>18 Марта 2013</time>
                  </div>
                </a>
              </li>

              <li class="divider"></li>

              <li class="media">
                <a class="mediaMsg" href="javascript:;">
                  <img class="media-object pull-left" src="/i/mediaMsg.png">
                  <div class="media-body">
                    <h5 class="media-heading">ФЕДОР БЕЛЬТЮГОВ</h5>
                    <p>Пойдем на турники</p>
                    <time>18 Марта 2013</time>
                  </div>
                </a>
              </li>

              <li class="divider"></li>

              <li class="showAllMediaMsg"><a href="javascript:;" class="text-center">показать все сообщения</a></li>
            </ul>
          </li>
          <li class="navCurr dropdown">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">usd</a>
            <ul class="dropdown-menu" role="menu">
              <li><a tabindex="-1" href="#">РУБЛИ (RUB)</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">ДОЛЛАРЫ (USD)</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">ЕВРО (EUR)</a></li>
            </ul>
          </li>
          <li class="navLang dropdown">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">рус</a>
            <ul class="dropdown-menu" role="menu">
              <li><a tabindex="-1" href="#">русский</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">английский</a></li>
              <li class="divider"></li>
              <li><a tabindex="-1" href="#">немецкий</a></li>
            </ul>
          </li>
        </ul>
      </div>  <!-- /container -->
    </div>  <!-- /navbar-inner -->
  </nav>

  <section class="container">
    <div class="row">
        
      <div id="layout_body" class="spreader"></div>
      <script type="text/javascript">appendLoader({appendTo:document.getElementById("layout_body"), text: l10n.loaders.loading})</script>  
      
    </div>
  </section> <!-- /container -->

  <footer>
    <nav class="navbar navbar-static-top">  <!-- .navbar-static-top, navbar-fixed-top, navbar-fixed-bottom -->
      <div class="navbar-inner">
        <div class="container">
          <ul class="nav text-center">
            <li><a href="./aboutProject.html">О проекте</a></li>
            <li><a href="./help.hmtl">Помощь</a></li>
            <li class="active"><a href="./tickets.html">Авиабилеты</a></li>
            <li><a href="./hotels.hmtl">Отели</a></li>
            <li><a href="./tour.html">Туры</a></li>
            <li><a href="./travel.html">ПУТЕШЕСТВИЯ</a></li>
            <li><a href="./cruise.html">Круизы</a></li>
            <li><a href="./rent.html">АРЕНДА недвижимости</a></li>
            <li><a href="./aboutTrip.html">ВСЕ О ПУТЕШЕСТВИЯХ</a></li>
            <li><a href="./visa.html">Визы</a></li>
            <li><a href="./ensur.html">Страховка</a></li>
          </ul>
        </div>  <!-- /container -->
      </div>  <!-- /navbar-inner -->
    </nav>

    <div class="container">
      <div class="row">
        <div class="span12 social text-center">
          <a href="javascript:;"><img src="/i/socialFb.png" alt=""></a>
          <a href="javascript:;"><img src="/i/socialGoogle.png" alt=""></a>
          <a href="javascript:;"><img src="/i/socialVk.png" alt=""></a>
          <a href="javascript:;"><img src="/i/socialLj.png" alt=""></a>
          <a href="javascript:;"><img src="/i/socialTw.png" alt=""></a>
          <a href="javascript:;"><img src="/i/socialLi.png" alt=""></a>
        </div>  <!-- /social -->

        <div class="span12 fbLine text-center">
          <a href="javascript:;"><img src="/i/fbookLine.jpg" alt=""></a>
        </div>  <!-- /fbLine -->

        <div class="span4 offset2 footRights">
          <p>© Photo square   2012  Все права защищены</p>
          <p class="footDev">Разработка сайта <a href="http://re-branding.ru/">
            <img alt="re-branding.ru" src="/i/footDev.png"></a>
          </p>
        </div>  <!-- /footRights -->

        <div class="span5 offset1 footContacts">
          <p class="footPhone">+7 495 <b>123 45 67</b></p>
          <p>ул. Рабочая 84/4, Москва, 109544, Россия</p>
          <p>e-mail: <a href="javascript:;">hello@ph2studios.com</a></p>
        </div>  <!-- /footContacts -->
      </div>
    </div> <!-- /container -->
  </footer>

  <div class="shading"></div>
   
  <!-- javascript
  ================================================== -->
  <!-- Placed at the end of the document so the pages load faster -->
  <script src="/js/bootstrap.min.js"></script>
  <script src="/js/jquery.sliderkit.1.9.2.js"></script>

  <script src="/js/custom_el.js"></script>

  <script src="/js/custom.js"></script>
</body>
</html>