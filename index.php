<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="utf-8">
	<title>Travel Online</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  <meta name="author" content="">

  <link rel="stylesheet" type="text/css" href="./css/sliderkit-core.css" rel="stylesheet"/>
  <link rel="stylesheet" type="text/css" href="./css/sliderkit-demos.css" rel="stylesheet"/>
  <link rel="stylesheet" type="text/css" href="./css/sliderkit-demos-ie8.css" rel="stylesheet"/>  
  <link href="./css/bootstrap.css" rel="stylesheet">  
  <link href="./css/jquery-ui-1.10.2.custom.min.css" rel="stylesheet">
  <!-- <link href="./css/responsive.css" rel="stylesheet"> -->
  <link href="./css/browser-hack.css" rel="stylesheet">

	<!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    
    
<? include 'scripts.html'; ?>
    
    
    
<link rel="stylesheet" type="text/css" href="/one/css/common_u0580.css">
<link rel="stylesheet" type="text/css" href="/ott-fixed.css"> 
   
</head>


<body>

  <? include 'content.html'; ?>
  <? include 'templates.html'; ?>

  <div class="h-popupSide">
  <!-- popupSideHelp -->
    <div class="popupSide text-center" id="popupSideHelp">
      <a href="javascript:;" class="popupSideBtn"><img src="./i/popupSideHelp-btn.png" alt="Помощь"></a>
      <button type="button" class="close">×</button>
      <h3>Выберите раздел в котором Вам нужна помощь</h3>
      <table class="popupSideTable">
        <tr>
          <th><a href="javascript:;"><img src="./i/popupSideHelpFly.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="./i/popupSideHelpHotel.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="./i/popupSideHelpTour.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="./i/popupSideHelpTrip.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="./i/popupSideHelpCruise.png" alt=""></a></th>
          <th><a href="javascript:;"><img src="./i/popupSideHelpRent.png" alt=""></a></th>
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
      <a class="ent" href="javascript:;"><img src="./i/modalEnter1.png" alt=""></a>
      <a class="ent" href="javascript:;"><img src="./i/modalEnterFb.png" alt=""></a>
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
      <a class="btn btn-link" href="javascript:;">Хотите хавести аккаунт?</a>
    </div>
  </div>
<!-- /modalEnter -->


<!-- modalReg -->
  <div class="modal hide" id="modalReg" tabindex="-1" role="dialog" aria-labelledby="modalEnter" aria-hidden="true">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    </div>
    <div class="modal-body">
      <a class="ent" href="javascript:;"><img src="./i/modalEnter1.png" alt=""></a>
      <a class="ent" href="javascript:;"><img src="./i/modalEnterFb.png" alt=""></a>
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
        <a class="brand" href="./index.html"><img src="./i/brand.png" alt="TravelOnline"></a>
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
          <li class="navPersPhoto"><img src="./i/navPersPhoto.jpg" alt=""></li>
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
                  <img class="media-object pull-left" src="./i/mediaMsg.png">
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
                  <img class="media-object pull-left" src="./i/mediaMsg.png">
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
                  <img class="media-object pull-left" src="./i/mediaMsg.png">
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
      <div class="span12 mainSearch">
      
        <div id="layout_panels">
            <div id="rotationPanel"><div class="spreader" id="rotationPanelTop"></div></div>
            <div id="infoPanel">
                <div class="spreader"><div class="advText"></div></div>
            </div>
            <div id="topPanel" style="display: none;">
                <div class="spreader">
                    <table><tr>
                        <td id="languageSelect" class="panelDropMenu"></td>
                        <td>
                            <ul id="topMenu">
                                <li id="about" class="invisible">О проекте</li>
                                <li class="invisible">Авиабилеты</li>
                                <li><a href="javascript:if(confirm(%27http://www.booking.com/?aid=358564&label=Onetwotrip-Navtab  \n\nThis file was not retrieved by Teleport Pro, because it is addressed on a domain or path outside the boundaries set for its Starting Address.  \n\nDo you want to open it from the server?%27))window.location=%27http://www.booking.com/?aid=358564&label=Onetwotrip-Navtab%27" tppabs="http://www.booking.com/?aid=358564&label=Onetwotrip-Navtab" target="_blank" id="m_booking_link">Отели</a></li>
                                <li><a href="javascript:if(confirm(%27http://www.onetwotrip.com/bonus/  \n\nThis file was not retrieved by Teleport Pro, because it is addressed on a path excluded by the site\%27s Robot Exclusion parameters.  (Teleport Pro\%27s compliance with this system is optional; see the Project Properties, Netiquette page.)  \n\nDo you want to open it from the server?%27))window.location=%27http://www.onetwotrip.com/bonus/%27" tppabs="http://www.onetwotrip.com/bonus/" target="_blank">Бонусы</a></li>
                            </ul>
                        </td>
                        <td id="subMenu" class="panelDropMenu"></td>
                        <td id="topSocialIn">
                            <div>
                                <span>OneTwoTrip в</span>
                                <a rel="nofollow" target="_blank" class="fb" href="javascript:if(confirm(%27http://www.facebook.com/onetwotrip  \n\nThis file was not retrieved by Teleport Pro, because it is addressed on a domain or path outside the boundaries set for its Starting Address.  \n\nDo you want to open it from the server?%27))window.location=%27http://www.facebook.com/onetwotrip%27" tppabs="http://www.facebook.com/onetwotrip" title="Facebook"></a>
                            </div>
                        </td>
                        <td class="profileCell">
                            <div class="loginLoader invisible"></div>
                            <div class="profileInfo invisible">
                                <div class="unknownUser">
                                    <span class="register">Зарегистрироваться</span> | <span class="enter">Войти</span>
                                </div>
                                <div class="knownUser invisible">
                                    <a href="" class="myprofile"></a> | <span class="exit">Выйти</span>
                                </div>
                            </div>
                        </td>
                    </tr></table>
                </div>
            </div>
            <div class="spreader" style="display: none;">
                <div class="tag_price">
                    <div class="tag_small invisible"><a href="#" class="empty_link"></a></div>
                    <div class="tag_big invisible">
                        <div class="price_content">
                            <div class="tag_close"><div class="w"></div><div class="c"></div></div>
                            <div class="header"></div>
                            <div class="info"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="topPanel2">
                <form id="form_search" class="form-inline row" action="">
                    <div class="spreader well span10" id="topPanel2spreader"></div>
                    <div class="spreader invisible" id="priceDynamicSpreader"><div class="priceDynamic"></div></div>
                    <div class="spreader" id="tongueSpreader"><div class="height0">
                        <div id="dirTongue" class="invisible"></div>
                        <div id="searchButtonTongue" class="invis">
                            <input type="submit" class="btn btn-danger span2" value="ПОИСК"/>
                        </div>
                    </div></div>
                </form>
                <div id="pageTitlePanel" class="spreader invisible"><div id="pageTitle"></div></div>
            </div>
            <div id="layout_recentSearches">
                <div class="spreader">
                    <ul class="spreader" id="recentSearches"></ul>
                </div>
            </div>
        </div>
      
        <form class="form-inline row" action="" style="display: none;">
        
          
          <div class="well span10">
            <div class="btn-toolbar">
              <div class="input-append">
                <input type="text" class="input-large" value="Москва (Россия)">
                <button class="btn btn-primary"><h3>16</h3><h4>дек</h4></button>
              </div>
              
              <div class="btn-group calend" data-toggle="buttons-radio">
                <a href="javascript:;" class="btn" id="flightType1"><img src="./i/btnFlight1.png" alt="Туда"></a>
                <a href="javascript:;" class="btn active" id="flightType2"><img src="./i/btnFlight2.png" alt="Туда-сюда"></a>
                <a href="javascript:;" class="btn" id="flightType3"><img src="./i/btnFlight3.png" alt="Туда-туда"></a>
              </div>

              <div class="input-append">
                <input type="text" class="input-large" value="Нью-Йорк (США)">
                <button class="btn btn-primary"><h3>16</h3><h4>дек</h4></button>
              </div>
            </div>

            <div class="btn-toolbar toolbar2">
              <div class="input-append">
                <input type="text" class="input-large" value="Москва (Россия)">
                <button class="btn btn-primary"><h3>16</h3><h4>дек</h4></button>
              </div>

              <div class="input-append">
                <input type="text" class="input-large" value="Нью-Йорк (США)">
                <button class="btn btn-primary"><h3>16</h3><h4>дек</h4></button>
              </div>
            </div>

             <div class="calendar">
                <div class="datepicker dp1">
                  <div class="dateHeader">
                    <p><span class="selDate">Выберите дату</span> <img src="./i/dateHeaderPlane.png" alt=""><span class="from">Москва</span> &rarr; <span class="to">Лондон</span></p>
                    <div class="btn-group" data-toggle="buttons-radio">
                      <span class="btn">прямые рейсы</span>
                      <span class="btn active">с пересадкой</span>
                    </div>
                  </div>
                </div>
              </div>  <!-- /calendar -->
          </div>  <!-- /well -->

          <input type="submit" class="btn btn-danger span2" value="ПОИСК">
        </form>

        <div class="span12 dynamics">
          <div class="hided">
            <div class="row">
              <div class="span12">
                <p class="searchResult"><a href="javascript:;">Москва - Нью-Йорк с 13 фев по 27 фев</a></p>
              </div>
            </div>
            <div class="row">
              <span class="dynTo span6">
                <h2>Исходящий рейс <small>Динамика стоимости</small></h2>
                <div class="dynMonth navbar clearfix">
                  <ul class="nav">
                    <li><a href="javascript:;">янв</a></li>
                    <li><a href="javascript:;">фев</a></li>
                    <li><a href="javascript:;">мар</a></li>
                    <li class="active"><a href="javascript:;">апр</a></li>
                    <li><a href="javascript:;">май</a></li>
                    <li><a href="javascript:;">июн</a></li>
                    <li><a href="javascript:;">июл</a></li>
                    <li><a href="javascript:;">авг</a></li>
                    <li><a href="javascript:;">сен</a></li>
                    <li><a href="javascript:;">окт</a></li>
                    <li><a href="javascript:;">ноя</a></li>
                    <li><a href="javascript:;">дек</a></li>
                  </ul>
                </div>  <!-- /dynMonth -->

                <div class="dynDateGraph navbar">
                  <ul class="nav">
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;" class="h60"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;" class="h80"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li class="active"><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;" class="h100"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                  </ul>
                </div>  <!-- /dynDate -->

                <div class="dynDate navbar">
                  <ul class="nav">
                    <li><a href="javascript:;">01</a></li>
                    <li><a href="javascript:;">02</a></li>
                    <li><a href="javascript:;">03</a></li>
                    <li><a href="javascript:;">04</a></li>
                    <li><a href="javascript:;">05</a></li>
                    <li><a href="javascript:;">06</a></li>
                    <li><a href="javascript:;">07</a></li>
                    <li><a href="javascript:;">08</a></li>
                    <li><a href="javascript:;">09</a></li>
                    <li><a href="javascript:;">10</a></li>
                    <li><a href="javascript:;">11</a></li>
                    <li><a href="javascript:;">12</a></li>
                    <li class="active"><a href="javascript:;">13</a></li>
                    <li><a href="javascript:;">14</a></li>
                    <li><a href="javascript:;">15</a></li>
                    <li><a href="javascript:;">16</a></li>
                    <li><a href="javascript:;">17</a></li>
                    <li><a href="javascript:;">18</a></li>
                    <li><a href="javascript:;">19</a></li>
                    <li><a href="javascript:;">20</a></li>
                    <li><a href="javascript:;">21</a></li>
                    <li><a href="javascript:;">22</a></li>
                    <li><a href="javascript:;">23</a></li>
                    <li><a href="javascript:;">24</a></li>
                    <li><a href="javascript:;">25</a></li>
                    <li><a href="javascript:;">26</a></li>
                    <li><a href="javascript:;">27</a></li>
                    <li><a href="javascript:;">28</a></li>
                    <li><a href="javascript:;">29</a></li>
                    <li><a href="javascript:;">30</a></li>
                    <li><a href="javascript:;">31</a></li>
                  </ul>
                </div>  <!-- /dynDate -->

                <div class="dynDay navbar">
                  <ul class="nav">
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                    <li><span>ч</span></li>
                    <li><span>п</span></li>
                    <li class="active"><span>с</span></li>
                    <li class="active"><span>в</span></li>
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                    <li><span>ч</span></li>
                    <li><span>п</span></li>
                    <li class="active"><span>с</span></li>
                    <li class="active"><span>в</span></li>
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                    <li><span>ч</span></li>
                    <li><span>п</span></li>
                    <li class="active"><span>с</span></li>
                    <li class="active"><span>в</span></li>
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                    <li><span>ч</span></li>
                    <li><span>п</span></li>
                    <li class="active"><span>с</span></li>
                    <li class="active"><span>в</span></li>
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                  </ul>
                </div>  <!-- /dynDate -->
              </span>  <!-- /dynTo -->

              <span class="dynFrom span6">
                <h2>Обратный рейс <small>Динамика стоимости</small></h2>
                <div class="dynMonth navbar clearfix">
                  <ul class="nav">
                    <li><a href="javascript:;">янв</a></li>
                    <li><a href="javascript:;">фев</a></li>
                    <li><a href="javascript:;">мар</a></li>
                    <li class="active"><a href="javascript:;">апр</a></li>
                    <li><a href="javascript:;">май</a></li>
                    <li><a href="javascript:;">июн</a></li>
                    <li><a href="javascript:;">июл</a></li>
                    <li><a href="javascript:;">авг</a></li>
                    <li><a href="javascript:;">сен</a></li>
                    <li><a href="javascript:;">окт</a></li>
                    <li><a href="javascript:;">ноя</a></li>
                    <li><a href="javascript:;">дек</a></li>
                  </ul>
                </div>  <!-- /dynMonth -->

                <div class="dynDateGraph navbar">
                  <ul class="nav">
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li class="active"><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                    <li><a href="javascript:;"></a></li>
                  </ul>
                </div>  <!-- /dynDate -->

                <div class="dynDate navbar">
                  <ul class="nav">
                    <li><a href="javascript:;">01</a></li>
                    <li><a href="javascript:;">02</a></li>
                    <li><a href="javascript:;">03</a></li>
                    <li><a href="javascript:;">04</a></li>
                    <li><a href="javascript:;">05</a></li>
                    <li><a href="javascript:;">06</a></li>
                    <li><a href="javascript:;">07</a></li>
                    <li><a href="javascript:;">08</a></li>
                    <li><a href="javascript:;">09</a></li>
                    <li><a href="javascript:;">10</a></li>
                    <li><a href="javascript:;">11</a></li>
                    <li><a href="javascript:;">12</a></li>
                    <li class="active"><a href="javascript:;">13</a></li>
                    <li><a href="javascript:;">14</a></li>
                    <li><a href="javascript:;">15</a></li>
                    <li><a href="javascript:;">16</a></li>
                    <li><a href="javascript:;">17</a></li>
                    <li><a href="javascript:;">18</a></li>
                    <li><a href="javascript:;">19</a></li>
                    <li><a href="javascript:;">20</a></li>
                    <li><a href="javascript:;">21</a></li>
                    <li><a href="javascript:;">22</a></li>
                    <li><a href="javascript:;">23</a></li>
                    <li><a href="javascript:;">24</a></li>
                    <li><a href="javascript:;">25</a></li>
                    <li><a href="javascript:;">26</a></li>
                    <li><a href="javascript:;">27</a></li>
                    <li><a href="javascript:;">28</a></li>
                    <li><a href="javascript:;">29</a></li>
                    <li><a href="javascript:;">30</a></li>
                    <li><a href="javascript:;">31</a></li>
                  </ul>
                </div>  <!-- /dynDate -->

                <div class="dynDay navbar">
                  <ul class="nav">
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                    <li><span>ч</span></li>
                    <li><span>п</span></li>
                    <li class="active"><span>с</span></li>
                    <li class="active"><span>в</span></li>
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                    <li><span>ч</span></li>
                    <li><span>п</span></li>
                    <li class="active"><span>с</span></li>
                    <li class="active"><span>в</span></li>
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                    <li><span>ч</span></li>
                    <li><span>п</span></li>
                    <li class="active"><span>с</span></li>
                    <li class="active"><span>в</span></li>
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                    <li><span>ч</span></li>
                    <li><span>п</span></li>
                    <li class="active"><span>с</span></li>
                    <li class="active"><span>в</span></li>
                    <li><span>п</span></li>
                    <li><span>в</span></li>
                    <li><span>с</span></li>
                  </ul>
                </div>  <!-- /dynDate -->
              </span>  <!-- /dynFrom -->
            </div>

            <div class="row">
              <div class="span12 dynamicsFoot">
                <div class="dynamicsFootDate">
                  <p>13 Февраля 2013 г. - 27 Февряля 2013 г.</p>
                </div>
                <input type="submit" class="btn btn-danger" value="ИСКАТЬ НА ЭТИ ДАТЫ">
              </div>  <!-- /dynamicsFoot-->
            </div>  <!-- /row -->
          </div>  <!-- /hided -->
          <a href="javascript:;" class="labelDynamics">Календарь цен</a>
        </div>  <!-- /dynamics -->
      </div>  <!-- /mainSearch -->


      <div class="span9 offset3 selectors">
        <div class="btn-row">
          <div class="btn-toolbar">
            
            <div class="FlightsDifficulties" style="display: inline-block;">
              <div class="btn-group d_option" data-toggle="buttons-radio">
                <button class="d_direction btn d_first active">Все рейсы</button>
                <button class="d_direction btn d_last">Прямые</button>
              </div>
            </div>
            
            <div class="FlightPriceInformation" style="display: inline-block;">
              <div class="ComparePriceSelection" style="display: inline-block;">
                <div class="btn-group d_option" data-toggle="buttons-radio">
                  <button class="d_direction btn d_first">Итоговая</button>
                  <button class="d_direction btn d_last">Сравнительная</button>
                </div>
              </div>

              <div class="classSearch_wrapper" style="display: inline-block;">
                <label class="checkbox">класс: </label>
                <div class="btn-group d_option" data-toggle="buttons-radio">
                  <button class="d_direction btn d_first" cs="E">Эконом</button>
                  <button class="d_direction btn d_middle" cs="B">Бизнес</button>
                </div>
              </div>
            </div>
            
            <div id="CurrenciesBlock" style="float: right;">
              <div class="btn-group last d_option" data-toggle="buttons-radio">
                <button class="d_direction btn" data-cur="RUB">RUB</button>
                <button class="d_direction btn" data-cur="USD">USD</button>
                <button class="d_direction btn" data-cur="EUR">EUR</button>
              </div>
            </div>
            <label class="last">валюта:</label>
          </div>  <!-- /btn-toolbar -->
        </div>
      </div>  <!-- /selectors -->

      
      <div id="layout_body" class="spreader">
        <div id="layout_results"></div>                   
      </div>
      
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
          <a href="javascript:;"><img src="./i/socialFb.png" alt=""></a>
          <a href="javascript:;"><img src="./i/socialGoogle.png" alt=""></a>
          <a href="javascript:;"><img src="./i/socialVk.png" alt=""></a>
          <a href="javascript:;"><img src="./i/socialLj.png" alt=""></a>
          <a href="javascript:;"><img src="./i/socialTw.png" alt=""></a>
          <a href="javascript:;"><img src="./i/socialLi.png" alt=""></a>
        </div>  <!-- /social -->

        <div class="span12 fbLine text-center">
          <a href="javascript:;"><img src="./i/fbookLine.jpg" alt=""></a>
        </div>  <!-- /fbLine -->

        <div class="span4 offset2 footRights">
          <p>© Photo square   2012  Все права защищены</p>
          <p class="footDev">Разработка сайта <a href="http://re-branding.ru/">
            <img alt="re-branding.ru" src="./i/footDev.png"></a>
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

  <!-- javascript
  ================================================== -->
  <!-- Placed at the end of the document so the pages load faster -->
  <!--
  <script src="/js/jquery-1.9.min.js"></script>
  <script src="/js/bootstrap.min.js"></script>
  <script src="/js/jquery.sliderkit.1.9.2.js"></script>
  <script src="/js/jquery-ui-1.10.2.custom.min.js"></script>
  <script src="/js/custom_el.js"></script>
  <script src="/js/jquery.ui.datepicker-ru.js"></script>
  <script src="/js/custom.js"></script>
  -->

  <script src="/js/bootstrap.min.js"></script>
  <script src="/js/jquery.sliderkit.1.9.2.js"></script>

  <script src="/js/custom_el.js"></script>

  <script src="/js/custom.js"></script>
  
</body>
</html>