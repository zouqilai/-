//观察者的目的就是给需要变化的dom或者元素增加一个观察者，当数据变化后，执行对应的方法
class Watcher{
	constructor(vm,expr,cb){
		this.vm = vm;
		this.expr = expr;
		this.cb = cb;
		//先获取老的值
		this.value = this.get();
	}
	getVal(vm,expr){//处理数据中{{a.a.a}}的a.a.a这样的数据
		expr = expr.split('.');
		return expr.reduce((prev,next) => {//vm.$data
			return prev[next];
		}, vm.$data);
	}
	get(){
		Dep.target = this;
		let value = this.getVal(this.vm,this.expr);
		Dep.target = null;
		return value;
	}
	//对外暴露的方法
	update(){
		let newValue = this.getVal(this.vm,this.expr);
		let oldValue = this.value;
		if(newValue!=oldValue){
			this.cb(newValue);
		}
	}
}
//用新值和老值对比 如果变化，调用更新方法
//vm.$data expr