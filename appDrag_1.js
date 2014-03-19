/**
 * @author Tian Li <leetian.pp@gmail.com>
 */

var circleList = null;
var dunbarList = null;
var garbageList = {
	"circleName" : "回收站",
	"circleNo" : -1,
	"circleUserList" : []
};

var itemsPerPage = 12;
var share;
var viewType = "card"; // "graph" "dunbar"
var UID = 0;

var groupHeaderRGB = [ "#abd7f3", "#88cfb4", "#ffc85c", "#9c89d3", "" ];

var labelType, useGradients, nativeTextSupport, animate;
(function() {
	var ua = navigator.userAgent, iStuff = ua.match(/iPhone/i)
			|| ua.match(/iPad/i), typeOfCanvas = typeof HTMLCanvasElement, nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'), textSupport = nativeCanvasSupport
			&& (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
	// I'm setting this based on the fact that ExCanvas provides text support
	// for IE
	// and that as of today iPhone/iPad current text support is lame
	labelType = (!nativeCanvasSupport || (textSupport && !iStuff)) ? 'Native'
			: 'HTML';
	nativeTextSupport = labelType == 'Native';
	useGradients = nativeCanvasSupport;
	animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
	elem : false,
	write : function(text) {
		if (!this.elem) {
			this.elem = document.getElementById('log');
		}
		this.elem.innerHTML = text;
	}
};

function initData(data, uid) {
	$("#regularViewBtn").addClass("active-state");
	circleList = eval(data);
	UID = uid;
	circleInit();

}

function CircleLogoDispCtrl(circleNo) {
	$circleItem = $("#circle_" + circleNo);
	if ($circleItem.is(":hidden")) {
		$circleItem.slideDown();
		$btn = $("#cli_" + circleNo).find(".unfoldCircleBtn");
		$btn.removeClass("unfoldCircleBtn");
		$btn.addClass("foldCircleBtn");
	} else {
		$circleItem.slideUp();
		$btn = $("#cli_" + circleNo).find(".foldCircleBtn");
		$btn.removeClass("foldCircleBtn");
		$btn.addClass("unfoldCircleBtn");
	}
}

function showOrToggleSmallIconDisplay(circleNo) {
	$circleItem = $("#circle_" + circleNo);
	var currentCircleNo = $("#display_list").attr("displayNo");

	if ($circleItem.is(":hidden")) {
		$circleItem.slideDown();
		$btn = $("#cli_" + circleNo).find(".unfoldCircleBtn");
		$btn.removeClass("unfoldCircleBtn");
		$btn.addClass("foldCircleBtn");
	} else {
		if (circleNo != currentCircleNo)
			return;
		$circleItem.slideUp();
		$btn = $("#cli_" + circleNo).find(".foldCircleBtn");
		$btn.removeClass("foldCircleBtn");
		$btn.addClass("unfoldCircleBtn");
	}
}

function TransData(rawJson) {
	var jsonData = [];
	for ( var i = 0; i < rawJson.length; i++) {
		var jsonObj = eval(rawJson[i]);
		for ( var j = 0; j < jsonObj.length; j++)
			jsonData.push(jsonObj[j]);
	}

	return jsonData;
}

function JitInit() {
	var circleNo = $("#display_list").attr("displayNo");
	var circleID = circleList[circleNo].circleID;
	$("#diplay_circle_name").html(circleList[circleNo].circleName);

	$
			.ajax({
				type : "post",
				url : "graph.do?m=getGraph",
				data : {
					circle : circleID
				},
				success : function(data) {
					if (data.length != 0) {
						data = eval(data);
						var jsonData = TransData(data);

						var fd = new $jit.ForceDirected(
								{
									injectInto : 'infovis',
									Navigation : {
										enable : true,
										panning : 'avoid nodes',
										zooming : 80
									},
									Node : {
										overridable : true
									},
									Edge : {
										overridable : true,
										color : '#23A4FF',
										lineWidth : 0.8
									},
									Tips : {
										enable : true,
										type : "Native",
										offsetX : 5,
										offsetY : 5,
										onShow : function(tip, node) {
											var count = 0;
											// node.eachAdjacency(function() {
											// count++;
											// });
											for ( var i = 0; i < jsonData.length; i++) {
												if (node.id == jsonData[i].id) {
													url = jsonData[i].imageUrl;
													friendCnt = jsonData[i].friendsCount;
													followerCnt = jsonData[i].followersCount;
													weiboCnt = jsonData[i].weiboCount;
													tags = jsonData[i].tags;
												}
											}
											tip.innerHTML = "<div class='graph_tip'><img src='"
													+ url
													+ "' />"
													+ "<div class='tip-right'>"
													+ "<div class='tagTitle'>"
													+ node.name
													+ "</div>"
													+ "<table class='stat_tb' style='color:#779;'>"
													+ "<tr><td class='friendNum'>"
													+ friendCnt
													+ "</td>"
													+ "<td>"
													+ followerCnt
													+ "</td>"
													+ "<td>"
													+ weiboCnt
													+ "</td>"
													+ "<td></td></tr>"
													+ "<tr><td>关注</td>"
													+ "<td>粉丝</td>"
													+ "<td>微博</td></tr></table>";
											if (tags != "")
												tip.innerHTML += "<div class='tagTitle'>标签 "
														+ tags;
											tip.innerHTML += "</div></div></div>";
										}
									},
									Events : {
										enable : true,
										type : 'Native',
										onMouseEnter : function() {
											fd.canvas.getElement().style.cursor = 'move';
										},
										onMouseLeave : function() {
											fd.canvas.getElement().style.cursor = '';
										},
										onClick : function(node) {
											if (node == true || node == false)
												return;

											fd.graph.eachNode(function(n) {
												if (n.selected)
													n.data.$dim -= 8;
												if (n.id != node.id)
													delete n.selected;
												var d = n.getData("dim");
												n.data.$dim = d;
												n.data.$color = "#83548B";
												n.eachAdjacency(function(adj) {
													adj.setDataset('end', {
														lineWidth : 0.8,
														color : '#23a4ff'
													});
												});
											});
											if (!node.selected) {
												node.selected = true;
												var d = parseFloat(node
														.getData("dim"));
												node.data.$dim = d + 8;
												node.data.$color = "#c74243";
												node
														.eachAdjacency(function(
																adj) {
															adj
																	.setDataset(
																			'end',
																			{
																				lineWidth : 3,
																				color : '#36acfb'
																			});
														});
											} else {
												delete node.selected;
											}

											fd.fx
													.animate({
														modes : [
																'node-property:dim',
																'edge-property:lineWidth:color' ],
														duration : 500
													});

											var html = "<h4>"
													+ node.name
													+ "</h4><b> connections:</b><ul><li>", list = [];
											node.eachAdjacency(function(adj) {
												if (adj.getData('alpha'))
													list.push(adj.nodeTo.name);
											});
											// $jit.id('inner-details').innerHTML
											// = html + list.join("</li><li>") +
											// "</li></ul>";
										},
										onDragMove : function(node, eventInfo,
												e) {
											var pos = eventInfo.getPos();
											node.pos.setc(pos.x, pos.y);
											fd.plot();
										}
									},
									iterations : 500,
									levelDistance : 220,
									onCreateLabel : function(domElement, node) {
										var nameContainer = document
												.createElement('span'), closeButton = document
												.createElement('span'), style = nameContainer.style;
										nameContainer.className = 'name';
										nameContainer.innerHTML = node.name;
										closeButton.className = 'close';
										closeButton.innerHTML = 'x';
										domElement.appendChild(nameContainer);
										// domElement.appendChild(closeButton);
										style.fontSize = "0.8em";
										style.color = "#555";
										// closeButton.onclick = function() {
										// node.setData('alpha', 0, 'end');
										// node.eachAdjacency(function(adj) {
										// adj.setData('alpha', 0, 'end');
										// });
										// fd.fx.animate({
										// modes: ['node-property:alpha',
										// 'edge-property:alpha'],
										// duration: 500
										// });
										// };
										nameContainer.onclick = function() {
											fd.graph.eachNode(function(n) {
												if (n.selected)
													n.data.$dim -= 8;
												if (n.id != node.id)
													delete n.selected;
												var d = n.getData("dim");
												n.data.$dim = d;
												n.data.$color = "#83548B";
												n.eachAdjacency(function(adj) {
													adj.setDataset('end', {
														lineWidth : 0.6,
														color : '#23a4ff'
													});
												});
											});
											if (!node.selected) {
												node.selected = true;
												var d = parseFloat(node
														.getData("dim"));
												// console.log(d);
												// console.log(d + 5);
												node.data.$dim = d + 8;
												node.data.$color = "#c74243";
												node
														.eachAdjacency(function(
																adj) {
															adj
																	.setDataset(
																			'end',
																			{
																				lineWidth : 3,
																				color : '#36acfb'
																			});
														});
											} else {
												delete node.selected;
											}

											fd.fx
													.animate({
														modes : [
																'node-property:dim',
																'edge-property:lineWidth:color' ],
														duration : 500
													});

											var html = "<h4>"
													+ node.name
													+ "</h4><b> connections:</b><ul><li>", list = [];
											node.eachAdjacency(function(adj) {
												if (adj.getData('alpha'))
													list.push(adj.nodeTo.name);
											});
											// $jit.id('inner-details').innerHTML
											// = html + list.join("</li><li>") +
											// "</li></ul>";
										};
									},

									onPlaceLabel : function(domElement, node) {
										var style = domElement.style;
										var left = parseInt(style.left);
										var top = parseInt(style.top);
										var w = domElement.offsetWidth;
										style.left = (left - w / 2) + 'px';
										style.top = (top + 10) + 'px';
										style.display = '';
									}
								});// end of jd

						fd.loadJSON(jsonData);
						fd.computeIncremental({
							iter : 40,
							property : 'end',
							onStep : function(perc) {
								$("#log").show();
								Log.write(perc + '% loaded...');
								// disable the "切换视图" button
								$("#switchBtn").hide();
								$("#switchBtn2").show();
							},
							onComplete : function() {
								Log.write('done');
								$("#log").hide();
								fd.animate({
									modes : [ 'linear' ],
									transition : $jit.Trans.Elastic.easeOut,
									duration : 2500
								});
								// enable the "切换视图" button
								$("#switchBtn2").hide();
								$("#switchBtn").show();
							}
						});

						// Initialize the zoom slider
						var maxRange = data.length - 1;
						$("#zoom_slider")
								.slider(
										{
											orientation : "vertical",
											range : "min",
											min : 0,
											max : maxRange,
											value : 0,
											step : 1,
											slide : function(event, ui) {
												var level = ui.value;
												var deleteArray = [];
												for ( var i = 0; i < level; i++) {
													var obj = eval(data[i]);
													for ( var j = 0; j < obj.length; j++)
														deleteArray
																.push(obj[j]);
												}

												fd.graph
														.eachNode(function(node) {
															node.setData(
																	'alpha', 1,
																	'end');
															node
																	.eachAdjacency(function(
																			adj) {
																		adj
																				.setData(
																						'alpha',
																						1,
																						'end');
																	});
															fd.fx
																	.animate({
																		modes : [
																				'node-property:alpha',
																				'edge-property:alpha' ],
																		duration : 500
																	});
														});// end of eachNode

												fd.graph
														.eachNode(function(node) {
															for ( var i = 0; i < deleteArray.length; i++) {
																if (node.id == deleteArray[i].id) {
																	node
																			.setData(
																					'alpha',
																					0,
																					'end');
																	node
																			.eachAdjacency(function(
																					adj) {
																				adj
																						.setData(
																								'alpha',
																								0,
																								'end');
																			});
																	fd.fx
																			.animate({
																				modes : [
																						'node-property:alpha',
																						'edge-property:alpha' ],
																				duration : 500
																			});
																}
															}// end of for
														});// end of eachNode
											}
										});

					}
				}
			});

}

function DunbarInit() {
	viewType = "dunbar";
	$("#circle_list").children().remove();

	$.ajax({
		type : "post",
		url : "download.do?m=getDunbarDivid",
		success : function(data) {
			if (data != "uid invalid")
				dunbarList = eval(data);
			// console.log(dunbarList);
			// console.log("---------");
			// dunbarList = [1, 2, 3, 4, 5, 6];
			// var margins = [0, -34, -48, -64, -72, -74];
			var dunbarNum = [ 5, 15, 35, 150, 500, 1500 ];

			for ( var i = 0; i < dunbarList.length; i++) {
				var cssClass = "dunbarCircle-" + i;
				var dunbar = "";
				dunbar = "<li class='" + cssClass
						+ "' onclick='RefreshDisplay(" + i + ")'><div>"
						+ dunbarNum[i];
				if (dunbarList[i].circleUserList.length < dunbarNum[i])
					dunbar += "(" + dunbarList[i].circleUserList.length + ")";
				dunbar += "</div></li>";
				$("#circle_list").append(dunbar);

				// if(i != 0){
				// var marginTop = margins[i];
				// marginTop += "px";
				// $("#circle_list").find("li:last").css("margin-top",
				// marginTop);
				// }
			}
			RefreshDisplay(0);
			
			share.apply_config({
				callback_url : 'http://apps.weibo.com/friendsfj/viewcircle/type=dunbar&uid=' + UID + '&m=home&circleID=' + dunbarList[0].circleID,
				circle_members : dunbarList[0].circleUserList,
				circle_name : dunbarList[0].circleName,
				circle_id : dunbarList[0].circleID,
				share_button : '#shareBtn',
				access_token : "2.00dHQyACRlzboD5859f59dfa0xlSM5"
			});
		}// end of if
	});

}

function circleInit() {
	share = new ShareCircle(
			{
				callback_url : "http://apps.weibo.com/friendsfj/viewcircle/type=circle&m=home&circleID="
						+ circleList[0].circleID,
				circle_members : circleList[0].circleUserList,
				circle_name : circleList[0].circleName,
				circle_id : circleList[0].circleID,
				share_button : '#shareBtn',
				access_token : "2.00dHQyACRlzboD5859f59dfa0xlSM5"
			});
	var circle_num = circleList.length;
	for ( var i = 0; i < circle_num; i++) {
		var cname = circleList[i].circleName;
		var members = circleList[i].circleUserList;
		var cid = "circle_" + i;
		var cli_id = "cli_" + i;
		var span_name_id = "sname_" + i;
		var span_num_id = "snum_" + i;
		var l = "<li id='" + cli_id + "' class='cli acceptableByCircleLogo'>"
				+ "<div class='group-header'>";
		// + "<div class='group-header' style='background:
		// url(\"/images/groupHeader.png\") no-repeat -6px -7px;
		// line-height:37px;'>"; //for plan2

		if (i == 0)
			l += "<a class='foldCircleBtn' href='javascript:void(0);' onclick='CircleLogoDispCtrl(";
		else
			l += "<a class='unfoldCircleBtn' href='javascript:void(0);' onclick='CircleLogoDispCtrl(";

		l += i
				+ ");'> "
				+ "<a class='circle_title' href='javascript:void(0);' onclick='showOrToggleSmallIconDisplay("
				+ i
				+ ");RefreshDisplay("
				+ i
				+ ");'>"
				+ "<span style='word-wrap:break-word;' id='"
				+ span_name_id
				+ "'>"
				+ cname
				+ "</span>"
				+ " (<span id='"
				+ span_num_id
				+ "'>"
				+ members.length
				+ "</span>)"
				+ "</a></div><div style='clear:both; zoom:1; width:100%;height:0;overflow:hidden;'></div>";

		if (i == 0) {
			l += "<div class='circle_item acceptableByCircleLogo' id='" + cid
					+ "'>";
		} else {
			l += "<div class='circle_item acceptableByCircleLogo' id='" + cid
					+ "' style='display:none'>";
		}

		var circle_logo_id = "circle_logo_" + i;
		var smallDisplay = "<ul class='circle_logo' id='" + circle_logo_id
				+ "'>";
		// for ( var j = 0; j < members.length; j++) {
		// if (j <= itemsPerPage - 1 || members.length <= itemsPerPage + 1) {
		// var uid = members[j].uid;
		// var img_url = members[j].imageUrl;
		// var screen_name = members[j].screenName;
		// var sli = "<li class='acceptableByCircleLogo deletable' inpos='" + j
		// + "' uid='" + uid
		// + "'><div class='small_member_icon'>"
		// + "<img src='http://tp1.sinaimg.cn" + img_url
		// + "' title='" + screen_name
		// + "'/>" + "</div></li>";
		// smallDisplay += sli;
		// } else if (j == itemsPerPage + 1) {
		// l += smallDisplay + "</ul>";
		// var sli = "<a style='float:left' href='javascript:void(0);'
		// onclick='Paging(" + i + "," + 1 + ")'>>></a>" + "</div></li>";
		// l += sli;
		// break;
		// }
		// }

		// if (j == members.length) {
		// l += smallDisplay + "</ul></div>"
		// + "</li>";
		// }

		for ( var j = 0; j < members.length && j < itemsPerPage; j++) {
			var uid = members[j].uid;
			var img_url = members[j].imageUrl;
			var screen_name = members[j].screenName;
			var sli = "<li class='acceptableByCircleLogo deletable' inpos='"
					+ j + "' uid='" + uid + "'><div class='small_member_icon'>"
					+ "<img src='http://tp1.sinaimg.cn" + img_url + "' title='"
					+ screen_name + "'/>" + "</div></li>";
			smallDisplay += sli;
		}
		l += smallDisplay + "</ul>";

		// add new paging button (2012-4-27)
		var lp = (members.length - members.length % itemsPerPage)
				/ itemsPerPage;
		var pagingBar = "<div style='clear:both; zoom:1; width:90%;height:0;overflow:hidden;'></div>"
				+ "<ul class='pagingBtnBar'>"
				+ "<li class='toFirstPageBtn' onclick='Paging("
				+ i
				+ ","
				+ 0
				+ ")'></li>"
				+ "<li class='toPrevPageBtn' onclick='Paging("
				+ i
				+ ","
				+ 0
				+ ")'></li>"
				+ "<li class='toNextPageBtn' onclick='Paging("
				+ i
				+ ","
				+ 1
				+ ")'></li>"
				+ "<li class='toLastPageBtn' onclick='Paging("
				+ i
				+ "," + lp + ")'></li>" + "</ul>";

		l += pagingBar + "</div></li>";
		// + "<div class='circle_item_bottom'></div>"; //for plan2

		$("#circle_list").append(l);

		// Display the first circle by default
		if (i == 0) {
			$("#diplay_circle_name").html(circleList[0].circleName);
			for ( var j = 0; j < members.length; j++) {
				AppendNewCard(i, j, "show");
				$("#display_list").attr("displayNo", 0);
			}
		}

	}

	$(".circle_logo > li").draggable({
		revert : "invalid",
		containment : $("#whole_circle").length ? "#whole_circle" : "document",
		opacity : 0.8,
		scroll : "true",
		helper : "clone",
		cursor : "move"
	});

	$(".cli").draggable({
		revert : "invalid",
		containment : $("#whole_circle").length ? "#circle_list" : "document",
		opacity : 0.8,
		scroll : "true",
		helper : "clone",
		cursor : "move",
		cancel : ".circle_logo"
	});

	$(".circle_item").droppable({
		accept : ".acceptableByCircleLogo",
		activeClass : "highlight-state",
		hoverClass : "hoverclass",
		drop : function(event, ui) {
			var dropItem = $(this);
			AddToCircleLogo(dropItem, ui.draggable);
		}
	});

	$("#display_list").droppable({
		accept : ".circle_logo > li",
		activeClass : "custom-state-active",
		drop : function(event, ui) {
			var dropItem = $(this);
			AddToDisplayArea(dropItem, ui.draggable);
		}
	});

	$("#delete-bar").droppable({
		accept : ".deletable",
		activeClass : "delete-state-active",
		hoverClass : "delete-state-hover",
		drop : function(event, ui) {
			DeleteItem(ui.draggable);
		}
	});
}

// function SwitchView(){
// var currentCircleNo = $("#display_list").attr("displayNo");
//	
// if (viewType == "card"){
// viewType = "graph";
// $("#display_list").hide();
// $("#infovis").html('');
// $("#graph_area").show();
// $("#switchBtn").hide();
// $("#switchBtn2").show();
// JitInit();
// }
// else{
// viewType = "card";
// $("#graph_area").hide();
// $("#display_list").show();
// RefreshDisplay(currentCircleNo);
// }
// }

function RebuildCircleList(circleNo, type) {
	$("#circle_list").children().remove();

	if (type == "card" || type == "graph") {
		var circle_num = circleList.length;
		for ( var i = 0; i < circle_num; i++) {
			var cname = circleList[i].circleName;
			var members = circleList[i].circleUserList;
			var cid = "circle_" + i;
			var cli_id = "cli_" + i;
			var span_name_id = "sname_" + i;
			var span_num_id = "snum_" + i;
			var l = "<li id='" + cli_id
					+ "' class='cli acceptableByCircleLogo'>"
					+ "<div class='group-header'>";

			if (i == 0)
				l += "<a class='foldCircleBtn' href='javascript:void(0);' onclick='CircleLogoDispCtrl(";
			else
				l += "<a class='unfoldCircleBtn' href='javascript:void(0);' onclick='CircleLogoDispCtrl(";

			l += i
					+ ");'> "
					+ "<a class='circle_title' href='javascript:void(0);' onclick='showOrToggleSmallIconDisplay("
					+ i
					+ ");RefreshDisplay("
					+ i
					+ ");'>"
					+ "<span style='word-wrap:break-word;' id='"
					+ span_name_id
					+ "'>"
					+ cname
					+ "</span>"
					+ " (<span id='"
					+ span_num_id
					+ "'>"
					+ members.length
					+ "</span>)"
					+ "</a></div><div style='clear:both; zoom:1; width:100%;height:0;overflow:hidden;'></div>";

			if (i == circleNo) {
				l += "<div class='circle_item acceptableByCircleLogo' id='"
						+ cid + "'>";
			} else {
				l += "<div class='circle_item acceptableByCircleLogo' id='"
						+ cid + "' style='display:none'>";
			}

			var circle_logo_id = "circle_logo_" + i;
			var smallDisplay = "<ul class='circle_logo' id='" + circle_logo_id
					+ "'>";

			for ( var j = 0; j < members.length && j < itemsPerPage; j++) {
				var uid = members[j].uid;
				var img_url = members[j].imageUrl;
				var screen_name = members[j].screenName;
				var sli = "<li class='acceptableByCircleLogo deletable' inpos='"
						+ j
						+ "' uid='"
						+ uid
						+ "'><div class='small_member_icon'>"
						+ "<img src='http://tp1.sinaimg.cn"
						+ img_url
						+ "' title='" + screen_name + "'/>" + "</div></li>";
				smallDisplay += sli;
			}
			l += smallDisplay + "</ul>";

			var lp = (members.length - members.length % itemsPerPage)
					/ itemsPerPage;
			var pagingBar = "<div style='clear:both; zoom:1; width:90%;height:0;overflow:hidden;'></div>"
					+ "<ul class='pagingBtnBar'>"
					+ "<li class='toFirstPageBtn' onclick='Paging("
					+ i
					+ ","
					+ 0
					+ ")'></li>"
					+ "<li class='toPrevPageBtn' onclick='Paging("
					+ i
					+ ","
					+ 0
					+ ")'></li>"
					+ "<li class='toNextPageBtn' onclick='Paging("
					+ i
					+ ","
					+ 1
					+ ")'></li>"
					+ "<li class='toLastPageBtn' onclick='Paging("
					+ i
					+ ","
					+ lp + ")'></li>" + "</ul>";

			l += pagingBar + "</div></li>";

			$("#circle_list").append(l);
		}

		$(".circle_logo > li").draggable(
				{
					revert : "invalid",
					containment : $("#whole_circle").length ? "#whole_circle"
							: "document",
					opacity : 0.8,
					scroll : "true",
					helper : "clone",
					cursor : "move"
				});

		$(".cli").draggable(
				{
					revert : "invalid",
					containment : $("#whole_circle").length ? "#circle_list"
							: "document",
					opacity : 0.8,
					scroll : "true",
					helper : "clone",
					cursor : "move",
					cancel : ".circle_logo"
				});

		$(".circle_item").droppable({
			accept : ".acceptableByCircleLogo",
			activeClass : "highlight-state",
			hoverClass : "hoverclass",
			drop : function(event, ui) {
				var dropItem = $(this);
				AddToCircleLogo(dropItem, ui.draggable);
			}
		});
	}
}

function SwitchView(type) {
	var currentCircleNo = 0;
	if (viewType != "dunbar") {
		currentCircleNo = $("#display_list").attr("displayNo");
//		$("#shareBtn").hide();
	}
	else {
//		$("#shareBtn").show();
	}

	if (type == "graph") {
		if (viewType == "dunbar") {
			RebuildCircleList(currentCircleNo, "graph");
			$("#display_list").attr("displayNo", currentCircleNo);
		}

		viewType = "graph";
		$("#graphViewBtn").addClass("active-state");
		$("#regularViewBtn").removeClass("active-state");
		$("#dunbarViewBtn").removeClass("active-state");
		$("#card_area").hide();
		$("#infovis").html('');
		$("#graph_area").show();
		
		share.apply_config({
			callback_url : 'http://apps.weibo.com/friendsfj/viewcircle/type=circle&m=home&circleID=' + circleList[currentCircleNo].circleID,
			circle_members : circleList[currentCircleNo].circleUserList,
			circle_name : circleList[currentCircleNo].circleName,
			circle_id : circleList[currentCircleNo].circleID,
			share_button : '#shareBtn',
			access_token : "2.00dHQyACRlzboD5859f59dfa0xlSM5"
		});

		JitInit();
	} else if (type == "card") {
		if (viewType == "dunbar") {
			RebuildCircleList(currentCircleNo, "card");
			$("#display_list").attr("displayNo", currentCircleNo);
		}

		viewType = "card";
		$("#regularViewBtn").addClass("active-state");
		$("#graphViewBtn").removeClass("active-state");
		$("#dunbarViewBtn").removeClass("active-state");
		$("#graph_area").hide();
		$("#card_area").show();
		
		share.apply_config({
			callback_url : 'http://apps.weibo.com/friendsfj/viewcircle/type=circle&m=home&circleID=' + circleList[currentCircleNo].circleID,
			circle_members : circleList[currentCircleNo].circleUserList,
			circle_name : circleList[currentCircleNo].circleName,
			circle_id : circleList[currentCircleNo].circleID,
			share_button : '#shareBtn',
			access_token : "2.00dHQyACRlzboD5859f59dfa0xlSM5"
		});

		RefreshDisplay(currentCircleNo);
	} else if (type == "dunbar") {
		viewType = "dunbar";
		$("#dunbarViewBtn").addClass("active-state");
		$("#regularViewBtn").removeClass("active-state");
		$("#graphViewBtn").removeClass("active-state");
		$("#graph_area").hide();
		$("#card_area").show();
		
		DunbarInit();
	}
}

function RefreshGraph() {
	$("#infovis").html('');
	$("#graph_area").show();
	JitInit();
}

function AppendNewCard(circleNo, inpos, display) {
	var circle = {};
	var card_li = "<li ";

	if (display == "hidden") {
		card_li += "style='display:none;' ";
	}

	if (circleNo == -1) {
		circle = garbageList;
		card_li += "class='card_li acceptableByCircleLogo'";
	} else if (viewType == "card") {
		circle = circleList[circleNo];
		card_li += "class='card_li acceptableByCircleLogo deletable'";
	} else if (viewType == "dunbar") {
		circle = dunbarList[circleNo];
		card_li += "class='card_li'";
	}

	var screen_name = circle.circleUserList[inpos].screenName;
	var img_url = "http://tp1.sinaimg.cn"
			+ circle.circleUserList[inpos].imageUrl;
	var friendUID = circle.circleUserList[inpos].uid;
	var friend_count = circle.circleUserList[inpos].friendsCount;
	var follower_count = circle.circleUserList[inpos].followersCount;
	var weibo_count = circle.circleUserList[inpos].weiboCount;
	var description = circle.circleUserList[inpos].description;
	var score = circle.circleUserList[inpos].score;
	var url = "http://weibo.com/u/" + friendUID;
	var tags = circle.circleUserList[inpos].tags;

	var rl = StringRealLength(screen_name);

	var $tip = $("#tip").clone();
	$tip.attr("id", "tip_" + friendUID);
	$tip.find(".tip_screenName").html(CutScreenName(screen_name, 32));
	if (rl <= 14)
		$tip.find(".tip_screenName").addClass("tip_screenName_big");
	else
		$tip.find(".tip_screenName").addClass("tip_screenName_small");
	$tip.find(".tip_avatar").attr("src", img_url);
	$tip.find(".friendNum").html(friend_count);
	$tip.find(".followerNum").html(follower_count);
	$tip.find(".weiboNum").html(weibo_count);

	if (description == null || description == "")
		$tip.find(".tags").css("display", "none");
	else
		$tip.find(".tags").html(description);
	if (tags.length != 0)
		$tip.find(".tags").html(
				"<hr><span class='tagTitle'>标签: </span>&nbsp;" + tags);

	var card = "<div class='card'>" + "<img src='" + img_url
			+ "'/><div class='card_panel_r'>";

	if (rl <= 12) {
		card += "<div class='screen_name big'>";
	} else if (rl > 12 && rl <= 14) {
		card += "<div class='screen_name middle'>";
	} else {
		screen_name = CutScreenName(screen_name, 28);
		card += "<div class='screen_name small'>";
	}

	card += "<a href='" + url + "' target='top'>" + screen_name + "</a></div>"
			+ CreateRater(score) + "</div></div>";

	card_li += "id='card_li_" + friendUID + "' uid='" + friendUID + "'>" + card
			+ "</li>";

	$("#display_list").append(card_li);
	$("#display_list").append($tip);

	// Add draggable attribute
	var $thisCardLi = $(".card_li:last");
	$thisCardLi.draggable({
		revert : "invalid",
		containment : $("#whole_circle").length ? "#whole_circle" : "document",
		opacity : 0.8,
		helper : "clone",
		cursor : "move"
	});

	// Add tracable tips
	var $thisCard = $(".card:last");
	$thisCard.bind("mousemove", function(event) {
		var id = $(this).parent().attr("uid");
		// console.log(event.pageX + "\t" + event.pageY);
		$("#tip_" + id).offset({
			top : event.pageY + 10,
			left : event.pageX + 10
		});
	});
	$thisCard.mouseleave(function(event) {
		var id = $(this).parent().attr("uid");
		$("#tip_" + id).hide();
	});
	$thisCard.mouseenter(function(event) {
		var id = $(this).parent().attr("uid");
		$("#tip_" + id).show();
	});

	return $thisCardLi;
}

function CutScreenName(s, maxLength) {
	if (StringRealLength(s) < maxLength)
		return s;

	// console.log(maxLength - 2);

	for ( var i = s.length - 1; i >= 0; i--) {
		s = s.substring(0, i);
		if (StringRealLength(s) <= maxLength - 2)
			break;
	}
	return s + "...";
}

function CreateRater(score) {

	var remain = Math.floor(score * 2 + 0.5);
	var lighthNum = Math.floor(remain / 2);
	remain %= 2;
	var r = "<ul class='star_rater'>";
	for ( var i = 0; i < 5; i++) {
		if (i < lighthNum)
			// r += "<li><img src='/images/icons/star.png' /></li>";
			r += "<li><div class='img_star'></div></li>";
		else if (i < lighthNum + remain)
			// r += "<li><img src='/images/icons/star_half.png' /></li>";
			r += "<li><div class='img_half_star'></div></li>";
		else
			// r += "<li><img src='/images/icons/star_grey.png' /></li>";
			r += "<li><div class='img_grey_star'></div></li>";
	}
	r += "</ul>";
	/*
	 * var grade = 1; var remain = score % grade; var lighthNum = (score -
	 * remain)/grade; var carry = (remain >= grade/2) ? true : false;
	 * 
	 * var r = "<ul class='star_rater'>"; var i = 0; while(i < lighthNum){ r += "<li><img
	 * src='/images/icons/star.png' /></li>"; i ++; } if(carry){ r += "<li><img
	 * src='/images/icons/star.png' /></li>"; i ++; } else{ r += "<li><img
	 * src='/images/icons/star_half.png' /></li>"; i ++; } while(i < 5){ r += "<li><img
	 * src='/images/icons/star_grey.png' /></li>"; i ++; } r += "</ul>";
	 */

	return r;
}

function DeleteItem($item) {
	var $parent = $item.parent();
	var circleno = -1;
	if ($item.find(".card").length != 0) {
		circleno = $parent.attr("displayno");
	} else {
		var id = $parent.attr("id");
		var tmp = id.split("_");
		circleno = tmp[tmp.length - 1];
	}
	var fid = $item.attr("uid");
	var cid = circleList[circleno].circleID;

	// TODO: send delete request to server
	$
			.ajax({
				type : "post",
				url : "circle.do?m=delete",
				data : {
					friendUID : fid,
					circle : cid
				},
				success : function(data) {
					if (data == "success") {
						$item.fadeOut(function() {
							$item.remove();
						});

						if ($item.find(".card").length != 0) { // delete from
																// display area
							// delete tip
							$("#tip_" + fid).remove();

							// delete corresponding item in circle logo
							$("#circle_logo_" + circleno).children().each(
									function(index, element) {
										if ($(element).attr("uid") == fid) {
											$(element).fadeOut(function() {
												$(element).remove();
											});
										}
									});
						} else {
							if (circleno == $("#display_list")
									.attr("displayno")) {
								$("#display_list").children("li").each(
										function(index, element) {
											if ($(element).attr("uid") == $item
													.attr("uid")) {
												$(element).fadeOut(function() {
													$(element).remove();
												});
											}
										});
							}
						}

						// Add to garbage circle
						var circleListNum = -1;
						if ($("#circle_list").find("li#cli_-1").length == 0) {
							var garbage_li = "<li id='cli_-1' class='cli acceptableByCircleLogo'>";
							garbage_li += "<div class='group-header'>";
							garbage_li += "<a class='foldCircleBtn' href='javascript:void(0);' onclick='CircleLogoDispCtrl(-1)'></a>";
							garbage_li += "<a style='float:left' href='javascript:void(0);' onclick='RefreshDisplay("
									+ circleListNum + ");'>&nbsp;";
							garbage_li += "<span id='sname_" + circleListNum
									+ "'>回收站</span>(";
							garbage_li += "<span id='snum_" + circleListNum
									+ "'>0</span>)</a>";
							garbage_li += "<div style='clear:both'></div>";
							garbage_li += "<div class='circle_item acceptableByCircleLogo' id='circle_"
									+ circleListNum + "'>";
							garbage_li += "<ul class='circle_logo' id='circle_logo_"
									+ circleListNum + "'>";
							garbage_li += "</ul></div><div></li>";
							$("#circle_list").append(garbage_li);

							// build new paging bar (2012-4-28)
							var pagingBar = "<div style='clear:both; zoom:1; width:90%;height:0;overflow:hidden;'></div>"
									+ "<ul class='pagingBtnBar'>"
									+ "<li class='toFirstPageBtn' onclick='Paging("
									+ -1
									+ ","
									+ 0
									+ ")'></li>"
									+ "<li class='toPrevPageBtn' onclick='Paging("
									+ -1
									+ ","
									+ 0
									+ ")'></li>"
									+ "<li class='toNextPageBtn' onclick='Paging("
									+ -1
									+ ","
									+ 0
									+ ")'></li>"
									+ "<li class='toLastPageBtn' onclick='Paging("
									+ -1 + "," + 0 + ")'></li>" + "</ul>";
							$("#circle_-1").append(pagingBar);

							$("#cli_-1")
									.draggable(
											{
												revert : "invalid",
												containment : $("#whole_circle").length ? "#whole_circle"
														: "document",
												opacity : 0.8,
												scroll : "true",
												helper : "clone",
												cursor : "move",
												cancel : ".circle_logo"
											});
						} else { // if it has 四大皆空 image
							$("#circle_logo_-1").find(".empty_img").remove();
						}

						// adjust page
						var length = garbageList.circleUserList.length + 1;
						if (length > itemsPerPage) {
							var remain = length % itemsPerPage;
							var p = (length - remain) / itemsPerPage;
							Paging(-1, p);
						}

						// refresh data list
						var array = [];
						var obj = {};
						var pos = -1;
						for ( var i = circleList[circleno].circleUserList.length - 1; i >= 0; i--) {
							obj = circleList[circleno].circleUserList.pop();
							if (obj.uid == fid) {
								pos = i;
								break;
							}
							array.push(obj);
						}
						garbageList.circleUserList.push(obj);
						for ( var i = array.length - 1; i >= 0; i--) {
							circleList[circleno].circleUserList.push(array[i]);
						}
						$("#snum_" + circleno).html(
								circleList[circleno].circleUserList.length);

						// adjust from page
						var r = pos % itemsPerPage;
						var curPage = (pos - r) / itemsPerPage;
						var start = (curPage + 1) * itemsPerPage - 1;
						if (start < circleList[circleno].circleUserList.length)
							CreateSmallCircleItem(circleno, start, "hidden")
									.fadeIn();
						if (circleList[circleno].circleUserList.length <= itemsPerPage)
							$("#circle_" + circleno).find("a").remove();

						var inpos = garbageList.circleUserList.length - 1;
						var $newItem = CreateSmallCircleItem(-1, inpos,
								"hidden");
						$newItem.fadeIn(function() {
							$("#snum_-1").html(
									garbageList.circleUserList.length);
						});

						if ($("#display_list").attr("displayno") == -1) {
							var $newCard = AppendNewCard(-1, inpos, "hidden");
							$newCard.fadeIn();
						}

					}
				}
			});
}

function RenameAction() {
	if (viewType == "dunbar")
		return;
//	console.log($("#diplay_circle_name").children("#input_cname"));
	if($("#diplay_circle_name").children("#input_cname").length > 0)
		return;
	$("#diplay_circle_name").html("<input type='text' id='input_cname'/>");
	var circleNo = $("#display_list").attr("displayNo");
	var oldName = circleList[circleNo].circleName;
	$("#input_cname").val(oldName);
	$("#changeNameBtn").hide();
	$("#saveNameBtn").show();
}

function RenameCircle() {
	if (viewType == "dunbar")
		return;

	var circleNo = $("#display_list").attr("displayNo");
	var newName = $("#input_cname").val();
	if (newName.length == 0) {
		$("#input_cname").addClass("warning");
		setTimeout(function() {
			$("#input_cname").removeClass("warning");
		}, 1000);
		return;
	}

	var circleId = circleList[circleNo].circleID;
	// TODO: ajax;
	$
			.ajax({
				type : "post",
				url : "/circle.do?m=rename",
				data : {
					circle : circleId,
					newCircleName : newName
				},
				success : function(data) {
					if (data == "success") {
						circleList[circleNo].circleName = newName;
						$("#sname_" + circleNo).html(newName);
						$("#diplay_circle_name").html(newName);
						$("#changeNameBtn").show();
						$("#saveNameBtn").hide();

						$("#msgBox").show();
						$("#renameSuccess").show();
						$("#renameFail").hide();
						setTimeout(function() {
							$("#msgBox").fadeOut();
						}, 1500);

						share.apply_config({
									callback_url : 'http://apps.weibo.com/friendsfj/viewcircle/type=circle&m=home&circleID='
											+ circleList[circleNo].circleID,
									circle_members : circleList[circleNo].circleUserList,
									circle_name : circleList[circleNo].circleName,
									circle_id : circleList[circleNo].circleID,
									share_button : '#shareBtn',
									access_token : "2.00dHQyACRlzboD5859f59dfa0xlSM5"
								});
					} else if (data == "failed") {
						$("#msgBox").show();
						$("#renameFail").show();
						$("#renameSuccess").hide();
						setTimeout(function() {
							$("#msgBox").fadeOut();
						}, 1500);
					}

				}
			});
}

function Paging(circleNo, page) {
	// delect old items
	// $("#circle_logo_" + circleNo).children("li").each(function(index,
	// element) {
	// $(element).remove();
	// });
	// $("#circle_" + circleNo).find("a").remove();

	$("#circle_logo_" + circleNo).children().each(function(index, element) {
		$(element).remove();
	});
	$("#circle_" + circleNo).find(".pagingBtnBar").remove();
	$("#circle_" + circleNo).find("div").remove();
	// console.log($("#circle_" + circleNo));

	// add new items
	var members = [];
	if (circleNo == -1)
		members = garbageList.circleUserList;
	else
		members = circleList[circleNo].circleUserList;
	for ( var j = page * itemsPerPage; j < (page + 1) * itemsPerPage
			&& j < members.length; j++) {
		CreateSmallCircleItem(circleNo, j, "show");
	}

	// build new paging bar (2012-4-28)
	var lp = (members.length - members.length % itemsPerPage) / itemsPerPage;
	var np = (page + 1 > lp) ? lp : page + 1;
	var pp = (page - 1 < 0) ? 0 : page - 1;
	// console.log(lp);

	var pagingBar = "<div style='clear:both; zoom:1; width:90%;height:0;overflow:hidden;'></div>"
			+ "<ul class='pagingBtnBar'>"
			+ "<li class='toFirstPageBtn' onclick='Paging("
			+ circleNo
			+ ","
			+ 0
			+ ")'></li>"
			+ "<li class='toPrevPageBtn' onclick='Paging("
			+ circleNo
			+ ","
			+ pp
			+ ")'></li>"
			+ "<li class='toNextPageBtn' onclick='Paging("
			+ circleNo
			+ ","
			+ np
			+ ")'></li>"
			+ "<li class='toLastPageBtn' onclick='Paging("
			+ circleNo + "," + lp + ")'></li>" + "</ul>";
	$("#circle_" + circleNo).append(pagingBar);

	// if (page > 0) {
	// var p = page - 1;
	// var sli = "<a href='javascript:void(0);' onclick='Paging(" + circleNo +
	// "," + p + ")'><<</a>";
	// $("#circle_" + circleNo).append(sli);
	// }
	// if (j < members.length) {
	// var p = page + 1;
	// var sli = "<a href='javascript:void(0);' onclick='Paging(" + circleNo +
	// "," + p + ")'>>></a></div>";
	// $("#circle_" + circleNo).append(sli);
	// }

}

function AddToDisplayArea($drop, $drag) {
	var $parent = $drag.parent();
	var id = $parent.attr("id");
	var tmp = id.split("_");
	var circleFromNo = tmp[tmp.length - 1];
	var circleToNo = $("#display_list").attr("displayno");

	// console.log($drag);
	var fid = $drag.attr("uid");

	if (circleFromNo == circleToNo)
		return;

	if (circleToNo == -1) { // delete
		DeleteItem($drag);
		return;
	}

	if (circleFromNo == -1) { // recycle from garbage
		var circleToID = circleList[circleToNo].circleID;
		$
				.ajax({
					type : "post",
					url : "circle.do?m=add",
					data : {
						circle : circleToID,
						friendUID : fid
					},
					success : function(data) {
						if (data == "success") {
							// refresh data list
							var array = [];
							var obj = {};
							var pos = -1;
							for ( var i = garbageList.circleUserList.length - 1; i >= 0; i--) {
								obj = garbageList.circleUserList.pop();
								if (obj.uid == fid) {
									pos = i;
									break;
								}
								array.push(obj);
							}
							circleList[circleToNo].circleUserList.push(obj);
							for ( var i = array.length - 1; i >= 0; i--) {
								garbageList.circleUserList.push(array[i]);
							}
							var inpos = circleList[circleToNo].circleUserList.length - 1;
							var $newCard = AppendNewCard(circleToNo, inpos,
									"hidden");

							$drag
									.fadeOut(function() {
										$newCard.fadeIn();

										var length1 = garbageList.circleUserList.length;
										var length2 = circleList[circleToNo].circleUserList.length;
										$("#snum_" + circleFromNo)
												.html(length1);
										$("#snum_" + circleToNo).html(length2);

										// refresh corresponding circle logo
										// Adjust the page
										if ($("#circle_logo_" + circleToNo)
												.children().length + 1 > itemsPerPage) {
											$("#circle_logo_" + circleToNo)
													.children()
													.each(
															function(index,
																	element) {
																$(element)
																		.remove();
															});
											$("#circle_" + circleNo).find(
													".pagingBtnBar").remove();
											$("#circle_" + circleNo)
													.find("div").remove();

											var remain = length2 % itemsPerPage;
											var p = (length2 - remain)
													/ itemsPerPage;

											for ( var i = 0; i < remain - 1; i++) {
												CreateSmallCircleItem(
														circleToNo, i + p
																* itemsPerPage,
														"show");
											}

											// var pp = p - 1;
											// var sli = "<a
											// href='javascript:void(0);'
											// onclick='Paging(" + circleToNo +
											// "," + pp + ")'><<</a>";
											// $("#circle_" +
											// circleToNo).append(sli);

											// build new paging bar (2012-4-28)
											var pp = p - 1;

											var pagingBar = "<div style='clear:both; zoom:1; width:90%;height:0;overflow:hidden;'></div>"
													+ "<ul class='pagingBtnBar'>"
													+ "<li class='toFirstPageBtn' onclick='Paging("
													+ circleNo
													+ ","
													+ 0
													+ ")'></li>"
													+ "<li class='toPrevPageBtn' onclick='Paging("
													+ circleNo
													+ ","
													+ pp
													+ ")'></li>"
													+ "<li class='toNextPageBtn' onclick='Paging("
													+ circleNo
													+ ","
													+ p
													+ ")'></li>"
													+ "<li class='toLastPageBtn' onclick='Paging("
													+ circleNo
													+ ","
													+ p
													+ ")'></li>" + "</ul>";
											$("#circle_" + circleToNo).append(
													pagingBar);
										}

										var $item = CreateSmallCircleItem(
												circleToNo, inpos, "hidden");
										$item.fadeIn();

										// adjust from page
										var r = pos % itemsPerPage;
										var curPage = (pos - r) / itemsPerPage;
										var start = (curPage + 1)
												* itemsPerPage - 1;
										if (start < garbageList.circleUserList.length)
											CreateSmallCircleItem(circleFromNo,
													start, "hidden").fadeIn();
										// if (garbageList.circleUserList.length
										// <= itemsPerPage){
										// $("#circle_" +
										// circleFromNo).find("a").remove();
										// }
										if (garbageList.circleUserList.length == 0) {
											$(
													"<img class='empty_img'src='images/icons/empty.png'>")
													.appendTo(
															$("#circle_logo_-1"));
										}

									});

						}
					}
				});
		return;
	}

	var circleFromID = circleList[circleFromNo].circleID;
	var circleToID = circleList[circleToNo].circleID;

	// TODO: send add item request to server
	$
			.ajax({
				type : "post",
				url : "circle.do?m=move",
				data : {
					fromCircle : circleFromID,
					toCircle : circleToID,
					friendUID : fid
				},
				success : function(data) {
					if (data == "success") {
						// refresh data list
						var array = [];
						var obj = {};
						var pos = -1;
						for ( var i = circleList[circleFromNo].circleUserList.length - 1; i >= 0; i--) {
							obj = circleList[circleFromNo].circleUserList.pop();
							if (obj.uid == fid) {
								pos = i;
								break;
							}
							array.push(obj);
						}
						circleList[circleToNo].circleUserList.push(obj);
						for ( var i = array.length - 1; i >= 0; i--) {
							circleList[circleFromNo].circleUserList
									.push(array[i]);
						}
						var inpos = circleList[circleToNo].circleUserList.length - 1;
						var $newCard = AppendNewCard(circleToNo, inpos,
								"hidden");

						$drag
								.fadeOut(function() {
									$newCard.fadeIn();

									var length1 = circleList[circleFromNo].circleUserList.length;
									var length2 = circleList[circleToNo].circleUserList.length;
									$("#snum_" + circleFromNo).html(length1);
									$("#snum_" + circleToNo).html(length2);

									// refresh corresponding circle logo
									// Adjust the page
									if ($("#circle_logo_" + circleToNo)
											.children().length + 1 > itemsPerPage) {
										$("#circle_logo_" + circleToNo)
												.children()
												.each(function(index, element) {
													$(element).remove();
												});
										$("#circle_" + circleToNo).find("div")
												.remove();
										$("#circle_" + circleToNo).find(
												".pagingBtnBar").remove();

										var remain = length2 % itemsPerPage;
										var p = (length2 - remain)
												/ itemsPerPage;

										for ( var i = 0; i < remain - 1; i++) {
											CreateSmallCircleItem(circleToNo, i
													+ p * itemsPerPage, "show");
										}

										// var pp = p - 1;
										// var sli = "<a
										// href='javascript:void(0);'
										// onclick='Paging(" + circleToNo + ","
										// + pp + ")'><<</a>";
										// $("#circle_" +
										// circleToNo).append(sli);

										// build new paging bar (2012-4-28)
										var pp = p - 1;

										var pagingBar = "<div style='clear:both; zoom:1; width:90%;height:0;overflow:hidden;'></div>"
												+ "<ul class='pagingBtnBar'>"
												+ "<li class='toFirstPageBtn' onclick='Paging("
												+ circleNo
												+ ","
												+ 0
												+ ")'></li>"
												+ "<li class='toPrevPageBtn' onclick='Paging("
												+ circleNo
												+ ","
												+ pp
												+ ")'></li>"
												+ "<li class='toNextPageBtn' onclick='Paging("
												+ circleNo
												+ ","
												+ p
												+ ")'></li>"
												+ "<li class='toLastPageBtn' onclick='Paging("
												+ circleNo
												+ ","
												+ p
												+ ")'></li>" + "</ul>";
										$("#circle_" + circleNo).append(
												pagingBar);
									}

									var $item = CreateSmallCircleItem(
											circleToNo, inpos, "hidden");
									$item.fadeIn();

									// adjust from page
									var r = pos % itemsPerPage;
									var curPage = (pos - r) / itemsPerPage;
									var start = (curPage + 1) * itemsPerPage
											- 1;
									if (start < circleList[circleFromNo].circleUserList.length)
										CreateSmallCircleItem(circleFromNo,
												start, "hidden").fadeIn();
									// if
									// (circleList[circleFromNo].circleUserList.length
									// <= itemsPerPage)
									// $("#circle_" +
									// circleFromNo).find("a").remove();

								});
					}
				}
			});
}

function AddToCircleLogo($drop, $drag) {
	// Merge
	if ($drag.find(".circle_logo").length != 0) {
		var dropId = $drop.find("ul").attr("id");
		var tmp = dropId.split("_");
		var circleToNo = tmp[tmp.length - 1];
		var name1 = $("#sname_" + circleToNo).html();

		var dragId = $drag.find("ul").attr("id");
		var tmp2 = dragId.split("_");
		var circleFromNo = tmp2[tmp2.length - 1];
		var name2 = $("#sname_" + circleFromNo).html();

		var circleFromID = circleList[circleFromNo].circleID;
		var circleToID = circleList[circleToNo].circleID;

		var radioArray = $("input[type='radio']");
		$(radioArray[0]).attr("value", name1);
		$("#c1_name").html(name1);
		$(radioArray[1]).attr("value", name2);
		$("#c2_name").html(name2);
		$("#self_defined_name").val("");

		$("#dialog_form")
				.dialog(
						{
							height : 260,
							width : 350,
							modal : true,
							buttons : {
								"确定" : function() {
									var bValid = false;
									var newName = "";

									if ($(radioArray[0]).attr("checked") == "checked") {
										newName = $(radioArray[0]).val();
										bValid = true;
									} else if ($(radioArray[1]).attr("checked") == "checked") {
										newName = $(radioArray[1]).val();
										bValid = true;
									} else if ($(radioArray[2]).attr("checked") == "checked") {
										newName = $("#self_defined_name").val();
										bValid = true;
									}

									if (bValid) {
										// TODO: send merge request to server
										$
												.ajax({
													type : "post",
													url : "circle.do?m=combine&_t="
															+ getCurrentTime(),
													data : {
														fromCircle : circleFromID,
														toCircle : circleToID,
														newCircleName : newName
													},
													success : function(data) {
														if (data != "failed") {
															// refresh data list
															var length2 = circleList[circleFromNo].circleUserList.length;

															var newCircleUserList = eval(data);
															circleList[circleToNo].circleUserList = newCircleUserList;
															// for(var i = 0; i
															// < length2; i ++){
															// var item =
															// circleList[circleFromNo].circleUserList[i];
															// circleList[circleToNo].circleUserList.push(item);
															// }
															for ( var i = 0; i < length2; i++) {
																circleList[circleFromNo].circleUserList
																		.pop();
															}

															circleList[circleToNo].circleName = newName;
															var l = circleList[circleToNo].circleUserList.length;
															$(
																	"#sname_"
																			+ circleToNo)
																	.html(
																			newName);
															$(
																	"#snum_"
																			+ circleToNo)
																	.html(l);

															// refresh display
															// area
															var displayno = $(
																	"#display_list")
																	.attr(
																			"displayno");
															if (displayno == circleToNo) {
																RefreshDisplay(circleToNo);
															}
															if (displayno == circleFromNo) {
																RefreshDisplay(circleFromNo);
															}

															// adjust page
															$(
																	"#circle_logo_"
																			+ circleToNo)
																	.children(
																			"")
																	.each(
																			function(
																					index,
																					element) {
																				$(
																						element)
																						.remove();
																			});
															$(
																	"#circle_"
																			+ circleToNo)
																	.find("div")
																	.remove();
															$(
																	"#circle_"
																			+ circleToNo)
																	.find(
																			".pagingBtnBar")
																	.remove();

															var remain = (l
																	% itemsPerPage == 0) ? l
																	: l
																			% itemsPerPage;
															var p = (l - remain)
																	/ itemsPerPage;
															for ( var i = 0; i < remain; i++) {
																CreateSmallCircleItem(
																		circleToNo,
																		i
																				+ p
																				* itemsPerPage,
																		"show");
															}
															// if(l >
															// itemsPerPage){
															// var pp = p - 1;
															// var sli = "<a
															// href='javascript:void(0);'
															// onclick='Paging("
															// + circleToNo +
															// "," + pp +
															// ")'><<</a>";
															// $("#circle_" +
															// circleToNo).append(sli);
															// }

															// build new paging
															// bar (2012-4-28)
															var pp = p - 1;
															var pagingBar = "<div style='clear:both; zoom:1; width:90%;height:0;overflow:hidden;'></div>"
																	+ "<ul class='pagingBtnBar'>"
																	+ "<li class='toFirstPageBtn' onclick='Paging("
																	+ circleToNo
																	+ ","
																	+ 0
																	+ ")'></li>"
																	+ "<li class='toPrevPageBtn' onclick='Paging("
																	+ circleToNo
																	+ ","
																	+ pp
																	+ ")'></li>"
																	+ "<li class='toNextPageBtn' onclick='Paging("
																	+ circleToNo
																	+ ","
																	+ p
																	+ ")'></li>"
																	+ "<li class='toLastPageBtn' onclick='Paging("
																	+ circleToNo
																	+ ","
																	+ p
																	+ ")'></li>"
																	+ "</ul>";
															$(
																	"#circle_"
																			+ circleToNo)
																	.append(
																			pagingBar);

															$(
																	"#cli_"
																			+ circleToNo)
																	.fadeOut(
																			function() {
																				$(
																						"#cli_"
																								+ circleToNo)
																						.fadeIn();
																			});
															$(
																	"#cli_"
																			+ circleFromNo)
																	.fadeOut(
																			function() {
																				$(
																						"#cli_"
																								+ circleFromNo)
																						.remove();
																			});

															$("#dialog_form")
																	.dialog(
																			"close");
														}// end of
															// if(data!="failed")
													}// end of ajax's success
												});

									}
								},
								"取消" : function() {
									$(this).dialog("close");
								}
							}
						});
	}

	// add single item to circle
	else {
		var dropId = $drop.find("ul").attr("id");
		var tmp = dropId.split("_");
		var circleToNo = tmp[tmp.length - 1];

		var element = $drag.parent();
		var dragId = $(element).attr("id");
		var circleFromNo = -1;
		// the item is from display list
		if (dragId == "display_list") {
			circleFromNo = $(element).attr("displayno");
		}
		// the item is from circle logo
		else {
			var tmp1 = dragId.split("_");
			circleFromNo = tmp1[tmp1.length - 1];
		}

		if (circleFromNo == circleToNo)
			return;

		if (circleFromNo == -1) { // recycle from garbage
			var fid = $drag.attr("uid");
			var circleToID = circleList[circleToNo].circleID;

			// TODO: send add item reqest to server
			$
					.ajax({
						type : "post",
						url : "circle.do?m=add",
						data : {
							circle : circleToID,
							friendUID : fid
						},
						success : function(data) {
							if (data == "success") {
								// adjust page
								var dropPageLength = $(
										"#circle_logo_" + circleToNo)
										.children().length;
								if (dropPageLength + 1 > itemsPerPage) {
									var remain = (circleList[circleToNo].circleUserList.length + 1)
											% itemsPerPage;
									var lastPage = (circleList[circleToNo].circleUserList.length + 1 - remain)
											/ itemsPerPage;
									Paging(circleToNo, lastPage);
								}

								// refresh data list
								var array = [];
								var obj = {};
								var pos = -1;
								for ( var i = garbageList.circleUserList.length - 1; i >= 0; i--) {
									obj = garbageList.circleUserList.pop();
									if (obj.uid == fid) {
										pos = i;
										break;
									}
									array.push(obj);
								}
								circleList[circleToNo].circleUserList.push(obj);
								for ( var i = array.length - 1; i >= 0; i--) {
									garbageList.circleUserList.push(array[i]);
								}

								var inpos = circleList[circleToNo].circleUserList.length - 1;
								var $newItem = CreateSmallCircleItem(
										circleToNo, inpos, "hidden");
								var $newCard = {};

								$drag
										.fadeOut(function() {
											$drag.remove();
											$drop.find(".empty_img").remove();
											$newItem
													.fadeIn(function() {
														$("#snum_" + circleToNo)
																.html(
																		circleList[circleToNo].circleUserList.length);
													});

											if ($("#display_list").attr(
													"displayno") == circleToNo) {
												$newCard = AppendNewCard(
														circleToNo, inpos,
														"hidden");
												$newCard.fadeIn();
											}
											if ($("#display_list").attr(
													"displayno") == circleFromNo) {
												// console.log(111);
												// console.log($drag);
												$("#display_list")
														.children()
														.each(
																function(index,
																		element) {
																	if ($(
																			element)
																			.attr(
																					"uid") == $drag
																			.attr("uid")) {
																		$(
																				element)
																				.fadeOut(
																						function() {
																							$(
																									element)
																									.remove();
																						});
																	}
																});
											}

											$("#snum_" + circleFromNo)
													.html(
															garbageList.circleUserList.length);

											// adjust from page
											var r = pos % itemsPerPage;
											var curPage = (pos - r)
													/ itemsPerPage;
											var start = (curPage + 1)
													* itemsPerPage - 1;
											if (start < garbageList.circleUserList.length)
												CreateSmallCircleItem(-1,
														start, "hidden")
														.fadeIn();
											// if
											// (garbageList.circleUserList.length
											// <= itemsPerPage)
											// $("#circle_-1").find("a").remove();
										});

								// refresh the circle logo if $drag is from
								// display area
								if (dragId == "display_list") {
									$("#circle_logo_" + circleFromNo)
											.children()
											.each(
													function(index, element) {
														if ($(element).attr(
																"uid") == fid) {
															$(element)
																	.fadeOut(
																			function() {
																				$(
																						element)
																						.remove();
																			});
														}
													});
								}

								if (garbageList.circleUserList.length == 0) {
									$(
											"<img class='empty_img'src='/images/icons/empty.png'>")
											.appendTo($("#circle_logo_-1"));
								}

							}
						}
					});

		}

		else {
			var fid = $drag.attr("uid");
			var circleFromID = circleList[circleFromNo].circleID;
			var circleToID = circleList[circleToNo].circleID;

			// TODO: send add item reqest to server
			$
					.ajax({
						type : "post",
						url : "circle.do?m=move",
						data : {
							fromCircle : circleFromID,
							toCircle : circleToID,
							friendUID : fid
						},
						success : function(data) {
							if (data == "success") {
								// adjust page
								var dropPageLength = $(
										"#circle_logo_" + circleToNo)
										.children().length;
								if (dropPageLength + 1 > itemsPerPage) {
									var remain = (circleList[circleToNo].circleUserList.length + 1)
											% itemsPerPage;
									var lastPage = (circleList[circleToNo].circleUserList.length + 1 - remain)
											/ itemsPerPage;
									Paging(circleToNo, lastPage);
								}

								// refresh data list
								var array = [];
								var obj = {};
								var pos = -1;
								for ( var i = circleList[circleFromNo].circleUserList.length - 1; i >= 0; i--) {
									obj = circleList[circleFromNo].circleUserList
											.pop();
									if (obj.uid == fid) {
										pos = i;
										break;
									}
									array.push(obj);
								}
								circleList[circleToNo].circleUserList.push(obj);
								for ( var i = array.length - 1; i >= 0; i--) {
									circleList[circleFromNo].circleUserList
											.push(array[i]);
								}

								var inpos = circleList[circleToNo].circleUserList.length - 1;
								var $newItem = CreateSmallCircleItem(
										circleToNo, inpos, "hidden");
								var $newCard = {};

								$drag
										.fadeOut(function() {
											$drag.remove();
											$drop.find(".empty_img").remove();
											$newItem
													.fadeIn(function() {
														$("#snum_" + circleToNo)
																.html(
																		circleList[circleToNo].circleUserList.length);
													});

											if ($("#display_list").attr(
													"displayno") == circleToNo) {
												$newCard = AppendNewCard(
														circleToNo, inpos,
														"hidden");
												$newCard.fadeIn();
											}
											if ($("#display_list").attr(
													"displayno") == circleFromNo) {
												// console.log(111);
												// console.log($drag);
												$("#display_list")
														.children()
														.each(
																function(index,
																		element) {
																	if ($(
																			element)
																			.attr(
																					"uid") == $drag
																			.attr("uid")) {
																		$(
																				element)
																				.fadeOut(
																						function() {
																							$(
																									element)
																									.remove();
																						});
																	}
																});
											}

											$("#snum_" + circleFromNo)
													.html(
															circleList[circleFromNo].circleUserList.length);

											// adjust from page
											var r = pos % itemsPerPage;
											var curPage = (pos - r)
													/ itemsPerPage;
											var start = (curPage + 1)
													* itemsPerPage - 1;
											if (start < circleList[circleFromNo].circleUserList.length)
												CreateSmallCircleItem(
														circleFromNo, start,
														"hidden").fadeIn();
											// if
											// (circleList[circleFromNo].circleUserList.length
											// <= itemsPerPage)
											// $("#circle_" +
											// circleFromNo).find("a").remove();
										});

								// refresh the circle logo if $drag is from
								// display area
								if (dragId == "display_list") {
									$("#circle_logo_" + circleFromNo)
											.children()
											.each(
													function(index, element) {
														if ($(element).attr(
																"uid") == fid) {
															$(element)
																	.fadeOut(
																			function() {
																				$(
																						element)
																						.remove();
																			});
														}
													});
								}

								if (circleList[circleFromNo].circleUserList.length == 0) {
									// console.log("empty");
									$(
											"<img class='empty_img'src='/images/icons/empty.png'>")
											.appendTo($(element));
								}

							}
						}
					});
		}
	}
}

function CreateSmallCircleItem(circleNo, inpos, display) {
	var li = "<li ";
	var circle = {};

	if (display == "hidden") {
		li += "style='display:none'";
	}

	if (circleNo == -1) {
		li += "class='acceptableByCircleLogo' ";
		circle = garbageList;
	} else {
		li += "class='acceptableByCircleLogo deletable' ";
		circle = circleList[circleNo];
	}

	var uid = circle.circleUserList[inpos].uid;
	var img_url = circle.circleUserList[inpos].imageUrl;
	var screen_name = circle.circleUserList[inpos].screenName;

	li += "uid='" + uid + "'>" + "<div class='small_member_icon'>"
			+ "<img src='http://tp1.sinaimg.cn" + img_url + "' title='"
			+ screen_name + "'></div></li>";

	$("#circle_logo_" + circleNo).append(li);

	var $thisSmallItemLi = $("#circle_logo_" + circleNo + ">li:last");
	$thisSmallItemLi.draggable({
		revert : "invalid",
		containment : $("#whole_circle").length ? "#whole_circle" : "document",
		opacity : 0.8,
		scroll : "true",
		helper : "clone",
		cursor : "move"
	});

	return $thisSmallItemLi;
}

function RefreshDisplay(circleNo) {
	if (viewType == "graph") {
		var members = {};
		if (circleNo != -1) {
			members = circleList[circleNo];
			share.apply_config({
				callback_url : 'http://apps.weibo.com/friendsfj/viewcircle/type=circle&m=home&circleID='+ circleList[circleNo].circleID,
				circle_members : circleList[circleNo].circleUserList,
				circle_name : circleList[circleNo].circleName,
				circle_id : circleList[circleNo].circleID,
				share_button : '#shareBtn',
				access_token : "2.00dHQyACRlzboD5859f59dfa0xlSM5"
			});
		} else {
			members = garbageList;
		}

		$("#display_list").attr("displayNo", circleNo);
		$("#diplay_circle_name").html(members.circleName);
		$("#infovis").html('');
		$("#graph_area").show();
		
		JitInit();
		
	} else if (viewType == "card") {
		$.post("/log.do?m=actionShowCircle&circleID=" + circleNo);
		// Delete old circle members from the display list
		$("#display_list").children("li").each(function() {
			$(this).remove();
		});
		$(".tipDiv").each(function() {
			if ($(this).attr("id") != "tip")
				$(this).remove();
		});
		// Add new circle members to the display list
		var members = {};
		if (circleNo != -1) {
			members = circleList[circleNo];
			share.apply_config({
				callback_url : 'http://apps.weibo.com/friendsfj/viewcircle/type=circle&m=home&circleID='+ circleList[circleNo].circleID,
				circle_members : circleList[circleNo].circleUserList,
				circle_name : circleList[circleNo].circleName,
				circle_id : circleList[circleNo].circleID,
				share_button : '#shareBtn',
				access_token : "2.00dHQyACRlzboD5859f59dfa0xlSM5"
			});
		} else {
			members = garbageList;
		}
		for ( var j = 0; j < members.circleUserList.length; j++) {
			AppendNewCard(circleNo, j, "show");
		}
		$("#display_list").attr("displayNo", circleNo);
		$("#diplay_circle_name").html(members.circleName);
		$("#saveNameBtn").hide();
		$("#changeNameBtn").show();
		
	} else if (viewType == "dunbar") {
		$("#display_list").children().remove();

		members = dunbarList[circleNo];
		for ( var j = 0; j < members.circleUserList.length; j++) {
			AppendNewCard(circleNo, j, "show");
		}
		$("#display_list").attr("displayNo", circleNo);
		$("#diplay_circle_name").html(members.circleName);
		$("#saveNameBtn").hide();
		$("#changeNameBtn").show();
		
		share.apply_config({
			callback_url : 'http://apps.weibo.com/friendsfj/viewcircle/type=dunbar&uid=' + UID + '&m=home&circleID='+ dunbarList[circleNo].circleID,
			circle_members : dunbarList[circleNo].circleUserList,
			circle_name : dunbarList[circleNo].circleName,
			circle_id : dunbarList[circleNo].circleID,
			circle_type : 'dunbar',
			share_button : '#shareBtn',
			access_token : "2.00dHQyACRlzboD5859f59dfa0xlSM5"
		});
	}
}

function StringRealLength(s) {
	return s.replace(/[^\x00-\xff]/g, "**").length;
}
