class MVVM{
	constructor(options){
		//上来先把可用的东西挂在实例上
		this.$el = options.el;
		this.$data = options.data;

		//如果有需要编译的模板，开始编译
		if(this.$el){
			//数据劫持 把的对象的所有属性，改成get和set方法
			new ObServer(this.$data);
			this.proxyData(this.$data);
			//用数据和元素进行编译
			new Compile(this.$el, this);
		}
	}
	proxyData(data){
		Object.keys(data).forEach(key=>{
			Object.defineProperty(this,key,{
				get(){
					return data[key];
				},
				set(newValue){
					data[key] = newValue;
				}
			});
		});
	}
}