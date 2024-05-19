// console.log(goods);
/**
 * 避免直接操作原数据
 */

class UIGoods {
  //构造函数 开头大写 往原型上给方法
  constructor(g) {
    this.data = g;
    //商品个数
    this.choose = 0;
  };
  //如果直接添加总价会造成数据冗余，建议写成函数
  //关系就是 选择的个数加上价格 = 单个总价
  getTotalPrice() {
    return this.data.price * this.choose;
  };
  //是否选中商品
  isChoose() {
    return this.choose > 0;
  };
  //选择的数量+1
  increase() {
    this.choose++;
  };
  //选择的数量-1
  decrease() {
    if (this.choose === 0) {
      return
    }
    this.choose--;
  }
}
//整个界面的数据
class UIData {
  constructor() {
    let uiGoods = [];
    //遍历每个数据
    for (let i = 0; i < goods.length; i++) {
      let uig = new UIGoods(goods[i]);
      uiGoods.push(uig);
    }
    //将数组保存到UIData方法中去
    this.uiGoods = uiGoods;
    //起送费
    this.deliveryThreshould = 30;
    //配送费
    this.deliveryPrice = 5
  };
  // 得到总价
  getTotalPrice() {
    //计算商品总价
    let sum = 0;
    for (let i = 0; i < this.uiGoods.length; i++) {
      //得到每个商品单个总价
      const g = this.uiGoods[i];
      sum += g.getTotalPrice();
    };
    return sum;
  };
  //增加某件商品的选中数量
  increase(index) {
    this.uiGoods[index].increase();
  };
  //减少某件商品的选中数量
  decrease(index) {
    this.uiGoods[index].decrease();
  }

  //获取购物车里面的总商品个数
  getTotalChooseNumber() {
    let sum = 0;
    for (let i = 0; i < this.uiGoods.length; i++) {
      //商品每一个选中数量
      sum += this.uiGoods[i].choose
    }
    return sum;
  }
  //购物车里面有没有东西 返回true ..
  hasGoodsInCar() {
    return this.getTotalChooseNumber() > 0
  }
  //是否跨越了起送门槛
  isCroseDeliveryThreshold() {
    return this.getTotalPrice() >= this.deliveryThreshould
  }
  //是否选中 true false
  isChoose(index) {
    return this.uiGoods[index].isChoose();
  }
}
// 整个界面
class UI {
  constructor() {
    this.UIData = new UIData();
    this.doms = {
      goodsContainer: document.querySelector('.goods-list'),
      deliveryPrice: document.querySelector('.footer-car-tip'),
      footerPay:document.querySelector('.footer-pay'),
      footerPayInterSpan:document.querySelector('.footer-pay span'),
      totalPrice:document.querySelector('.footer-car-total'),
      car: document.querySelector('.footer-car'),
      badge: document.querySelector('.footer-car-badge')
    };

    //得到购物车元素的矩形 getBoundingClientRect()
    const carRect = this.doms.car.getBoundingClientRect();
    const jumpTarget = {
      //横坐标+自身一般的宽 = 它的x坐标
      x: carRect.left + carRect.width / 2,
      y: carRect.top + carRect.height / 5
    }
    this.jumpTarget = jumpTarget;

    this.createHTML();
    this.updateFooter();
    this.listenEvent();
  };
  //监听事件 
  listenEvent(){
    this.doms.car.addEventListener('animationend',function(){
      //this指向 car
      this.classList.remove('animate');
    });
  }

  //根据商品数据创造列表元素
  createHTML() {
    let html = '';
    for (let i = 0; i < this.UIData.uiGoods.length; i++) {
      let g = this.UIData.uiGoods[i];
      html += `<div class="goods-item">
      <img src="${g.data.pic}" alt="" class="goods-pic">
      <div class="goods-info">
        <h2 class="goods-title">${g.data.title}</h2>
        <p class="goods-desc">${g.data.desc}</p>
        <p class="goods-sell">
          <span>月售 ${g.data.sellNumber}</span>
          <span>好评率${g.data.favorRate}%</span>
        </p>
        <div class="goods-confirm">
          <p class="goods-price">
            <span class="goods-price-unit">￥</span>
            <span>${g.data.price}</span>
          </p>
          <div class="goods-btns">
            <i index="${i}" class="iconfont i-jianhao"></i>
            <span>${g.choose}</span>
            <i index="${i}" class="iconfont i-jiajianzujianjiahao"></i>
          </div>
        </div>
      </div>
    </div>`
    }
    this.doms.goodsContainer.innerHTML = html
  }
  increase(index) {
    this.UIData.increase(index);
    this.updateGoodsItem(index)
    this.updateFooter();
    this.jump(index);
  };
  decrease(index) {
    this.UIData.decrease(index);
    this.updateGoodsItem(index)
    this.updateFooter();
  };
  //更新商品元素的显示状态
  updateGoodsItem(index) {
    //拿到子元素渲染
    const goodsDom = this.doms.goodsContainer.children[index];
    //判断是否选中
    if (this.UIData.isChoose(index)) {
      goodsDom.classList.add('active');
    } else {
      goodsDom.classList.remove('active');
    }
    const span = goodsDom.querySelector('.goods-info span');
    //渲染商品个数
    span.textContent = this.UIData.uiGoods[index].choose;
  }
  //更新页脚
  updateFooter() {
    const total = this.UIData.getTotalPrice();
    this.doms.deliveryPrice.innerHTML = `
    配送费为￥${this.UIData.deliveryPrice}
    `;
    //是否超过起送点
    if(this.UIData.isCroseDeliveryThreshold()) {
      this.doms.footerPay.classList.add('active');
    }else {
      this.doms.footerPay.classList.remove('active');
      //设置起送费还差多少
      let dis =this.UIData.deliveryThreshould - total;
      dis = Math.round(dis)
      this.doms.footerPayInterSpan.innerHTML = `还差￥${dis}起送`
    }
    //设置总价 保持两位小数
    this.doms.totalPrice.innerHTML = total.toFixed(2);
    //设置购物车样式
    if(this.UIData.hasGoodsInCar()) {
      this.doms.car.classList.add('active');
    }else {
      this.doms.car.classList.remove('active');
    }
    //设置购物车
    this.doms.badge.innerHTML = this.UIData.getTotalChooseNumber();
  }

  //购物车动画
  carAnimate(){
    this.doms.car.classList.add('animate');
  }
  //加号跳跃
  jump(index){
    //找到对应商品加号
    const btnAdd = this.doms.goodsContainer.children[index].querySelector('.i-jiajianzujianjiahao');
    //得到加号元素的矩形
    const rect = btnAdd.getBoundingClientRect();
    const start = {
      x:rect.top,
      y:rect.top
    };
    //跳
    const div = document.querySelector('div');
    div.className = 'add-to-car';
    const i = document.querySelector('i');
    i.className = 'iconfont i-jiajianzujianjiahao';
    //设置初始位置
    div.style.transform = `translateX(${start.x}px)`
    i.style.transform = `translateY(${start.y}px)`
    div.appendChild(i)
    document.body.appendChild(div)
    //强行渲染 有他的任何一个属性 都会强行渲染
    //或者 h5中的 requestAnimationFrame
    div.clientWidth;

    //设置结束位置
    div.style.transform = `translateX(${this.jumpTarget.x}px)`
    i.style.transform = `translateY(${this.jumpTarget.y}px)`

    const that = this;
    div.addEventListener('transitionend',function(){
      div.remove();
      that.carAnimate();
    },{
      //表示事件只触发一次 防止冒泡
      once:true
    });
  }
}
const ui = new UI();

ui.doms.goodsContainer.addEventListener('click',function(e){
  if(e.target.classList.contains('i-jiajianzujianjiahao')) {
    var index = +e.target.getAttribute('index')
    ui.increase(index)
  }else if (e.target.classList.contains('i-jianhao')) {
    var index = +e.target.getAttribute('index')
    ui.crease(index)
  }
});

window.addEventListener('keypress', function (e) {
  if (e.code === 'Equal') {
    ui.increase(0);
  } else if (e.code === 'Minus') {
    ui.decrease(0);
  }
});



