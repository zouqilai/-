class Compile{
	constructor(el, vm){
		this.el = this.isElementNode(el)?el:document.querySelector(el);
		this.vm = vm;
		if(this.el){
			//如果这个元素存在的话，开始编译
			//1.先把真是的Dom移入内存，fragment 文档随便
			let fragment = this.node2fragment(this.el);
			//2.编译=>提取想要的元素节点 v-modle 和文本节点{{}}
			this.compile(fragment);
			//3.把编译好的fragment在塞回页面中去
			this.el.appendChild(fragment);
		}
	}
	/*专门写辅助方法*/
	//判断是不是一个元素节点
	isElementNode(node){
		return node.nodeType === 1;
	}
	//是不是一个指令 /^v-/.test(name)
	isDirective(name){
		return name.includes('v-');
	}
	//专心写核心方法
	//编译节点
	compileElement(node){
		//带v-model
		let attrs = node.attributes;
		Array.from(attrs).forEach(attr => {
			//console.log(attr.name,attr.value);
			let attrName = attr.name;
			//判断属性是不是包含v-
			if(this.isDirective(attrName)){
				//取到相应的值放到节点
				let expr = attr.value;
				let type = attrName.slice(2);
				//node vm.$data expr v-model v-html
				//todo .....
				CompileUtil[type](node,this.vm,expr);
			}
		});
	}
	//编译文本
	compileText(node){
		let expr = node.textContent;//取文本内容
		let reg = /\{\{([^}]+)\}\}/g;
		if(reg.test(expr)){
			//node this.vm.$data text
			//todo .....
			CompileUtil['text'](node,this.vm,expr);
		}
	}
	//编译=>提取想要的元素节点 v-modle 和文本节点{{}}
	compile(fragment){
		let childNodes = fragment.childNodes;//只支持第一层  例如只能找到ul
		Array.from(childNodes).forEach(node => {
			if(this.isElementNode(node)){
				//是元素节点,需深入检查
				//这里需要编译元素
				this.compileElement(node);
				this.compile(node);
			}else{
				//这里需要编译文本
				//文本节点
				this.compileText(node);
			}
		});
	}
	node2fragment(el){
		let fragment = document.createDocumentFragment();
		let firstChild;
		while(firstChild = el.firstChild){
			fragment.appendChild(firstChild);
		}
		return fragment;
	}
}

CompileUtil = {
	getVal(vm,expr){//处理数据中{{a.a.a}}的a.a.a这样的数据
		expr = expr.split('.');
		return expr.reduce((prev,next) => {//vm.$data
			return prev[next];
		}, vm.$data);
	},
	getTextVal(vm, expr){
		return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
			return this.getVal(vm, arguments[1]);
		});
	},
	text(node, vm, expr){//文本处理
		let updateFn = this.updater['textUpdater'];
		//mes.a => [mes,a] vm.$data.mes.a
		//vm.$data[expr]
		let value = this.getTextVal(vm,expr);

		expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
			new Watcher(vm,arguments[1],(newValue)=>{
				//如果文本节点数据变化了，文本节点需要重新获取依赖的属性更新文本中得内容
				updateFn && updateFn(node, this.getTextVal(vm, expr));
			});
		});

		updateFn && updateFn(node, value);
	},
	setVal(vm, expr, value){
		expr = expr.split('.');
		return expr.reduce((prev,next,currentIndex)=>{
			if(currentIndex===expr.length-1){
				return prev[next] = value;
			}
			return prev[next];
		},vm.$data);
	},
	model(node, vm, expr){//输入框处理
		let updateFn = this.updater['modelUpdater'];
		//mes.a => [mes,a] vm.$data.mes.a
		//vm.$data[expr]
		//这里应该加一个相应的监控，数据变化了，应该调用这个watcher的callback
		new Watcher(vm,expr,(newValue) => {
			//当值变化后会调用cb 将新值传递过来
			updateFn && updateFn(node, this.getVal(vm,expr))
		});

		node.addEventListener('input',(e)=>{
			let newValue = e.target.value;
			this.setVal(vm,expr,newValue);
		});

		updateFn && updateFn(node, this.getVal(vm,expr));
	},
	updater:{
		//文本更新
		textUpdater(node, value){
			node.textContent = value;
		},
		//输入框更新
		modelUpdater(node, value){
			node.value = value
		}
	}
};