//Dependency: Evoque.js
$.extend('imageCompressor', (function (self) {
    var defaultOption = {
        //需要压缩的图片文件数组，每个元素为File对象或者Image标签对象
        srcImgList: [],
        ratio: 0.8,
        onCompleted: function () {}
    };

    var windowWidth = 1024;
    var windowHeight = 1024;

    self.exec = function (option) {
        var $option = $(option);
        var srcImgList = defaultOption.srcImgList;
        var typeOfSrcImgList = $.checkType(option.srcImgList);
        if (typeOfSrcImgList === type.eArray || typeOfSrcImgList === type.eArraylist) {
            srcImgList = option.srcImgList;
        }
        var ratio = $option.getValueOfProperty('ratio', defaultOption);
        if (ratio <= 0 || ratio > 1) {
            throw 'ratio is error!';
        }
        var onCompleted = $option.getValueOfProperty('onCompleted', defaultOption);
        var worker = new compressWorker();
        worker.do(srcImgList, ratio, onCompleted);
    };

    function compressWorker() {
        this.result = [];
    }
    compressWorker.prototype = {
        do: function (srcImgList, ratio, onCompleted) {
            var result = this.result;
            var completedCount = 0;
            for (var i = 0; i < srcImgList.length; ++i) {
                var srcImg = srcImgList[i];
                if (srcImg instanceof File) {
                    readImage.call(this, srcImg, i, function (readImg) {
                        compress.call(readImg.readImage, readImg.readImage, ratio, readImg.imageIndex, function (resultData) {
                            result[resultData.imageIndex] = resultData.resultImageData;
                            increaseCount();
                        });
                    });
                }
                else if (srcImg instanceof HTMLImageElement) {
                    compress.call(srcImg, srcImg, ratio, i, function (resultData) {
                        result[resultData.imageIndex] = resultData.resultImageData;
                        increaseCount();
                    });
                }
                else {
                    result[i] = null;
                    increaseCount();
                }
            }

            function increaseCount() {
                ++completedCount;
                if (completedCount >= srcImgList.length) {
                    if ($.checkType(onCompleted) === type.eFunction) {
                        onCompleted.call(this, { result: result });
                    }
                }
            }
        }
    };

    function readImage(file, index, onRead) {
        var that = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = document.createElement('img');
            img.onload = function () {
                if ($.checkType(onRead) === type.eFunction) {
                    onRead.call(that, { readImage: this, imageIndex: index, width: this.width, height: this.height });
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function compress(srcImg, ratio, index, onResult) {
        var that = this;
        var canvas = document.createElement('canvas');
        var scaleSize = getScaledSize(srcImg.width, srcImg.height);
        canvas.width = scaleSize.width;
        canvas.height = scaleSize.height;
        var ctx = canvas.getContext("2d");
        var r = scaleSize.width / srcImg.width;
        ctx.scale(r, r);
        ctx.drawImage(srcImg, 0, 0);
        //填充余白
        var canvas1 = document.createElement('canvas');
        canvas1.width = windowWidth;
        canvas1.height = windowHeight;
        var left = (windowWidth - scaleSize.width) / 2;
        var top = (windowHeight - scaleSize.height) / 2;
        var ctx1 = canvas1.getContext("2d");
        ctx1.fillStyle = 'rgba(255,255,255,1)';
        ctx1.fillRect(0,0,windowWidth,windowHeight);
        ctx1.drawImage(canvas, left, top);

        var imgData = canvas1.toDataURL("image/jpeg", ratio);
        if ($.checkType(onResult) === type.eFunction) {
            onResult.call(that, { resultImageData: imgData, imageIndex: index });
        }
    }

    function getScaledSize(w, h) {
        var whRatio = windowWidth / windowHeight;
        if (w > windowWidth) {
            var mh = Math.round(windowWidth / w * h);
            if (mh > windowHeight) {
                var mw = Math.round(windowHeight / h * w);
                return {
                    width: mw,
                    height: windowHeight
                };
            }
            else {
                return {
                    width: windowWidth,
                    height: mh
                };
            }
        }
        else if (h > windowHeight) {
            var mw = Math.round(windowHeight / h * w);
            if (mw > windowWidth) {
                var mh = Math.round(windowWidth / w * h);
                return {
                    width: windowWidth,
                    height: mh
                };
            }
            else {
                return {
                    width: mw,
                    height: windowHeight
                };
            }
        }
        else {
            return {
                width: w,
                height: h
            };
        }
    }

    return self;
}({})));
