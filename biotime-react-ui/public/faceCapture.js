/**
 * Craeted by Quinn.Meng 2025-06-09
 */

class FaceCapture {
    version = '0.0';
    _protocol = 'ws://localhost:29060/websocket';
    _websocket = null;
    IsConnected = false;

    constructor() {
        if (window.location.protocol === 'https:') {
            this._protocol = 'ws://localhost:29060/websocket';//wss
        }
    }

    /**
     * @returns {number} -1 不支持websocket  -2 未检测到驱动
     */
    connect(onopen) {
        if (!!window.WebSocket && window.WebSocket.prototype.send) {
            if (this.IsConnected) {
                this.disconnect();
            }
            let parent = this;
            let websocket = new WebSocket(this._protocol);
            this._websocket = websocket;

            websocket.onopen = function (event) {
                parent.IsConnected = true;
                if (typeof onopen == 'function') {
                    onopen(event);
                }
            };
            websocket.onclose = function (event) {
                parent.IsConnected = false;
            };
            websocket.onmessage = function (event) {
                parent.IsConnected = true;
                switch (typeof event.data) {
                    case "string":
                        console.info(event.data)
                        let mes = JSON.parse(event.data);
                        parent._handleMessage(mes);
                        break;
                    case "object":
                    default:
                        let reader = new FileReader();
                        reader.onload = function (ev) {
                            if (ev.target.readyState === FileReader.DONE) {
                                //url.replace('data:application/octet-stream;base64,', 'data:image/jpg;base64,').replace('data:;base64,', 'data:image/jpg;base64,')
                                let img_b64str = arrayBufferToBase64(ev.target.result);
                                let img_src = String.format('data:image/jpg;base64,{0}', img_b64str);
                                parent._handleMessage({
                                    ret: 0,
                                    img_b64str: img_b64str,
                                    img_src: img_src
                                });
                            }
                        };
                        reader.readAsArrayBuffer(event.data);
                        break;
                }
            }
            websocket.onerror = function (event) {
                parent.IsConnected = false;
            };
            return 0
        } else {
            return -1
        }
    }

    disconnect() {
        if (this._websocket != null) {
            this._websocket.close();
            this._websocket = null;
        }
        this.IsConnected = false;
    }

    sendMessage(dicData) {
        if (this.IsConnected && this._websocket.readyState === 1) {//WebSocket websocket.bufferedAmount === 0
            this._websocket.send(JSON.stringify(dicData));//发送json数据类型
            return true;
        } else {
            return false;
        }
    }

    sensorType = 2;

    /**
     * get version info of service
     */
    getInfo() {
        let parent = this;
        let r = getRandomNum().toString();
        this._handler = function (res) {
            //check msgid
            if (res.ret === 0 && res.msgid === r) {
                parent._handler = null;
                parent.version = res.data.server_version;
                parent.sensorType = 2;
                return true;
            } else {
                return false;
            }
        };
        let res = this.sendMessage({
            module: "common",
            msgid: r,
            function: "info",
            //sensortype: 2,
            parameter: " "
        })
        return res ? r : -1;
    }

    /**
     * Open Camera
     */
    open() {
        let parent = this;
        let r = getRandomNum().toString();
        this._handler = function (res) {
            //check msgid
            if (res.ret === 0 && res.msgid === r) {
                parent._handler = null;
                parent.startCapture();
                return true;
            } else {
                return false;
            }
        };
        let res = this.sendMessage({
            module: "facecapsensor",
            msgid: r,
            function: "open",
            sensortype: parent.sensorType,
            parameter: " "
        })
        return res ? r : -1;
    }

    /**
     * Close Camera
     */
    close() {
        this.stopCapture();
        let r = getRandomNum().toString();
        let res = this.sendMessage({
            module: "facecapsensor",
            msgid: r,
            function: "close",
            //sensortype: 2,
            parameter: " "
        })
        return res ? r : -1;
    }

    /**
     * get capture image
     */
    getImage(callback) {
        let parent = this;
        let r = getRandomNum().toString();
        this._handler = function (res) {
            //check msgid
            if (res.ret === 0 && res.msgid === r) {
                parent._handler = null;
                if (typeof callback == 'function') {
                    callback(res);
                }
                return true;
            } else {
                return false;
            }
        };
        let res = this.sendMessage({
            module: "facecapsensor",
            msgid: r,
            function: "getimage",
            //sensortype: 2,
            parameter: " "
        })
        return res ? r : -1;
    }

    startCapture() {
        let r = getRandomNum().toString();
        let res = this.sendMessage({
            module: "facecapsensor",
            msgid: r,
            function: "begincapture",
            //sensortype: 2,
            parameter: " "
        })
        return res ? r : -1;
    }

    stopCapture() {
        let r = getRandomNum().toString();
        let res = this.sendMessage({
            module: "facecapsensor",
            msgid: r,
            function: "cancelcapture",
            //sensortype: 2,
            parameter: " "
        })
        return res ? r : -1;
    }

    _onMessage = null;

    setOnMessage(callback) {
        if (typeof callback == 'function') {
            this._onMessage = callback;
        }
    }

    removeOnMessage() {
        this._onMessage = null;
    }

    /**
     * run before onmessage
     * @type {function}
     * @private
     * @returns {boolean} true handled, false not handled
     */
    _handler = null;

    _handleMessage(res) {
        let handled = false;
        if (this._handler != null) {
            try {
                handled = this._handler(res);
            } catch (e1) {
            }
        }
        if (!handled && this._onMessage != null) {
            try {
                this._onMessage(res);
            } catch (e1) {
            }
        }
    }
}

/**
 * 重写layer对话框
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

class FaceDialog {
    _formLayerIndex = null;
    _curImg_b64str = '';
    faceService = null;

    onConnected(res) {
        this.faceService.getInfo();
    }

    onMessage(res) {
        let mesBlock = $('#cameraContentId');
        switch (res.ret) {
            case 0:
                mesBlock.hide();
                if (res.img_src != null) {
                    $('#canvas_img').attr('src', res.img_src);
                    this._curImg_b64str = res.img_b64str;
                }
                break;
            default:
                let msg = Messages_FC.getMessage(res.ret.toString());
                mesBlock.html(msg).show();
                break;
        }
    }

    openCamera() {
        this.faceService.open();
    }

    closeCamera() {
        this.faceService.close();
    }

    capturedImage = '';

    captureImage() {
        if (this.faceService.IsConnected) {
            this.capturedImage = this._curImg_b64str;
            return this.capturedImage;
        } else {
            return '';
        }
    }

    constructor(_faceService) {
        this.faceService = _faceService;
        let parent = this;
        _faceService.setOnMessage(function (res) {
            parent.onMessage(res);
        })
    }

    /**
     * 初始化html组件
     * @returns {string}
     */
    initControls(submitMethod, cancelMethod) {
        let submitMethodString = submitMethod == null ? 'submitFaceEvent()' : submitMethod;
        let cancelMethodString = cancelMethod == null ? 'cancelFaceEvent()' : cancelMethod;
        return '<div style="position: absolute; left: 400px; top: 300px; width: auto; height: 28px; display: block;">'
            + '  <button style="width: 142px" type="button" id="openCameraId" class="enroll-button" name="openCamera" onclick="OpenCamera();">'
            + '      ' + gettext('btn_refreshCamera')
            + '  </button>'
            + '</div>'
            // + '<div style="position: absolute; left: 400px; top: 300px; width: auto; height: 28px; display: block;">'
            // + '  <button style="width: 142px" type="button" id="closeCameraId" class="enroll-button" name="closeCamera" onclick="CloseCamera();">'
            // + '      ' + gettext('btn_closeCamera')
            // + '  </button>'
            // + '</div>'
            + '<div style="position: absolute; left: 400px; top: 340px; width: auto; height: 28px; display: block;">'
            + '  <button style="width: 142px" type="button" id="captureImageButtonId" class="enroll-button" name="captureImage" onclick="CapFaceImage();">'
            + '      ' + gettext('btn_capture')
            + '  </button>'
            + '</div>'
            + '<div style="position: absolute; left: 400px; top: 380px; width: auto; height: 28px; display: block;">'
            + '  <button style="width: 142px" type="button" id="submitFaceButtonId" class="enroll-button" name="makeSureName" onclick="'
            + submitMethodString + ';">'
            + '      ' + gettext('btn_confirm')
            + '  </button>'
            + '</div>'
            + '<div style="position: absolute; left: 400px; top: 420px; width: auto; height: 28px; display: block;">'
            + '  <button style="width: 142px" type="button" id="closeFaceButton" class="enroll-button" name="closeFaceButton" onclick="'
            + cancelMethodString + ';">'
            + '      ' + gettext('btn_cancel')
            + '  </button>'
            + '</div>'
            + '<div style="position: absolute;top: 40px;width: 100%;text-align: center;display: none;"'
            + ' id="cameraContentId">'
            + '</div>'
            + '<div style="position: absolute;left: 390px;height: 240px;width: 180px;">'
            + '<img style="width: 100%;height: 100%" id="capturedImgId" alt=""/>'
            + '</div>';
    }

    /**
     * 初始化组件
     * @author Quinn
     * @param eleID element for drawing; default 'canvas'
     * @param submitMethod
     * @param cancelMethod
     * @returns {*|jQuery}
     */
    initialize(eleID, submitMethod, cancelMethod) {
        if (!eleID) {
            eleID = "canvas";
        }
        let parent = this;
        let form = document.createElement('div');
        $(form).attr('style', 'height:480px;width:600px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)');

        //画板
        let canvas = document.createElement('img');
        $(canvas).attr('id', eleID);
        $(canvas).attr('style', 'position:absolute;left:5px;background:rgb(243, 245,240)');
        canvas.height = 480;
        canvas.width = 360;
        $(form).append(canvas);//添加画板到窗口

        //创建其他控件
        let controls = this.initControls(submitMethod, cancelMethod);
        $(form).append(controls);

        return $(form);
    }

    showForm(parentControl, submitMethod, cancelMethod) {
        let index = layer.load(4);

        this._curImg_b64str = '';
        let parent = this;
        let eleID = "canvas_img";//
        let form = this.initialize(eleID, submitMethod, cancelMethod);
        if (parentControl != null) {
            parentControl.append(form);
        } else {
            overrideLayerDialog();
            let options = {
                title: gettext("faceRegister_face_register"),
                skin: 'option_dialog',
                area: ['600px', '530px'],
                resize: false,
                success: function (layero, index) {
                    parent._formLayerIndex = index;
                },
                end:function (){
                    parent.closeCamera();
                }
            };
            $(form).layerDialog(options);
        }
        let res = this.faceService.connect(function (event) {
            parent.onConnected(event);
        });
        switch (res) {
            case -1://browser not support ws
                layer.msg('Browser not support websocket.', {icon: 5, time: 3000})
                break;
            case 0:
            case -2://undetected available device service
            default:
                break;
        }
        setTimeout(function () {
            if (!parent.faceService.IsConnected) {
                let msg = gettext('please_install_driver_or_start_service')
                    + '<br /><a href="/files/help/ZKFaceCapOnline.exe" style="color:red;">'
                    + gettext('Download_Driver') + '</a>'

                $('#cameraContentId').html(msg).show();
                //layer.msg(msg, {
                //    icon: 5,
                //    time: 0,
                //    closeBtn: 2,
                //    title: gettext('pop_window_title')
                //});
            }
        }, 3000);

        layer.close(index);
        this.openCamera();
        return form
    }

    close() {
        //this.closeCamera();
        layer.close(this._formLayerIndex);
    }
}

let faceDialog = new FaceDialog(new FaceCapture())

function submitFaceRegister() {
    faceDialog.showForm();
}

function OpenCamera() {
    faceDialog.openCamera();
}

function CloseCamera() {
    faceDialog.closeCamera();
}

function CapFaceImage() {
    let image = faceDialog.captureImage();
    if (image) {
        $('#capturedImgId').attr('src', String.format('data:image/jpg;base64,{0}', image));
        //layer.open({
        //    type: 1,
        //    title: gettext("preview"),
        //    closeBtn: 1,
        //    area: ['350', '420'],
        //    shadeClose: true,
        //    // skin: 'yourclass',
        //    content: String.format('<img alt=\'\' src="data:image/jpg;base64,{0}"/>', image),
        //    offset: ['100px', '200px'],
        //    resize: false,
        //});
    }
}

function submitFaceEvent() {
    //将人脸数据保存到页面
    if (faceDialog.capturedImage) {
        $("#id_face").val(faceDialog.capturedImage);
        $("#id_faceCount").val(1);
    }
    faceDialog.close();
}

function cancelFaceEvent() {
    faceDialog.close();
}

function arrayBufferToBase64(buffer) {
    //if (typeof TextDecoder !== 'undefined' && typeof btoa !== 'undefined') {
    //    return btoa(new TextDecoder().decode(new Uint8Array(buffer)));
    //} else {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    //}
}

function getRandomNum() {
    return parseInt(1E6 * Math.random())
}

class Messages_FC {
    static getMessage(key) {
        if (key == null) {
            return "undefined";
        }
        if (key in this._dicTips) {
            return this._dicTips[key];
        } else {
            return key;
        }
    }

    static _dicTips = {
        "0": gettext("faRegister_0"),//"Operate Successfully",// "成功",
        "-10001": gettext("faRegister_-10001"),//"Invalid Params",//"无效参数或者参数格式错误",
        "-10002": gettext("faRegister_-10002"),//"Device Is Connected",//"设备已连接",
        "-10003": gettext("faRegister_-10003"),//"Operate Timeout",//"设置超时时间失败",
        "-10004": gettext("faRegister_-10004"),//"Device Is Busy",//"设备忙打开失败",
        "-10005": gettext("faRegister_-10005"),//"Open Device Failed",//"打开设备失败",
        "-10006": gettext("faRegister_-10006"),//"Device Is Closed",//"设备未打开",
        "-10007": gettext("faRegister_-10007"),//"Unknown Module",//"无效模块/未知模块",
        "-10008": gettext("faRegister_-10008"),//"Checking Failed",//"自检失败",
        "-10009": gettext("faRegister_-10009"),//"Failed To Close Device",//"关闭设备失败",
        "-10010": gettext("faRegister_-10010"),//"Waiting To Capture",//"未开始采集",
    }
}