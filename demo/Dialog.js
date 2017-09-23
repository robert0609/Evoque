//require.config({
//    paths: {
//        evoque: '../src_v2.0.0/js/Evoque',
//        session: '../src_v2.0.0/js/Evoque.Session',
//        cache: '../src_v2.0.0/js/Evoque.Cache',
//        dialog: '../src_v2.0.0/js/Evoque.Dialog',
//        dialogAdapter: '../src_v2.0.0/js/adapter/Evoque.Dialog.Adapter',
//        scrollBox: '../src_v2.0.0/js/Evoque.ScrollBox'
//    },
//    shim: {
//        cache: ['evoque', 'session'],
//        session: ['evoque'],
//        dialog: ['evoque'],
//        dialogAdapter: ['evoque', 'dialog'],
//        scrollBox: ['evoque', 'cache']
//    },
//    urlArgs: "bust=" + (new Date()).getTime()
//});

//var click, showSub, resize;
//var ttt = 0;
//require(['evoque', 'cache', 'dialog', 'dialogAdapter', 'scrollBox'], function (evoque) {
//    click = function () {


//        //            var i = 0;
//        //调用dialog控件显示
//        //            $.dialog.showModalDialog({
//        //                content:'article',
//        //                width:document.documentElement.clientWidth * 0.9,
//        //                onDialogShowed: function () {
//        //                    $('#articleScroll').scrollBox.create();
//        //                },
//        //                autoClose: false
//        //            });
//        //            window.setTimeout(function () {
//        //                $.dialog.closeCurrentDialog();
//        //            }, 2000);
//        //            $.dialog.alert('alert 1');
//        //            $.dialog.alert('dialog');
//        //            $.dialog.showMessageBox({
//        //                title:'title',
//        //                //width:document.documentElement.clientWidth * 0.9,
//        //                content:'message text',
//        //                button:'yes|no',
//        //                onClickYes: function(){
//        //                    alert('click yes');
//        //                },
//        //                onClickNo: function(){
//        //                    alert('click no');
//        //                    return false;
//        //                },
//        //                customButton: [
//        //                    {
//        //                        caption: '自定义',
//        //                        onClick: function(){
//        //                            alert('click custom button');
//        //                            return false;
//        //                        }
//        //                    }
//        //                ],
//        //                onQuiting: function () {
//        //                    alert('onQuiting---1');
//        //                },
//        //                onDialogClosed: function () {
//        //                    alert('onDialogClosed---1');
//        //                },
//        //                direction: 'center',
//        //                layoutVersion: 'plain'
//        //            });
//        $.dialog.showModalDialog({
//            content: 'dialog1',
//            button: 'yes|no',
//            onQuiting: function () {
//                //alert('onQuiting---2');
//            },
//            onDialogClosed: function () {
//                //alert('onDialogClosed---2');
//            },
//            autoClose: false,
//            direction: 'top'
//        });
//        /*            $.dialog.showLoading('loading...', function () {
//                        $.loadPage('/demo/demo.html');
//                    });*/
//        //$(document).dialog.closeCurrentDialog();
//    };

//    showSub = function () {
//        $('#subBtn').alert('sub alert 1');
//        $('#subBtn').alert('sub dialog');
//        $('#subBtn').showMessageBox({
//            title: 'sub title',
//            icon: '',
//            content: 'sub message text',
//            button: 'yes|no',
//            onClickYes: function () {
//                alert('click sub yes');
//            },
//            onClickNo: function () {
//                alert('click sub no');
//                return false;
//            },
//            customButton: [
//                {
//                    caption: '自定义',
//                    onClick: function () {
//                        alert('click sub custom button');
//                        return false;
//                    }
//                }
//            ],
//            onQuiting: function () {
//                alert('sub onQuiting---1');
//            },
//            onDialogClosed: function () {
//                alert('sub onDialogClosed---1');
//            }
//        });
//    };

//    resize = function () {
//        $('#dialog').setStyle('height', '300px');
//    };

//    $.unload(function () {
//        $('#result').text(++ttt);
//        $.dialog.closeAll();
//    });
//});

//---------------------------------------------
var click, showSub, resize;
var ttt = 0;
document.addEventListener('DOMContentLoaded', function () {
    LazyLoad.js(['../src_v2.0.0/js/Evoque.js', '../src_v2.0.0/js/Evoque.Cache.js', '../src_v2.0.0/js/Evoque.Dialog.js', '../src_v2.0.0/js/adapter/Evoque.Dialog.Adapter.js', '../src_v2.0.0/js/Evoque.ScrollBox.js'], function () {

        click = function () {


            //            var i = 0;
            //调用dialog控件显示
            //            $.dialog.showModalDialog({
            //                content:'article',
            //                width:document.documentElement.clientWidth * 0.9,
            //                onDialogShowed: function () {
            //                    $('#articleScroll').scrollBox.create();
            //                },
            //                autoClose: false
            //            });
            //            window.setTimeout(function () {
            //                $.dialog.closeCurrentDialog();
            //            }, 2000);
            //            $.dialog.alert('alert 1');
            //            $.dialog.alert('dialog');
            //            $.dialog.showMessageBox({
            //                title:'title',
            //                //width:document.documentElement.clientWidth * 0.9,
            //                content:'message text',
            //                button:'yes|no',
            //                onClickYes: function(){
            //                    alert('click yes');
            //                },
            //                onClickNo: function(){
            //                    alert('click no');
            //                    return false;
            //                },
            //                customButton: [
            //                    {
            //                        caption: '自定义',
            //                        onClick: function(){
            //                            alert('click custom button');
            //                            return false;
            //                        }
            //                    }
            //                ],
            //                onQuiting: function () {
            //                    alert('onQuiting---1');
            //                },
            //                onDialogClosed: function () {
            //                    alert('onDialogClosed---1');
            //                },
            //                direction: 'center',
            //                layoutVersion: 'plain'
            //            });
            $.dialog.showModalDialog({
                content: 'dialog1',
                button: 'yes|no',
                onQuiting: function () {
                    //alert('onQuiting---2');
                },
                onDialogClosed: function () {
                    //alert('onDialogClosed---2');
                },
                autoClose: false,
                direction: 'top'
            });
            /*            $.dialog.showLoading('loading...', function () {
                            $.loadPage('/demo/demo.html');
                        });*/
            //$(document).dialog.closeCurrentDialog();
        };

        showSub = function () {
            $('#subBtn').alert('sub alert 1');
            $('#subBtn').alert('sub dialog');
            $('#subBtn').showMessageBox({
                title: 'sub title',
                icon: '',
                content: 'sub message text',
                button: 'yes|no',
                onClickYes: function () {
                    alert('click sub yes');
                },
                onClickNo: function () {
                    alert('click sub no');
                    return false;
                },
                customButton: [
                    {
                        caption: '自定义',
                        onClick: function () {
                            alert('click sub custom button');
                            return false;
                        }
                    }
                ],
                onQuiting: function () {
                    alert('sub onQuiting---1');
                },
                onDialogClosed: function () {
                    alert('sub onDialogClosed---1');
                }
            });
        };

        resize = function () {
            $('#dialog').setStyle('height', '300px');
        };

        $.unload(function () {
            $('#result').text(++ttt);
            $.dialog.closeAll();
        });
    });
});


