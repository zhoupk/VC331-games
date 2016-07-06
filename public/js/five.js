var cav,pen;
var width=height=600;
var color=1;//0为黑，1为白
var data=new Array();


function myinit(id){
	cav=document.getElementById(id);
	cav.width=cav.height=600;
	pen=cav.getContext('2d');
	pen.save();
	pen.beginPath();
	pen.rect(0,0,600,600);
	pen.lineWidth=5;
	pen.closePath();
	pen.stroke();
	pen.restore();
	
	pen.save();
	var xy=40;
	for(var i=0;i<14;i++){
		pen.beginPath();
		pen.moveTo(xy,0);
		pen.lineTo(xy,600);
		pen.closePath();
		pen.stroke();
		
		pen.beginPath();
		pen.moveTo(0,xy);
		pen.lineTo(600,xy);
		pen.closePath();
		pen.stroke();
		
		xy+=40;
	}
	pen.restore();
	for(var row=0;row<15;row++){
		var temp=new Array();
		for(var col=0;col<15;col++){
			temp[col]=-1;
		}
		data[row]=temp;
	}
}

function play(flag){
	if(flag){
		cav.onmousedown=draw;
	}else{
		cav.onmousedown=null;
	}
	
}

function draw(event){
	var x=event.clientX-cav.offsetLeft;
	var y=event.clientY-cav.offsetTop;
	
	var col=Math.floor(x/40);
	var row=Math.floor(y/40);
	
	if(data[row][col]!=-1){
		return;
	} else {
		data[row][col]=color;
	}
	
	show(row,col,color);
	
	//玩家将旗子位置发送给服务器端。第三步
	socket.emit("game.change",{"row":row,"col":col});
	cav.onmousedown=null;
	if(gameover(row,col,color)==true){
		cav.onmousedown=null;
		socket.emit("game.over",{});
//		alert((color ? "白子":"黑子")+"赢了");
	}
	
}

function show(row,col,color){
	pen.beginPath();
	pen.arc(col*40+20,row*40+20,15,0,Math.PI*2);
	if(color){
		pen.stroke();
	}else{
		pen.fill();
	}
	pen.closePath();
	data[row][col]=color;
}

function gameover(row,col,tempcolor){
	
	var count=1;
	for(var i=col-1;i>=0;i--){
		if(data[row][i]==tempcolor){
			count++;
		}else{
			break;
		}
	}
	for(var i=col+1;i<15;i++){
		if(data[row][i]==tempcolor){
			count++;
		}else{
			break;
		}
	}
	if(count==5){
		return true;
	}
	
	
	count=1;
	
	for(var i=row-1;i>=0;i--){
		if(data[i][col]==tempcolor){
			count++;
		}else{
			break;
		}
	}
	for(var i=row+1;i<15;i++){
		if(data[i][col]==tempcolor){
			count++;
		}else{
			break;
		}
	}
	
	if(count==5){
		return true;
	}
	
	
	count=1;
	for(var i=row+1,j=col+1;i<15,j<15;i++,j++){
		if(data[i][j]==tempcolor){
			count++;
		}else{
			break;
		}
	}
	for(var i=row-1,j=col-1;i>=0,j>=0;i--,j--){
		if(data[i][j]==tempcolor){
			count++;
		}else{
			break;
		}
	}
	if(count==5){
		return true;
	}
	
	
	count=1;
	
	for(var i=row+1,j=col-1;i<15,j>=0;i++,j--){
		if(data[i][j]==tempcolor){
			count++;
		}else{
			break;
		}
	}
	for(var i=row-1,j=col+1;i>=0,j<15;i--,j++){
		if(data[i][j]==tempcolor){
			count++;
		}else{
			break;
		}
	}
	
	if(count==5){
		return true;
	}else{
		return false;
	}
	
}
