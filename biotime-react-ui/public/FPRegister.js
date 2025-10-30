
class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
/**
 * Finger Renderer
 */
class FingerRender {
    /**
     * Construct an instance
     * @author Quinn
     * @param context 2d canvas context
     * @param pointArray Coordinate point array
     */
    constructor(context, pointArray) {
        this.context = context;
        this.pointArray = pointArray;
        this.isClick = false;
    }
    /**
     * Draw the fingers
     * @author Quinn
     * @param renderFlag Rendering flag "stroke": drawing edge; "fill": filling
     * @param color Render color
     */
    drawFinger(renderFlag, color) {
        if (renderFlag === "stroke") {
            this.context.strokeStyle = color;
        } else if (renderFlag === "fill") {
            this.context.fillStyle = color;
        }
        this.context.lineWidth = 1;
        this.context.beginPath();
        for (let i = 0; i < this.pointArray.length; i++) {
            if (i === 0) {
                this.context.moveTo(this.pointArray[0].x, this.pointArray[0].y);
            } else {
                this.context.lineTo(this.pointArray[i].x, this.pointArray[i].y);
            }
        }
        if (renderFlag === "stroke") {
            this.context.stroke();
        } else if (renderFlag === "fill") {
            this.context.fill();
        }
    };
}
/**
 * Palm Renderer
 */
class HandRender {
    /**
     * Construct an instance
     * @author Quinn
     * @param context Canvas Context
     * @param pointArray Coordinate point array
     */
    constructor(context, pointArray) {
        this.context = context;
        this.pointArray = pointArray;
        this.isClick = false;
    }
    /**
     * Draw the palm
     * @author Quinn
     * @param color Render Color
     */
    drawHand(color) {
        this.context.strokeStyle = color;
        this.context.lineWidth = 1;
        this.context.beginPath();
        for (let i = 0; i < this.pointArray.length; i++) {
            if (i === 0) {
                this.context.moveTo(this.pointArray[0].x, this.pointArray[0].y);
            } else {
                this.context.lineTo(this.pointArray[i].x, this.pointArray[i].y);
            }
        }
        this.context.stroke();
    };
}
/**
 * Arc Drawer
 */
class ArcDrawer {
    /**
     * Construct an instance
     * @author Quinn
     * @param context Canvas Context
     * @param pointArray Coordinate point
     */
    constructor(context, pointArray) {
        this.context = context;
        this.pointArray = pointArray;
    }
    /**
     * draw
     * @author Quinn
     * @param color color
     */
    draw(color) {
        this.context.fillStyle = color;
        this.context.beginPath();
        for (let i = 0; i < this.pointArray.length; i++) {
            if (i === 0) {
                this.context.moveTo(this.pointArray[0].x, this.pointArray[0].y);
            } else {
                this.context.lineTo(this.pointArray[i].x, this.pointArray[i].y);
            }
        }
        //this.context.stroke();
        this.context.fill();
    };
}
/**
 * Drawing a progress bar
 * @author Quinn
 * @param context Canvas Context
 * @param collCount Progress 0-3
 * @param color background color
 */
function drawProgressBar(context, collCount, color) {
    let x = 300;
    let y = 60;
    let width = 40;
    let height = 20;
    context.fillStyle = color;
    context.fillRect(x, y, 122, height);
    if (collCount === 0) {
        context.fillStyle = "rgb(175,181,185)";
        context.fillRect(x + 2, y + 2, width - 2, height - 4);
        context.fillRect(x + 42, y + 2, width - 2, height - 4);
        context.fillRect(x + 82, y + 2, width - 2, height - 4);
    } else if (collCount === 1) {
        context.fillStyle = "rgb(122,193,66)";
        context.fillRect(x + 2, y + 2, width - 2, height - 4);
        context.fillStyle = "rgb(175,181,185)";
        context.fillRect(x + 42, y + 2, width - 2, height - 4);
        context.fillRect(x + 82, y + 2, width - 2, height - 4);
    } else if (collCount === 2) {
        context.fillStyle = "rgb(122,193,66)";
        context.fillRect(x + 2, y + 2, width - 2, height - 4);
        context.fillRect(x + 42, y + 2, width - 2, height - 4);
        context.fillStyle = "rgb(175,181,185)";
        context.fillRect(x + 82, y + 2, width - 2, height - 4);
    } else if (collCount === 3) {
        context.fillStyle = "rgb(122,193,66)";
        context.fillRect(x + 2, y + 2, width - 2, height - 4);
        context.fillRect(x + 42, y + 2, width - 2, height - 4);
        context.fillRect(x + 82, y + 2, width - 2, height - 4);
    }
}
/**
 * Override the layer dialog box
 */
function overrideLayerDialog() {
    $.fn.layerDialog = function (opt) {
        let dialog_content = $(this).html();
        let default_options = {
            type: 1
            , area: ['auto', 'auto']
            , title: ""
            , content: dialog_content
            , maxmin: false
            , closeBtn: 1
            , shadeClose: true
            , zIndex: 1003
        };
        let options = opt || {};
        $.extend(default_options, options);
        top.layer.open(default_options);
    };
}
class Template {
    version = "10";
    template = "";
    length = 0;
    no = 0;
    constructor() {
    }
}
/**
 * Fingerprint reader driver
 */
class FPDriver {
    // Driver access address
    ISSOnlineUrl = "https://localhost:24308/ISSOnline";//"http://localhost:24008/ISSOnline";
    // Browser identifier
    browserFlag = getBrowserType() || "";
    // Request URL
    url = null;
    // Synchronous or asynchronous
    async = null;
    // Callback for handling response
    dealResult = function (data) {
    };
    constructor() {
        if (window.location.protocol === 'https:') {
            this.ISSOnlineUrl = "https://localhost:24308/ISSOnline";
        }
        else {
            this.ISSOnlineUrl = "http://localhost:24008/ISSOnline";
        }
    }
    /**
     * Execute callback to handle returned data
     * @param result
     */
    dealFPDriverResponse(result) {
        this.dealResult(result);
    }
    /**
     * Use AJAX to access URL
     * @author Quinn
     * @param url
     * @param async Whether asynchronous
     */

    ajaxAccess(url, async) {
        let result = null;
        let parent = this;
        let xhr = getXMLRequest();
        xhr.open("GET", this.ISSOnlineUrl + url, async);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) { //Request completed
                if (xhr.status === 200) {
                    let resultData = xhr.responseText;
                    resultData = resultData.replace(/\\/g, "/");
                    result = JSON.parse(resultData);
                    parent.dealFPDriverResponse(result);
                } else {
                }
            }
        }
        xhr.onerror = function (res) {
        }
        xhr.send();
    }

    /**
     * Compatible with IE8, IE9 to access URL
     */
    xDomainAccess(url, async) {
        let parent = this;
        let xDomainRequest = new XDomainRequest();
        if (xDomainRequest) {
            xDomainRequest.timeout = 10000;
            xDomainRequest.open('GET', this.ISSOnlineUrl + url, async);
            xDomainRequest.onload = function () {
                var resultData = xDomainRequest.responseText;
                resultData = resultData.replace(/\\/g, "/");
                var obj = JSON.parse(resultData);
                parent.dealFPDriverResponse(obj);
            };
            xDomainRequest.onerror = function () {
                // Set object to null after use
                xDomainRequest = null;
            };
            xDomainRequest.ontimeout = function () {
                // Set object to null after use
                xDomainRequest = null;
            };
            xDomainRequest.send();
        }
    }
    accessDriver() {
        if (this.browserFlag === "html5") {
            try {
                this.ajaxAccess(this.url, this.async);
            } catch (e) {
            }
        } else if (this.browserFlag === "simple") {
            try {
                this.xDomainAccess(this.url, this.async);
            } catch (e) {
            }
        } else {
            if (window.console) {
                console.error("browserFlag is missing");
            }
        }
    }
    initSetting(setting) {
        this.url = setting.url;
        this.async = setting.async;
        this.dealResult = setting.callback;
    }
    /**
     * Execute request
     * @author Quinn
     * @param setting Request configuration
     */
    static execute(setting) {
        let driver = new FPDriver();
        driver.initSetting(setting);
        driver.accessDriver();
    }
    /**
     * Start capturing image
     * @author Quinn
     * @param fpAlgs all: all versions; 10.0|12.0: specific version
     * @param callback Callback handler
     */
    static beginCapture(fpAlgs, callback) {
        let setting = {};
        setting.url = "/beginCaptureExt?type=1&fpAlgs=" + fpAlgs;
        setting.async = true;
        setting.callback = callback;
        this.execute(setting);
    }
    /**
     * Cancel image capture
     * @author Quinn
     */
    static cancelCapture(callback) {
        let setting = {};
        setting.url = "/cancelCaptureExt";
        setting.async = false;
        setting.callback = callback;
        this.execute(setting);
    }
    /**
     * Get supported fingerprint algorithm versions
     * @author Quinn
     * @param callback Callback handler
     */
    static getFPAlgs(callback) {
        let setting = {};
        setting.url = "/getFPAlgs";
        setting.async = true;
        setting.callback = callback;
        this.execute(setting);
    }
    static info(callback) {
        let setting = {};
        setting.url = "/info";
        setting.async = true;
        setting.callback = callback;
        this.execute(setting);
    }
    /**
     * Get fingerprint image
     * @author Quinn
     * @param callback Callback handler
     */
    static getImageExt(callback) {
        let setting = {};
        setting.url = "/getImageExt";
        setting.async = false;
        setting.callback = callback;
        this.execute(setting);
    }
    /**
     * Get fingerprint template
     * @author Quinn
     * @param callback Callback handler
     */
    static getTemplateExt(callback) {
        let setting = {};
        setting.url = "/getTemplateExt";
        setting.async = false;
        setting.callback = callback;
        this.execute(setting);
    }
}
/**
 * Fingerprint registration window
 */

class FPRegister {
    /** canvas drawing ----start---- */
    /**canvas element id*/
    elementId = "canvas";
    //canvas
    pubContext = null;
    // Page background color
    bgColor = "rgb(243, 245,240)";
    // Drawing graphic border style -- edge drawing
    strokeStyle = "stroke";
    // Border color for drawing finger
    fingerBorderColor = "rgb(71,75,79)";
    // Clicked finger color
    fillFingerColor = "rgb(71,75,79)";
    // Array storing finger drawing functions
    fingerList = [];
    // Currently selected finger
    currentFPNum = null;
    // Save the finger mark currently being collected - used during deletion to remove the current collection color
    lastFPIdNum = null;
    // Horizontal coordinate of the starting point for drawing hands
    x = 28;
    // Vertical coordinate of the starting point for drawing hands
    y = 346;
    /**
     * Initialize the starting coordinates for drawing fingers, palms, and arcs, and format them as JSON
     * @author wenxin
     * @create 2013-06-15 15:40:31 pm
     */
    initCoordJson() {
        let x = this.x;
        let y = this.y;
        let coordJson = [{ "num": 0, "coord": { "x": x + 77, "y": y + 18 } },
        { "num": 1, "coord": { "x": x + 67, "y": y - 26 } },
        { "num": 2, "coord": { "x": x + 47, "y": y - 34 } },
        { "num": 3, "coord": { "x": x + 25, "y": y - 37 } },
        { "num": 4, "coord": { "x": x + 3, "y": y - 37 } },
        { "num": 5, "coord": { "x": x + 153, "y": y + 34 } },
        { "num": 6, "coord": { "x": x + 159, "y": y - 19 } },
        { "num": 7, "coord": { "x": x + 177, "y": y - 30 } },
        { "num": 8, "coord": { "x": x + 198, "y": y - 36 } },
        { "num": 9, "coord": { "x": x + 220, "y": y - 36 } },
        { "num": 10, "coord": { "x": x, "y": y } },
        { "num": 11, "coord": { "x": x + 170, "y": y + 12 } },
        { "num": 12, "coord": { "x": x + 210, "y": y - 346 } }];
        return coordJson;
    }
    /**
     * Put the drawing coordinate points into an array
     * @author wenxin
     * @create 2013-05-31 18:01:33 pm
     * @param coordArray Array to store coordinates, passed in and returned
     * @param x, y Starting coordinates for drawing finger
     * @param num Finger and palm numbers 0-9: finger number; 10: left palm, 11: right palm, 12: arc.
     */
    initCoordArray(coordArray, x, y, num) {
        let Coord = Coordinate;
        if (num === 0) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x + 30, y - 18);
            coordArray[2] = new Coord(x + 34, y - 17);
            coordArray[3] = new Coord(x + 37, y - 14);
            coordArray[4] = new Coord(x + 39, y - 11);
            coordArray[5] = new Coord(x + 39, y - 8);
            coordArray[6] = new Coord(x + 38, y - 6);
            coordArray[7] = new Coord(x + 12, y + 15);
            coordArray[8] = new Coord(x + 8, y + 17);
            coordArray[9] = new Coord(x + 2, y + 14);
            coordArray[10] = new Coord(x - 2, y + 8);
            coordArray[11] = new Coord(x, y);
        } else if (num === 1) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x + 19, y - 37);
            coordArray[2] = new Coord(x + 21, y - 39);
            coordArray[3] = new Coord(x + 28, y - 39);
            coordArray[4] = new Coord(x + 32, y - 36);
            coordArray[5] = new Coord(x + 33, y - 31);
            coordArray[6] = new Coord(x + 17, y + 6);
            coordArray[7] = new Coord(x + 12, y + 10);
            coordArray[8] = new Coord(x + 6, y + 10);
            coordArray[9] = new Coord(x + 1, y + 6);
            coordArray[10] = new Coord(x, y);
        } else if (num === 2) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x + 14, y - 54);
            coordArray[2] = new Coord(x + 16, y - 57);
            coordArray[3] = new Coord(x + 23, y - 58);
            coordArray[4] = new Coord(x + 28, y - 55);
            coordArray[5] = new Coord(x + 29, y - 50);
            coordArray[6] = new Coord(x + 17, y + 4);
            coordArray[7] = new Coord(x + 13, y + 8);
            coordArray[8] = new Coord(x + 6, y + 9);
            coordArray[9] = new Coord(x + 1, y + 5);
            coordArray[10] = new Coord(x, y);
        } else if (num === 3) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x + 8, y - 50);
            coordArray[2] = new Coord(x + 12, y - 54);
            coordArray[3] = new Coord(x + 19, y - 55);
            coordArray[4] = new Coord(x + 22, y - 53);
            coordArray[5] = new Coord(x + 24, y - 49);
            coordArray[6] = new Coord(x + 18, y + 1);
            coordArray[7] = new Coord(x + 15, y + 6);
            coordArray[8] = new Coord(x + 8, y + 7);
            coordArray[9] = new Coord(x + 3, y + 4);
            coordArray[10] = new Coord(x, y);
        } else if (num === 4) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x + 2, y - 35);
            coordArray[2] = new Coord(x + 5, y - 40);
            coordArray[3] = new Coord(x + 11, y - 42);
            coordArray[4] = new Coord(x + 16, y - 40);
            coordArray[5] = new Coord(x + 18, y - 35);
            coordArray[6] = new Coord(x + 18, y + 1);
            coordArray[7] = new Coord(x + 15, y + 5);
            coordArray[8] = new Coord(x + 9, y + 7);
            coordArray[9] = new Coord(x + 3, y + 5);
            coordArray[10] = new Coord(x, y);
        } else if (num === 5) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x - 26, y - 21);
            coordArray[2] = new Coord(x - 27, y - 24);
            coordArray[3] = new Coord(x - 26, y - 30);
            coordArray[4] = new Coord(x - 21, y - 34);
            coordArray[5] = new Coord(x - 16, y - 34);
            coordArray[6] = new Coord(x + 12, y - 18);
            coordArray[7] = new Coord(x + 15, y - 10);
            coordArray[8] = new Coord(x + 13, y - 3);
            coordArray[9] = new Coord(x + 7, y + 1);
            coordArray[10] = new Coord(x, y);
        } else if (num === 6) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x - 17, y - 46);
            coordArray[2] = new Coord(x - 17, y - 50);
            coordArray[3] = new Coord(x - 13, y - 56);
            coordArray[4] = new Coord(x - 6, y - 56);
            coordArray[5] = new Coord(x - 3, y - 54);
            coordArray[6] = new Coord(x + 15, y - 11);
            coordArray[7] = new Coord(x + 15, y - 4);
            coordArray[8] = new Coord(x + 11, y + 2);
            coordArray[9] = new Coord(x + 4, y + 2);
            coordArray[10] = new Coord(x, y);
        } else if (num === 7) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x - 12, y - 54);
            coordArray[2] = new Coord(x - 10, y - 58);
            coordArray[3] = new Coord(x - 5, y - 62);
            coordArray[4] = new Coord(x + 1, y - 61);
            coordArray[5] = new Coord(x + 4, y - 58);
            coordArray[6] = new Coord(x + 18, y - 4);
            coordArray[7] = new Coord(x + 16, y + 1);
            coordArray[8] = new Coord(x + 11, y + 5);
            coordArray[9] = new Coord(x + 5, y + 4);
            coordArray[10] = new Coord(x, y);
        } else if (num === 8) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x - 5, y - 54);
            coordArray[2] = new Coord(x - 2, y - 58);
            coordArray[3] = new Coord(x + 3, y - 62);
            coordArray[4] = new Coord(x + 9, y - 61);
            coordArray[5] = new Coord(x + 11, y - 58);
            coordArray[6] = new Coord(x + 18, y - 4);
            coordArray[7] = new Coord(x + 16, y + 1);
            coordArray[8] = new Coord(x + 11, y + 5);
            coordArray[9] = new Coord(x + 5, y + 4);
            coordArray[10] = new Coord(x, y);
        } else if (num === 9) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x, y - 37);
            coordArray[2] = new Coord(x + 3, y - 41);
            coordArray[3] = new Coord(x + 7, y - 43);
            coordArray[4] = new Coord(x + 13, y - 41);
            coordArray[5] = new Coord(x + 15, y - 37);
            coordArray[6] = new Coord(x + 17, y + 1);
            coordArray[7] = new Coord(x + 15, y + 3);
            coordArray[8] = new Coord(x + 10, y + 6);
            coordArray[9] = new Coord(x + 3, y + 4);
            coordArray[10] = new Coord(x, y);
        } else if (num === 10) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x + 2, y - 8);
            coordArray[2] = new Coord(x + 6, y - 16);
            coordArray[3] = new Coord(x + 13, y - 23);
            coordArray[4] = new Coord(x + 27, y - 27);
            coordArray[5] = new Coord(x + 37, y - 25);
            coordArray[6] = new Coord(x + 43, y - 23);
            coordArray[7] = new Coord(x + 64, y - 16);
            coordArray[8] = new Coord(x + 69, y - 11);
            coordArray[9] = new Coord(x + 73, y - 3);
            coordArray[10] = new Coord(x + 73, y + 10);
            coordArray[11] = new Coord(x + 71, y + 18);
            coordArray[12] = new Coord(x + 57, y + 40);
            coordArray[13] = new Coord(x + 50, y + 46);
            coordArray[14] = new Coord(x + 41, y + 49);
            coordArray[15] = new Coord(x + 34, y + 49);
            coordArray[16] = new Coord(x + 14, y + 43);
            coordArray[17] = new Coord(x + 10, y + 41);
            coordArray[18] = new Coord(x + 6, y + 36);
            coordArray[19] = new Coord(x + 2, y + 29);
            coordArray[20] = new Coord(x, y);
        } else if (num === 11) {
            coordArray[0] = new Coord(x, y);
            coordArray[1] = new Coord(x - 2, y - 10);
            coordArray[2] = new Coord(x + 1, y - 20);
            coordArray[3] = new Coord(x + 14, y - 31);
            coordArray[4] = new Coord(x + 47, y - 39);
            coordArray[5] = new Coord(x + 55, y - 38);
            coordArray[6] = new Coord(x + 61, y - 34);
            coordArray[7] = new Coord(x + 68, y - 26);
            coordArray[8] = new Coord(x + 72, y - 16);
            coordArray[9] = new Coord(x + 72, y + 13);
            coordArray[10] = new Coord(x + 68, y + 22);
            coordArray[11] = new Coord(x + 62, y + 29);
            coordArray[12] = new Coord(x + 60, y + 30);
            coordArray[13] = new Coord(x + 39, y + 36);
            coordArray[14] = new Coord(x + 34, y + 36);
            coordArray[15] = new Coord(x + 20, y + 33);
            coordArray[16] = new Coord(x + 16, y + 29);
            coordArray[17] = new Coord(x, y);
        } else if (num === 12) {
            coordArray[0] = new Coord(x - 10, y);
            coordArray[1] = new Coord(x + 212, y);
            coordArray[2] = new Coord(x + 212, y + 129);
            coordArray[3] = new Coord(x + 201, y + 130);
            coordArray[4] = new Coord(x + 191, y + 131);
            coordArray[5] = new Coord(x + 174, y + 131);
            coordArray[6] = new Coord(x + 159, y + 129);
            coordArray[7] = new Coord(x + 142, y + 127);
            coordArray[8] = new Coord(x + 133, y + 125);
            coordArray[9] = new Coord(x + 114, y + 120);
            coordArray[10] = new Coord(x + 97, y + 113);
            coordArray[11] = new Coord(x + 86, y + 108);
            coordArray[12] = new Coord(x + 72, y + 100);
            coordArray[13] = new Coord(x + 52, y + 87);
            coordArray[14] = new Coord(x + 40, y + 76);
            coordArray[15] = new Coord(x + 29, y + 64);
            coordArray[16] = new Coord(x + 16, y + 48);
            coordArray[17] = new Coord(x + 5, y + 30);
            coordArray[18] = new Coord(x - 10, y);
        }
        return coordArray;
    }
    /**
     * Render fingers on page load and repaint
     * @author Quinn
     * @param context Canvas Context
     * @param num Current rendering finger number
     * @param browserFlag Browser tag simple: simple version, indicating IE browser; html5: indicates a browser that supports html5
     */
    renderInit(context, num, browserFlag) {
        if (num < 0 || num >= 10 || this.fpTypeArray.length != 10) {
            return;
        }
        if (this.isContains(num)) {
            let f = this.fpTypeArray[num];
            if (f === 0) {
                if (browserFlag === "html5") {
                    context.fillStyle = "rgb(122,193,66)";
                    context.fill();
                }
            } else {
                if (browserFlag === "html5") {
                    context.fillStyle = "red";
                    context.fill();
                }
            }
        }
    }
    /**
     * Drawing fingerprint image
     * @author Quinn
     * @param context Canvas Context
     * @param base64FPImg
     * @param browserFlag html5 verification clearForVerify clearForRegister  simple verifySimple clearForSimple
     */
    drawImage(context, base64FPImg, browserFlag) {
        let imgSrc = "data:image/jpg;base64," + base64FPImg;
        let img;
        if (browserFlag === "html5") {
            img = new Image();
            img.src = "";
            img.src = imgSrc;
            img.onload = function () {
                // Save the current drawing state
                context.save();
                // Start creating a path
                context.beginPath();
                // Draw an ellipse
                context.oval(125, 142, 112, 145);
                // Close Path
                context.closePath();
                // Clipping Path
                context.clip();
                //Draw the image onto the canvas
                context.drawImage(img, 70, 70, 112, 145);
                //The last saved state will be restored by calling restore
                context.restore();
            }
        } else if (browserFlag === "verification") {
            img = new Image();
            img.src = "";
            img.src = imgSrc;
            img.onload = function () {
                // Calling restore will restore the last saved state and save the current drawing state.
                context.save();
                // Start creating a path
                context.beginPath();
                // Draw an ellipse
                context.oval(92, 159, 100, 128);
                // Close Path
                context.closePath();
                // Close path clipping path
                context.clip();
                //Draw the image onto the canvas
                context.drawImage(img, 37, 90, 112, 145);
                //The last saved state will be restored by calling restore
                context.restore();
            }
        } else if (browserFlag === "clearForVerify" || browserFlag === "clearForRegister") {
            if (context == null) {
                return;
            }
            img = new Image();
            img.src = "";
            img.src = base64FPImg;
            img.onload = function () {
                // Save the current drawing state
                context.save();
                // Start creating a path
                context.beginPath();
                // Draw an ellipse
                if (browserFlag === "clearForVerify") {
                    context.oval(91, 160, 112, 145);
                } else if (browserFlag === "clearForRegister") {
                    context.oval(125, 142, 132, 165);
                }
                // Close Path
                context.closePath();
                // Clipping Path
                context.clip();
                //Draw the image onto the canvas
                if (browserFlag === "clearForVerify") {
                    context.drawImage(img, 12, 54, 160, 213);
                } else if (browserFlag === "clearForRegister") {
                    context.drawImage(img, 60, 60, 132, 165);
                }
                //The last saved state will be restored by calling restore
                context.restore();
            }
        } else {
            if (browserFlag === "simple") {
                $("#showFPImageDiv").html("<img src=" + imgSrc + " width='112' height='145' />");
            } else if (browserFlag === "verifySimple") {
                $("#showSeachingDiv").show();
            } else if (browserFlag === "clearForSimple") {
                $("#showFPImageDiv").html("");
            }
        }
    }
    /**
     * Draw fingers and palms
     * @author Quinn
     * @param context Canvas Context
     * @param coordArray Coordinate point array
     * @param color color
     * @param x Starting coordinate x
     * @param y Starting coordinate y
     * @param num Numbers 0-9 fingers 10-11 palm
     */
    drawFingerAndHand(context, coordArray, color, x, y, num) {
        coordArray = this.initCoordArray(coordArray, x, y, num);
        let drawObj = null;
        if (num < 10) {// finger
            //drawObj = "finger" + num;
            drawObj = new FingerRender(context, coordArray);
            drawObj.drawFinger(this.strokeStyle, color)
            this.renderInit(context, num, "html5");
            // Store the drawn finger instance in array for redrawing
            this.fingerList.push(drawObj);
        } else if (num < 12) {// 10  11  palm
            new HandRender(context, coordArray).drawHand(color);
        }
        this.drawImage(context, "/base_fpVerify_clearImage.png", "clearForRegister");
    }
    /**
     * Draw finger
     * @param context Canvas context
     * @param coordArray Coordinate array
     * @param x
     * @param y
     * @param num Finger number
     */
    DrawFinger(context, coordArray, x, y, num) {
        if (num >= 0) {
            coordArray = this.initCoordArray(coordArray, x, y, num);
            if (num < this.fingerList.length) {
                this.fingerList[num].drawFinger(this.strokeStyle, this.fingerBorderColor);
            } else {
                new FingerRender(context, coordArray).drawFinger(this.strokeStyle, this.fingerBorderColor);
            }
        }
    }
    /**
     * Render after capture
     * @author Quinn
     * @param context Canvas context
     * @param num Finger number
     * @param fillColor Fill color
     * @param successOrNot Whether capture was successful
     */
    renderAfterColl(context, num, fillColor, successOrNot) {
        let canvas = document.getElementById(this.elementId);
        let localContext = getCanvasContext(canvas);
        // Initialize starting coordinates and return JSON format data
        let coordJson = this.initCoordJson();
        // When entering page, click delete
        if (num == null) {
            num = this.currentFPNum;
        }
        // Clicked finger number matches num in JSON
        if (coordJson[num].num === num) {
            // Initialize coordinate array and draw finger
            this.DrawFinger(context, new Array(), coordJson[num].coord.x, coordJson[num].coord.y, num)
        }
        // Capture successful, fill color (red, green)
        if (successOrNot) {
            if (this.duressFingerFlag) {
                localContext.fillStyle = "red";//fillColor
                localContext.fill();
            } else {
                localContext.fillStyle = "rgb(122,193,66)";//fillColor
                localContext.fill();
            }
        } else {
            // Capture failed, fill background color -- remove color (yellow)
            localContext.fillStyle = fillColor;
            localContext.fill();
        }
    }
    /**
     * Auto word break for text
     * @author Quinn
     * @param context Canvas context
     * @param text Display message content
     * @param CWidth Canvas width
     * @param x Text X coordinate
     */
    autoWordBreak(context, text, CWidth, x) {
        context.clear();
        let rownum = CWidth / 10;
        let len = text.length;
        if (rownum > len) {
            context.fillText(text, x, 30);
        } else {
            let endInd = rownum < text.length ? rownum : text.length;
            let beginInd = 0;
            let endTemp = 0;
            for (let i = 0; i <= text.length / rownum; i++) {
                endTemp = text.substr(beginInd, endInd).lastIndexOf(" ");
                if (endTemp != -1) {
                    endInd = beginInd + endTemp;
                }
                context.fillText(text.substr(beginInd, endInd), x, (i + 1) * 30);
                beginInd = endInd + 1;
                if (beginInd >= text.length) {
                    break;
                }
                endInd = beginInd + rownum;
            }
        }
    }
    /**
     * Info box -- display collection count, success/failure, etc.
     * @author Quinn
     * @param context Canvas context
     * @param text Display message content
     * @param browserFlag Browser flag or verification flag simple: simple version, IE browser; html5: supports html5 browser; verification: fingerprint verification flag
     */
    collectTips(context, text, browserFlag) {
        if (browserFlag === "html5") {
            context.fillStyle = this.bgColor;
            context.fillRect(140, 18, 300, 16);
            // Right-align text
            context.fillStyle = "rgb(122,193,66)";
            context.font = "13px Times New Roman";
            //context.shadowColor = 'white';
            //context.shadowBlur = 10;
            //context.strokeText(text, 230, 30);
            context.textAlign = "end";
            context.fillText(text, 420, 30);
        } else if (browserFlag === "verification") {
            context.fillStyle = "#F3F5F0";//#6BA5D7
            context.fillRect(2, 8, 600, 30);
            // Returns a text metrics object
            let metrics = context.measureText(text);
            // Text width
            let textWidth = metrics.width;
            let canvas = document.getElementById(this.elementId);
            // Canvas width
            let canvasWidth;
            canvas != null ? canvasWidth = canvas.width : canvasWidth = 450;
            // Starting x coordinate for text
            let x = textWidth / 2 + (canvasWidth - textWidth) / 2;
            // Right-align text
            context.fillStyle = "rgb(122,193,66)";
            context.font = "24px Times New Roman";
            context.textAlign = "center";
            // Auto line break
            this.autoWordBreak(context, text, canvasWidth, x);
            context.restore();
        }
    }
    /**
     * Draw canvas
     * @author Quinn
     * @param context Canvas context
     * @param color Line color
     */
    draw(context, color) {
        if (this.fingerList.length > 0) {
            this.fingerList = new Array();
        }
        let coordArray = new Array();
        // Initialize starting coordinates and return JSON format data
        let coordJson = this.initCoordJson();
        for (let i = 0; i < coordJson.length; i++) {
            this.drawFingerAndHand(context, coordArray, color, coordJson[i].coord.x, coordJson[i].coord.y, i);
            coordArray = null;
            coordArray = new Array();
        }
        // Check fingerprint reader
        this.checkFPReader(context);
        // Progress bar
        drawProgressBar(context, 0, this.bgColor)
        // Disable submit button
        $("#" + this.id_submit_button).attr("disabled", true);
    }
    /**
     * Redraw clicked position
     * @author Quinn
     * @param x
     * @param y
     */
    redraw(x, y) {
        let parent = this;
        let canvas = document.getElementById(this.elementId);
        let context = getCanvasContext(canvas);
        if (context) {
            let isInFingerArea = false;
            for (let i = 0; i < this.fingerList.length; i++) {
                let finger = this.fingerList[i];
                finger.drawFinger(this.strokeStyle, this.fingerBorderColor);
                if (context.isPointInPath(x, y)) {
                    isInFingerArea = true;
                    break;
                }
            }
            outerloop:
            for (let i = 0; i < this.fingerList.length; i++) {
                if (this.collectFlag) {
                    if (this.currentFPNum == i) {
                        // After switching fingers, render the finger (remove original finger color)
                        this.renderAfterColl(this.pubContext, this.currentFPNum, parent.bgColor, false);
                    }
                }
                let finger = this.fingerList[i];
                finger.drawFinger(this.strokeStyle, this.fingerBorderColor);
                if (context.isPointInPath(x, y)) {
                    this.pubContext = context;
                    // Whether two clicks are from the same finger. If yes, second click cancels collection.
                    let iaSameFinger = false;
                    if (this.currentFPNum == i && this.collectFlag) {
                        iaSameFinger = true;
                    }
                    // Determine whether the finger already has fingerprints
                    let isCollected = this.isContains(i);
                    this.currentFPNum = i;
                    if (!isCollected) {
                        this.lastFPIdNum = this.currentFPNum;
                        if (iaSameFinger) {
                            // Cancel collection
                            this.cancelCapture();
                            // After canceling, prompt to select finger again
                            this.collectTips(this.pubContext, Messages.tip1, "html5");
                            // Redraw progress bar after cancel
                            drawProgressBar(context, 0, this.bgColor);
                            this.currentFPNum = -1;
                        } else {
                            // Cancel collection
                            this.cancelCapture();
                            context.fillStyle = this.fillFingerColor;
                            context.fill();
                            this.collectFlag = true;// Need to check, color changes on repeated click
                            $("#" + this.id_duress_div).attr("disabled", true);
                            $("#" + this.id_submit_button).attr("disabled", true);
                            let text = Messages.tip3 + ":" + this.FINGERPRINT_NUMBER;
                            drawProgressBar(this.pubContext, 0, this.bgColor);
                            this.collectTips(this.pubContext, text, 'html5');
                            // Start capture
                            this.beginCapture();
                        }
                    } else {
                        this.cancelCapture();
                        layer.confirm(Messages.tip5, {
                            title: gettext("btn_confirm")
                            , btn: [gettext("btn_confirm"), gettext("btn_cancel")]
                        }, function (index) {
                            layer.close(index);
                            parent.delFPData(parent.currentFPNum, context);
                        },
                            function (index) {
                                layer.close(index);
                            }
                        );
                        break outerloop;
                    }
                } else {
                    context.fillStyle = this.bgColor;
                    context.fill();
                    this.renderInit(context, i, "html5");
                    if (this.collectFlag) {
                        if (this.currentFPNum == i && !isInFingerArea) {
                            context.fillStyle = "yellow";
                            context.fill();
                        }
                    }
                }
            }
        }
    }
    /** canvas drawing ----end---- */
    /** html elements ----start---- */
    /**
     * Whether to show duress fingerprint (not needed when user registers fingerprints)
     */
    duressFingerShowFlag = false;
    formLayerIndex = null;
    id_duress_div = "duressFingerDiv";
    id_duress_input = "duressFinger";
    id_fpVersion_div = "id_fp_version_div";
    id_fpVersion_select = "id_fp_version";
    id_submit_button = "submitButtonId";
    id_close_button = "closeButton";
    id_del_fps = "id_del_fps";
    id_dur_fps = "id_dur_fps";
    id_templates = "id_templates";
    id_fp_type = "id_fp_type";
    id_fps = "id_fps";
    /**
     * Initialize HTML controls
     * @returns {string}
     */
    initControls() {
        return ''
            + '<div id="' + this.id_fpVersion_div + '" style="position: absolute; left: 320px; top: 257px; width: 130px; height: 56px; diaplay: block;">'
            + '<p style="word-break: keep-all;color: #7AC142">' + gettext('fingerprint_version') + '</p>'
            + '<div style="position: absolute;  top: 28px; width: 70px; height: 28px; diaplay: block;">'
            + '<select lay-ignore name = "fp_version" id = "' + this.id_fpVersion_select + '">'
            + '<option value="0">All</option>'
            + '</select>'
            + '</div>'
            + '</div>'
            + '<div style="position: absolute; left: 310px; top: 325px; width: 70px; height: 28px; diaplay: block;">'
            + '  <button type="button" id="' + this.id_submit_button + '" class="enroll-button" name="makeSureName" onclick="submitEvent();">'
            + '      ' + gettext('btn_confirm')
            + '  </button>'
            + '</div>'
            + '<div style="position: absolute; left: 310px; top: 365px; width: 70px; height: 28px; diaplay: block;">'
            + '  <button type="button" id="' + this.id_close_button + '" class="enroll-button" name="closeButton" onclick="cancelEvent()">'
            + '      ' + gettext('btn_cancel')
            + '  </button>'
            + '</div>';
    }
    /**
     * Initialize components
     * @author Quinn
     * @param eleID element for drawing; default 'canvas'
     * @returns {*|jQuery}
     */
    initialize(eleID) {
        if (!eleID) {
            eleID = "canvas";
        }
        let parent = this;
        let form = document.createElement('div');
        // Drawing board
        let canvas = document.createElement('canvas');
        $(canvas).attr('id', eleID);
        $(canvas).attr('style', 'background:rgb(243, 245,240)');
        canvas.height = 450;
        canvas.width = 450;
        $(form).append(canvas);// Add canvas to window
        // Create other controls
        let controls = this.initControls();
        $(form).append(controls);
        return $(form);
    }
    /**
     * Show default fingerprint image
     * @param context
     */
    clearFPImage(context) {
        this.drawImage(context, "/base_fpVerify_clearImage.png", "clearForRegister");
    }
    /**
     * Load fingerprint version list into HTML
     * @param data
     */
    loadVersions(data) {
        if (data) {
            let ss = $("#" + this.id_fpVersion_select);
            if (ss) {
                let s = ss[0];
                s.options.length = 0;
                let o = new Option('All', 'all');
                s.options.add(o);
                if (data.fpAlgs && data.fpAlgs.length > 0) {
                    for (let i = 0; i < data.fpAlgs.length; i++) {
                        let o1 = new Option(data.fpAlgs[i], data.fpAlgs[i]);
                        s.options.add(o1);
                    }
                }
            }
        }
    }
    //modified
    loadVersions(data) {
        let ss = $("#" + this.id_fpVersion_select);
        if (ss && ss[0]) {
            let s = ss[0];
            s.options.length = 0; // Clear existing options

            // Add only version 13
            let option13 = new Option('10.0', '10.0');
            s.options.add(option13);

            // Optionally, you can set it as selected by default
            s.value = '10.0';
        }
    }
    /** html elements ----end---- */
    /** Interaction start */
    /**
     * Array of ten dictionaries, each corresponding to a finger number
     */
    fpArray = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    // Corresponding to ten fingerprints, 0 is normal, non-zero is duress finger
    fpTypeArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // Finger deletion flag array
    delFPIdArray = new Array();
    // Fingerprint capture count
    FINGERPRINT_NUMBER = 3;
    // Check if current finger is being captured
    collectFlag = false;
    // Duress fingerprint flag
    duressFingerFlag = false;
    // Flag to check if data has been modified (including add and delete)
    fpModifyFlag = false;
    // Timer -- used to clear setTimeout
    timer = null;
    /**
     * Constructor
     * @author Quinn
     * @param useDuress Whether to show duress option
     */
    constructor(useDuress) {
        this.duressFingerShowFlag = useDuress;
        let parent = this;
        /**
         * Set canvas, add oval drawing
         * @author Quinn
         * @param x X coordinate for oval positioning
         * @param y Y coordinate for oval positioning
         * @param width Width of oval
         * @param height Height of oval
         * @returns {CanvasRenderingContext2D}
         */
        CanvasRenderingContext2D.prototype.oval = function (x, y, width, height) {
            let k = (width / 0.75) / 2, w = width / 2, h = height / 2;
            this.strokeStyle = parent.bgColor;
            this.beginPath();
            this.moveTo(x, y - h);
            this.bezierCurveTo(x + k, y - h, x + k, y + h, x, y + h);
            this.bezierCurveTo(x - k, y + h, x - k, y - h, x, y - h);
            this.closePath();
            this.stroke();
            return this;
        }
        /** Set canvas, clear function */
        CanvasRenderingContext2D.prototype.clear = CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
            if (preserveTransform) {
                this.save();
                this.setTransform(1, 0, 0, 1, 0, 0);
            }
            this.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (preserveTransform) {
                this.restore();
            }
        }
    }
    /**
     * Load data from HTML to JS
     * @author Quinn
     */
    loadData() {
        //let fpIDs = $("#" + this.id_fps).val();//0
        let fpTemps = $("#" + this.id_templates).val();//1
        //let fpValids = $("#" + this.id_fp_type).val();//2
        let fpDurs = $("#" + this.id_dur_fps).val();//3
        let fpDels = $("#" + this.id_del_fps).val();

        console.log("loadData: " + fpTemps + " " + fpDurs + " " + fpDels);

        if ($.trim(fpDurs) != "") {
            debugger;
            let fs = eval(fpDurs);
            for (let i = 0; i < fs.length; i++) {
                this.fpTypeArray[parseInt(fs[i])] = 3;
            }
        }
        if ($.trim(fpDels) !== "") {
        }
        if ($.trim(fpTemps) != "") {
            let fs = eval(fpTemps);
            for (let i = 0; i < fs.length; i++) {
                let f = fs[i];
                let no = parseInt(f.no);
                let d = this.fpArray[no];
                if (f.version in d) continue;
                d[f.version] = f;
            }
        }
    }
    /**
     * Check if fingerprint exists
     * @author Quinn
     * @param num
     * @returns {boolean}
     */
    isContains(num) {
        let isCollected = false;
        if (num < 0 || num >= this.fpArray.length) {
            return isCollected;
        }
        let temps = this.fpArray[num];
        if (temps && Object.keys(temps).length > 0) {
            isCollected = true;
        }
        return isCollected;
    }
    delFPData(fpNum, context) {
        if (fpNum >= 0 && fpNum < this.fpArray.length) {
            this.fpArray[fpNum] = {};
            this.delFPIdArray.push(fpNum);
            // Change finger color -- must be checked during redraw
            context.fillStyle = this.bgColor;
            context.fill();
            // Remove color of finger to be deleted
            this.renderAfterColl(this.pubContext, this.currentFPNum, this.bgColor, false);
            this.fpModifyFlag = true;
            $("#" + this.id_duress_div).attr("disabled", false);
            $("#" + this.id_submit_button).attr("disabled", false);
        }
    }

    deleteTemplate(userId, fingerIndices) {

        if (fingerIndices.length === 0) {
            return;
        }
        // Convert the array of indices to a comma-separated string
        const indexs = fingerIndices;

        // Build the URL with query parameters
        const url = `/MonthlyTeacherFingerprint/DeleteFingerPrint?id=${encodeURIComponent(userId)}&indexs=${encodeURIComponent(indexs)}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log('Template deleted successfully');
                    // Handle success (e.g., update UI)
                } else {
                    console.error('Failed to delete template');
                    // Handle error
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }

    saveToServer(templates) {
        const filteredArr = templates
            .filter(item => item.hasOwnProperty('length'))
            .map(item => ({
                no: item.no || null,
                length: item.length,
                version: item.version || null,
                template: item.template || null
            }));

        if (filteredArr.length === 0) {
            return;
        }

        var Id = $("#Id").val();
        var teacherId = $("#teacherId").val();

        // Wrap the array and additional info in an object
        const result = {
            Id: Id,
            teacherId: teacherId,
            templates: filteredArr
        };

        console.log("saveToServer: ", result);

        fetch("/MonthlyTeacherFingerprint/GetTemplateExt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result)
        })
            .then(response => {
                if (!response.ok) throw new Error("Server error");
                return response.json();
            })
            .then(data => {
                console.log("GetTemplateExt response:", data);
            })
            .catch(err => {
                console.error("GetTemplateExt error:", err);
            });
    }


    /**
     * Save data to HTML
     */
    saveData() {
        $("#" + this.id_del_fps).val(this.delFPIdArray.toString());
        let temps = [];
        var id = $("#Id").val();
        this.deleteTemplate(id, this.delFPIdArray.toString());
        console.log("Deleting templates for user ID:", id, "Finger indices:", this.delFPIdArray.toString());
        for (let i = 0; i < this.fpArray.length; i++) {
            if (this.fpArray[i]) {
                let d = this.fpArray[i];
                for (let k in d) {
                    if (d[k].template) {
                        d[k].no = i;
                        temps.push(d[k]);
                    }
                }
            }
        }
        console.log("saveData: " + temps.length + " indx " + this.currentFPNum);
        console.log(temps);
        this.saveToServer(temps);
        $("#id_fpCount").val(temps.length);
        $("#" + this.id_templates).val(JSON.stringify(temps));
        let dur_fps = [];
        for (let i = 0; i < this.fpTypeArray.length; i++) {
            if (this.fpTypeArray[i] != 0) {
                dur_fps.push(i);
            }
        }
        $("#" + this.id_dur_fps).val(dur_fps.toString());
    }
    /**
     * Activate form
     * @author Quinn
     * @param elementId
     */
    activeForm(elementId) {
        this.elementId = elementId;
        let parent = this;
        let canvas = document.getElementById(elementId);
        let context = getCanvasContext(canvas);
        parent.draw(context, parent.fingerBorderColor);
        // jQuery enables CORS cross-domain requests in IE
        jQuery.support.cors = true;
        canvas.onmousedown = function (event) {
            event = event || window.event;// Compatible with IE which lacks event, uses window.event
            if (event != undefined) {
                if ((event.which && event.which == 1) || (event.button && event.button == 1)) {
                    let pageInfo = canvas.getBoundingClientRect();
                    let x = event.clientX - pageInfo.left;
                    let y = event.clientY - pageInfo.top;
                    parent.duressFingerFlag = $("#" + parent.id_duress_input).attr("checked");
                    parent.redraw(x, y);
                }
            }
        }
        canvas.onmousedown();
    }
    /**
     *
     * @param parentControl Specify parent
     * @returns {*|jQuery} Returns div form
     */
    showForm(parentControl) {
        let index = layer.load(4);
        let eleID = "canvas";
        let form = this.initialize(eleID);
        if (parentControl != null) {
            parentControl.append(form);
        } else {
            let parent = this;
            overrideLayerDialog();
            let options = {
                title: gettext("fpRegister_fingerprint_register"),
                skin: 'option_dialog',
                resize: false,
                success: function (layero, index) {
                    parent.formLayerIndex = index;
                    if (parent.collectFlag) {
                        parent.cancelCapture();
                        clearTimeout(parent.timer);// Close recursive timer call
                    }
                }
            };
            $(form).layerDialog(options);
        }
        if (!this.duressFingerShowFlag) {
            $("#" + this.id_duress_div).hide(); // Hide duress fingerprint checkbox
        }
        //$("#" + this.id_fpVersion_div).hide();
        this.fpArray = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
        this.fpTypeArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.delFPIdArray = new Array();
        this.loadData();
        this.activeForm(eleID);
        layer.close(index);
        return form;
    }
    closeForm() {
        layer.close(this.formLayerIndex);
    }
    cancelEvent() {
        if (this.collectFlag) {
            // During capture, cancel capture state
            this.cancelCapture();
            // Close recursive timer call
            clearTimeout(this.timer);
        }
        if (this.fpModifyFlag) {// Discard changes
            this.clearFPImage();
        }
        this.closeForm();
    }
    submitEvent() {
        if (this.collectFlag) {
            // During capture, cancel capture state
            this.cancelCapture();
            // Close recursive timer call
            clearTimeout(this.timer);
        }
        this.saveData();
        this.closeForm();
    }
    /**
     * Backend comparison
     * @author Quinn
     * @param template Fingerprint to compare
     * @param templatesArray Fingerprint collection
     */
    compareFP(template, templatesArray) {
        let temp = JSON.stringify(template);
        let temps = JSON.stringify(templatesArray);
        let ret = "";
        $.ajax({
            type: "POST",
            url: "/api/users/fingerprintMatching/",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            data: "template=" + temp + "&templates=" + temps,
            dataType: "json",
            async: false,
            success: function (response, status, xhr) {
                if (response.code === 0) {
                    ret = "ok";
                } else if (response.code === -1) {
                    ret = "Forbidden"
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                ret = "dllNotExist"
            }
        });
        return ret;
    }
    /** Fingerprint device operations start */
    /**
     * Check initialization of capture mode
     * @param context
     * @returns {number}
     */
    checkFPReader(context) {
        let parent = this;
        let ret = -1;
        FPDriver.getFPAlgs(function (res) {
            parent.loadVersions(res.data);
            ret = res.ret;
            // When interface call succeeds
            if (ret === 0) {
                // Info box -- capture prompt
                parent.collectTips(context, Messages.tip1, "html5");
            } else if (ret == -2001) {
                // Info box -- capture prompt
                parent.collectTips(context, Messages.tip2, "html5");
            } else if (ret == -2002) {
                parent.collectTips(context, Messages.getMessage("-2002"), "html5");
            } else if (ret == -2005) {
                // Info box -- capture prompt
                parent.collectTips(context, Messages.tip1, "html5");
            }
            parent.collectFlag = true;
            // Cancel capture
            parent.cancelCapture();
        });
        return ret;
    }
    /**
     * Update fingerprint versions supported by the device
     */
    getFPAlgs() {
        let parent = this;
        FPDriver.getFPAlgs(function (res) {
            parent.loadVersions(res.data);
        });
    }
    /**
     * Start capture
     */
    beginCapture() {
        let parent = this;
        //let fpAlgs = $("#" + this.id_fpVersion_select).val();- modified
        let fpAlgs = "10.0";
        FPDriver.beginCapture(fpAlgs, function (result) {
            // Return code
            let ret = result.ret;
            // When interface call succeeds
            if (ret === 0) {
                // Check capture count, display image
                parent.getImageExt();
            } else if (ret == -2001) {
                // ${base_fp_connectFail}: Failed to connect to fingerprint device
                // Info box -- capture prompt
                parent.collectTips(parent.pubContext, Messages.tip2, "html5");
            } else if (ret == -2002) {
                parent.collectTips(parent.pubContext, Messages.getMessage('-2002'), "html5");
            } else if (ret == -2005) {
                // Cancel capture
                parent.cancelCapture();
                // After switching fingers, render finger (remove original color)
                parent.renderAfterColl(parent.pubContext, parent.currentFPNum, parent.bgColor, false);
                // ${base_fp_pressFinger}: Please select a finger
                // Info box -- capture prompt
                parent.collectTips(parent.pubContext, Messages.tip1, "html5");
            }
        });
    }
    /**
     * Exit fingerprint capture mode
     */
    cancelCapture() {
        let parent = this;
        if (this.collectFlag) {
            // Close recursive timer call
            clearTimeout(this.timer);
            FPDriver.cancelCapture(function () {
                // If duress fingerprint is checked, uncheck it
                if (parent.duressFingerFlag) {
                    $("#" + parent.id_duress_input).attr("checked", false);
                }
                if (parent.fpModifyFlag) {
                    $("#" + parent.id_submit_button).attr("disabled", false);
                }
                $("#" + parent.id_duress_input).attr("disabled", false);
                if (parent.currentFPNum != null) {
                    // Remove original finger color
                    parent.renderAfterColl(parent.pubContext, parent.lastFPIdNum, parent.bgColor, false);
                }
                parent.collectFlag = false;
            })
        }
    }
    /**
     * Get fingerprint image
     */
    getImageExt() {
        let parent = this;
        FPDriver.getImageExt(function (result) {
            let base64FPImg = "";
            let collCount = 0;
            // Return code
            let ret = result.ret;
            if (ret === 0) {
                collCount = result.data.enroll_index;
                base64FPImg = result.data.jpg_base64;
            }
            if (collCount != 3) {
                // For first and second captures, display count, image, progress bar
                if (collCount === 1 || collCount === 2) {
                    // ${common_fp_collCount}: Remaining presses:
                    let text = Messages.tip3 + ":" + (parent.FINGERPRINT_NUMBER - collCount);
                    // Info box -- capture prompt
                    parent.collectTips(parent.pubContext, text, "html5");
                    // Progress bar
                    drawProgressBar(parent.pubContext, collCount, parent.bgColor);
                    // Display fingerprint image
                    parent.drawImage(parent.pubContext, base64FPImg, "html5");
                    // Clear image
                    setTimeout(function () {
                        parent.clearFPImage(parent.pubContext, 'register');
                    }, 1000);
                }
                // Timer
                parent.timer = setTimeout(function () {
                    parent.getImageExt();
                }, 1000);
            } else {
                // Display fingerprint image
                parent.drawImage(parent.pubContext, base64FPImg, "html5");
                setTimeout(function () {
                    parent.clearFPImage(parent.pubContext, 'register');
                }, 1000);
                // Progress bar
                drawProgressBar(parent.pubContext, collCount, parent.bgColor);
                // Get fingerprint template
                if (!parent.getTemplateExt('register')) {
                    drawProgressBar(parent.pubContext, 0, parent.bgColor);// Gray out progress bar
                }
                // If duress fingerprint is checked, uncheck it
                if (parent.duressFingerFlag) {
                    $("#" + parent.id_duress_input).attr("checked", false);
                }
                $("#" + parent.id_duress_input).attr("disabled", false);
                $("#" + parent.id_submit_button).attr("disabled", false);
                parent.collectFlag = false;
                parent.currentFPNum = -1;
                return collCount;
            }
        });
    }
    /**
     * Get template from fingerprint device
     * @author Quinn
     * @param flag register: registration mode
     * @returns {boolean}
     */
    getTemplateExt(flag) {
        let parent = this;
        let collectSuccessFlag = false;
        FPDriver.getTemplateExt(function (result) {
            if (result.ret !== 0) {
                if (result.ret === -2003) {
                    // After capture, render finger
                    parent.renderAfterColl(parent.pubContext, parent.currentFPNum, parent.bgColor, false);
                    // Info box -- capture prompt
                    parent.collectTips(parent.pubContext, Messages.tip10, "html5");
                }
            } else {
                // Process data
                let fpTemplates = {};
                if (result.data.templates) {
                    for (let i = 0; i < result.data.templates.length; i++) {
                        let temp = result.data.templates[i];
                        fpTemplates[temp.version] = temp
                    }
                    collectSuccessFlag = true;
                    if (flag === "register") {
                        // Check if finger already has fingerprint
                        let compareRet = parent.compareFP(fpTemplates, parent.fpArray);
                        if ($.trim(compareRet) === "dllNotExist") {
                            // After capture, render finger
                            parent.renderAfterColl(parent.pubContext, parent.currentFPNum, parent.bgColor, false);//bgColor check
                            // Info box -- capture prompt
                            parent.collectTips(parent.pubContext, Messages.tip7, "html5");
                        } else {
                            if (compareRet === "noFingerServer") {
                                // After capture, render finger
                                parent.renderAfterColl(parent.pubContext, parent.currentFPNum, parent.bgColor, false);//bgColor check
                                // Info box -- capture prompt
                                parent.collectTips(parent.pubContext, Messages.tip9, "html5");
                            } else if (compareRet === "noLicences") {
                                // After capture, render finger
                                parent.renderAfterColl(parent.pubContext, parent.currentFPNum, parent.bgColor, false);//bgColor check
                                // Info box -- capture prompt
                                parent.collectTips(parent.pubContext, Messages.tip11, "html5");
                            } else {
                                // This finger not captured
                                if (compareRet !== "ok") {
                                    // After capture, render finger
                                    parent.renderAfterColl(parent.pubContext, parent.currentFPNum, parent.bgColor, true);//bgColor check
                                    // Info box -- capture prompt
                                    parent.collectTips(parent.pubContext, Messages.tip6, "html5");
                                    // Duress fingerprint
                                    if (parent.duressFingerFlag) {
                                        // Save finger mark to array
                                        parent.fpTypeArray[parent.currentFPNum] = 3;
                                    } else {
                                        // Save finger mark to array
                                        parent.fpTypeArray[parent.currentFPNum] = 0;
                                    }
                                    // Save fingerprint template to array
                                    parent.fpArray[parent.currentFPNum] = fpTemplates;
                                } else {
                                    // After capture, render finger
                                    parent.renderAfterColl(parent.pubContext, parent.currentFPNum, parent.bgColor, false);//bgColor check
                                    // Please don't repeat input fingerprint!
                                    // Info box -- capture prompt
                                    parent.collectTips(parent.pubContext, Messages.tip8, "html5");
                                }
                            }
                        }
                    }
                }
            }
        });
        return collectSuccessFlag;
    }
    /** Fingerprint device operations end */
}
let fpRegister = new FPRegister(false);

function GetFingerIndex() {
    return fpRegister.currentFPNum;
}

function GetId() {
    return $("#Id").val();
}
function GetTeacherId() {
    return $("#teacherId").val();
}
/**
 * Turn on fingerprint collection
 */
function submitRegister() {
    if (driverIsReady) {
        fpRegister.showForm();
    } else {
        let msg = gettext('please_install_driver_or_start_service') + '<br /><a href="/files/help/Fingerprint Reader Driver.exe" style="color:red;">Download Driver</a>'

        layer.msg(msg, {
            icon: 5,
            time: 0,
            closeBtn: 2,
            title: gettext('pop_window_title')
        });
    }
}
/**
 * Click OK to submit the event
 */
function submitEvent() {
    fpRegister.submitEvent();
}
/**
 * Click Cancel Event
 */
function cancelEvent() {
    fpRegister.cancelEvent();
}
/**
 * Is the fingerprint reader driver currently available?
 * @type {boolean}
 */
let driverIsReady = false;
/**
 * Fingerprint detection device
 * @param isFPLogin Whether to use fingerprint login
 */
function checkDriver(isFPLogin) {
    let browserFlag = getBrowserType() || "";
    if (browserFlag === "upgradeBrowser") {
        if (isFPLogin) {
            $("#id_fp_identify").unbind();
            $("#id_fp_identify").attr({ disabled: "true", title: gettext("Current browser does not support this feature, please upgrade or change browser.") });
        } else {
            $("#id_fp_register").attr("onclick", "");
            $("#id_fp_register").attr({ disabled: "true", title: gettext("Current browser does not support this feature, please upgrade or change browser.") });
        }
    } else {
        FPDriver.info(function (res) {
            if (res.ret === 0) {
                driverIsReady = true;
                if (isFPLogin) {
                    $("#fp_identify_disabled").hide();
                    $("#id_fp_identify").show();
                }
            }
        });
        submitRegister();
    }
}
$(function () {
    $("#id_fp_help a").attr("href", "files/help/fingerprintDriverInstall.html");
    $("#hid").html(`<input type="hidden" id="id_del_fps" />
    <input type="hidden" id="id_dur_fps" />
    <input type="hidden" id="id_templates" />
    <input type="hidden" id="id_fp_type" />
    <input type="hidden" id="id_fps" />
    <input type="hidden" id="id_fpCount" />
    <input type="hidden" id="Id" />
    <input type="hidden" id="teacherId" />`);
});
/**
 * --------------------Tips-----------------
 */
class Messages {
    static getMessage(key) {
        if (key == null || key == undefined) {
            return "undefined";
        }
        if (key in this.dicTips) {
            return this.dicTips[key];
        } else {
            return key;
        }
    }
    static dicTips = {
        "-2001": gettext("fpRegister_alert_readerNotDetected"),
        "-2002": gettext("fpRegister_connectionError_loadFP10failed"),
        "tip1": gettext("fpRegister_alert_fingerNotSelect"),
        "tip3": gettext("fpRegister_tip_pressRemaining"),
        "tip4": gettext("fpRegister_tip_fingerprintRegistered"),
        "tip5": gettext("fpRegister_alert_deleteSelectedFingerprint"),
        "tip6": gettext("fpRegister_tip_registerSuccessful"),
        "tip7": gettext("fpRegister_alert_loadDLLFailed"),
        "tip8": gettext("fpRegister_alert_fingerprintDuplicate"),
        "tip9": gettext("fpRegister_alert_serviceStop"),
        "tip10": gettext("fpRegister_alert_pressAgain"),
        "tip11": gettext("fpRegister_alert_licenseFailed"),
    };
    static tip1 = this.getMessage("tip1");
    static tip2 = this.getMessage("-2001");
    static tip3 = this.getMessage("tip3");
    static tip4 = this.getMessage("tip4");
    static tip5 = this.getMessage("tip5");
    static tip6 = this.getMessage("tip6");
    static tip7 = this.getMessage("tip7");
    static tip8 = this.getMessage("tip8");
    static tip9 = this.getMessage("tip9");
    static tip10 = this.getMessage("tip10");
    static tip11 = this.getMessage("tip11");
}


function gettext(key) {
    const translations = {
        'fpRegister_duress_fingerprint': 'Duress Fingerprint',
        'fingerprint_version': 'Fingerprint Version',
        'btn_confirm': 'Confirm',
        'btn_cancel': 'Cancel',
        'fpRegister_fingerprint_register': 'Fingerprint Registration',
        'please_install_driver_or_start_service': 'Please install driver or start service',
        'pop_window_title': 'System Notice',
        'fpRegister_alert_readerNotDetected': 'Fingerprint reader not detected',
        'fpRegister_connectionError_loadFP10failed': 'Failed to load fingerprint library',
        'fpRegister_alert_fingerNotSelect': 'Please select a finger to register',
        'fpRegister_tip_pressRemaining': 'Press finger remaining times',
        'fpRegister_tip_fingerprintRegistered': 'Fingerprint already registered',
        'fpRegister_alert_deleteSelectedFingerprint': 'Delete selected fingerprint?',
        'fpRegister_tip_registerSuccessful': 'Registration successful',
        'fpRegister_alert_loadDLLFailed': 'Failed to load fingerprint DLL',
        'fpRegister_alert_fingerprintDuplicate': 'Duplicate fingerprint detected',
        'fpRegister_alert_serviceStop': 'Fingerprint service stopped',
        'fpRegister_alert_pressAgain': 'Please press finger again',
        'fpRegister_alert_licenseFailed': 'License verification failed',
        'Ã¥Â½â€œÃ¥â€°ÂÃ¦ÂµÂÃ¨Â§Ë†Ã¥â„¢Â¨Ã¤Â¸ÂÃ¦â€Â¯Ã¦Å’ÂÃ¨Â¯Â¥Ã¥Å Å¸Ã¨Æ’Â½,Ã¨Â¯Â·Ã¥Ââ€¡Ã§ÂºÂ§Ã¦Ë†â€“Ã¦â€ºÂ´Ã¦ÂÂ¢Ã¦ÂµÂÃ¨Â§Ë†Ã¥â„¢Â¨.': 'Current browser does not support this feature, please upgrade or change browser.'
    };
    return translations[key] || key;
}

// Browser detection function
function getBrowserType() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1 || userAgent.indexOf('Firefox') > -1 || userAgent.indexOf('Safari') > -1) {
        return 'html5';
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
        return 'simple';
    }
    return 'html5';
}

// Canvas context helper with validation
function getCanvasContext(canvas) {
    if (!canvas) {
        console.error('Canvas element is null');
        return null;
    }

    if (typeof canvas.getContext !== 'function') {
        console.error('Canvas getContext method not available');
        return null;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Failed to get 2D context from canvas');
        return null;
    }

    return context;
}

// XML HTTP Request helper
function getXMLRequest() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
    return null;
}

// Auto-start registration when page loads
function autoStartRegistration() {
    checkDriver(false);
}

function FetchFingerprint(id) {
    const url = `/api/users/${id}/fingerprints`;
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log('Fingerprint data:', response);
            const formatted = response
                .filter(item => item && item.template) // remove null or invalid entries
                .map(item => ({
                    no: item.fingerIndex ?? item.id ?? 0,
                    version: "10",
                    template: item.template
                }));

            // ✅ Convert to JSON string
            const jsonstring = JSON.stringify(formatted);
            console.log('Formatted JSON string:', jsonstring);

            $("#id_templates").val(jsonstring);
            console.log($("#id_templates").val());

            // Start registration automatically
            autoStartRegistration();
            // Handle the response as needed
        },
        error: function (xhr, status, error) {
            console.error('Error fetching fingerprint:', error);
        }
    });
}