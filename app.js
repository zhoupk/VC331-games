var express = require("express");
var app = express();
app.use(express.static("./public"));
var server = app.listen(80, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log("listen" + host + port);
});


var online = {};
var rooms=new Array();
for(var i=1;i<=16;i++){
	//rooms数组,房间号roomid为1-16,player1为1号玩家名,play2为2号玩家用户名,
    //count为玩家人数
	rooms.push({"roomid":i,"player1":"","player2":"","count":0});
}
var io = require('socket.io')(server);
io.on('connect', function(socket) {
	socket.join("public");
	
	socket.on("add_user", function(data) {
		online[socket.id] ={"username":data.username,"room":"public"} ;
		io.sockets.in("public").emit("online_list", online);
		io.sockets.in("public").emit("room_list",rooms);
	});
	
	socket.on("add_content",function(data){
		data.name=online[socket.id].username;
		io.sockets.in(online[socket.id].room).emit("message_list",data);
	});
	
	socket.on("roomchange",function(data){
		socket.leave("public").join(data.room_id);
		online[socket.id].room=data.room_id;
		var room;
		for(var i=0;i<rooms.length;i++){
			if(rooms[i].roomid==data.room_id){
				room=rooms[i];
			}
		}
		io.of("/").in(data.room_id).clients(function(error,clients){
			room.count=clients.length;
			room.player1=clients[0]?online[clients[0]].username:"";
			room.player2=clients[1]?online[clients[1]].username:"";
			
			//广播public,改变房间
			io.sockets.in("public").emit("room_list",rooms);
			//改变自己房间
			io.sockets.in(data.room_id).emit("room_join",room);
			
			//判断加入房间人数达到2人，游戏开始。第一步
			if(room.count==2){
				//第一位玩家不符合条件，故此处socket是加入的第二位玩家.
				//socket.in(data.room_id)是不包括自己的data.room_id房间的其他玩家，即玩家1
				socket.in(data.room_id).emit("game.star",{"flag":true,"color":1});
				socket.emit("game.star",{"flag":false,"color":0});
			}
		});
		
	});
	
	//玩家断开连接，自动认输
	socket.on("disconnect", function() {
		var roomid=online[socket.id].room;
		if(roomid=="public"){
			delete online[socket.id];
		io.sockets.in("public").emit("online_list",online);
		}else{
			var room;
			for(var i=0;i<rooms.length;i++){
				if(roomid==rooms[i].roomid){
					room=rooms[i];
					break;
				}
			}
			var failder=online[socket.id].username;
			var winer=room.player1 == failder?room.player2:room.player1;
			room.player1=room.player2="";
			room.count=0;
	
			io.of("/").in(roomid).clients(function(error,clients){
				io.sockets.sockets[clients[0]].emit("game.over",{"iswiner":true});
				io.sockets.sockets[clients[0]].leave(roomid).join("public");
				delete online[socket.id];
			io.sockets.in("public").emit("message_list",{"name":winer,"message":failder+",你不行"});
			io.sockets.in("public").emit("room_list",rooms);
			io.sockets.in("public").emit("online_list", online);
				
			});
		
			
		}
		
	});
	
	//服务器端将旗子位置发给对战客户端，第四步
	socket.on("game.change",function(data){
		socket.in(online[socket.id].room).emit("game.change",data);
	});
	
	
	//只有产生胜利者，才会激活"game.over"信息
	socket.on("game.over",function(){
		
		var roomid=online[socket.id].room;
		
		var room;
		for(var i=0;i<rooms.length;i++){
			if(rooms[i].roomid==roomid){
				room=rooms[i];
			}
		}
		
		var failder=online[socket.id].username;
		var winer=(failder==room.player1?room.player2:room.player1);
		
		
		socket.emit("game.over",{"iswiner":true});//返回胜利者
		socket.in(roomid).emit("game.over",{"iswiner":false});
		
		
		room.player1="";
	    room.player2="";
	    room.count=0;
		
		
		io.of("/").clients(function(error,clients){
			io.sockets.sockets[clients[0]].leave(roomid).join("public");
		    io.sockets.sockets[clients[1]].leave(roomid).join("public");
//			socket.leave(roomid).join("public");
//			socket.in(roomid).leave(roomid).join("public");
  
			online[clients[0]].room="public";
			online[clients[1]].room="public";
			
			io.sockets.in("public").emit("message_list",{"name":winer,"message":failder+",你不行"});
			io.sockets.in("public").emit("room_list",rooms);
		});
		
		
	    
		
	});
});