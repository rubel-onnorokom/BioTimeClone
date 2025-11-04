
/**
 * ----------------------------------------------------------common start--------------------------------------------------------------

  ä»£ç æ˜¯æŒ‰ä¸¤ä¸ªæ‰‹æŽŒç™»è®°å†™çš„ï¼Œå¯ä»¥åŒºåˆ†å·¦å³æ‰‹ã€‚ä½†æ˜¯ï¼Œç”±äºŽè®¾å¤‡åªèƒ½ä¸‹å‘ä¸€ä¸ªæ‰‹æŽŒã€‚æ‰€ä»¥ç•Œé¢ç¨å¾®è°ƒæ•´ï¼ŒçŽ°åœ¨åªå‰©å·¦æ‰‹ï¼Œå’Œè®¾å¤‡ä¿æŒä¸€è‡´ã€‚
  å¦‚æžœéœ€è¦è°ƒæ•´å›žåŒæ‰‹ç™»è®°ï¼Œåªéœ€è¦è°ƒæ•´ç”»å›¾ä»¥åŠåŽç«¯ä¿å­˜çš„idç”±é»˜è®¤çš„0æ”¹æˆpalmidå³å¯ã€‚
  å¦‚éœ€è°ƒè¯•ï¼Œåªéœ€è¦æŠŠæ³¨é‡Šäº†çš„console.logæ”¹å›žå°±å¯ä»¥åœ¨æµè§ˆå™¨è°ƒè¯•ã€‚
  2019 - 12 -31
  pynick
 */

//æ‰‹æŽŒæ ‡è®°æ•°ç»„
var palmIdArray = [];
//æ‰‹æŽŒåˆ é™¤æ ‡è®°æ•°ç»„
var delpalmIdArray = [];
//æŽŒçº¹æ¨¡æ¿æ•°æ®æ•°ç»„
var templatePalmDataArray = [];
//å®šæ—¶å™¨--å…³é—­setTimeOutæ—¶ç”¨åˆ°
var timer = null;
//åˆ¤æ–­å½“å‰æ‰‹æŽŒæ˜¯å¦æ­£åœ¨é‡‡é›†ä¸­
var collectFlag = false;
//å½“å‰ç‚¹å‡»çš„æ‰‹æŽŒæ ‡è®°
var palmIdNum = null;
//æ•°æ®åº“ä¸­çš„æŽŒçº¹
var palmIdDBArray = [];

//æ˜¯å¦å¯ä»¥è®¿é—®æŽŒçº¹é©±åŠ¨
var canPalmConnection = false;
var layerIndex = null;
// åˆå§‹åŒ–ç»˜ç”»æ‰‹æŽŒã€æ‰‹æŽŒã€åœ†å¼§çš„èµ·å§‹åæ ‡,å¹¶åšæˆjsonæ ¼å¼
function initPalmCoordJson() {
	var coordPalmJson = [{"num" : 0, "coord" : {"x" : x , "y" : y }},
                         //åªå‰©å·¦æ‰‹ï¼Œå³æ‰‹ç”»å›¾æ³¨é‡Šäº†ã€‚
                         // {"num" : 1, "coord" : {"x" : x , "y" : y }},
		             ];
	return coordPalmJson;
}
/**
 * é‡‡é›†å®ŒæŽŒçº¹åŽæ¸²æŸ“æ‰‹æŽŒ
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param num å½“å‰éœ€è¦æ¸²æŸ“çš„æ‰‹æŽŒç¼–å·
 * @param fillColor é‡‡é›†å®ŒåŽå¡«å……é¢œè‰²
 * @param successOrNot é‡‡é›†æ˜¯å¦æˆåŠŸ--å¸ƒå°”å€¼ true:é‡‡é›†æˆåŠŸï¼›false:é‡‡é›†å¤±è´¥
 */
function renderPalmAfterColl(context, num, fillColor, successOrNot) {
    //console.log('é‡‡é›†æˆåŠŸå¡«å……é¢œè‰²');
	var canvas = document.getElementById("canvasPalm");
	var localContext = getCanvasContext(canvas);
	var coordArray = new Array();
	//åˆå§‹åŒ–èµ·å§‹åæ ‡,å¹¶è¿”å›žjsonæ ¼å¼æ•°æ®
	var coordPalmJson = initPalmCoordJson();
	//è¿›æ¥é¡µé¢ï¼Œç‚¹å‡»åˆ é™¤
	if(num == null)
	{
		num = palmIdNum;
	}
	//ç‚¹å‡»çš„æ‰‹æŽŒç¼–å·å’Œjsonä¸­numç›¸ç­‰
	if(coordPalmJson[num].num == num)
	{
		//åˆå§‹åŒ–åæ ‡æ•°ç»„å’Œç»˜ç”»æ‰‹æŽŒ
		initCoordAndDrawPalm(context, coordArray, coordPalmJson[num].coord.x, coordPalmJson[num].coord.y, num);
	}

	//é‡‡é›†æˆåŠŸï¼Œå¡«å……é¢œè‰²(çº¢ã€ç»¿)
	if(successOrNot)
	{
	    localContext.fillStyle = "rgb(122,193,66)";//fillColor
        localContext.fill();
        palmModifyFlag = true;
	}
	else
	{
		//é‡‡é›†å¤±è´¥ï¼Œå¡«å……èƒŒæ™¯è‰²--æ¶ˆé™¤é¢œè‰²(é»„)
		localContext.fillStyle = fillColor;
		localContext.fill();
	}
}
/**
 * åæ ‡ç‚¹å¯¹è±¡
 */
var Coord = function(x, y) {
	this.x = x;
	this.y = y;
};
/**
 * åˆå§‹åŒ–åæ ‡æ•°ç»„å’Œç»˜ç”»æ‰‹æŽŒ--èŽ·å–å½“å‰çš„context
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param pointArray åæ ‡ç‚¹æ•°ç»„
 * @param x,y ç»˜ç”»å½“å‰æ‰‹æŽŒçš„èµ·å§‹åæ ‡
 * @param num æ‰‹æŽŒæ ‡è®°
 */
function initCoordAndDrawPalm(context, coordArray, x, y, num) {
	coordArray = initPalmCoordArray(coordArray, x, y, num);
	new renderPalm(context, coordArray).drawPalm(strokeStyle, palmBorderColor);
}

/**
 * ç»˜ç”»æ‰‹æŽŒ
 * @author pynick
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param pointArray åæ ‡ç‚¹æ•°ç»„
 * @param renderFlag æ¸²æŸ“æ ‡è®° stroke:ç»˜ç”»è¾¹çº¿ï¼›fill:å¡«å……
 * @param color æ¸²æŸ“é¢œè‰²
 */
var renderPalm = function(context, pointArray1) {
	this.context = context;
	this.pointArray = pointArray1;
	this.isClick = false;
	this.drawPalm = function(renderFlag, color)
	{
		if(renderFlag == "stroke")
		{
			this.context.strokeStyle = color;
		}
		else if(renderFlag == "fill")
		{
			this.context.fillStyle = color;
		}
		this.context.lineWidth = 1;
		this.context.beginPath();
		for(var i=0; i<this.pointArray.length; i++)
		{
			if(i == 0)
			{
				this.context.moveTo(this.pointArray[0].x, this.pointArray[0].y);
			}
			else
			{
				this.context.lineTo(this.pointArray[i].x, this.pointArray[i].y);
			}
		}
		if(renderFlag == "stroke")
		{
			this.context.stroke();
		}
		else if(renderFlag == "fill")
		{
			this.context.fill();
		}
	};
};

/**
 * å°†ç»˜ç”»çš„åæ ‡ç‚¹æ”¾å…¥æ•°ç»„
 * @param coordArray ä¼ å…¥çš„æ•°ç»„ï¼Œæ”¾å…¥åæ ‡åŽï¼Œè¿”å›ž
 * @param x, y ç»˜ç”»æ‰‹æŽŒçš„èµ·ç‚¹çš„åæ ‡
 * @param num æ‰‹æŽŒç¼–å· 0å·¦æ‰‹æŽŒï¼Œ1ï¼šå³æ‰‹æŽŒ, 2:åœ†å¼§ã€‚
 */
function initPalmCoordArray(coordArray, x, y, num) {
	if(num == 0){
	    // xyçš„åˆå€¼å†³å®šæ‰‹æŽŒçš„ä½ç½®
	    x = 135; y = 250;
		coordArray[0] = new Coord(x+20*0.75, 200*0.75+y);
		coordArray[1] = new Coord(x+20*0.75, 200*0.75+y);
		coordArray[2] = new Coord(x+10*0.75, 100*0.75+y);
		coordArray[3] = new Coord(x, 50*0.75+y);
		coordArray[4] = new Coord(x+3*0.75, 45*0.75+y);
		coordArray[5] = new Coord(x+10*0.75, 40*0.75+y);
		coordArray[6] = new Coord(x+15*0.75, 45*0.75+y);
		coordArray[7] = new Coord(x+30*0.75, 100*0.75+y);
		coordArray[8] = new Coord(x+35*0.75, 100*0.75+y);
		coordArray[9] = new Coord(x+50*0.75, 5*0.75+y);
		coordArray[10] = new Coord(x+60*0.75, y);
		coordArray[11] = new Coord(x+70*0.75, 5*0.75+y);
		coordArray[12] = new Coord(x+60*0.75, 90*0.75+y);
		coordArray[13] = new Coord(x+65*0.75, 90*0.75+y);
		coordArray[14] = new Coord(x+80*0.75, 5*0.75+y);
		coordArray[15] = new Coord(x+90*0.75, y);
		coordArray[16] = new Coord(x+100*0.75, 5*0.75+y);
		coordArray[17] = new Coord(x+85*0.75, 105*0.75+y);
		coordArray[18] = new Coord(x+90*0.75, 110*0.75+y);
		coordArray[19] = new Coord(x+120*0.75, 20*0.75+y);
		coordArray[20] = new Coord(x+130*0.75, 15*0.75+y);
		coordArray[21] = new Coord(x+135*0.75, 25*0.75+y);
		coordArray[22] = new Coord(x+110*0.75, 120*0.75+y);
		coordArray[23] = new Coord(x+110*0.75, 160*0.75+y);
		coordArray[24] = new Coord(x+140*0.75, 120*0.75+y);
		coordArray[25] = new Coord(x+160*0.75, 120*0.75+y);
		coordArray[26] = new Coord(x+160*0.75, 130*0.75+y);
		coordArray[27] = new Coord(x+120*0.75, 180*0.75+y);
		coordArray[28] = new Coord(x+110*0.75, 200*0.75+y);
		coordArray[29] = new Coord(x+20*0.75, 200*0.75+y);
	}
	// else if(num == 1)
	// {
	// 	coordArray[0] = new Coord(x+340*0.75,200*0.75+y);
	// 	coordArray[1] = new Coord(x+340*0.75,200*0.75+y);
	// 	coordArray[2] = new Coord(x+350*0.75,100*0.75+y);
	// 	coordArray[3] = new Coord(x+360*0.75,50*0.75+y);
	// 	coordArray[4] = new Coord(x+357*0.75,45*0.75+y);
	// 	coordArray[5] = new Coord(x+350*0.75,40*0.75+y);
	// 	coordArray[6] = new Coord(x+345*0.75,45*0.75+y);
	// 	coordArray[7] = new Coord(x+330*0.75,100*0.75+y);
	// 	coordArray[8] = new Coord(x+325*0.75,100*0.75+y);
	// 	coordArray[9] = new Coord(x+310*0.75,5*0.75+y);
	// 	coordArray[10] = new Coord(x+300*0.75,0+y);
	// 	coordArray[11] = new Coord(x+290*0.75,0+y);
	// 	coordArray[12] = new Coord(x+300*0.75,90*0.75+y);
	// 	coordArray[13] = new Coord(x+295*0.75,90*0.75+y);
	// 	coordArray[14] = new Coord(x+280*0.75,5*0.75+y);
	// 	coordArray[15] = new Coord(x+270*0.75,0+y);
	// 	coordArray[16] = new Coord(x+260*0.75,5*0.75+y);
	// 	coordArray[17] = new Coord(x+275*0.75,105*0.75+y);
	// 	coordArray[18] = new Coord(x+270*0.75,110*0.75+y);
	// 	coordArray[19] = new Coord(x+240*0.75,20*0.75+y);
	// 	coordArray[20] = new Coord(x+230*0.75,15*0.75+y);
	// 	coordArray[21] = new Coord(x+225*0.75,25*0.75+y);
	// 	coordArray[22] = new Coord(x+250*0.75,120*0.75+y);
	// 	coordArray[23] = new Coord(x+250*0.75,160*0.75+y);
	// 	coordArray[24] = new Coord(x+220*0.75,120*0.75+y);
	// 	coordArray[25] = new Coord(x+200*0.75,120*0.75+y);
	// 	coordArray[26] = new Coord(x+200*0.75,130*0.75+y);
	// 	coordArray[27] = new Coord(x+240*0.75,180*0.75+y);
	// 	coordArray[28] = new Coord(x+250*0.75,200*0.75+y);
	// 	coordArray[29] = new Coord(x+340*0.75,200*0.75+y);
	// }
	return coordArray;
}
/**
 * ç»˜ç”»é¡µé¢å³ä¸Šè§’çš„åœ†å¼§å¹¶å¡«å……é¢œè‰²
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param x, y ç»˜ç”»åœ†å¼§çš„èµ·ç‚¹çš„åæ ‡
 * @param color ç»˜ç”»å¤šè¾¹å½¢çš„å¡«å……é¢œè‰²--å³ä¸Šè§’çš„åœ†å¼§åŒºåŸŸ
 */
var FillArc = function(context, pointArray1) {
	this.context = context;
	this.pointArray = pointArray1;
	this.drawArc = function(colorArc)
	{
		this.context.fillStyle = color;
		this.context.beginPath();
		for(var i=0; i<this.pointArray.length; i++)
		{
			if(i == 0)
			{
				this.context.moveTo(this.pointArray[0].x, this.pointArray[0].y);
			}
			else
			{
				this.context.lineTo(this.pointArray[i].x, this.pointArray[i].y);
			}
		}
		//this.context.stroke();
		this.context.fill();
	};
};
//æ¸…é™¤ç”»å¸ƒå†…å®¹
CanvasRenderingContext2D.prototype.clear =
  CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }
};


/**
 * æ˜¾ç¤ºæ¡†--æ˜¾ç¤ºé‡‡é›†æ¬¡æ•°ã€é‡‡é›†æˆåŠŸã€å¤±è´¥ç­‰ä¿¡æ¯
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param text  æ˜¾ç¤ºä¿¡æ¯å†…å®¹
 * @param browserFlag æµè§ˆå™¨æ ‡è®°æˆ–æ¯”å¯¹éªŒè¯æ ‡è®° simple:ç®€æ˜“ç‰ˆæœ¬ï¼Œè¡¨ç¤ºæ˜¯ieæµè§ˆå™¨ï¼›html5:è¡¨ç¤ºæ”¯æŒhtml5çš„æµè§ˆå™¨
 * --verification:æŽŒçº¹éªŒè¯æ ‡è®°
 */
function collectPalmTips(context, text, browserFlag) {
	if(browserFlag == "simple")
	{
		$("#showCollInfoDiv").html("<span style='color:rgb(122,193,66); font-size: 13px;word-break: break-all; word-wrap: break-word;'>"+text+"</span>");
	}
	else if(browserFlag == "html5")
	{
		context.fillStyle = bgColor;//bgColor;
		context.fillRect(220, 18, 310, 16);

		//æ–‡å­—å³å¯¹é½
		context.fillStyle = "rgb(122,193,66)";
		context.font ="13px Times New Roman";
		context.textAlign = "end";
		context.fillText(text, 520, 30);
	}
	else if(browserFlag == "verification")
	{
		//#6BA5D7
		context.fillStyle = "#F3F5F0";//#6BA5D7
		context.fillRect(2, 8, 600, 30);
		//èŽ·å–canvaså¯¹è±¡
		var canvas = document.getElementById("canvasPalm");
//		canvas.width = canvas.width;
		//è¿”å›žä¸€ä¸ªæ–‡æœ¬çš„åº¦é‡ä¿¡æ¯å¯¹è±¡metrics
		var metrics = context.measureText(text);
		//æ–‡æœ¬å®½åº¦
		var textWidth = metrics.width;
		//canvaså®½åº¦
		canvas != null?canvasWidth = canvas.width:canvasWidth = 450;
		//æ–‡æœ¬å¼€å§‹xåæ ‡
		var x = textWidth/2 + (canvasWidth - textWidth)/2;
		//æ–‡å­—å³å¯¹é½
		context.fillStyle = "rgb(122,193,66)";
		context.font ="24px Times New Roman";
		context.textAlign = "center";
		//è‡ªåŠ¨æ¢è¡Œ
		autoWordBreak(context,text,canvasWidth,x);
		context.restore();
	}
	else if(browserFlag == "verifyForSimple")
	{
		$("#showCollInfoDiv").html("<span style='color:yellow;align:center;font-size: 18px;word-break: break-all; word-wrap: break-word;'>"+text+"</span>");
	}
}

/**
 * ç”»å¸ƒæ–‡æœ¬è‡ªåŠ¨æ¢è¡Œ
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param text  æ˜¾ç¤ºä¿¡æ¯å†…å®¹
 * @param CWidth ç”»å¸ƒå®½åº¦
 * @param x æ–‡æœ¬Xåæ ‡å€¼
 *
 */
function autoWordBreak(context,text,CWidth,x){
	context.clear();
	var rownum = CWidth / 10;
	var len = text.length;
	if (rownum > len)
	{
		context.fillText(text, x, 30);
	}
	else
	{
		var endInd = rownum<text.length?rownum:text.length;
		var beginInd = 0;
		var endTemp=0;
		for (var i = 0; i <= text.length / rownum; i++)
		{
			endTemp = text.substr(beginInd, endInd).lastIndexOf(" ");
			if(endTemp!=-1)
				endInd=beginInd+endTemp;
			context.fillText(text.substr(beginInd, endInd), x, (i + 1) * 30);
			beginInd = endInd+1;
			if(beginInd>=text.length)
				break;
			endInd = beginInd + rownum;
		}
	}
}

/**
 * ç”»è¿›åº¦æ¡
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param x,y,width,height è¿›åº¦æ¡åº•æ¡†çš„åæ ‡å’Œå®½åº¦ã€é«˜åº¦
 */
function drawPalmProgressBar(context, collCount) {
	var x = 380;
	var y = 60;
	var width = 90;
	var height = 20;
	context.fillStyle = bgColor;
	context.fillRect(x, y, width, height);
	if(collCount == 0)
	{
		context.fillStyle = "rgb(175,181,185)";
		context.fillRect(x + 4, y + 2, width - 70, height - 4);
		context.fillRect(x + 32, y + 2, width - 70, height - 4);
		context.fillRect(x + 60, y + 2, width - 70, height - 4);
		context.fillRect(x + 88, y + 2, width - 70, height - 4);
		context.fillRect(x + 116, y + 2, width - 70, height - 4);
	}
	else if(collCount == 1)
	{
		context.fillStyle = "rgb(122,193,66)";
		context.fillRect(x + 4, y + 2, width - 70, height - 4);
		context.fillStyle = "rgb(175,181,185)";
		context.fillRect(x + 32, y + 2, width - 70, height - 4);
		context.fillRect(x + 60, y + 2, width - 70, height - 4);
		context.fillRect(x + 88, y + 2, width - 70, height - 4);
		context.fillRect(x + 116, y + 2, width - 70, height - 4);
	}
	else if(collCount == 2)
	{
		context.fillStyle = "rgb(122,193,66)";
		context.fillRect(x + 4, y + 2, width - 70, height - 4);
		context.fillRect(x + 32, y + 2, width - 70, height - 4);
		context.fillStyle = "rgb(175,181,185)";
		context.fillRect(x + 60, y + 2, width - 70, height - 4);
		context.fillRect(x + 88, y + 2, width - 70, height - 4);
		context.fillRect(x + 116, y + 2, width - 70, height - 4);
	}
	else if(collCount == 3)
	{
		context.fillStyle = "rgb(122,193,66)";
		context.fillRect(x + 4, y + 2, width - 70, height - 4);
		context.fillRect(x + 32, y + 2, width - 70, height - 4);
		context.fillRect(x + 60, y + 2, width - 70, height - 4);
		context.fillStyle = "rgb(175,181,185)";
		context.fillRect(x + 88, y + 2, width - 70, height - 4);
		context.fillRect(x + 116, y + 2, width - 70, height - 4);
	}else if(collCount == 4)
	{
		context.fillStyle = "rgb(122,193,66)";
		context.fillRect(x + 4, y + 2, width - 70, height - 4);
		context.fillRect(x + 32, y + 2, width - 70, height - 4);
		context.fillRect(x + 60, y + 2, width - 70, height - 4);
		context.fillRect(x + 88, y + 2, width - 70, height - 4);
		context.fillStyle = "rgb(175,181,185)";
		context.fillRect(x + 116, y + 2, width - 70, height - 4);
	}else if(collCount == 5)
	{
		context.fillStyle = "rgb(122,193,66)";
		context.fillRect(x + 4, y + 2, width - 70, height - 4);
		context.fillRect(x + 32, y + 2, width - 70, height - 4);
		context.fillRect(x + 60, y + 2, width - 70, height - 4);
		context.fillRect(x + 88, y + 2, width - 70, height - 4);
		context.fillRect(x + 116, y + 2, width - 70, height - 4);
	}
}
/**
 * -----------------------------------canvas end----------------------------
 */
/**
 * æ¸…ç©ºæŽŒçº¹å›¾åƒ
 */
function clearPalmImage(context, browserFlag) {
	if(browserFlag == "verification")
	{
		showPalmImage(context, "/media/images/abroad_att/base_palmVerify_clearImage.png", "clearForVerify");
	}
	else if(browserFlag == "register")
	{
		showPalmImage(context, "/media/images/abroad_att/base_palmVerify_clearImage.png", "clearForRegister");
	}
	else if(browserFlag == "verifyForSimple" || browserFlag == "registerForSimple")
	{
		showPalmImage(null, "", "clearForSimple");
	}
}
/**
 * æ˜¾ç¤ºæŽŒçº¹å›¾åƒ
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param browserFlag æµè§ˆå™¨æ ‡è®° simple:ç®€æ˜“ç‰ˆæœ¬ï¼Œè¡¨ç¤ºæ˜¯ieæµè§ˆå™¨ï¼›html5:è¡¨ç¤ºæ”¯æŒhtml5çš„æµè§ˆå™¨
 */
function showPalmImage(context, base64PalmImg, browserFlag) {
    // console.log('showPalmImage', browserFlag);
	var img;
	var imgSrc = "data:image/bmp;base64,"+base64PalmImg;
	if(browserFlag == "html5"){
		img = new Image();
		img.src = "";
		img.src = imgSrc;
		img.onload=function() {
			// ä¿å­˜å½“å‰çš„ç»˜å›¾çŠ¶æ€
			context.save();
			// å¼€å§‹åˆ›å»ºè·¯å¾„
			context.beginPath();
			// ç”»ä¸€ä¸ªæ¤­åœ†
			context.oval(195, 142, 132, 165);
			// å…³é—­è·¯å¾„
			context.closePath();
			// å‰ªåˆ‡è·¯å¾„
			context.clip();
			//å°†å›¾ç‰‡ç”»åˆ°ç”»å¸ƒä¸Š
	        context.drawImage(img, 130, 60, 132, 165);
			//è°ƒç”¨restoreæœ€åŽä¸€æ¬¡å­˜å‚¨çš„çŠ¶æ€ä¼šè¢«æ¢å¤
	        context.restore();
	    }
	}
	else if(browserFlag == "verification")
	{
		img = new Image();
		img.src = "";
		img.src = imgSrc;
		img.onload=function() {
			// ä¿å­˜å½“å‰çš„ç»˜å›¾çŠ¶æ€
			context.save();
			// å¼€å§‹åˆ›å»ºè·¯å¾„
			context.beginPath();
			// ç”»ä¸€ä¸ªæ¤­åœ†
			context.oval(162, 159, 100, 128);
			// å…³é—­è·¯å¾„
			context.closePath();
			// å‰ªåˆ‡è·¯å¾„
			context.clip();
			//å°†å›¾ç‰‡ç”»åˆ°ç”»å¸ƒä¸Š
	        context.drawImage(img, 107, 90, 112, 145);
			//è°ƒç”¨restoreæœ€åŽä¸€æ¬¡å­˜å‚¨çš„çŠ¶æ€ä¼šè¢«æ¢å¤
	        context.restore();
	    }
	}
	else if(browserFlag == "clearForVerify" || browserFlag == "clearForRegister")
	{
		// è°·æ­Œæµè§ˆå™¨è°ƒç”¨çš„å‡½æ•°
		img = new Image();
		img.src = "";
		img.src = base64PalmImg;
		img.onload=function() {
			// ä¿å­˜å½“å‰çš„ç»˜å›¾çŠ¶æ€
			context.save();
			// å¼€å§‹åˆ›å»ºè·¯å¾„
			context.beginPath();
			// ç”»ä¸€ä¸ªæ¤­åœ†
			if(browserFlag == "clearForVerify")
			{
				context.oval(161, 160, 132, 165);
			}
			else if(browserFlag == "clearForRegister")
			{
				// è°·æ­Œæµè§ˆå™¨è°ƒç”¨çš„å‡½æ•°
				context.oval(195, 142, 132, 165);
			}
			// å…³é—­è·¯å¾„
			context.closePath();
			// å‰ªåˆ‡è·¯å¾„
			context.clip();
			//å°†å›¾ç‰‡ç”»åˆ°ç”»å¸ƒä¸Š
			if(browserFlag == "clearForVerify")
			{
				context.drawImage(img, 82, 54, 160, 213);
			}
	        else if(browserFlag == "clearForRegister")
	        {
	        	// è°·æ­Œæµè§ˆå™¨è°ƒç”¨çš„å‡½æ•°
                //console.log('ç”»å›¾')
	        	context.drawImage(img, 130, 60, 132, 165);
	        }
			//è°ƒç”¨restoreæœ€åŽä¸€æ¬¡å­˜å‚¨çš„çŠ¶æ€ä¼šè¢«æ¢å¤
	        context.restore();
	    }
	}
	else if(browserFlag == "simple")
	{
		$("#showPalmImageDiv").html("<img src="+imgSrc+" width='112' height='145' />");
	}
	else if(browserFlag == "verifySimple")
	{
		$("#showSeachingDiv").show();
//		$("#showSeachingDiv").html("&nbsp;&nbsp;<img src=\"/public/images/searching.gif\" width='20' height='20'/></br><label style='color:yellow;align:center;font-size: 14px;'>${base_fp_waiting}</label>");
	}
	else if(browserFlag == "clearForSimple")
	{
		$("#showPalmImageDiv").html("");
	}
}
/**
 * é¡µé¢åŠ è½½å’Œé‡ç”»æ—¶æ¸²æŸ“æ‰‹æŽŒ
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param num å½“å‰éœ€è¦æ¸²æŸ“çš„æ‰‹æŽŒç¼–å·
 * @param browserFlag æµè§ˆå™¨æ ‡è®° simple:ç®€æ˜“ç‰ˆæœ¬ï¼Œè¡¨ç¤ºæ˜¯ieæµè§ˆå™¨ï¼›html5:è¡¨ç¤ºæ”¯æŒhtml5çš„æµè§ˆå™¨
 */
function renderPalmInit(context, num, browserFlag) {
	var palmId;
	for(var i=0; i<palmIdArray.length; i++)
	{
		palmId = eval(palmIdArray[i]);
		if(browserFlag == "html5"){
			if(palmId == num)
				{
					context.fillStyle = "rgb(122,193,66)";
					context.fill();
				}
			}
	}
	if(browserFlag == "simple")
	{
		document.getElementById("palm" + palmId).checked = true;
	}
}
/**
 * åˆ é™¤æ•°ç»„å…ƒç´  -- ä»Ždxä¸‹æ ‡å¼€å§‹ï¼Œåˆ é™¤ä¸€ä¸ªå…ƒç´ 
 * @param dx è¦åˆ é™¤å…ƒç´ çš„ä¸‹æ ‡
 */
function removeItem(array, dx) {
   array.splice(dx, 1);
}
/**
 * ç‚¹å‡»å·²ç»é‡‡é›†æŽŒçº¹çš„æ‰‹æŽŒæ—¶ï¼Œå¼¹å‡ºæ¡†åˆ é™¤æ•°æ®
 * åˆ é™¤æ—¶çš„å›žè°ƒå‡½æ•°
 * @param result å¼¹å‡ºæ¡†é€‰æ‹©ç¡®å®šè¿˜æ˜¯å–æ¶ˆ
 * @param context 2dç”»å¸ƒä¸Šä¸‹æ–‡
 * @param browserFlag æµè§ˆå™¨æ ‡è®° simple:ç®€æ˜“ç‰ˆæœ¬ï¼Œè¡¨ç¤ºæ˜¯ieæµè§ˆå™¨ï¼›html5:è¡¨ç¤ºæ”¯æŒhtml5çš„æµè§ˆå™¨
 */
var delPalmData = function(result, context, browserFlag) {
	var palmId;
	if(result)
	{
		//å°†æ•°ç»„ä¸­çš„æŽŒå®šå…ƒç´ åˆ é™¤
		for(var i=0; i<palmIdArray.length; i++)
		{
			palmId = eval(palmIdArray[i]);
            if(palmId == palmIdNum)
            {
            	delpalmIdArray.push(palmIdArray[i]);
                removeItem(palmIdArray, i);
                templatePalmDataArray = []
            }
		}
		if(browserFlag == "simple")
		{
			document.getElementById("palm" + palmId).checked = false;
		}
		else if(browserFlag == "html5")
		{
			//å°†æ‰‹æŽŒé¢œè‰²æ”¹å˜--é‡ç”»æ—¶ä¹Ÿè¦åˆ¤æ–­
			context.fillStyle = bgColor;
			context.fill();
			if(lastPalmIdNum != null && lastPalmIdNum != lastPalmIdNum)
			{
				//æ¶ˆé™¤åŽŸæ¥æ‰‹æŽŒçš„é¢œè‰²
				renderPalmAfterColl(globalContext, lastPalmIdNum, bgColor, false);
			}
			//æ¶ˆé™¤éœ€è¦åˆ é™¤çš„æ‰‹æŽŒé¢œè‰²
			renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);
		}
		palmModifyFlag = true;
		$("#submitPalmButtonId").attr("disabled", false);
	}
	else
	{
		if(browserFlag == "simple")
		{
			document.getElementById("palm" + palmIdNum).checked = true
			collectFlag = true;
		}
		else if(browserFlag == "html5")
		{
			//æ¶ˆé™¤åŽŸæ¥æ‰‹æŽŒçš„é¢œè‰²--æœ‰é—®é¢˜ï¼Œå¦‚æžœåŽŸæ¥æ‰‹æŽŒå’ŒçŽ°åœ¨çš„ä¸€æ ·ï¼Œæœ‰é—®é¢˜
			//renderPalmAfterColl(globalContext, lastPalmIdNum, bgColor, false);
		}
	}
};
/**
 * åˆ¤æ–­å½“å‰æ‰‹æŽŒæ˜¯å¦åœ¨palmIdArrayä¸­ï¼Œå¦‚æžœåœ¨ï¼Œåˆ™è¯´æ˜Žæ­¤æ‰‹æŽŒå·²ç»é‡‡é›†æŽŒçº¹
 * @param num æ‰‹æŽŒç¼–å·
 * @param palmIdArray å­˜æ”¾æ‰‹æŽŒç¼–å·çš„æ•°ç»„
 * @return è¿”å›žbooleanå€¼ true:numåŒ…å«åœ¨palmIdArrayä¸­ï¼›false:æ²¡æœ‰åŒ…å«
 */
function isPalmContains(palmIdArray, num) {
	var palmId;
	var isCollected = false;
	for(var j=0; j<palmIdArray.length; j++)
	{
		palmId = eval(palmIdArray[j]);
		if(palmId == num)
		{
			isCollected = true;
		}
	}
	return isCollected;
}
/**
 * å°†æŽŒçº¹æ•°æ®ä¿å­˜åˆ°é¡µé¢
 */
function storePalmToHtml() {
    //console.log('å¼€å§‹å­˜æ•°æ®è¿›ç½‘é¡µ')
    var palmDelArray = new Array();
    //console.log('æ•°æ®åº“ä¸­çš„æŽŒçº¹', palmIdDBArray.length);
    for(var i=0; i< palmIdDBArray.length; i++){
        var palmdbid = palmIdDBArray[i];
        var match =false;
        for(var j=0; j<palmIdArray.length;j++){
            var fid= palmIdArray[j];
            if(palmdbid == fid){
                match = true
            }
        }
        if(match){
            var index = palmIdArray.indexOf(palmdbid);
            if(delpalmIdArray.indexOf(palmdbid) > -1){
            	palmDelArray.push(palmdbid);
			}else{
            	removeItem(palmIdArray, index);
            	templatePalmDataArray = []
			}
        }else{
            palmDelArray.push(palmdbid);
        }
    }
    $("#id_del_palm").val(palmDelArray.toString());
	//æ²¡æœ‰æ‰‹æŽŒæ ‡è®°æ•°æ®
	if(palmIdArray.length == 0)
	{
		$("#id_palms").val("");
	}
	else
	{
        var ptype = new Array();
        var pIdArray = new Array();
        for(var i=0; i < palmIdArray.length; i++){
            var palmdbid = palmIdArray[i];
            var ptypecode = 1;
            ptype.push(ptypecode);
            pIdArray.push(palmdbid);
        }
        //å°†æ‰‹æŽŒç±»åž‹æ•°æ®ä¿å­˜åˆ°é¡µé¢
        $("#id_palm_type").val(ptype.toString());
        //console.log('pIdArray', pIdArray.toString());
		//å°†æ‰‹æŽŒæ ‡è®°æ•°æ®ä¿å­˜åˆ°é¡µé¢
		$("#id_palms").val(pIdArray.toString());
	}
	//æ²¡æœ‰æŽŒçº¹æ¨¡æ¿æ•°æ®
	if(templatePalmDataArray.length == 0)
	{
	    //console.log('æ²¡æœ‰æŽŒçº¹æ¨¡æ¿æ•°æ®');
		$("#id_palm_template").val("");
	}
	else
	{
		//å°†æŽŒçº¹æ¨¡æ¿æ•°æ®ä¿å­˜åˆ°é¡µé¢
		$("#id_palm_template").val(templatePalmDataArray.toString());
	}
}
/**
 * åˆ¤æ–­æŽŒçº¹æ•°é‡--é¡µé¢åŠ è½½æ—¶ï¼Œæ²¡æœ‰è®¡ç®—ã€‚åªæ˜¯åœ¨é‡‡é›†å®ŒæŽŒçº¹åŽè®¡ç®—æŽŒçº¹æ•°é‡
 */
function showPalmCount() {
	$("#id_palmCount").val(palmIdArray.length);
}
/**
 * èŽ·å–é¡µé¢çš„æŽŒçº¹æ•°æ®
 * @param
 */
function getPalmFromPage() {

    var palmDel = $("#id_del_palm").val(); //åˆ é™¤çš„æŽŒçº¹ID
    //console.log('èŽ·å–åˆ é™¤æ•°æ®',palmDel);
    var palmDelArray = new Array();
    if($.trim(palmDel) != ""){
        palmDelArray = palmDel.split(",");
    }
    var palmId = $("#id_palms").val();
    //console.log('åˆ¤æ–­æ˜¯å¦æœ‰æ•°æ®', $("#id_palm_template").val());
    var palmTemplate = $("#id_palm_template").val();
    //å¦‚æžœæœ‰æ•°æ®
    if($.trim(palmId) != "")
    {
        //console.log('æœ‰æ•°æ®', palmId);
        //console.log('å¯¹palmIdArrayè¿›è¡Œèµ‹å€¼');
	    palmIdArray = palmId.split(",");
	    templatePalmDataArray = palmTemplate.split(",");
    }else{
        //console.log('æ— æ•°æ®')
    	palmIdArray=new Array();
    	templatePalmDataArray=new Array();
    	palmIdDBArray=[]
    }
    for(var i=0;i<palmIdDBArray.length;i++){
        var dbfid = palmIdDBArray[i];
        var match = false
        for (var j = 0; j < palmIdArray.length; j++) {
            var fid = palmIdArray[j];
            if (dbfid == fid) {
                match = true;
            }
        }
        if (!match) {
            palmIdArray.push(dbfid);
            templatePalmDataArray.push("");
        }
    }
}
/**
 * æ£€æµ‹æŽŒçº¹ç™»è®°è®¾å¤‡æ˜¯å¦å¯ç”¨
 */
function checkPalmReader(context, browserFlag) {
    if (browserFlag == "html5") {
        var setting = {};
        setting.url = "/zkbioonline/palm/beginCapture?type=1&ledtime=500";
        setting.async = false;
        setting.callback = function (result){
            //è¿”å›žç 
            var ret = null;
            ret = result.ret;
            // console.log('æ‰§è¡Œåˆå§‹åŒ–åˆ¤æ–­è®¾å¤‡æ˜¯å¦è¿žæŽ¥æˆåŠŸ', ret);
            //æŽ¥å£è°ƒç”¨æˆåŠŸè¿”å›žæ—¶
            if (ret == '0') {
                //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
                collectPalmTips(context, TIP27, "html5");
            }
            else if (ret == '-2') {
                getPalmWebServerInfo("1");
            }
            // è™½ç„¶æ˜¯åˆå§‹åŒ–ç®—æ³•å¤±è´¥ï¼Œä½†å…¶å®žæ˜¯è®¾å¤‡æ²¡æœ‰è¿žæŽ¥ä¸Šã€‚
            else if (ret == '-6') {
                collectPalmTips(context, TIP3, "html5");
            }
            else {
                //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
                collectPalmTips(context, TIP2, "html5");
            }
            collectFlag = true;
            //å–æ¶ˆé‡‡é›†
            cancelPalmRegister();
        };
        excute2(setting);
    }
}
/**
 * èŽ·å–webserverä¿¡æ¯çš„å›žè°ƒå‡½æ•°
 */
function getPalmWebServerInfoCallBack(result) {
	//è¿”å›žç 
	var ret = null;
	ret = result.ret;
	// console.log(result.ret)
	//æŽ¥å£è°ƒç”¨æˆåŠŸè¿”å›žæ—¶
	if(ret == '0')
	{
		showPALMRegister();
	}else {
       collectPalmTips(context, TIP3, "html5");
    }
}

/**
 * èŽ·å–webserverçš„ä¿¡æ¯
 * @param
 * @param type 0 è¡¨ç¤ºå‘é€å®Œè¯·æ±‚åŽ,è¿˜æœ‰åˆ«çš„æ“ä½œã€‚1 è¡¨ç¤ºå‘é€å®Œè¯·æ±‚åŽï¼Œæ²¡æœ‰å…¶ä½™çš„æ“ä½œäº†

 */
function getPalmWebServerInfo(type) {
    var setting = {};
    setting.url = "/zkbioonline/info";
    setting.async = true;
    setting.callback = function(result){
            //æ£€æŸ¥é©±åŠ¨
			if(type == "0")
			{
				getPalmWebServerInfoCallBack(result);
			}
			//æ£€æŸ¥åŠ¨æ€åº“è¿žæŽ¥ ç›®å‰æ²¡æœ‰è¿™ä¸ªåŠŸèƒ½
			else if(type == "1")
			{
				getPalmDLLConnectCallBack(result);
			}
    };
    excute2(setting);
}
/**
 * ----------------------------------------------------------PalmDriver start-------------------------------------------
 */
//é©±åŠ¨è®¿é—®åœ°å€ï¼ŒæŒ‡çº¹é©±åŠ¨å’ŒæŽŒçº¹é©±åŠ¨éƒ½æ˜¯åŒä¸€ä¸ª
var BIOOnlineUrl = "http://127.0.0.1:22001";
/**
 * é©±åŠ¨ç±»åˆå§‹åŒ–
 * @returns {PalmDriver}
 */
function initPalmDriver(){
    var PalmDriver = function(){};
    PalmDriver.prototype.dealPalmDriverResponse = function(result) {
        this.dealResult(result);
    };
    PalmDriver.prototype.ajaxAccess = function(url, async){
        var result = null;
		var parent = this;
        var xhr = getXMLRequest();
        xhr.open("GET", BIOOnlineUrl+url, async);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4){ //è¯·æ±‚å®Œæˆ
                if(xhr.status == 200){
                    var resultData = xhr.responseText;
                    resultData = resultData.replace(/\\/g,"/");
                    result = JSON.parse(resultData);
                    parent.dealPalmDriverResponse(result);
                }else{
                }
            }
        };
        xhr.send();
    };
    //IE8ã€IE9è®¿é—®æœåŠ¡
	PalmDriver.prototype.xDomainAccess = function(url, async)
	{
		var parent = this;
		var xDomainRequest = new XDomainRequest();
		if (xDomainRequest)
		{
			xDomainRequest.timeout=10000;
			xDomainRequest.open('GET', BIOOnlineUrl+url, async);
			xDomainRequest.onload = function()
			{
				var resultData = xDomainRequest.responseText;
				resultData = resultData.replace(/\\/g,"/");
                var obj = JSON.parse(resultData);
				parent.dealPalmDriverResponse(obj);
			};
			xDomainRequest.onerror = function()
			{
				//ç”¨å®ŒåŽï¼Œå°†å¯¹è±¡ç½®ä¸ºç©º
				xDomainRequest = null;
			};
			xDomainRequest.ontimeout = function()
			{
				//ç”¨å®ŒåŽï¼Œå°†å¯¹è±¡ç½®ä¸ºç©º
				xDomainRequest = null;
			};
			xDomainRequest.send();
		}
	}
    var browserFlag = getBrowserType() || "";
    PalmDriver.prototype.accessDriver = function(){
        if(browserFlag == "html5" )
		{
			this.ajaxAccess(this.url, this.async);
		}
		else if(browserFlag == "simple")
		{
			this.xDomainAccess(this.url, this.async);
		}
		else
		{
			if(window.console)
			{
				console.error("browserFlag is missing");
			}
		}
    }
    PalmDriver.prototype.createDriver = function(setting){
        var Driver = function(){};
        var driver = this.initSetting(Driver, setting);
        return driver;
    };
    PalmDriver.prototype.initSetting = function (Driver, setting){
        ZK.extend(Driver, PalmDriver, {
            url: setting.url,
            async: setting.async,
            dealResult:setting.callback
        });
        return new Driver();
    };
    PalmDriver.prototype.getPalmDriver = function(setting){
        var driver = new PalmDriver();
        var mydriver = driver.createDriver(setting);
        mydriver.accessDriver();
    };
    return new PalmDriver();
}
/**
 * å‘é€è¯·æ±‚
 * @type {PalmDriver}
 */
var palm_driver = initPalmDriver();
function excute2(setting){
    palm_driver.getPalmDriver(setting);
}
/**
 * åˆ¤æ–­æ˜¯å¦å®‰è£…æŽŒçº¹é©±åŠ¨
 * @param browserFlag æµè§ˆå™¨æ ‡è®° simple:ç®€æ˜“ç‰ˆæœ¬ï¼Œè¡¨ç¤ºæ˜¯ieæµè§ˆå™¨ï¼›html5:è¡¨ç¤ºæ”¯æŒhtml5çš„æµè§ˆå™¨
 * @param paramArray å­˜æ”¾å›½é™…åŒ–å…ƒç´ çš„æ•°ç»„
 * @param isPalmLogin æ˜¯å¦æ˜¯æŽŒçº¹ç™»å½• true:æ˜¯ï¼›false:å¦
 */
function checkPalmDriver(isPalmLogin) {
    //console.log('æ£€æŸ¥é©±åŠ¨')
    var browserFlag = getBrowserType() || "";
    if(browserFlag == "upgradeBrowser"){
        if(isPalmLogin){
            $("#id_palm_identify").unbind();
            $("#id_palm_identify").attr({disabled:"true",title:gettextBasePalm("å½“å‰æµè§ˆå™¨ä¸æ”¯æŒè¯¥åŠŸèƒ½,è¯·å‡çº§æˆ–æ›´æ¢æµè§ˆå™¨.")});
        }else{
            $("#id_palm_register").attr("onclick", "");
            $("#id_palm_register").attr({disabled:"true",title:gettextBasePalm("å½“å‰æµè§ˆå™¨ä¸æ”¯æŒè¯¥åŠŸèƒ½,è¯·å‡çº§æˆ–æ›´æ¢æµè§ˆå™¨.")});
        }
    }
	else
	{
		// å‘é€ä¸€ä¸ªè¯·æ±‚ï¼Œæ£€æŸ¥æ˜¯å¦å®‰è£…é©±åŠ¨
		getPalmWebServerInfo("0");
	}
}
/**
 * èŽ·å–æŽŒçº¹å›¾åƒ
 */
function getPalmImage(resultDeal) {
    //console.log('æ‰§è¡ŒèŽ·å–å›¾åƒå‘½ä»¤')
    var setting = {};
    setting.url = "/zkbioonline/palm/getImage";
    setting.async = false;
    setting.callback = resultDeal;
    excute2(setting);
}
/**
 * èŽ·å–æŽŒçº¹æ¨¡ç‰ˆ
 */
function getPalmTemplate(flag) {
    var setting = {};
    setting.url = "/zkbioonline/palm/getTemplate";
    setting.async = false;
    var palmTemplate = [];
	var collectSuccessFlag = false;
	//console.log('æ‰§è¡Œå‘½ä»¤èŽ·å–æ¨¡æ¿');
    setting.callback= function(result) {
        //è¿”å›žç 
        var ret = null;
        ret = result.ret;
        if(ret == '0') {
        	var palm = {}
        	for(let i=0; i<result.data.length; i++) {
        		palm[i] = result.data[i].template;
			}
        	palmTemplate.push(JSON.stringify(palm));
            if (flag == "register") {
                //åˆ¤æ–­æ‰‹æŽŒæ˜¯å¦å·²ç»é‡‡é›†æŽŒçº¹
                var compareRet = 'ok';
                if($.trim(compareRet) == "-1") {
                    //é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
                    renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);//bgColoråˆ¤æ–­
                    //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
                    collectPalmTips(globalContext, TIP2, "html5");
                }
                else if(compareRet == -25) {
                        //é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
                        renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);//bgColoråˆ¤æ–­
                        //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
                        collectPalmTips(globalContext, TIP26, "html5");
                    }
                else if(compareRet == -19){
                        //é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
                        renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);//bgColoråˆ¤æ–­
                        //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
                        collectPalmTips(globalContext, TIP20, "html5");
                    }
                else if(compareRet == -18){
                        //é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
                        renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);//bgColoråˆ¤æ–­
                        //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
                        collectPalmTips(globalContext, TIP19, "html5");
                    }
                else if(compareRet == -24){
                        //é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
                        renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);//bgColoråˆ¤æ–­
                        //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
                        collectPalmTips(globalContext, TIP25, "html5");
                    }
                else {
                	//æ­¤æ‰‹æŽŒæœªé‡‡é›†æŽŒçº¹
					if(compareRet == "ok") {
						collectSuccessFlag = true;
						//console.log('å­˜æ”¾ç¼“å­˜æŽŒçº¹');
						//é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
						renderPalmAfterColl(globalContext, palmIdNum, bgColor, true);//bgColoråˆ¤æ–­
						//æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
						collectPalmTips(globalContext, TIP1, "html5");
						//å°†æŽŒçº¹æ¨¡æ¿ä¿å­˜åˆ°æ•°ç»„ä¸­
						//console.log('å°†æŽŒçº¹æ¨¡æ¿ä¿å­˜åˆ°æ•°ç»„ä¸­');
						templatePalmDataArray = palmTemplate;
						//å°†æ‰‹æŽŒæ ‡è®°ä¿å­˜åˆ°æ•°ç»„ä¸­
						palmIdArray[palmIdArray.length] = palmIdNum;
					}
					else {
						//console.log('æ¯”å¯¹çš„è¿”å›žå€¼ä¸æ˜¯â€˜OKâ€™')
						//é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
						renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);//bgColoråˆ¤æ–­
						//æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
						collectPalmTips(globalContext, TIP2, "html5");
					}
                }
            }
            else if(flag == "verification") {
        	verifyFlag = false;
        	//æŽŒçº¹æ¯”å¯¹
			// getPalmTmp(palmTemplate);
        }
        }
        else if(ret == '-8') {
			//é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
			renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);
			//æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
			collectPalmTips(globalContext, TIP9, "html5");
        }
        else if(ret == '-13') {
			//é‡‡é›†å®ŒæŽŒçº¹ï¼Œæ¸²æŸ“æ‰‹æŽŒ
			renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);
			//æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
			collectPalmTips(globalContext, TIP14, "html5");
        }
    };
    excute2(setting);
    // console.log('èŽ·å–çŠ¶æ€', collectSuccessFlag);
    return collectSuccessFlag;
}
/**
 * ---------------------------------------------------html--------------------------------------------------------------
 */
var closeWindow = function(){
	// console.log('closewindow');
	layer.close(layerIndex);
  //$(".layui-layer-close").click();
};

//ä¿å­˜æŽŒçº¹åˆ°ç½‘é¡µä¸­
var savePalmData = function(result) {
	if(collectFlag)
	{
		//å–æ¶ˆé‡‡é›†
		cancelPalmRegister();
		//å°†å®šæ—¶å™¨çš„é€’å½’è°ƒç”¨å…³é—­
		clearTimeout(timer);
	}
	if(result)
	{
        showPalmCount();
	    storePalmToHtml();
	    closeWindow();
		//console.log('å­˜æ•°æ®')
	}
	else
	{
		clearPalmImageData();
		closeWindow();
	}
};
/**
 * æç¤ºå®‰è£…é©±åŠ¨
 */
function alertDialog(){
    var msg = gettextBasePalm('please.install.plam.detector.driver.license.first');
    var message = '<div>'
        +'<div id="msg" class="alertDialog"><span>'+msg+'</span></div>'
        +'</div>';

    $(message).dialog({
        title:gettextBasePalm("æç¤º"),
        on_load:function(obj){
                $(message).find("#msg").css({width:(msg.length*10+100)+'px'});
        }
    });
}
/**
 * --------------------æç¤ºä¿¡æ¯-----------------
 */
var TIP1 = gettextBasePalm("ZKPALM.ERR.OK"); //ret = 0 /**<  æ“ä½œæˆåŠŸ
var TIP2 = gettextBasePalm("ZKPALM.ERR.FAIL"); // -1 /**<  æ“ä½œå¤±è´¥
var TIP3 = gettextBasePalm("ZKPALM.ERR.NO.DEVICE"); // -2 /**<  è®¾å¤‡æœªè¿žæŽ¥
var TIP4 = gettextBasePalm("ZKPALM.ERR.NULL.POINT");// -3	 /**<  ç©ºæŒ‡é’ˆ
var TIP5 = gettextBasePalm("ZKPALM.ERR.INVALID.PARAM"); //-4	 /**<  æ— æ•ˆå‚æ•°
var TIP6 = gettextBasePalm("ZKPALM.ERR.NO.SUPPORT"); // -5	 /**<  ä¸æ”¯æŒ
var TIP7 = gettextBasePalm("ZKPALM.ERR.INITLIB");// -6	 /**<  åˆå§‹åŒ–ç®—æ³•åº“å¤±è´¥
var TIP8 = gettextBasePalm("ZKPALM.ERR.INVALID.HANDLE");// -7	 /**<  æ— æ•ˆå¥æŸ„
var TIP9 = gettextBasePalm("ZKPALM.ERR.NOT.DETECTED");// -8	 /**<  æœªæ£€æµ‹åˆ°æ‰‹æŽŒ
var TIP10 = gettextBasePalm("ZKPALM.ERR.MEMORY.NOT.ENOUGH");// -9	 /**<  è½¯ä»¶å†…å­˜åˆ†é…
var TIP11 = gettextBasePalm("ZKPALM.ERR.OUT.AREA");// -10	 /**<  æ‰‹æŽŒä¸åœ¨æŽŒå®šåŒºåŸŸ
var TIP12 = gettextBasePalm("ZKPALM.ERR.LOADACAMLIB.FAIL");// -11	 /**<  åŠ è½½ACAMåŠ¨æ€åº“å¤±è´¥
var TIP13 = gettextBasePalm("ZKPALM.ERR.SETLICDATAFAIL");// -12      /**<  è®¾ç½®è®¸å¯æ–‡ä»¶å¤±è´¥
var TIP14 = gettextBasePalm("ZKPALM.ERR.EXTRACT.FAIL");// -13      /**<  æå–æ¨¡æ¿å¤±è´¥
var TIP15 = gettextBasePalm("ZKPALM.ERR.LOADLIB.FAIL");// -14      /**<  åŠ è½½ç®—æ³•åº“å¤±è´¥
var TIP16 = gettextBasePalm("ZKPALM.ERR.TEMPLATE.ERROR");// -15      /**<  æ¨¡æ¿æ ¼å¼æœ‰è¯¯
var TIP17 = gettextBasePalm("ZKPALM.ERR.ALGORITHM.ALLOCATION.MEMORY.ERROR ");// -16  /**<  æ·»åŠ ç™»è®°æ¨¡æ¿åˆ°é«˜é€Ÿç¼“å†²åŒºå¤±è´¥(ç®—æ³•åˆ†é…å†…å­˜é”™è¯¯)
var TIP18 = gettextBasePalm("ZKPALM.ERR.TEMPLATE.FAIL");// -17      /**<  æ¨¡æ¿è½¬æ¢å¤±è´¥
var TIP19 = gettextBasePalm("ZKPALM.ERR.COMPARE.TEMPLATE.ERROR");// -18      /**<  è¦åˆæˆçš„æ¯”å¯¹æ¨¡æ¿æ•°æ®æœ‰è¯¯
var TIP20 = gettextBasePalm("ZKPALM.ERR.OPEN.DEVICE.FAIL");// -19      /**<  æ‰“å¼€è®¾å¤‡å¤±è´¥
var TIP21 = gettextBasePalm("ZKPALM.ERR.NO.HTTP.POST"); //-20     /**<  æœªä½¿ç”¨HTTP POST
var TIP22 = gettextBasePalm("ZKPALM.ERR.BASE64.CODE.FAIL"); //-21     /**<  base64ç¼–ç å¤±è´¥
var TIP23 = gettextBasePalm("ZKPALM.ERR.CREATE.COLLECTION.FAIL"); //-22     /**< åˆ›å»ºé‡‡é›†çº¿ç¨‹å¤±è´¥
var TIP24 = gettextBasePalm("ZKPALM.ERR.CONTINUE.TO.REGISTER"); //-23     /**<  è¯·ç»§ç»­é‡‡é›†æ‰‹æŽŒ
var TIP25 = gettextBasePalm("ZKPALM.ERR.NO.OPEN.DEVICE"); //-24     /**< æœªæ‰“å¼€è®¾å¤‡
var TIP26 = gettextBasePalm("ZKPALM.ERR.REPEAT.PALM"); //-25     /**< æŽŒçº¹é‡å¤å½•å…¥ï¼Œæ•°æ®åº“ä¸­å·²æœ‰è¯¥æŽŒçº¹
var TIP27 = gettextBasePalm("ZKPALM.ERR.OK.START"); //ret = 0 /**<  åˆå§‹åŒ–æ—¶æç¤º


function gettextBasePalm(key) {
    const translations = {
        // ZKPALM Error Messages
        'ZKPALM.ERR.OK': 'Operation succeeded',
        'ZKPALM.ERR.FAIL': 'Operation failed',
        'ZKPALM.ERR.NO.DEVICE': 'Device not connected',
        'ZKPALM.ERR.NULL.POINT': 'Null pointer',
        'ZKPALM.ERR.INVALID.PARAM': 'Invalid parameter',
        'ZKPALM.ERR.NO.SUPPORT': 'Not supported',
        'ZKPALM.ERR.INITLIB': 'Failed to initialize algorithm library',
        'ZKPALM.ERR.INVALID.HANDLE': 'Invalid handle',
        'ZKPALM.ERR.NOT.DETECTED': 'Palm not detected',
        'ZKPALM.ERR.MEMORY.NOT.ENOUGH': 'Insufficient memory allocation',
        'ZKPALM.ERR.OUT.AREA': 'Palm not within the designated region',
        'ZKPALM.ERR.LOADACAMLIB.FAIL': 'Failed to load ACAM dynamic library',
        'ZKPALM.ERR.SETLICDATAFAIL': 'Failed to set license file',
        'ZKPALM.ERR.EXTRACT.FAIL': 'Failed to extract template',
        'ZKPALM.ERR.LOADLIB.FAIL': 'Failed to load algorithm library',
        'ZKPALM.ERR.TEMPLATE.ERROR': 'Invalid template format',
        'ZKPALM.ERR.ALGORITHM.ALLOCATION.MEMORY.ERROR': 'Failed to add enrollment template to fast buffer (algorithm memory allocation error)',
        'ZKPALM.ERR.TEMPLATE.FAIL': 'Template conversion failed',
        'ZKPALM.ERR.COMPARE.TEMPLATE.ERROR': 'Error in comparison template data for fusion',
        'ZKPALM.ERR.OPEN.DEVICE.FAIL': 'Failed to open device',
        'ZKPALM.ERR.NO.HTTP.POST': 'HTTP POST not used',
        'ZKPALM.ERR.BASE64.CODE.FAIL': 'Base64 encoding failed',
        'ZKPALM.ERR.CREATE.COLLECTION.FAIL': 'Failed to create collection thread',
        'ZKPALM.ERR.CONTINUE.TO.REGISTER': 'Please continue palm collection',
        'ZKPALM.ERR.NO.OPEN.DEVICE': 'Device not opened',
        'ZKPALM.ERR.REPEAT.PALM': 'Palm print already exists in database (duplicate enrollment)',
        'ZKPALM.ERR.OK.START': 'Initialization prompt message'
    };
    return translations[key] || key;
}
