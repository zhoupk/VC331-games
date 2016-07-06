var socket;
$(function() {
	//连接，autoConnect自动连接,reConnection重连接
	socket = io('http://localhost',{"autoConnect":false,"reConnection":false});
	$("#conn").click(function() {
		if ($(this).val() == "连接") {
			if ($("#username").val() == "") {
				$("#messeage").append("<div>用户名不能为空</div>");
				return;
			}
			//手动连接
			socket.connect();
		} else if ($(this).val() == "断开") {
			//关闭连接
			socket.close();	
		}
	});
	
	
	$("#send").click(function(){
		//发送add_content消息，携带json格式的参数，给服务器端.发送用户交流信息
		socket.emit("add_content",{"message":$("#send_content").val()});
	});
	
	
	
	//连接成功时,运行内调函数
	socket.on('connect',function(){
		    //发送用户名信息
			socket.emit("add_user", {"username": $("#username").val()});
			$("#messeage").append("<div>连接成功</div>");
			$("#conn").val("断开");
			$("#username").attr("disabled", true);
	});
	
	
	//打印所有连接的用户名，online[socket.id].username,online[socket.id].room
	socket.on("online_list", function(online) {
		$("#oline_list").empty();
		for (var id in online) {
			$("#oline_list").append("<div>" + online[id].username + "<div>");
		}
	});
	
	//显示游戏大厅,data为服务端rooms.
	socket.on("room_list",function(data){
		$(".box_right").empty();//清空
		
		for(var i=0;i<data.length;i++){
			var html="<div><p>房间号:"+data[i].roomid+"</p>";
			html+="<p>玩家1:"+data[i].player1+"</p>";
			html+="<p>玩家2:"+data[i].player2+"</p>";
			if(data[i].count<2){
				html+="<p><input type='button' class='changeroom' room_id="+data[i].roomid+" value='加入'/></p></div>";
			}
			$(".box_right").append(html);	
		}
		
		//点击加入按钮，向服务器端发送点击的房间号
	$(".box_right .changeroom").click(function(){
		socket.emit("roomchange",{"room_id":$(this).attr("room_id")});
	});
	});
	
	
	socket.on("room_join",function(data){
		$(".box_right").empty();
		var html="<div><p>房间号:"+data.roomid+"</p>";
		html+="<p>玩家1:"+data.player1+"</p>";
		html+="<p>玩家2:"+data.player2+"</p></div>";
		$(".box_right").append(html);
		$("#messeage").append("<div>提示:"+(data.player2==""?data.player1:data.player2)+"用户成功加入房间"+data.roomid+"</div>")
		
		
	});
	
	
	
	
	
	socket.on("message_list",function(data){
		$("#messeage").append("<div>"+data.name+"说:"+data.message+"</div>");
		$("#messeage").scrollTop($("#messeage").height);
	});
	
	socket.on("disconnect", function() {
		$("#oline_list").empty();
		$("#messeage").append("<div>断开连接</div>");
		$("#conn").val("连接");
		$("#username").attr("disabled", false);
	});
	
	//第二步
	socket.on("game.star",function(data){
		$("#messeage").append("<div>提示:游戏开始,您是"+(data.flag?"先手":"后手")+(data.color?"执白棋":"执黑棋")+"</div>");
		$(".box_right").empty();
		$(".box_right").append("<canvas id='cav'></canvas>");
		myinit("cav");
		color=data.color;
		play(data.flag);
	});
	
	//客户端从服务器端收到对战客户端的棋子位置，并显示在自己页面。第五步
	socket.on("game.change",function(data){
		show(data.row,data.col,color?0:1);
		play(true);//玩家可以下
	});
	
	socket.on("game.over",function(data){
		if(data.iswiner){
			alert("你赢了");
		}else{
			alert("你输了");
		}
	});

});