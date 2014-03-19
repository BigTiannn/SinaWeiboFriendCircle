/**
 * @author Hang SU <hang@jackiesu.com>
 * @date Feb. 25th sample usage: <code>
 * var share = new ShareCircle({
 *			callback_url:'aminer.org',
 *			circle_members:circleList[0].circleUserList,
 *			circle_name:'不知道啊',
 *			circle_id:3,
 *			share_button:'#share-button',
 *			access_token:"2.00dHQyACRlzboD5859f59dfa0xlSM5"
 * });
 * when you need to update configuration
 * call:
 * 	share.apply_config(config) in a similar way 
 * </code>
 */

function ShareCircle(config) {
	var global = this;

	this.params = {
		update_url : '/services/statusaction.do?m=update',
		upload_url : '/services/statusaction.do?m=upload',
		msg_template : '晒我的好友圈子，这是我的CIRCLE_NAME，你在里面么？也来晒晒你的好友圈子吧。',
		callback_url : undefined,
		circle_members : undefined,
		circle_name : '好友圈子',
		circle_id : undefined,
		share_button : '#share-button',
		access_token : '',
		circle_type : 'circle',
		max_select_count:3
	};

	this.elems = {
		li : undefined,
		textarea : undefined,
		submit_buttom : undefined,
		dialog_div : undefined
	};

	this.apply_config = function(con) {
		if (con == null || con == undefined)
			return;
		for ( var key in con) {
			this.params[key] = con[key];
		}
	};

	this.run = function() {
		if (this.params.circle_members == undefined
				|| this.params.circle_id == undefined
				|| this.params.callback_url == undefined) {
			alert("error config");
			return;
		}
		$(this.params.share_button).click(function(event) {
			global.show_dialog();
			event.preventDefault();
		});
	};

	this.show_dialog = function() {
		if ($('#share-circle-dialog').length == 0) {
			$('body')
					.append(
							'<div id="share-circle-dialog" style="display:none;width:600px;height:540px"></div>');
		}
		var div = $('#share-circle-dialog');
		var html = '<div class="fix-height">' + '<p>选择至多<b>'+global.params.max_select_count+'</b>个好友@他们吧</p>'
				+ '<ol>';
		for ( var i = 0; i < global.params.circle_members.length; i++) {
			var member = global.params.circle_members[i];
			var selected = i < global.params.max_select_count ? 'selected' : '';
			html += '<li class="' + selected + '">'
					+ '<img src="http://tp1.sinaimg.cn' + member.imageUrl
					+ '"/>' + '<button class="checkbimg"></button><br/>'
					+ '<span class="name"><a href="http://weibo.com/'
					+ member.uid + '" target="_blank">' + member.screenName
					+ '</a></span>'
					// + '<input type="checkbox" id="check-'+member.uid+'"
					// /><label for="check-'+member.uid+'">选择</label>'
					+ '</li>';
		}
		html += '</ol></div><div style="clear:both"></div>'
				+ '<textarea rows="4" cols="50"></textarea>'
				+ '<div class="share-submit">'
				+ '<a id="dis-select-all" class="W_btn_c" href="javascript:void(0);"><span>重置</span></a>'
				+ '<a id="submit-status" class="B_btn" href="javascript:void(0);"></a>'
				+ '<span id="dialog-status-bar"></span></div>';
		div.html(html);

		var submit_button = div.find('#submit-status');
		submit_button.click(global.submit_button_click);

		global.elems.li = div.find('li');
		global.elems.submit_buttom = submit_button;
		global.elems.textarea = div.find('textarea');
		global.elems.dialog_div = div;

		div.find('#dis-select-all').click(global.dis_select_all_click);
		div.find('li img,li .checkbimg').click(global.checkbox_click);

		global.refresh_textarea();
		
		div.dialog({
			width : 720,
			title : '分享到微博',
			position : 'top'
		});
	};

	this.refresh_textarea = function(){
		var text = '';
		global.elems.li.each(function(index, elem) {
			if ($(this).hasClass('selected')) {
				text += '@' + global.params.circle_members[index].screenName
						+ ',';
			}
		});
		text += global.params.msg_template.replace(/CIRCLE_NAME/,
				global.params.circle_name);
		text += global.params.callback_url;
		global.elems.textarea.val(text);
	};
	
	this.dis_select_all_click = function() {
		global.elems.li.removeClass('selected');
		global.refresh_textarea();
	};

	this.checkbox_click = function() {
		var li = $(this).parents('#share-circle-dialog li');
		li.toggleClass('selected');
		//console.log()
		if(global.elems.dialog_div.find('li.selected').length>global.params.max_select_count){
			li.removeClass('selected');
			global.show_msg("最多选择@<b>"+global.params.max_select_count+"</b>个人", {
				title : "错误提示"
			}, 2000);
			return;
		}
		global.refresh_textarea();
	};

	this.submit_button_click = function() {
		var thisBtn = $('#submit-status');
		if(thisBtn.hasClass("disable"))
			return;
		thisBtn.addClass("disable");
		thisBtn.css("cursor","default");
		$.ajax({
			type : 'POST',
			url : global.params.upload_url,
			data : {
				msg : global.elems.textarea.val(),
				circleID : global.params.circle_id,
				access_token : global.params.access_token,
				type : global.params.circle_type
			},
			success : function(data) {
				if (data == "success") {
					global.show_msg("发布成功", {
						title : "信息"
					}, 2000, function() {
						global.elems.dialog_div.dialog('close');
					});
				} else {
					global.show_msg("发布失败,请稍候再试<br/>" + data, {
						title : "错误"
					}, 2000);
				}
			},
			error : function() {
				global.show_msg("发布失败,请稍候再试", {
					title : "错误"
				}, 2000);
			}
		});
	};

	this.show_msg = function(html, options, duration, callback) {
		if ($('#status-dialog-msg').length == 0) {
			$('body').append('<div id="status-dialog-msg" style="display:none"></div>');
		}
		var msg_div = $('#status-dialog-msg');
		msg_div.html(html);

		options.width = 300;
		options.height = 200;
		options.top = 100;
		options.modal = true;
		options.buttons = [{
			text : 	"关闭",
			click: 	function(){
						$(this).dialog("close");
						if (callback != undefined) {
							callback();
						}
					}
		}];

		msg_div.dialog(options);

		if (duration != undefined) {
			if (duration < 2000)
				duration = 2000;
			setTimeout(function() {
				msg_div.dialog('close');
				if (callback != undefined) {
					callback();
				}
			}, duration);
		}
	};

	this.apply_config(config);
	this.run();
}