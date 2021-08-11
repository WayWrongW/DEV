<template>
	<view class="content">
		<view class="backarrow" @tap="relunch"><image src="../../static/backArrow.png"></image><text>返回</text></view>
		<view class="m_c_title">
			<view><image src="../../static/title_l.png"></image></view>
			<text @longtap="setIP">手动测量</text>
			<view><image src="../../static/title_r.png"></image></view>
		</view>
		<view style="display: flex;">
			<view style="width:550rpx ;">
				<view style="margin-left: 3rpx;width: 535rpx;height: 200rpx;background-image: url(../../static/mainbox.png) ;background-size: 100% 100%;">
					<view style="font-size: 16rpx;font-family: ZHSRXT-GBK;font-weight: bold;color: #00FFFF;line-height: 24rpx;margin-left: 5rpx;">测量结果</view>
					<view class="imgcontent" style="display: flex;">
						<image :src="photosrc" class="flip"></image>
					<image :src="snapshot" @tap="takephoto" class="flip"></image>
					<!-- <web-view src="https://threejs.org/examples/webgl_geometry_extrude_shapes2.html"></web-view> -->
					</view>
				</view>
				<view style="width: 540rpx;height: 150rpx;background-image: url(../../static/rect.png);background-size: 100% 100%;overflow: hidden;">
					<scroll-view scroll-y="true"  class="log">
						<view v-for="(log,index) in logs" class="" :key="index" @tap="showlog(index)">
							{{log.strResult}}
						</view>
					</scroll-view>
				</view>
			</view>
			<view style="margin-top: -50rpx;width: 150rpx;height: 400rpx;background-image: url(../../static/mainbox_r.png);background-size: 100% 100%;" >
				<view style="margin: 10rpx;">
					<radio-group @change="radioChange">
					<view class="r_box">
						<label :class="choise=='RoofLevel' ? 'radiochecked':''"><radio value="RoofLevel" /><text>顶板水平度</text></label>
						<label :class="choise=='GroundLevel' ? 'radiochecked':''"><radio value="GroundLevel" /><text>地面水平度</text></label>
						
					</view>
					<view class="r_box">
						<label :class="choise=='WallVertical' ? 'radiochecked':''"><radio value="WallVertical" /><text>竖墙垂直度</text></label>
					</view>
					<view class="r_box">
						<label :class="choise=='TopPlateFlatness' ? 'radiochecked':''"><radio value="TopPlateFlatness" /><text>顶板平面度</text></label>
						<label :class="choise=='GroundFlatness' ? 'radiochecked':''"><radio value="GroundFlatness" /><text>地面平面度</text></label>
						<label :class="choise=='SideWallFlatness' ? 'radiochecked':''"><radio value="SideWallFlatness" /><text>侧墙平面度</text></label>
					</view>
					<view class="r_box">
						<label :class="choise=='ExternalCorner' ? 'radiochecked':''"><radio value="ExternalCorner" /><text>阳角角度</text></label>
						<label :class="choise=='InsideCorner' ? 'radiochecked':''"><radio value="InsideCorner" /><text>阴角角度</text></label>
						
					</view>
					<view class="r_box">
						<label :class="choise=='DoorSize' ? 'radiochecked':''" class="unable"><radio value="DoorSize" disabled="true" /><text>门尺寸</text></label>
						<label :class="choise=='WindowSize' ? 'radiochecked':''" class="unable"><radio value="WindowSize" disabled="true"/><text>窗尺寸</text></label>
						
					</view>
					</radio-group>
					
				</view>
				<button class="btn_l" :class="startReady" :disabled="startReady=='ready'? false : true" @click="submit_measure">{{buttonTxt}}</button>
			</view>
		</view>
	</view>
</template>

<script>
	// #ifdef H5
	import mqtt from "mqtt"
	// console.log(this.$host)
	var client  = mqtt.connect('ws://192.168.10.86:8000')
	// #endif
	// #ifdef MP-WEIXIN||APP-PLUS
	var mqtt = require('mqtt/dist/mqtt.js')
	var client  = mqtt.connect('wx://192.168.10.86:8000')
	// #endif
	// import html2Canvas from 'html2canvas'
	export default {
		data() {
			return {
				title: 'Hello',
				photosrc:'http://192.168.10.86:8080/?action=stream',
				logs: [],
				snapshot:'http://192.168.10.86:8080/?action=snapshot',
				startReady:"busy",
				choise:'GroundFlatness',
				buttonTxt:"网络断开",
				measuerResult:{
						"RoofLevel" :{name:"顶板水平度",unit:"°",accuracy:2},
						"GroundLevel":{name:"地面水平度",unit:"°",accuracy:2},
						"WallVertical":{name:"竖墙垂直度",unit:"°",accuracy:2},
						"TopPlateFlatness":{name:"顶板平面度",unit:"mm",accuracy:2},
						"GroundFlatness":{name:"地面平面度",unit:"mm",accuracy:2},
						"SideWallFlatness":{name:"侧墙平面度",unit:"mm",accuracy:2},
						"ExternalCorner":{name:"阳角角度",unit:"°",accuracy:2},
						"InsideCorner":{name:"阴角角度",unit:"°",accuracy:2},
						"DoorSize" :{name:"门尺寸",unit:"mm",accuracy:2},
						"WindowSize" :{name:"窗尺寸",unit:"mm",accuracy:2}
				},
				post_temp:{ "code": 0, "context": { "id": 1614325611, "op": "measure", "params": [ "GroundFlatness" ] } }
			}
		},
		onLoad() {
			this.connect()
			
		},
		onShow() {
			// this.connect()
		},
		methods: {
			setIP(){
				uni.showModal({
					
				})
			},
			relunch(){
				uni.reLaunch({
					url:"./index"
				})
				
			},
			showlog(index){
				this.snapshot=this.logs[index].snapshot
			},
			connect(){
				var self = this
				client.on('connect', function() {
						self.logs.unshift('on connect')
							uni.hideLoading()
							self.startReady="ready"
							self.buttonTxt="测量"
						client.subscribe('iot/zhushi/scanner/1/#', function(err) {
							// if (!err) {
							// 	client.publish('presence', 'hello mqtt')
							// }
							
						})
					}).on('reconnect', function() {
						self.logs.unshift({"strResult":'on reconnect'})
					}).on('error', function() {
						self.logs.unshift({"strResult":'on error'})
						self.startReady="busy"
						self.buttonTxt="网络错误"
					}).on('end', function() {
						// self.logs.push('on end')
						self.startReady="busy"
						self.buttonTxt="网络断开"
					}).on('close', function() {
						self.logs.unshift({"strResult":'on close'})
						self.startReady="busy"
						self.buttonTxt="网络断开"
					}).on('message', function(topic, message) {
						console.log(message.toString())
						message=JSON.parse(message)
						switch (topic){
							case "iot/zhushi/scanner/1/status":
							if(message.code==0){
								self.startReady=message.context.status
								if(self.startReady=="busy"){
									uni.showLoading({
										title:"测量中"
									})
									self.buttonTxt="测量中"
									self.takephoto()
								}
								if(self.startReady=="ready"){
									uni.hideLoading()
									self.buttonTxt="测量"
								}
							}
							
							break
							case "iot/zhushi/scanner/1/result":
							uni.hideLoading()
							self.startReady="ready"
							self.buttonTxt="测量"
							if(message.code==0){
								var measure=self.measuerResult[message.context.result[0].name]
								var strResult=measure.name+':'+message.context.result[0].value.toFixed(measure.accuracy)+measure.unit
								if(message.context.result[0].optional){
									if(message.context.result[0].optional.b){
										strResult=measure.name+',横:'+message.context.result[0].value.toFixed(measure.accuracy)+measure.unit;
										
										strResult+='\r\n竖:'+message.context.result[0].optional.b.toFixed(measure.accuracy)+measure.unit
									}
									if(message.context.result[0].optional.d){							
										strResult+='\r\n斜:'+message.context.result[0].optional.d.toFixed(measure.accuracy)+measure.unit
									}
									if(message.context.result[0].optional.f){
										strResult+='\r\n反斜:'+message.context.result[0].optional.f.toFixed(measure.accuracy)+measure.unit
									}
									if(message.context.result[0].optional.avg){
										strResult+="  平均值:"+message.context.result[0].optional.avg.toFixed(measure.accuracy)
									}
									if(message.context.result[0].optional.min){
										strResult+="  最小值:"+message.context.result[0].optional.min.toFixed(measure.accuracy)
									}
									if(message.context.result[0].optional.max){
										strResult+="  最大值:"+message.context.result[0].optional.max.toFixed(measure.accuracy)
									}
									if(message.context.result[0].optional.max){
										strResult+="  最大值:"+message.context.result[0].optional.max.toFixed(measure.accuracy)
									}
									if(message.context.result[0].optional.width){
										strResult+="  长:"+message.context.result[0].optional.width.toFixed(measure.accuracy)
									}
									if(message.context.result[0].optional.height){
										strResult+="  宽:"+message.context.result[0].optional.height.toFixed(measure.accuracy)
									}
								}
								self.logs.unshift({"strResult":strResult,"snapshot":self.snapshot})
							}else{
								self.logs.unshift({"strResult":"测量失败！","snapshot":self.snapshot})
							}
							
							break
						}
						
						
						// self.logs.push(message.toString())
					})
			},
			radioChange(e){
				console.log(e.target)
				this.choise=e.target.value
				this.post_temp.context.params[0]=this.choise
			},
			submit_measure(){
				var timestamp=new Date().getTime()
				this.post_temp.context.id=Math.round(timestamp/1000)
				client.publish('iot/zhushi/scanner/1/control', JSON.stringify(this.post_temp))
			},
			takephoto(){
				var self=this
				var timestamp=new Date().getTime()
				uni.getImageInfo({
					src: 'http://192.168.10.86:8080/?action=snapshot&timestamp='+timestamp,
					success: function (image) {
						console.log('imagepath',image.path)
						self.snapshot=image.path
						// return image.path
					},
					fail:function() {
						console.log('fail')
					},
					complete:function(){
						console.log('complete')
					}
				});
			},
			 saveDomImage (html2Canvas, dom, fileName) {  //使用之前要引入 html2Canvas.js  
			        if(mui.os.plus){  
			            if (typeof html2Canvas == null)  
			                throw Error("html2Canvas is not defined");  
			            if (dom == null)  
			                throw Error("saveDomImage param : dom is null");  
			            if (fileName == null || fileName == "")  
			                fileName = "untitled.png";  
			
			            var getPixelRatio = function(context) {  
			                var backingStore = context.backingStorePixelRatio ||  
			                    context.webkitBackingStorePixelRatio || 1;  
			                return (window.devicePixelRatio || 1) / backingStore;  
			            };  
			
			            var _canvas = document.createElement('canvas');  
			
			            var ctx = _canvas.getContext('2d');  
			            var ratio = getPixelRatio(ctx);  
			            ctx.scale(ratio,ratio);  
			
			            var w = dom.offsetWidth;  
			            var h = dom.offsetHeight;  
			
			            _canvas.width = w;  
			            _canvas.height = h;  
			            _canvas.style.width = w *　ratio + 'px';  
			            _canvas.style.height = h　*　ratio + "px";  
			
			            html2Canvas(dom, {  
			                allowTaint:true,  
			                logging: false,  
			                profile: true,  
			                useCROS: true,  
			                canvas : _canvas,  
			                onrendered: function (canvas) {  
			                    var dataUrl = canvas.toDataURL();  
			                    var b = new plus.nativeObj.Bitmap('bitblmap');  
			
			                    b.loadBase64Data(dataUrl, function () {  
			                        /*这里一定要是_doc目录*/  
			                        b.save("_doc/" + fileName, {overwrite: true}, function (object) {  
			                            //保存到相册  
			                            plus.gallery.save("_doc/" + fileName, function () {  
			                                mui.toast("图片已保存到相册");  
			                            }, function () {  
			                                mui.toast("图片保存失败");  
			                            });  
			                        }, function () {  
			                            mui.toast("图片保存失败");  
			                        });  
			                    }, function () {  
			                        mui.toast("图片保存失败");  
			                    });  
			                }  
			            });  
			        }  
			    }
			
		}
	}
	
</script>   

<style>
	.unable{
		background-color: #999999;
		color: #333333;
		opacity: 0.3;
	}
	.flip{
		transform: rotateX(180deg);
	}
	.busy{
		background-image: url(../../static/bg2.jpg) !important;
	}
	.btn_l{
		margin: 0 auto;
		width: 90%;
		height: 28rpx;
		background-image: url(../../static/btn_l.png);
		background-size: 100% 100%;
		margin-bottom: 0;
		line-height: 28rpx;
	}
	.log{
		color: white;
		margin: 5rpx;
	}
.imgcontent image, web-view{
	margin: 4rpx;width: 262rpx;max-height: 172rpx;}
	.r_box{
		margin-top: 10rpx;
		background-image: url(../../static/r_box.png);background-size: 100% 100%;
		color: white;
	}
	.r_box radio{
		display: none;
	}
	.r_box:first-child{
		margin-top: 40rpx;
	}
	.r_box label{
		display: block;
		text-align: center;
		font-size: 18rpx;
		line-height: 28rpx;
		
	}
	.radiochecked{
		background-color:rgba(0, 255, 255, 0.3);
	}
	.m_c_title{
		margin: 24rpx auto;
		display: flex;
		color: #FFFFFF;
		font-size: 25rpx;
		line-height: 25rpx;
	}
	.m_c_title image{
		width: 45rpx;
		height:25rpx;
	}
	.m_c_title text{
		margin:0 15rpx;
	}
	.backarrow{
		position: fixed;
		left: 35rpx;
		top: 26rpx;
		height: 29rpx;;
	}
	.backarrow image{
		width: 24.5rpx;
		height: 29rpx;
	}
	.backarrow text{
	color: #00FFFF;
	font-size: 28rpx;
	display:inline-block;
	margin-left: 6rpx;
	text-align: center;
	vertical-align: text-bottom;
	opacity: .6;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
