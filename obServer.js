class ObServer{
	constructor(data){
		this.observe(data);
	}
	//要对这个data数据将原有属性改成set和get的形式
	observe(data){
		if(!data || typeof data !== 'object'){
			return ;
		}
		//要将数据劫持，先获取data的key和value
		Object.keys(data).forEach(key => {
			this.defineReactive(data, key, data[key]);
			this.observe(data[key]);//深度递归劫持
		});
	}
	//定义响应式
	defineReactive(obj,key,value){
		//在获取某个值
		let _this = this;
		let dep = new Dep();//相当于每一个变化的数据 都会对应一个数组，这个数组是存放所有更新的操作
		Object.defineProperty(obj, key, {
			enumerable: true,
			configurable: true,
			get(){//获取值调用的方法
				Dep.target && dep.addSub(Dep.target);
				return value;
			},
			set(newValue){
				if(newValue!=value){//当data属性中设置值得时候，改变获取属性的值
					//这里的this不是实例
					_this.observe(newValue);//如果是对象继续劫持
					value = newValue;
					dep.notify();//通知所有人数据更新了
				}
			}
		});
	}
}
class Dep{
	constructor(){
		//订阅的数组
		this.subs = [];
	}
	addSub(watcher){
		this.subs.push(watcher);
	}
	notify(){
		this.subs.forEach(watcher=>watcher.update());
	}
}