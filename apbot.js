/**
 * Auto Painting Bot
 * (for https://wolfchen.top/pix)
 * 2024/2/8 by yzl3014
 */
console.clear();
console.log("APBot is Running!");
var EffectivePixCount = 0; //有效像素数量。有效，即将被绘制的像素。
const imageHeight = 300, imageWidth = 410; // 读取图片到canvas的实际尺寸。只有这个大小范围内的图片才会被绘制
const delay = 80; // (单位为毫秒)绘制每个像素之间的等待时间。不能低于80，否则会堵塞。

/*↓↓↓↓↓↓↓↓↓↓ 您只需要更改此处 ↓↓↓↓↓↓↓↓↓↓*/
var imgStartPoint = { x: 0, y: 0 }; // 绘制起点
/*↑↑↑↑↑↑↑↑↑↑ 您只需要更改此处 ↑↑↑↑↑↑↑↑↑↑*/

/**
 * 计算色差
 * https://stackoverflow.com/questions/13586999
 * 共有2个Function：deltaE(rgbA, rgbB) rgb2lab(rgb)
 */
function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}
function rgb2lab(rgb) {
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}
/**
 * 毫秒转时分秒
 * https://gist.github.com/remino/1563878
 */
function convertMS(ms) {
    var d, h, m, s;
    if (isNaN(ms) || ms < 0) return 'N/A';
    if (ms < 1000) return ms + "毫秒";
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    h += d * 24;
    return h + '时' + m + '分' + s + '秒';
}
/**
 * JS Sleep功能
 * https://blog.csdn.net/lwx33912138/article/details/127666083
 */
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function init() { // 导入图片文件到Canvas
    // 创建一个input
    const inputElem = document.createElement("input");
    inputElem.type = "file";
    inputElem.accept = "image/png,image/jpeg";
    inputElem.addEventListener("change", (e) => {
        /**
         * 读入图片到canvas
         * 参考 https://segmentfault.com/a/1190000007237076
         */
        var file = e.target.files[0]; //获取input输入的图片
        if (!/image\/\w+/.test(file.type)) { // 判断类型是否正确
            alert("文件类型不正确，应为png,jpg,jpeg");
            return;
        }
        // 读取文件
        var reader = new FileReader();
        reader.readAsDataURL(file); // 转化成base64数据类型
        reader.onload = function (e) {
            // 创建Canvas
            var cvs = document.createElement("canvas");
            cvs.width = imageWidth;
            cvs.height = imageHeight;
            // 创建Canvas Context(上下文)和图片对象，并读取获取到的图片
            var ctx = cvs.getContext('2d');
            //以默认颜色为背景。此操作会起到重要作用
            ctx.rect(0, 0, cvs.width, cvs.height);
            ctx.fillStyle = "#0a9a38"; //默认颜色
            ctx.fill();

            var img = new Image;
            img.src = this.result;
            img.onload = function () { // 必须onload之后再画
                ctx.drawImage(img, 0, 0/*,imageWidth, imageHeight*/);//如果需要拉伸图片，则添加后面两个参数
                strDataURI = cvs.toDataURL();//获取canvas base64数据
                // 测试一下
                var rgbdata = ctx.getImageData(1, 1, 1, 1).data;
                var rgb = rgbdata[0] + "," + rgbdata[1] + "," + rgbdata[2];
                console.log("APBot:: Image read successfully! Color at (1,1) is rgb(" + rgb + ")");
                imageConverter(ctx);
            }
        }
    }, false);
    inputElem.click(); // 手动触发change事件,即模拟点击
}
function imageConverter(ctx) { // 将Canvas内的图片，按像素转换为颜色id
    EffectivePixCount = 0;
    ctx.canvas.willReadFrequently = true; // 启用高速读取优化
    // 顺序按照网站源码中的颜色id。按数组下标0,1,2,3读取，即可获取该编号对应的rgb颜色值
    var colorList = ["255,255,255",
        "0,0,0", "85,85,85", "136,136,136", "205,205,205", "255,213,188", "255,183,131", "182,109,61", "119,67,31", "252,117,16", "252,168,14", "253,232,23", "255,244,145", "190,255,64", "112,221,19", "49,161,23", "50,182,159", "136,255,243", "36,181,254", "18,92,199", "38,41,96", "139,47,168", "255,89,239", "255,169,217", "255,100,116", "240,37,35", "177,18,6", "116,12,0"];
    var imgRaw = new Array(imageHeight).fill(0).map(() => new Array(imageWidth).fill(0));;
    // 遍历图片的每一个像素
    for (let y = 0; y <= imageHeight - 1; y++) {
        for (let x = 0; x <= imageWidth - 1; x++) {
            let rgbData = ctx.getImageData(x, y, 1, 1).data; //当前像素的rgb颜色值
            let deviation = []; // 与所有可用颜色的差值
            let minDeviation = 1000.00;
            let minDeviationId = -1;
            if (rgbData[0] == 10 && rgbData[1] == 154 && rgbData[2] == 56) {
                imgRaw[y][x] = -1; // 数组和i,j与坐标y,x对应， 而不是x,y.
                continue;
            }
            // 遍历所有可用颜色，计算差值
            for (let m = 0; m <= colorList.length - 1; m++) {
                deviation[m] = deltaE(colorList[m].split(","), rgbData);
            }
            // 遍历差值，找到差值最小的颜色的id
            for (let n = 0; n <= deviation.length - 1; n++) {
                if (deviation[n] <= minDeviation) {
                    minDeviation = deviation[n];
                    minDeviationId = n;
                }
            }
            imgRaw[y][x] = minDeviationId;
            EffectivePixCount++;
        }
    }

    // 此时图片已经转换完毕，可以进行绘制操作：
    drawImg(imgRaw, imgStartPoint);
    /*
    如果需要输出数组（一维数组），打开注释即可。处理完后将自动下载，名字为[时间戳.txt]
    var text = imgRaw.join();
    const blob = new Blob([text], {
        type: "text/plain;charset=utf-8"
    });
    const objectURL = URL.createObjectURL(blob);
    const aTag = document.createElement('a');
    aTag.href = objectURL;
    aTag.download = String(Date.now()) + ".txt";
    aTag.click();
    URL.revokeObjectURL(objectURL);
    */
}


/**
 * 由原始的addpix函数修改。
 * 见 e-smart-zoom-jquery.js
 * 第291行 addpix(x,y)
 */
function addpix(x, y, c, num = 0) {
    console.log("ADD PIX:: [" + x + "," + y + "][" + c + "] " + //位置和颜色id
        "at [" + new Date().toLocaleTimeString() + "], " + // 时间字符串
        "id=[" + num + "], Percentage=[" + String(Math.round(num / EffectivePixCount * 10000) / 100) + "%], total=[" + EffectivePixCount + "]"); //像素计数和完成度

    var uid = localStorage.getItem("uid");
    //drawPoint(x, y, ???);
    let data = '&x=' + x + '&y=' + y + '&c=' + c + '&uid=' + uid,
        url = './add.php',
        xhr = new XMLHttpRequest();
    xhr.open('post', url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
            var obj = JSON.parse(xhr.responseText);
            //drawPoint(obj['x'],obj['y'],obj['c'])
            //console.log(x + "," + y + "=" + $(".picked").attr("id").slice(5) + "-" + uid);
        }
    }

    localStorage.setItem("pixcount", parseInt(localStorage.getItem("pixcount")) + 1);
    //保留上一行则记录写入像素数，最终被提交到服务器
    document.getElementById("pixcount").innerHTML = localStorage.getItem("pixcount");
}

async function drawImg(imgRaw, startPoint) {
    // async不可删除，它与sleep配合使用
    if (("Notification" in window) && Notification.permission !== "granted") {
        alert("APBot将在绘制结束时向您显示通知，请在关闭本弹窗后选择是否允许\n如果没有弹出选择框，请检查浏览器设置。");
        Notification.requestPermission();
    }

    console.clear();
    console.log("APBot started painting at [" + new Date().toLocaleString() + "]");
    localStorage.setItem("pixcount", 0); // 重置像素数，以便统计数字。可以注释掉
    const startTime = new Date(); // 开始运行时间

    // 按imgRaw数组，进行自动绘制
    var count = 0;
    for (let y = 0; y <= imageHeight - 1; y++) {
        console.log("ADD PIX:: [ENTER][line: " + y + "]");
        for (let x = 0; x <= imageWidth - 1; x++) {
            let color = imgRaw[y][x]; // 数组与坐标系的像素存储方式保持一致，一行中的y坐标相等，一列中的x坐标相等
            if (color == -1) continue;
            count++;
            await sleep(delay);
            addpix(startPoint.x + x, startPoint.y + y, color, count);
        }
    }
    console.log("APBot FinishED painting at [" + new Date().toLocaleString() + "]");
    // 统计运行耗时
    const endTime = new Date(); // 结束运行时间
    const executionTime = endTime - startTime;
    console.log("Time: " + convertMS(executionTime));

    const notification = new Notification("APBot", {
        lang: "zh-CN",
        body: '任务已完成，耗时' + convertMS(executionTime)
    });
}


init();
// 运行过程：
// init导入文件到Canvas -> imageConverter将Canvas每个像素转换为颜色id存到数组 -> 绘制图片 