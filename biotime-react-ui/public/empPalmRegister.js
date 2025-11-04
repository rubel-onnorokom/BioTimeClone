/**
 * Created by Arvin on 2015-05-20.
 */
//ç»˜ç”»åŒæ‰‹çš„èµ·ç‚¹æ¨ªåæ ‡
var x = 28;
//ç»˜ç”»åŒæ‰‹çš„èµ·ç‚¹çºµåæ ‡
var y = 346;
//å­˜æ”¾ç”»æ‰‹æŽŒå‡½æ•°çš„æ•°ç»„
var palmList = [];
//ä¿å­˜å½“å‰æ­£åœ¨é‡‡é›†çš„æ‰‹æŽŒæ ‡è®°--åˆ é™¤æ—¶ï¼Œæ¶ˆé™¤å½“å‰æ­£åœ¨é‡‡é›†çš„æ‰‹æŽŒé¢œè‰²æ—¶ç”¨åˆ°
var lastPalmIdNum = null;
//å…¨å±€2dç”»ç¬”
var globalContext = null;
//ç»˜ç”»æ‰‹æŽŒçš„è¾¹æ¡†é¢œè‰²
var palmBorderColor = "rgb(71,75,79)";
//é¡µé¢èƒŒæ™¯è‰²
var bgColor = "rgb(243, 245,240)";
//ç»˜ç”»çš„å›¾å½¢è¾¹æ¡†æ ·å¼--è¾¹çº¿ç»˜å›¾
var strokeStyle = "stroke";
//ç»˜ç”»çš„å›¾å½¢å¡«å……æ ·å¼--å¡«å……ç»˜å›¾
var fillStyle = "fill";
//ç‚¹å‡»æ‰‹æŽŒ çš„é¢œè‰²
var fillPalmColor="rgb(71,75,79)";
//åˆ¤æ–­æ˜¯å¦ä¿®æ”¹äº†æ•°æ®(åŒ…æ‹¬æ–°å¢žå’Œåˆ é™¤)
var palmModifyFlag = false;

/**
 * ç”»æ¤­åœ† -- ç»™contextæ·»åŠ ç»˜ç”»æ¤­åœ†çš„å±žæ€§
 * @param x, y æ¤­åœ†å®šä½çš„åæ ‡
 * @param width, height æ¤­åœ†çš„å®½åº¦å’Œé«˜åº¦
 */
CanvasRenderingContext2D.prototype.oval = function  (x, y, width, height)
{
    var k = (width/0.75)/2,w = width/2,h = height/2;
    this.strokeStyle = bgColor;
	this.beginPath();
	this.moveTo(x, y-h);
	this.bezierCurveTo(x+k, y-h, x+k, y+h, x, y+h);
	this.bezierCurveTo(x-k, y+h, x-k, y-h, x, y-h);
	this.closePath();
	this.stroke();
	return this;
};
/**
 * ç”»æ‰‹æŽŒ
 */
function drawPalms(context, coordArray, color, x, y, num){
    //åˆå§‹åŒ–åæ ‡
	coordArray = initPalmCoordArray(coordArray, x, y, num);
	var drawObj = null;
    drawObj = "palm"+num;
    drawObj = new renderPalm(context, coordArray);
    drawObj.drawPalm(strokeStyle, color);
    //åˆå§‹åŒ–æ—¶ï¼Œæ¸²æŸ“æ‰‹æŽŒ
    renderPalmInit(context, num, "html5");
    //å°†ç»˜ç”»çš„æ‰‹æŽŒå®žä¾‹æ”¾å…¥æ•°ç»„ï¼Œæ–¹ä¾¿é‡ç”»æ—¶ç”¨
    //console.log('å°†ç»˜ç”»çš„æ‰‹æŽŒå®žä¾‹æ”¾å…¥æ•°ç»„')
    palmList.push(drawObj);
    //ç»˜ç”»åœ†åœˆå›¾ç‰‡
    showPalmImage(context, "/base_palmVerify_clearImage.png", "clearForRegister");

}
/**
 * æ¸…é™¤æŽŒçº¹æ˜¾ç¤º
 * ç›®å‰çš„é€»è¾‘æ˜¯ä¿æŒæŽŒçº¹æŒç»­æ˜¾ç¤ºï¼Œæ‰€ä»¥è¿™ä¸ªå‡½æ•°å…ˆæ³¨é‡Šäº†
 */
function clearPalmImageData(){
    // clearPalmImage(globalContext, 'register');
}
/**
 * æ£€æŸ¥é‡‡é›†æ¬¡æ•°
 * @param collCount é‡‡é›†æ¬¡æ•°
 */
function checkPalmCollCount()
{
	var base64PalmImg = "";
	//è¿”å›žç 
	var ret = null;
	// console.log('å‡†å¤‡å–å›¾');
    var resultDeal = function(result) {
        // console.log('result', result);
        ret = result.ret;
        enroll_index = result.data.enroll_index;
        collCount = 5 - enroll_index;
        if(ret == '0' && enroll_index == 5)
        {
            collCount = 1;
            base64PalmImg = result.data.image
        }else {
             collectPalmTips(globalContext, TIP24, "html5");
        }
        if(collCount != 1) {
            //ç¬¬ä¸€æ¬¡å’Œç¬¬äºŒæ¬¡é‡‡é›†ï¼Œæ˜¾ç¤ºé‡‡é›†æ¬¡æ•°ã€æŽŒçº¹å›¾åƒã€è¿›åº¦æ¡
            if(collCount == 3 || collCount == 2 || collCount == 4)
            {
                //è¿›åº¦æ¡
                 drawPalmProgressBar(globalContext, collCount);
            }
            //å®šæ—¶å™¨
            timer = setTimeout(function(){
                checkPalmCollCount();
            }, 1000);
        }
        else
        {
            //æ˜¾ç¤ºæŽŒçº¹å›¾åƒ
            showPalmImage(globalContext, base64PalmImg, "html5");
            setTimeout(function(){
                clearPalmImageData();
            }, 1000);
            //è¿›åº¦æ¡
            drawPalmProgressBar(globalContext, 5);
            //èŽ·å–æŽŒçº¹æ¨¡æ¿
            if(!getPalmTemplate('register')){
                drawPalmProgressBar(globalContext, 0);//è¿›åº¦æ¡ç°æ˜¾
                $("#submitPalmButtonId").attr("disabled", true);
            }else {
                $("#submitPalmButtonId").attr("disabled", false);
            }
            collectFlag = false;
            palmIdNum = -1;
            return 3;
        }
    };
    getPalmImage(resultDeal);
}
/**
 * å¼€å§‹æŽŒçº¹ä»ªå–åƒ
 */
function beginPalmRegister() {
    var setting = {};
    setting.url = "/zkbioonline/palm/beginCapture?type=2&ledtime=500";
    setting.async = true;
    setting.callback = function(result) {
        //è¿”å›žç 
        var ret = null;
        ret = result.ret;
        //æŽ¥å£è°ƒç”¨æˆåŠŸè¿”å›žæ—¶
        if(ret == '0') {
            //æ£€æŸ¥é‡‡é›†æ¬¡æ•°ã€æ˜¾ç¤ºå›¾åƒ
            checkPalmCollCount();
        }
        else if(ret == '-14') {
            //${base_palm_connectFail}:è¿žæŽ¥æŽŒçº¹é‡‡é›†å™¨å¤±è´¥ï¼ŒåŠ è½½ç®—æ³•åº“å¤±è´¥
            //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
            collectPalmTips(globalContext, TIP15, "html5");
        }else if(ret == '-6') {
            //${base_palm_connectFail}:è¿žæŽ¥æŽŒçº¹é‡‡é›†å™¨å¤±è´¥ï¼Œè¿”å›žçš„æ˜¯ret=-6ï¼Œ
            // ç®—æ³•åº“åœ¨è®¾å¤‡ä¸Šã€‚è®¾å¤‡æœªè¿žæŽ¥ä¹Ÿä¼šè¿”å›ž-6
            //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
            collectPalmTips(globalContext, TIP7, "html5");
        }else if(ret == '-22') {
            //${base_palm_connectFail}:åˆ›å»ºé‡‡é›†çº¿ç¨‹å¤±è´¥
            //æ˜¾ç¤ºæ¡†--é‡‡é›†æç¤º
            collectPalmTips(globalContext, TIP23, "html5");
        }
    };
    excute2(setting);
}
/**
 * ç»“æŸæŽŒçº¹ä»ªå–åƒ
 */
function cancelPalmRegister() {
    //å½“å‰æœ‰æ‰‹æŽŒåœ¨é‡‡é›†æŽŒçº¹
	if(collectFlag){
        var setting = {};
        setting.url = "/zkbioonline/palm/cancelCapture";
        setting.async = false;
        //å°†å®šæ—¶å™¨çš„é€’å½’è°ƒç”¨å…³é—­
		clearTimeout(timer);
        setting.callback = function() {
            if(palmModifyFlag)
            {
                $("#submitPalmButtonId").attr("disabled", false);
            }
            if(palmIdNum != null)
            {
                //æ¶ˆé™¤åŽŸæ¥æ‰‹æŽŒçš„é¢œè‰²
                renderPalmAfterColl(globalContext, lastPalmIdNum, bgColor, false);
            }
            collectFlag = false;
        };
        excute2(setting);
    }
}
function endPalmRegister() {
    //è°ƒç”¨ç»“æŸå‘½ä»¤ï¼Œä¸ç»“æŸä¼šå¯¼è‡´å’ŒæŒ‡çº¹ç™»è®°å†²çª
    var setting = {};
    setting.url = "/zkbioonline/palm/cancelCapture";
    setting.async = false;
    //å°†å®šæ—¶å™¨çš„é€’å½’è°ƒç”¨å…³é—­
    setting.callback = function() {
        collectFlag = false;
    };
    excute2(setting);
    //console.log('å…³é—­æŽŒçº¹ä»ª')
}

/**
 * å‘é€è¯·æ±‚åˆ°åŽå°ï¼ŒèŽ·å–æ•°æ®ä¸­çš„æŽŒçº¹æ¨¡æ¿, è¯¥åŠŸèƒ½ä¸å®Œå–„ï¼Œå…ˆç¦ç”¨ï¼Œä»£ç ä¿ç•™
 * å¦‚æžœæ•°æ®åº“å·²å­˜åœ¨æŽŒçº¹ï¼Œé‚£ä¹ˆresponse.code å°±ä¸º0.ä¸å­˜åœ¨å°±ä¸º-1
 * åªæœ‰å½“codeä¸º0çš„æƒ…å†µä¸‹ï¼Œæ‰éœ€è¦è¿›è¡ŒæŽŒçº¹æ¯”å¯¹ã€‚
 */
// function getPalmTmp(palmTemplate) {
//   var ret = "";
//   var arr = [];
//   $.ajax({
//       type: "GET",
//       url: "/get_palm_template/",
//       async: false,
//       success: function (response, status, xhr) {
//           if (response.code == 0) {
//               var palmTemplateArray = response.palm_tmp;
//               for (i = 0; i < palmTemplateArray.length; i++) {
//                   // console.log('å¼€å§‹forå¾ªçŽ¯ç¬¬'+ i + 'æ¬¡');
//                   ret = palmComparision(palmTemplate, palmTemplateArray[i]);
//                   // console.log('æ¯”å¯¹ç»“æžœ', ret);
//                   arr.push(ret);
//                   if (ret == -25) {
//                       collectPalmTips(globalContext, TIP26, "html5");
//                       break
//                   }else if (ret == -24){
//                       collectPalmTips(globalContext, TIP25, "html5");
//                       break
//                   }else if (ret == -19){
//                       collectPalmTips(globalContext, TIP20, "html5");
//                       break
//                   }else if (ret == -18){
//                       collectPalmTips(globalContext, TIP19, "html5");
//                       break
//                   }else if (ret == -13){
//                       collectPalmTips(globalContext, TIP14, "html5");
//                       break
//                   }else if (ret == -1){
//                       collectPalmTips(globalContext, TIP2, "html5");
//                       break
//                   }
//                   else {
//                       if(arr.length === palmTemplateArray.length){
//                         ret = 'ok'
//                       }else {
//                         ret = -1
//                       }
//                   }
//               }
//           } else if (response.code == -1) {
//               ret = "ok"
//           }
//           },
//       error: function (XMLHttpRequest, textStatus, errorThrown) {
//       }
//   });
//   // console.log('æ¯”å¯¹ç»“æžœ', ret);
//    return ret
// }

/**
 * å‘é€è¯·æ±‚åˆ°åŽå°ï¼ŒèŽ·å–æ•°æ®ä¸­çš„æŽŒçº¹æ¨¡æ¿, ç›®å‰çš„ç®—æ³•è¶…è¿‡576åˆ†ä¸ºç›¸åŒæŽŒçº¹ï¼Œæœ‰é—®é¢˜ã€‚ç›¸åŒæŽŒçº¹å¾ˆéš¾è¾¾åˆ°è¿™ä¸ªåˆ†æ•°
 */
// function palmComparision(palmTemplate, palmInDatabase) {
//     // console.log('å¼€å§‹æ¯”å¯¹æŽŒçº¹');
//     const body = {};
//     var ret = '';
//     body['regTemplate'] = palmTemplate[0];
//     body['verTemplate'] = palmInDatabase;
//     const _body = JSON.stringify(body);
//     let url = "http://127.0.0.1:22001/zkbioonline/palm/verify";
//     var xhr = new XMLHttpRequest();//ç¬¬ä¸€æ­¥ï¼šåˆ›å»ºéœ€è¦çš„å¯¹è±¡
//     xhr.open('POST', url, false); //ç¬¬äºŒæ­¥ï¼šæ‰“å¼€è¿žæŽ¥
//     xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");//è®¾ç½®è¯·æ±‚å¤´ æ³¨ï¼špostæ–¹å¼å¿…é¡»è®¾ç½®è¯·æ±‚å¤´ï¼ˆåœ¨å»ºç«‹è¿žæŽ¥åŽè®¾ç½®è¯·æ±‚å¤´ï¼‰
//     console.log(xhr.readyState, xhr.status);
//     if (xhr.readyState == 1) {
//             xhr.send(_body);//å‘é€è¯·æ±‚ å°†æ•°æ®å†™åœ¨sendä¸­
//             if (xhr.readyState == 4 && xhr.status == 200) {
//                     var result = JSON.parse(xhr.response);
//                     console.log('result.score', result.score);
//                     if (result.score > 576) {
//                         // console.log('ç›¸åŒæ‰‹æŽŒ');
//                         ret = -25
//                     } else {
//                         ret = 'ok'
//                     }
//                     return ret
//             }
//     }
// }


 /**
 * æŸ¥åŠ¨æ€åº“è¿žæŽ¥å›žè°ƒå‡½æ•°
 * @param ${pers_person_templateCount}:æŽŒçº¹æ•°
 */
function getPalmDLLConnectCallBack(result)
{
	 if(globalContext == null)
	 {
//		 globalContext = document.getElementById("canvas").getContext("2d");
		 var canvas = document.getElementById("canvasPalm");
         globalContext = getCanvasContext(canvas);
	 }
	//è¿”å›žç 
	var ret = null;
	ret = result.ret;
	//æŽ¥å£è°ƒç”¨æˆåŠŸè¿”å›žæ—¶
	if(ret == '0')
	{
		//è¿žæŽ¥æŽŒçº¹é‡‡é›†å™¨å¤±è´¥
		collectPalmTips(globalContext, TIP16, "html5");
	}
	else
	{
		collectPalmTips(globalContext, TIP7, "html5");
	}
}
/**
 * é‡ç”»
 * @param x
 * @param y
 */
function redrawPalm(x, y) {
    var canvas = document.getElementById("canvasPalm");
    var context = getCanvasContext(canvas);
    if (context) {
        var isInPalmArea = false;
        //console.log('palmList', palmList)
        for (var i = 0; i < palmList.length; i++) {
            //console.log('åŠ ç²—é€‰ä¸­æŽŒçº¹çš„è½®å»“')
            var palm = palmList[i];
            palm.drawPalm(strokeStyle, palmBorderColor);
            if (context.isPointInPath(x, y)) {
                isInPalmArea = true;
                break;
            }
        }
        outerloop:
        for(var i=0; i< palmList.length; i++){
            //console.log('collectFlag',collectFlag)
            if(collectFlag)
                {
                    if(palmIdNum == i) {
                        //åˆ‡æ¢æ‰‹æŽŒåŽï¼Œæ¸²æŸ“æ‰‹æŽŒ(æ¶ˆé™¤åŽŸæ¥æ‰‹æŽŒçš„é¢œè‰²)
                        renderPalmAfterColl(globalContext, palmIdNum, bgColor, false);
                    }
                }
                var palm = palmList[i];
                //console.log('ç¬¬äºŒæ¬¡ç”»å›¾', i)
                palm.drawPalm(strokeStyle, palmBorderColor);
                palm.drawPalm(fillStyle, 'rgb(122,193,66)');
                if (context.isPointInPath(x, y)) {
                    //console.log('ç‚¹å‡»çš„æ‰‹æŽŒ')
                    globalContext = context;
                    //ä¸¤æ¬¡æ˜¯å¦ç‚¹å‡»çš„åŒä¸€ä¸ªæ‰‹æŽŒè¿›è¡Œé‡‡é›†ã€‚å¦‚æžœæ˜¯ï¼Œåˆ™ç¬¬äºŒæ¬¡ç‚¹å‡»æ—¶å–æ¶ˆé‡‡é›†ã€‚
                    var iaSamePalm = false;
                    if( collectFlag)
                    {
                        //console.log('åŒä¸€ä¸ªæ‰‹æŽŒ')
                        iaSamePalm = true;
                    }
                    //åˆ¤æ–­è¯¥æ‰‹æŽŒæ˜¯å¦å·²ç»æœ‰æŽŒçº¹
                    var isCollected = false;
                    isCollected = isPalmContains(palmIdArray, i);
                    palmIdNum = i;
                    if(!isCollected)
                    {
                        //ä¿å­˜å½“å‰æ­£åœ¨é‡‡é›†çš„æ‰‹æŽŒæ ‡è®°
                        lastPalmIdNum = palmIdNum;
                    }
                    if(isCollected){
                        //console.log('æ‰‹æŽŒå·²ç»æœ‰æŽŒçº¹')
                        //å–æ¶ˆé‡‡é›†
                        cancelPalmRegister();
                        if(TIP21) {
                            layer.confirm(gettextEmpPalm('are.you.sure.you.want.to.delete...?'),
                                {
                                    title: gettextEmpPalm('palm.prompt'),
                                    btn: [gettextEmpPalm('btn.confirm'), gettextEmpPalm('btn.cancel')],
                                    yes: function (index) {
                                        delPalmData(true, context, "html5");
                                        layer.close(index);
                                    },
                                    cancel: function (index, layero) {
                                        delPalmData(false, context, "html5");
                                        layer.close(index);
                                    }
                                });
                        }
                        break outerloop;
                    }
                    else{
                        if(iaSamePalm){
                            //å–æ¶ˆé‡‡é›†
                            //console.log('å–æ¶ˆé‡‡é›†')
                            cancelPalmRegister();
                            //å–æ¶ˆé‡‡é›†åŽé‡æ–°æç¤ºè¯·é€‰æ‹©æ‰‹æŽŒ
                            collectPalmTips(globalContext, TIP14, "html5");
                            //å–æ¶ˆé‡‡é›†åŽé‡æ–°ç»˜åˆ¶è¿›åº¦æ¡
                            drawPalmProgressBar(context, 0);
                            palmIdNum = -1;
                        }else{
                            //å–æ¶ˆé‡‡é›†
                            cancelPalmRegister();
                            context.fillStyle = fillPalmColor;
                            //console.log('å¡«å……æ‰‹æŽŒé¢œè‰²')
                            context.fill();
                            collectFlag = true;//éœ€è¦åˆ¤æ–­ï¼Œå½“é‡å¤ç‚¹å‡»æ—¶ï¼Œé¢œè‰²æ”¹å˜
                            $("#submitPalmButtonId").attr("disabled", true);
                            drawPalmProgressBar(globalContext, 0);
                            //console.log('å¼€å§‹é‡‡é›†cmd=1');

                            //å¼€å§‹é‡‡é›† é‡‡é›†ä¸¤è¾¹æ‰‹æŽŒçš„æ—¶å€™æ‰ç”¨çš„åˆ°ä¸‹é¢çš„é€»è¾‘
                            if (templatePalmDataArray.length != 0){
                                layer.open({
                                    title: 'Prompt',
                                    content: 'Only Can Register One Palm',
                                    btn: ['OK'],
                                });
                                $("#submitPalmButtonId").attr("disabled", false);
                            }else {
                              beginPalmRegister();
                            }
                        }
                    }
                }
                else{
                    context.fillStyle = bgColor;
                    context.fill();
                    //renderInit(context, i, "html5");
                    if(collectFlag)
                    {
                        if(palmIdNum == i && !isInPalmArea)
                        {
                            context.fillStyle = "yellow";
                            context.fill();
                        }
                    }
                }
        }
    }
}
/**
 * @param context
 * @param x
 * @param y
 * @param color
 */
function drawPALM(context, color) {
    if(palmList.length > 0){
        palmList = new Array();
    }
    var coordArray = new Array();
	//åˆå§‹åŒ–èµ·å§‹åæ ‡,å¹¶è¿”å›žjsonæ ¼å¼æ•°æ®
	var coordJson = initPalmCoordJson();
    for(var i=0;i < coordJson.length; i++){
        drawPalms(context, coordArray, color, coordJson[i].coord.x, coordJson[i].coord.y, i);
        coordArray = null;
        coordArray = new Array();
    }
    //æ£€æŸ¥æŽŒçº¹é‡‡é›†å™¨
	checkPalmReader(context, "html5");
    //è¿›åº¦æ¡
    drawPalmProgressBar(context, 0);
    //å°†ç¡®å®šæŒ‰é’®ç½®ç°
	$("#submitPalmButtonId").attr("disabled", true);
}
/**
 * æ ¹æ®åŽå°ä¼ è¿‡æ¥çš„å‚æ•°åˆå§‹åŒ–æŽŒçº¹ç™»è®°ç›¸å…³å‚æ•°ï¼Œ ç›®å‰åªæœ‰ä¸€ä¸ªæŽŒçº¹æ‰€ä»¥è¿™ä¸ªå‚æ•°å…¶å®žæ²¡æœ‰ä½œç”¨
 */
function palmParamInit(){

    var PalmIdDb = $("#id_palms").val(); //æ•°æ®åº“æŽŒçº¹ID
    if($.trim(PalmIdDb) != ""){
        palmIdDBArray = PalmIdDb.split(",");
        //console.log('æ•°æ®åº“ä¸­çš„æŽŒçº¹id',palmIdDBArray)
    }
}
function palmPageInit(){
    palmParamInit();
    var canvas = document.getElementById("canvasPalm");
	var context = getCanvasContext(canvas);
    palmIdNum = null;
	//èŽ·å–é¡µé¢çš„æŽŒçº¹æ•°æ®
    //console.log('èŽ·å–é¡µé¢çš„æŽŒçº¹æ•°æ®')
	getPalmFromPage();
	//ç»˜ç”»
	drawPALM(context, palmBorderColor);
    //jqueryåœ¨ieä¸‹å®žçŽ°corsè·¨åŸŸè¯·æ±‚
	jQuery.support.cors = true;
    canvas.onmousedown = function(event){
        var event = event || window.event; //å…¼å®¹IE IEæ²¡æœ‰event,æœ‰window.event
		if(event.which && event.which == 1)
		{
			var pageInfo = canvas.getBoundingClientRect();
			var x = event.clientX - pageInfo.left;
			var y = event.clientY - pageInfo.top;
			//é‡ç”»
            //console.log('é‡ç”»',x,y)
			redrawPalm(x, y);
		}else if(event.button && event.button == 1 ){
            var pageInfo = canvas.getBoundingClientRect();
			var x = event.clientX - pageInfo.left;
			var y = event.clientY - pageInfo.top;
			redrawPalm(x, y);
        }
	}
}
$.fn.layerDialog = function(opt){
		var dialog_content = $(this).html();
		var default_options = {
			type: 1
      ,area: ['auto', 'auto']
      ,title: ""
      ,content: dialog_content
			,maxmin: false
      ,closeBtn: 1
      ,shadeClose: true
			,zIndex: 1003
		};
		var options = opt || {};
		$.extend(default_options, options);
		top.layer.open(default_options);
};
/**
 * æ˜¾ç¤ºæŽŒçº¹ç™»è®°é¡µé¢
 */
function showPalmRegister() {
    var template = document.createElement('div');
    var canvas = document.createElement('canvas');
    $(canvas).attr('id', 'canvasPalm');
    $(canvas).attr('style', 'background:rgb(243, 245,240)');
    canvas.height=450;
    canvas.width=550;
    $(template).append(canvas);
    var buttons = ''
        + '<div style="position: absolute; left: 375px; top: 90px; width: 140px; height: 160px; diaplay: block;">'
        +'<img src="/GIF.jpg">'
        + '</div>'
        // + '<div style="position: absolute; left: 375px; top: 270px; width: 140px; height: 160px; diaplay: block;font-size:1px">'
        // +'      '+gettextEmpPalm("please.place.your.hand.parallel.to.the.scanner.10cm.away.from.the.scanner.")
        // + '</div>'
        +'<div style="position: absolute; left: 410px; top: 340px; width: 70px; height: 28px; diaplay: block;">'
        +'  <button style="background-color: #7AC142; color: white; border: none; width: 100%; height: 100%;" type="button" id="submitPalmButtonId" class="enroll-button" name="makeSureName" onclick="submitPalmEvent();">'
        +'      '+gettextEmpPalm('btn.confirm')
        +'  </button>'
        +'</div>'
        +'<div style="position: absolute; left: 410px; top: 380px; width: 70px; height: 28px; diaplay: block;">'
        +'  <button style="background-color: #7AC142; color: white; border: none; width: 100%; height: 100%;" type="button" id="closePalmButton" class="enroll-button" name="closePalmButton" onclick="cancelPalmEvent()">'
        +'      '+gettextEmpPalm('btn.cancel')
        +'  </button>'
        +'</div>';
    $(template).append(buttons);
    var options = {
        title: gettextEmpPalm("palmRegister.palm.register"),
        skin: 'option_dialog',
        resize: false,
        success: function(layero, index){
            layerIndex = index;
            if(collectFlag){
                cancelPalmRegister();
                clearTimeout(timer);//å°†å®šæ—¶å™¨çš„é€’å½’è°ƒç”¨å…³é—­
            }
        }
    };
    $(template).layerDialog(options);
}
/**
 * ç¡®å®šæŒ‰é’®
 */
function submitPalmEvent()
{
	savePalmData(true);
	endPalmRegister();
}

function cancelPalmEvent()
{
	if(!palmModifyFlag)
	{
		if(collectFlag)
		{
			//å–æ¶ˆé‡‡é›†
			cancelPalmRegister();
			//å°†å®šæ—¶å™¨çš„é€’å½’è°ƒç”¨å…³é—­
			clearTimeout(timer);
		}
		closeWindow();
	}
	else
	{
        savePalmData(false);
	}
	endPalmRegister();
}
function showPALMRegister(){
    canPalmConnection = true;
}
/**
 * æŽŒçº¹ç™»è®°
 */
function submitPalmRegister() {
    var index = layer.load(4);
    if(!canPalmConnection){
        var msg = gettextEmpPalm('please_install_driver_or_start_service') + '<br /><a href="/files/help/ZKBioOnline.exe" style="color:red;">Download Driver</a>'

        layer.msg(msg, {
            icon: 5,
            time: 0,
            closeBtn: 2,
            title: gettextEmpPalm('pop_window_title')
        });

        layer.close(index);
        return false;
    }
    showPalmRegister();
    palmPageInit();
    layer.close(index);
}
$(function(){
    // $("#id_palm_help a").attr("href", "/data/system/help/?p=/file/"+$("#id_lng").val()+"/help/fingerprintDriverInstall.html");
    $("#id_palm_help a").attr("href", "files/help/fingerprintDriverInstall.html");
    checkPalmDriver(false);
});


function gettextEmpPalm(key) {
    const translations = {
        // UI & General
        'btn.confirm': 'Confirm',
        'btn.cancel': 'Cancel',
        'palmRegister.palm.register': 'Palm Registration',
        'please_install_driver_or_start_service': 'Please install driver or start service',
        'pop_window_title': 'System Notice',
        'palm.prompt': 'Palm Prompt',
        'are.you.sure.you.want.to.delete...?': 'Are you sure you want to delete?',
        'Ã¥Â½â€œÃ¥â€°ÂÃ¦ÂµÂÃ¨Â§Ë†Ã¥â„¢Â¨Ã¤Â¸ÂÃ¦â€Â¯Ã¦Å’ÂÃ¨Â¯Â¥Ã¥Å Å¸Ã¨Æ’Â½,Ã¨Â¯Â·Ã¥Ââ€¡Ã§ÂºÂ§Ã¦Ë†â€“Ã¦â€ºÂ´Ã¦ÂÂ¢Ã¦ÂµÂÃ¨Â§Ë†Ã¥â„¢Â¨.': 
            'Current browser does not support this feature, please upgrade or change browser.',

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