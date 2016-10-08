;(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define('JMscroller', [], function (jm) {
      return (root.JMscroller = factory(jm));
    });
  } else {
    root.JMscroller = factory();
  }
})(this, function(){
	var bd = document.getElementsByTagName("body")[0],
			head = document.getElementsByTagName("head")[0],
			_def = {
				'width':"4px",
				'height':'100%',
				'show':true,
				'auto':true,//是否自动创建
				'position':'outside',//inside,默认outside
				'right':'auto',
				'color':'rgba(255,255,255,0.7)',
				'bgColor':'rgba(0,0,0,0.7)',
				'top':"0px",
				'type':'normal',// 风格选择
				'speed':'normal',//默认是1,越大越快 
				'onScroll':function(){},
				'onBottom':function(){},
				'onTop':function(){}
			};
	//contructor
	function scroll(ele,opts){
		var def = _def,
				target,//目标
				outter = document.createElement("div"),//包裹层
				inner = document.createElement("div"),
				content = document.createElement("div"),//目标内容
				bg = document.createElement('div'),
				bar = document.createElement('div'),
				bgStyle = '',
				barStyle = '',
				speed = 1;//默认速度
		//复制配置
		if(opts){
			for(var key in opts){
				def[key] = opts[key];
			}
		}
		this.def = def;
		//速度
		this.speed = typeof def.speed == 'number' ? def.speed : (def.speed == 'fast' ? 2 : 1);
		//id
		target = (typeof document.querySelector == 'function' ? document.querySelector(ele) : document.getElementById(ele));
		//样式
		var bgStyleObj = {
				'position':'absolute',
				'width' : def.width,
				'height': def.height,
				'background-color':def.bgColor,
				'right':(def.right == 'auto' ? (def.position == 'outside' ? ("-" + def.width) : "0px") : def.right),
				'top':def.top,
				'display':(def.show ? 'block' :'none'),
				'overflow':'hidden',
				'visibility':'hidden',
				'border-radius':def.width,
				'-webkit-border-radius':def.width
			},
			barStyleObj = {
				'position':'absolute',
				'width' : "100%",
				'height': "10%",
				'background-color':def.color,
				'left':'0px',
				'top':"0px",
				'display':(def.show ? 'block' :'none'),
				'overflow':'hidden',
				'border-radius':def.width,
				'-webkit-border-radius':def.width
			}
		for(var key in bgStyleObj){
			bgStyle += (key + ":" + bgStyleObj[key] + ";");
		}
		for(var key in barStyleObj){
			barStyle += (key + ":" + barStyleObj[key] + ";");
		}
		outter.setAttribute("style","position: relative;left: 0;top: 0;width: 100%;height: 100%;");
		inner.setAttribute("style","position: absolute;left: 0;top: 0;width: 100%;height: 100%;overflow: hidden;");
		content.setAttribute("style","position: relative;left: 0;top: 0;width: 100%;height: auto;");
		bg.setAttribute("style",bgStyle);
		bar.setAttribute('style',barStyle);
		//添加内容父节点
		content.innerHTML = target.innerHTML;
		target.innerHTML = '';
		outter.appendChild(inner);
		outter.appendChild(bg);
		bg.appendChild(bar);
		inner.appendChild(content);
		target.appendChild(outter);
		//初始化
		this.Version = "1.0";
		this.Date = "written on 2016.9.30";
		this.target = target;
		this.content = content;
		this.bg = bg;
		this.bar = bar;
		this.tH = 0;//目标高度
		this.cH = 0;//内容高度
		this.bH = 0;//滚动条高度
		this.curP = 0;//当前位置
		this.lastP = '';//最后一个点
		this.scaleY = -1;//内容与滚动条高比
		//init
		def.auto && this.init();
	}
	//私有方法
	var _translate = function(obj,num){
		obj.style.transform = "translateY(" + num + "px)";
		obj.style.webkitTransform = "translateY(" + num + "px)";
	}

	//重写原型,添加公共方法
	scroll.fn = scroll.prototype = {
		"init":function(){
			this.resize();
			var _t = this;
			this.target.addEventListener("touchstart",function(e){
				var e = e || event;
				e.preventDefault();
				_t.lastP = e.touches[0].clientY;
				return false;
			},false);
			this.target.addEventListener("touchmove",function(e){
				var e = e || event;
				e.preventDefault();
				var y = e.touches[0].clientY;
				if(_t.lastP){
					var temp = _t.curP +(y - _t.lastP)*_t.speed;
					if(temp <= 0 && temp >= _t.tH - _t.cH){
						_t.curP += (y - _t.lastP)*_t.speed;
						_translate(_t.content,_t.curP);
						_translate(_t.bar,_t.curP*_t.scaleY);
						_t.lastP = y;
						typeof _t.def.onScroll == 'function' && _t.def.onScroll();
					}else{
						if(temp > 0){
							_translate(_t.content,0);
							_translate(_t.bar,0);
							(_t.curP != 0 && typeof _t.def.onTop == 'function') && _t.def.onTop();
							_t.curP = 0;
						}else{
							var _b = _t.tH - _t.cH;
							_translate(_t.content,_b);
							_translate(_t.bar,_b*_t.scaleY);
							(_t.curP != _b && typeof _t.def.onBottom == 'function') && _t.def.onBottom();
							_t.curP = _b;
						}
					}
				}else{
					_t.lastP = y;
				}
				_t.lastP = e.touches[0].clientY;
				return false;
			},true);
			//初始化完毕再显示
			this.bg.style.visibility = "visible";		
		},
		"resize":function(){
			var _t = this;
			_t.tH = _t.target.offsetHeight;
			_t.cH = _t.content.offsetHeight;
			_t.bH = _t.bg.offsetHeight;
			_t.bar.style.height = _t.bH*(_t.tH/_t.cH) + "px";
			_t.scaleY = -(_t.bH/_t.tH)*(_t.tH/_t.cH);
			console.log("resize");
		}
	}
	return scroll;
})