var musicArray = new Array();
var musicIndex = 0;
var musicCount = 0;
var palyFlag = 0; // 播放标志(默认不播放，需手动播放)
var playStyle = 0;
// 0：列表循环 2：随机播放 4：顺序播放 6：单曲循环
var playStyleIcon = new Array("&#xe605;", "列表循环", "&#xe6a1;", "随机播放", "&#xe6a2;", "顺序播放", "&#xe6a3;", "单曲循环");
var soundFlag = 1;
// var path = "http://www.pzhuweb.cn/data/music/";  // 网络资源
var path = ""; // 本地资源
$(function() {
    init(); // 初始化一些基本信息
    loadMusicList(); // 加载歌曲列表
    loadMusic(); // 加载音乐
    // 事件监听
    $("#musiclist li").click(clickplay);
    $(".search a").bind("click", search); // 点击歌曲信息跳转到相应的搜索页面
    $(".pointer").click(playMusic);
    // 结束后自动点击下一曲，时间函数（实时渲染时间、歌词等）
    $("audio").bind("ended", nextMusic).bind("timeupdate durationchange", updateTime)
    // 自定义进度条的点击事件
    $(".progress").bind("click", function(e) {
        var x0 = $(".progress").offset().left; // 获取div的位置
        var x = e.clientX; // 获取点击位置
        var width = x - x0; // 计算相对位置
        var audio = $("audio")[0];
        var dur_time = audio.duration;
        // 计算时间
        var cur_time = width / ($("#progress_bar").parent().width() - $("#timer").width() - 20) *
            dur_time;
        $("#progress_bar").width(width); // 重新设置进度条长度
        audio.currentTime = cur_time; // 重新设置播放位置
    })
    // 自定义音量条input：range  start
    var r = $('input');
    r.on('mouseenter', function() {
        var p = r.val();
        r.on('click', function() {
            p = r.val();
            bg(p);
        });
        r.on('mousemove', function() {
            p = r.val();
            bg(p);
        });
    });

    function bg(n) {
        r.css({
            'background-image': '-webkit-linear-gradient(left ,#ff410f 0%,#ff410f ' + n + '%,#807e7e ' +
                n + '%, #807e7e 100%)'
        });
    }
    // 自定义input：range  end

})
// 初始化，通过ajax获取歌曲名，将得到的歌曲名添加到 musicArray 数组
function init() {
    // 获取音乐信息的xml文件
    var musicXml = getXmlDoc(path + "src/musicname.xml");
    var musics = musicXml.getElementsByTagName("name");
    // 将音乐名添加到数组
    for (var i = 0; i < musics.length; i++) {
        musicArray.push(musics[i].childNodes[0].nodeValue);
    }
    musicCount = musicArray.length;
}
// 加载歌曲列表
function loadMusicList() {
    var fragment = document.createDocumentFragment();
    var newItem = $('<li class="inline-bloack"><span></span><span>歌曲</span><span>歌手</span></li>')[0];
    fragment.appendChild(newItem);
    $.each(musicArray, function(i, item) {
        var str = item.split(/-/);
        var newItem = $('<li class="inline-bloack list"><span>' +
            (i + 1) + '</span><span>' + str[1] + '</span><span>' +
            str[0] + '</span></li>')[0];
        fragment.appendChild(newItem);
    });
    $("#musiclist ul").html(fragment);
}
// 将以秒为单位的时间格式化为 mm:ss
function asTime(num) {
    num = Math.round(num);
    var m = Math.floor(num / 60);
    var s = Math.floor(num % 60);
    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }
    return m + ":" + s;
}
// 参数time格式：mm:ss
function getTime(time) {
    var timer = time.split(/:/);
    var millisecond = ((parseFloat(timer[0]) * 60) + parseFloat(timer[1])) * 1000;
    // console.log(millisecond);
    return millisecond;
}
// 更新显示时间
function updateTime() {
    var audio = $("audio")[0];
    var cur_time = audio.currentTime;
    var dur_time = audio.duration;
    $("#timer").html(asTime(cur_time) + "/" + asTime(dur_time));
    // 进度条的长度 = （父节点长度 - 时间框长度（含内外边框）） * （当前时间/总时间）
    var width = ($("#progress_bar").parent().width() - $("#timer").width() - 20) * (cur_time / dur_time)
    $("#progress_bar").width(width);
    // 渲染歌词
    for (var i = 0; i < timeArray.length; i++) {
        // 先通过循环计算歌词当前行
        if (timeArray[i] >= asTime(cur_time)) {
            if (lrcline != i - 1) { // 多加一次判断避免重复渲染
                lrcline = i - 1;
                updateLrc(lrcline); // 渲染歌词
            }
            break;
        }
        // 最后一句歌词
        if (i == timeArray.length - 1) {
            if (lrcline != i) { // 多加一次判断避免重复渲染
                lrcline = i;
                updateLrc(lrcline); // 渲染歌词
            }
        }
    }
}
// 加载新的音乐，根据musicIndex播放最新的音乐
function loadMusic() {
    var audio = document.getElementById("audio");
    // var musiclist = document.getElementById("musiclist");
    audio.src = path + "src/" + musicArray[musicIndex] + ".mp3";
    audio.load();
    // 重新加载音乐，默认自动播放
    // 如果手动暂停后点击下一曲，需要更新播放状态标志和按钮的显示信息
    // if (palyFlag == 0) {
        // playMusic();
    // }
    // console.log(audio.duration);
    // 更新歌曲显示信息
    showMessage();
    // 更新歌词
    loadLrc();
}
// 播放/暂停
function playMusic() {
    var audio = document.getElementById("audio");
    var btn = document.getElementById("btn_play");
    if (palyFlag) {
        audio.pause();
        btn.innerHTML = "&#xe64a;";
        palyFlag = 0;
        $(".disc").removeClass("rotate"); // 移除唱片旋转动画
        $(".pointer").removeClass("pointer-play"); // 移除指针播放动画，添加指针暂停动画
        $(".pointer").addClass("pointer-pause");
        $(".list_playing>span:nth-child(1)").removeClass("playinggif"); // 显示歌单列表序号
        $("#img_play").attr("src", "./img/pause.jpg"); // 替换控制区的小图片
    } else {
        audio.play();
        btn.innerHTML = "&#xe6ae;";
        palyFlag = 1;
        $(".disc").addClass("rotate"); // 添加唱片旋转动画
        $(".pointer").removeClass("pointer-pause"); // 移除指针暂停动画，添加指针播放动画
        $(".pointer").addClass("pointer-play");
        $(".list_playing>span:nth-child(1)").addClass("playinggif"); // 将歌单列表中单曲歌曲的序号改变为播放图
        $("#img_play").attr("src", "./img/playing2.gif");
    }
}
// 上一首
function lastMusic() {
    var step = getStep(); // 获取步长（不同模式的步长不相同）
    // - 运算可能得到负数，所以 +musicCount 后再取余，保证是非负数
    musicIndex = (musicIndex - step + musicCount) % musicCount;
    loadMusic();    // 加载音乐
    palyFlag = 0;   // 更新播放标志
    playMusic();    // 播放音乐
}
// 下一首
function nextMusic() {
    // 自动播放下一首，如果是顺序播放模式，播放完最后一首停止播放
    if ((audio.currentTime == audio.duration) && playStyle == 4 && musicIndex == musicCount - 1) {
        playMusic();
        return false;
    }
    var step = getStep(); // 获取步长（不同模式的步长不相同）
    musicIndex = (musicIndex + step) % musicCount;
    loadMusic();    // 加载音乐
    palyFlag = 0;   // 更新播放标志
    playMusic();    // 播放音乐
}

function clickplay() {
    var index = $(this).index(); // 获取点击的li的索引
    // 如歌点击的是当前正在播放/暂停的歌曲，则暂停/播放
    if ($("#musiclist li").eq(index).hasClass("list_playing")) {
        playMusic();
    } else {
        // 否者播放点击的歌曲
        musicIndex = index - 1;
        loadMusic();    // 加载音乐
        palyFlag = 0;   // 更新播放标志
        playMusic();    // 播放音乐
    }
}
// 显示歌曲信息
function showMessage() {
    // 音乐名称的格式为：歌手名 - 歌曲名
    var curmusicname = musicArray[musicIndex].split(/-/);
    $(".artist").html(curmusicname[0]); // 显示歌手名
    $(".title").html(curmusicname[1]); // 显示歌曲名
    // 渲染歌词列表
    $("#musiclist li").eq(musicIndex + 1).addClass("list_playing").siblings().removeClass("list_playing");
    $("#musiclist li span").removeClass("playinggif");
    // $(".list_playing>span:nth-child(1)").addClass("playinggif");
    if ($("#musiclist li")[musicIndex + 1].offsetTop > 457) {
        $("#musiclist").scrollTop($("#musiclist li")[musicIndex + 1].offsetTop - 456)
    } else {
        $("#musiclist").scrollTop(0);
    }
}

// 歌词部分
var timeArray = [],
    lrcArray = [];
var lrcline = 0;
// 加载歌词
function loadLrc() {
    lrcline = 0;
    try {
        var lrcdoc = getTextDoc(path + "lyric/" + musicArray[musicIndex] + ".lrc");
        // console.log(lrcdoc);
        timeArray = lrcdoc.match(/\[\d\d:\d\d.\d\d\]/g);
        lrcArray = lrcdoc.match(/\].{1,}/g);
        for (var i = 0; i < timeArray.length; i++) {
            timeArray[i] = timeArray[i].replace(/\[/g, "").replace(/\]/g, "");
            lrcArray[i] = lrcArray[i].replace(/\]/g, "");
        }
        console.log(timeArray);
        console.log(lrcArray);
        // 使用文档碎片，添加歌词
        var fragment = document.createDocumentFragment();
        $.each(lrcArray, function(i, item) {
            var newItem = $("<li>" + item + "</li>")[0];
            fragment.appendChild(newItem);
        });
        $("#lrc ul").html(fragment);
    } catch (e) { // 有可能找不到歌词
        timeArray = ['', '未找到歌词'];
        $("#lrc ul").html("");
        $("#lrc ul").html("未找到歌词");
    }
}
// 实时渲染歌词
function updateLrc(line) {
    $("#lrc li").removeClass("lrc_playing").eq(line).addClass("lrc_playing");
    if (line > 3) {
        $("#lrc").scrollTop((line - 3) * 30);
    } else {
        $("#lrc").scrollTop(0);
    }
}
// 改变播放风格
function changeStyle() {
    playStyle = (playStyle + 2) % 8;
    console.log(playStyleIcon[playStyle]);
    $("#btn_playstyle").html(playStyleIcon[playStyle]);
    $("#btn_playstyle").attr("title", playStyleIcon[playStyle + 1]);
}
// 调整音量
function adjustVolume() {
    $("audio")[0].volume = $("#volume")[0].value / 100;
}

// 静音
function soundoff() {
    if (soundFlag) {
        $("#btn_volme").html("&#xe65e;"); // 修改显示图标
        $("audio")[0].volume = 0;
        soundFlag = 0;
    } else {
        $("#btn_volme").html("&#xe662;");
        $("audio")[0].volume = $("#volume")[0].value / 100; // 根据音量条的值（0-100）恢复音量
        soundFlag = 1;
    }
}
// 获取步长，不同的播放模式有不同的步长
function getStep() {
    // 0：列表循环 2：随机播放 4：顺序播放 6：单曲循环
    // 得到单选按钮组，判断播放模式
    if (playStyle == 0 || playStyle == 4) {
        // 列表循环模式 或 顺序播放
        return 1;
    } else if (playStyle == 6) {
        // 单曲循环模式
        // 如果是单曲循环模式，还需要判断是否是手动点击了上/下一首
        // 通过时间判断，自动播放下一首一定是歌曲播放的当前时间等于总时间
        if (audio.currentTime != audio.duration) {
            return 1; // 手动播放上/下一首，尽管是单曲循环模式，但实际上应该真实的播放上/下一首
        } else {
            return 0; // 自动播放上/下一首，即单曲循环
        }
    } else if (playStyle == 2) {
        // 随机播放模式
        // return Math.floor(Math.random() * musicCount);
        // 避免随机播放下一曲仍是同一曲，步长step范围[1, musicCount - 1]
        return Math.floor(Math.random() * (musicCount - 2)) + 1;
    }
}
// 搜索支持
function search(event) {
    event = event ? event : window.event;
    var obj = event.srcElement ? event.srcElement : event.target;
    var words = obj.innerHTML;
    // 根据关键词百度搜索
    window.open("https://www.baidu.com/s?wd=" + words, "_blank")
    // window.open("https://baike.baidu.com/item/" + words, "_blank")  // 百度百科
}
