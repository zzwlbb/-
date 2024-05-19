// console.log(lrc);

/**
 *  解析歌词字符串
 *  得到歌词对象数组
 *  {time:开始时间,word:歌词}
 */

function parseLrc() {
    //得到一个数组，每个数组都是字符串
    const lines = lrc.split('\n')
    //把obj里面的属性都push到数组里面去
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const str = lines[i];
        //再次分割  歌词part[1]
        const pasts = str.split(']')
        // 分割变成 时间
        const timeStr = pasts[0].substring(1);
        const obj = {
            time: parseTime(timeStr),
            word: pasts[1]  //循环了没个歌词给obj对象
        }
        result.push(obj)
    }
    return result
}

/**
 * 解析时间
 * 将时间字符串解析成数字
 */

function parseTime(timeStr) {
    // timeStr 04:20.9 这种类型
    const pasts = timeStr.split(':')
    //得到数组 注意 要转成数字
    return +pasts[0] * 60 + +pasts[1];
}

const LrcData = parseLrc();
// console.log(LrcData);

/**
 * 获取需要的dom
 */
const doms = {
    audio: document.querySelector('audio'),
    ul: document.querySelector('ul'),
    container: document.querySelector('.container')
}


/**
 * 计算出当前情况下
 * data数组中 应该显示的高亮歌词下标
 * 如果没有歌词显示 下标为-1
 */
function findIdex() {
    // audio 中currentTime 显示的是当前播放的时间
    const curTime = doms.audio.currentTime;
    for (let i = 0; i < LrcData.length; i++) {
        if (LrcData[i].time > curTime) {
            return i - 1;
        }
    }
    //最后一句就是他自己的长度-1的下标
    return LrcData.length - 1;
}
//返回的是一个数，当前高亮歌词的时间下标


/**
 * 创建界面元素显示出来
 */

function createLrcElements() {
    /*
    * 创建一个文档片段 用来收集加载出来的节点
    * 防止for循环多次更改dom树
    * 用文档片段接收，暂时不会更改dom树
    * 将收集来的数据一次交给ul
    */
    const frag = document.createDocumentFragment();
    for (let i = 0; i < LrcData.length; i++) {
        const li = document.createElement('li');
        li.innerHTML = LrcData[i].word;
        frag.appendChild(li);
    }
    doms.ul.appendChild(frag);
}
createLrcElements();



//获得容器高度 
const containerHegiht = doms.container.clientHeight;
//获得li 高度 
const liHegiht = doms.ul.children[0].clientHeight;

/**
 * 设置ul偏移量
 * 偏移量 = li前面的所有li的高度 + 自身的一半 - 容器的一半
 */

//最大偏移量 = ul的高度 - 容器高度
const maxOffset = doms.ul.clientHeight - containerHegiht

function setOffSet() {
    //得到当前下标
    const index = findIdex();
    let offSet = liHegiht * index + liHegiht / 2 - containerHegiht / 2;
    if (offSet < 0) {
        offSet = 0;
    }
    //最大偏移量
    doms.ul.style.transform = `translateY(-${offSet}px)`

    // 排他
    const li = doms.ul.querySelector('.active')
    if (li) {
        li.classList.remove('active')
    }
    //添加样式 注意index中有-1
    const liIndex = doms.ul.children[index];
    if (liIndex) {
        liIndex.classList.add('active')
    }

}


//点击事件
doms.audio.addEventListener('timeupdate', setOffSet)