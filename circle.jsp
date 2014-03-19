<%@page import="sina.socialcapital.dao.AuthUserDao"%>
<%@page import="sina.socialcapital.services.SocialCapitalLogService"%>
<%@page import="sina.socialcapital.cache.SocialCapitalCache"%>
<%@page import="weibo4j.util.WeiboConfig"%>
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String uidString = request.getParameter("uid");
Long uid = null;
	try {
		uid = Long.parseLong(request.getParameter("uid"));
	} catch (NumberFormatException e) {
		uid = (Long) session.getAttribute("uid");
	}
	if(null == uid) {
		response.sendRedirect("/report.jsp?action=refreshall");
		return;
	} else {
		session.setAttribute("uid", uid);
	}
SocialCapitalLogService.logViewCircle(request);
AuthUserDao.Util.insert(request);

SocialCapitalCache.setStringToCache(uid, "ProcessPercentage", "3");
SocialCapitalCache.setStringToCache(uid, "ActionName", "正在准备用户授权信息");

//Double completePercentage = (Double)request.getAttribute("completePercentage");
//System.out.println(">>>>>" + completePercentage);

%>

<!DOCTYPE HTML>
<html>
  <head>

<script type="text/javascript" src="/js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="/js/jquery-ui-1.8.17.custom.min.js"></script>
<script type="text/javascript" src="/js/share-circle-1.js"></script>
<script type="text/javascript" src="/js/Jit/jit-yc.js"></script>
<script type="text/javascript" src="/js/Jit/jit.js"></script>
<script type="text/javascript" src="/js/Jit/Extras/excanvas.js"></script>
<script type="text/javascript" src="/js/appDrag_1.js?v=1.5"></script>
<script type="text/javascript" src="/js/data.js"></script>
<script type="text/javascript" src="/js/encode.js"></script>
<script type="text/javascript" src="/js/animation.js?v=1.0"></script>
<link type="text/css" rel="stylesheet" href="/css/jquery-ui-1.8.17.custom.css" />
<link type="text/css" rel="stylesheet" href="/css/cssfonts-min.css" />
<link type="text/css" rel="stylesheet" href="/css/cssreset-min.css" />
<link type="text/css" rel="stylesheet" href="/css/appDrag.css" />
<link type="text/css" rel="stylesheet" href="/css/share-circle.css"/>
<link type="text/css" rel="stylesheet" href="/css/sinaBtn.css" />
<link type="text/css" rel="stylesheet" href="/css/sinalayer.css"/>
<link type="text/css" rel="stylesheet" href="/css/page/circle.css"/>

<!--[if lte IE 6]>
	<link type="text/css" rel="stylesheet" href="/css/ie6-fix.css" />		
<![endif]-->

	<script type="text/javascript">
		/* if($.browser.msie) {
			if($.browser.version < 8.0) {
				window.location.href = "/WebBrowserReject.jsp";
			}
		} */
	
		$.post("/download.do?m=dataDownload&uid=<%=uid %>", function(data){
			if($.trim(data)=="uid invalid")
				window.location.href = "http://apps.weibo.com/friendsfj";
		});
	</script>
</head>


<body style="margin: 0px;">
	<div id="whole_circle">
		<div class="myheader">
			<div class="viewBtn">
				<a id='dunbarViewBtn' class='leftViewBtn' href="javascript:SwitchView('dunbar');" title=""><span>Dunbar圈</span></a>
				<a id='tagViewBtn' class='rightViewBtn'><span style="color: #ddd; font-size: 11px; margin-left: 6px;">标签圈(即将)</span></a>
				<div style="clear:both; zoom:1; width:100%;height:0;overflow:hidden;"></div>
				<a id='graphViewBtn' class='leftViewBtn' href="javascript:SwitchView('graph');" title=""><span>可视化</span></a>
				<a id='regularViewBtn' class='rightViewBtn' href="javascript:SwitchView('card');" 
					title="关系密切的好友太多？同事，大学同学，中学同学… 手工分组工作量太大？快来用晒我的好友圈子应用吧，能帮助你自动将好友分组，同学，同事一目了然。还可以晒你的圈子，跟亲密好友分享哦。"><span>社交圈</span></a>
			</div>
			<div id='diplay_circle_icon'></div>
			<div id='diplay_circle_name' onclick="RenameAction();"></div>
			<a id="saveNameBtn" style="display: none;" onclick="RenameCircle()">
				<span>保存</span>
			</a>
			<div id='big_logo'></div>
			<div id='shareAndGuide'>
				<a id='shareBtn'></a>
				<a id='guideBtn' href="javascript:showSlidePicture();"></a>
			</div>
		</div>
		
		<ul id="circle_list">
		</ul>
		
		<div class="panel_right">
			<div id="completePercentageTip" class="layer_message_box" >
		    	<a class="W_close_color" href="javascript:hideCompletePercentageTip();"></a>
		    	<ul>
					<li>总下载完成度：<span id="completePercentageSpan">0.0</span>%</li>
					<li>你的数据还不完整，刷新页面会增加信息完整度，同时提升我们的分圈精度。</li>
					<li><a class="W_btn_d" href="javascript:reloadPage();"><span>刷新</span></a></li>
				</ul>
		    </div>
			<div id="display_area">
				<div id="card_area">
					<ul id="display_list"></ul>
					<div style='clear:both; zoom:1; width:90%;height:0;overflow:hidden;'></div>
					<div id="delete-bar"></div>
				</div>
					
				<div id="graph_area" style="display:none;">
					<div id="infovis" style="height:450px; overflow: hidden;"></div>
					<div id="log"></div>
					<img class='refresh_btn' src='images/icons/refresh.png' onclick="RefreshGraph();"></img>
					<div style="color:#0085D8;">
						<div style="position:absolute; top:162px; left:731px; font-size:18px;">-</div>
						<div id="zoom_slider" style="height:240px; position:absolute; top:190px; left:728px;"></div>
						<div style="position:absolute; top:442px; left:729px; font-size:16px;">+</div>
					</div>
					<div id="inner-details"></div>
				</div>
			</div>
			
			<a class="W_btn_d" style="float:right; margin:40px 5px 0px 0px; display: none;" href="javascript:showRecalculateConfirm();">
				<span>重算圈子</span>
			</a>
		</div>
	</div>

	<!-- Dialog when merging -->
	<div id="dialog_form" title="合并好友圈" style="display:none;">
		请为合并后的好友圈选择名字:<br>
		<form>
			<input type="radio" id="radio_1" name="mergedName" value="" />
			<label for="radio_1" id="c1_name"></label><br>
			<input type="radio" id="radio_2" name="mergedName" value="" />
			<label for="radio_2" id="c2_name"></label><br> 
			<input type="radio" id="radio_3" name="mergedName" value="" />
			<label for="radio_3" id="c2_name">自定义
			<input type="text" id="self_defined_name" class="text ui-widget-content ui-corner-all" /></label><br>
		</form>
	</div>
	
	<div class="tipDiv" id="tip">
		<div class='tip_background'>
			<table class="tip_screenName_tb">
				<tr><td class="tip_screenName"></td></tr>
			</table>
			<img class='tip_avatar' />
		</div>
		
		<table class="stat_tb">
			<tr>
				<td class="friendNum"></td>
				<td class="followerNum"></td>
				<td class="weiboNum"></td>
			</tr>
			<tr>
				<td>关注</td>
				<td>粉丝</td>
				<td>微博</td>
			</tr>
		</table>
		<div class='tags'></div>
	</div>
	
	
	<div style="display:none;" class="msg_box" id="msgBox">
		<ul>
			<li id="renameSuccess">重命名成功！<li>
			<li id="renameFail">重命名失败！请刷新后重试。</li>
		</ul>
		<a class="close_btn" href="javascript:void(0);"></a>
	</div>
	
    <div id="downInfo">
    	<table width="100%">
    		<tr><td><div id="progressbar"></div></td></tr>
    		<tr><td width="100%"><span id="progressdetail" style="width: 100%; color: gray;"></span></td></tr>
   		</table>
    </div>
    <div id="walkThroughGuild" class="layer_message_box" >
    	<a class="W_close_color" href="javascript:hideSlidePicture();"></a>
    	<div id="slideDiv">
    		<img alt="" src="/images/slides/Slide1.JPG" id="slideImg"/>
    	</div>
    	<div style="padding-left: 6px;"><a class="W_btn_a" href="javascript:hideSlidePicture();"><span>关闭演示</span></a></div>
    </div>
    <div id="recalculateConfirm" class="layer_message_box" >
    	<a class="W_close_color" href="javascript:hideRecalculateConfirm();"></a>
    	<ul>
    		<li><span>这个行为将会导致您的所有手工分圈行为被覆盖，请问是否继续？</span></li>
    		<li>
	    		<a class="W_btn_b" href="javascript:recalculateCircle();"><span>确定</span></a>
	    		<a class="W_btn_b" href="javascript:hideRecalculateConfirm();"><span>取消</span></a>
    		</li>
    	</ul>
    </div>
  </body>
  
  <script type="text/javascript">
  	var final_show_time = 4300;
  	var interval = null;
  	//var slideInterval = null;
  	$(function(){
  		interval = window.setInterval(changeDownInfo,1000);
  		//slideInterval = window.setInterval(toggleSlidePicture, 6000);
  		window.setTimeout(toggleSlidePicture, final_show_time);
  	});
  	
  	var currentSlideNumber = 1;
  	var maxSlideNumber = 8;
  	var toggleSlidePictureActive = true;
  	function toggleSlidePicture() {
  		if(!toggleSlidePictureActive)
  			return;
  		if(currentSlideNumber >= maxSlideNumber) {
//  			$("#walkThroughGuild").fadeOut(300);
//  			return;
			currentSlideNumber = 0;
  		}
  		currentSlideNumber++;
  		$("#slideDiv").animate({
  				"margin-left" : "-475" 
  			},700, function(){
		  		$("#slideImg").attr("src","/images/slides/Slide"+currentSlideNumber+".JPG");
		  		$("#slideDiv").css("margin-left","475px");
		  		$("#slideDiv").animate({
		  				"margin-left" : "0" 
		  			},700);
		  		window.setTimeout(toggleSlidePicture, final_show_time);
  			});
  	}
  	
  	function showSlidePicture() {
  		if(toggleSlidePictureActive) {
  			return;
  		}
  		$("#slideImg").attr("src","/images/slides/Slide1.JPG");
  		toggleSlidePictureActive = true;
  		currentSlideNumber = 1;
  		tvIn($("#walkThroughGuild"), 1000);
  		//$("#walkThroughGuild").fadeIn(300);
  		window.setTimeout(toggleSlidePicture, final_show_time);
  	}
  	
  	function hideSlidePicture() {
  		toggleSlidePictureActive = false;
  		$("#walkThroughGuild").fadeOut(300);
  	}
  	
  	function hideCompletePercentageTip() {
  		$("#completePercentageTip").fadeOut(300);
  	}
  	
  	function updateCompletePercentage() {
  		$.get("/circle.do?m=getCompletePercentage",function(data){
  			var percentage = $.trim(data);
  			$("#completePercentageSpan").text(percentage);
  			if(percentage!="100.0") {
	  			$("#completePercentageTip").fadeIn(666);
	  			window.setTimeout("$(\"#completePercentageTip\").fadeOut(666);", 10000);
  			}
  		});
  	}
  	
  	function showRecalculateConfirm() {
  		$("#recalculateConfirm").fadeIn(666);
  	}
  	
  	function hideRecalculateConfirm() {
  		$("#recalculateConfirm").fadeOut(666);
  	}
  	
  	function recalculateCircle() {
  		$.get("/circle.do?m=recalculate",function(data){
//  			if($.trim(data)=="success")
			$("#recalculateConfirm").fadeOut(666,function(){
	  			window.location.reload();
			});
  		});
  	}
  	
  	function reloadPage() {
  		window.location.reload();
  	}
  	
  	var existAjax = null;
  	function changeDownInfo() {
  		
  		if(existAjax!=null)
  			existAjax.abort();
  		
  		var processJson = null;
  		$.get("/download.do?m=downInfo&_t=" + getCurrentTime(),function(data){
  			//$("#downInfo").html(data);
  			//alert(data);
  			processJson = eval("[" + data + "]")[0];
  			//console.log(data);
  			$("#progressbar").progressbar({
  				value: processJson.processPercentage
  			});
  			$("#progressdetail").text(processJson.processPercentage + "% : " + processJson.ActionName);
  			if(processJson.processPercentage==100) {
  				window.clearInterval(interval);
  				$("#walkThroughGuild").fadeOut(300);
  				toggleSlidePictureActive = false;
  				$("#downInfo").fadeOut(300);
  				updateCompletePercentage();
  				$.get("/download.do?m=getCircle&_t=" + getCurrentTime(),function(data){
  					initData(data,<%=uid%>);
  				});
  			}
  		});
  	}
  	
  	function getCurrentTime() {
  		var time = new Date();
  		return time.getTime();
  	}
  	
  	
  	
  </script>
</html>