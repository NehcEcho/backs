接口地址：https://api.znhaas.net:2443
登录
登录
Path：/login
Method：POST
接口描述：登录。采用 Basic Auth 认证机制。
请求参数：
表格
参数名称	参数值	是否必须
Authorization	"Basic" + “' 用户名：密码 ' 使用 Base64 编码后的字符串 “	是
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	是	-
├ token	String	是	token，用于后续接口请求的 Authorization Header 中（Bearer Token）
├ username	String	是	用户名
用户管理
获取用户个人相关信息
Path：/v1/user
Method：GET
接口描述：获取用户个人属性信息，及与个人相关的公司、角色信息。
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	否	用户信息
├ id	Number	是	用户 ID
├ createdAt	String	是	创建时间
├ updatedAt	String	是	更新时间
├ username	String	是	用户账号
├ email	String	否	email 地址
├ phone	String	否	电话号
├ enable	Boolean	是	是否启用
├ companyId	Number	是	公司 ID
├ companyName	String	是	公司名称
├ companyAdminUserName	String	否	公司管理员的账号
├ role	Object	是	角色信息
├ id	Number	是	角色 ID
├ roleKey	String	是	角色代码
├ roleName	String	是	角色名称
├ remark	String	否	备注
修改用户密码
Path：/v1/users/{username}/password
Method：PUT
接口描述：修改用户密码
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
password	String	是	密码
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
设备管理
获取用户个人相关的分组及设备信息
Path：/v1/user/devices
Method：GET
接口描述：获取用户个人相关的分组及设备信息。
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	否	分组及设备信息
├ groups	Object []	否	分组信息
├ id	Number	是	分组 ID
├ groupName	String	是	分组名称
├ devices	Object []	是	设备信息
├ id	Number	是	设备 ID（数据库自增）
├ createdAt	String	是	创建时间
├ updatedAt	String	是	更新时间
├ deviceId	String	是	设备 ID（业务）
├ deviceName	String	是	设备名称
├ productId	Number	是	产品 ID
├ productCode	String	是	产品代码
├ productName	String	是	产品名称
├ protocol	String []	是	通信协议
├ longitude	String	是	经度
├ latitude	String	是	纬度
├ latestData	Object	是	设备上传的原始数据（GNSS_UP 消息）
├ status	String	是	状态，在线时值为 Online，离线时值为 Offline
获取指定设备信息
Path：/v1/devices/{id}
Method：GET
接口描述：获取指定设备的信息
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
id	12	设备 ID（数据库自增）
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	否	-
├ id	Number	是	设备 ID（数据库自增）
├ createdAt	String	是	创建时间
├ updatedAt	String	是	更新时间
├ companyId	Number	是	公司 ID
├ companyName	String	是	公司名称
├ deviceId	String	是	设备 ID（业务）
├ deviceName	String	是	设备名称
├ productId	Number	是	产品 ID
├ productCode	String	是	产品代码
├ productName	String	是	产品名称
├ protocol	String []	是	通信协议
├ longitude	String	是	经度
├ latitude	String	是	纬度
├ latestData	Object	是	设备上传的原始数据（GNSS_UP 消息）
├ status	String	是	状态，在线时值为 Online，离线时值为 Offline
获取设备列表
Path：/v1/devices
Method：GET
接口描述：获取设备列表
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
is_page	Boolean	否	是否分页
page_index	Number	否	当前页码
page_size	Number	否	页大小
device_id	String	否	设备 ID
device_name	String	否	设备名称
company_id	Number	否	公司 ID
company_name	String	否	公司名称
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	否	-
├ pageIndex	Number	是	当前页码
├ pageSize	Number	是	页大小
├ pageCount	Number	是	总页数
├ total	Number	是	总记录数
├ items	Object []	否	设备列表
├ id	Number	是	设备 ID（数据库自增）
├ createdAt	String	是	创建时间
├ updatedAt	String	是	更新时间
├ deviceId	String	是	设备 ID（业务）
├ deviceName	String	是	设备名称
├ productId	Number	是	产品 ID
├ productCode	String	是	产品代码
├ productName	String	是	产品名称
├ protocol	String []	是	通信协议
├ longitude	String	是	经度
├ latitude	String	是	纬度
├ latestData	Object	是	设备上传的原始数据（GNSS_UP 消息）
├ status	String	是	状态，在线时值为 Online，离线时值为 Offline
修改设备信息
Path：/v1/devices/{id}
Method：PUT
接口描述：修改设备信息
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
id	12	设备 ID（数据库自增）
Body：
表格
名称	类型	是否必须	备注
deviceName	String	否	设备名称
productId	Number	否	产品 ID
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
获取指定设备的文件
Path：/v1/device/file
Method：GET
接口描述：获取指定设备的文件
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
type	String	否	文件类型。目前值范围：photo、video；默认值：photo
device_id	String	是	设备 ID（业务）。示例值：31011500991323310014
date	String	否	日期，格式 yyyy-MM-dd，示例值：2024-04-23
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	是	-
├ list	Object []	否	文件列表
├ name	String	是	文件名
├ path	String	是	文件路径
├ lastModified	String	是	更新时间
├ size	Number	是	文件大小（B）
├ presignedURL	String	是	文件访问 URL
删除文件
Path：/v1/device/file/delete
Method：POST
接口描述：删除文件
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
path	String	是	文件路径
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
电子围栏
新增围栏
Path：/v1/fences
Method：POST
接口描述：新增电子围栏。开始生效时间与结束生效时间相同时，为不限时间。
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
fenceName	String	是	围栏名称
startTimeStr	String	是	开始生效时间。格式：mm:ss
endTimeStr	String	是	结束生效时间。格式：mm:ss
eventType	Number	是	报警事件类型： 11 禁止离开；12 禁止进入；
deviceIndexIds	uint []	是	围栏关联的设备 ID（数据库自增）数组
fenceShape	String	是	围栏形状：值为 Polygon 或 Circle
circleFenceData	Object	否	圆形围栏数据。围栏形状为圆形时必须
├ radius	Number	是	圆形半径
├ center	Object	是	圆形中心点
├ longitude	String	是	经度
├ latitude	String	是	纬度
polygonFenceData	Object []	否	多边形围栏数据。围栏形状为多边形时必须
├ longitude	String	是	经度
├ latitude	String	是	纬度
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Number	否	围栏 ID
更新围栏
Path：/v1/fences/{id}
Method：PUT
接口描述：更新电子围栏。
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
fenceName	String	否	围栏名称
startTimeStr	String	否	开始生效时间。格式：mm:ss
endTimeStr	String	否	结束生效时间。格式：mm:ss
updateFenceDevice	Boolean	否	是否更新围栏关联的设备
deviceIndexIds	uint []	否	围栏关联的设备 ID（数据库自增）数组
fenceShape	String	否	围栏形状：值为 Polygon 或 Circle
circleFenceData	Object	否	圆形围栏数据。围栏形状为圆形时必须
├ radius	Number	是	圆形半径
├ center	Object	是	圆形中心点
├ longitude	String	是	经度
├ latitude	String	是	纬度
polygonFenceData	Object []	否	多边形围栏数据。围栏形状为多边形时必须
├ longitude	String	是	经度
├ latitude	String	是	纬度
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
删除围栏
Path：/v1/fences/{id}
Method：DELETE
接口描述：删除电子围栏
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
id	12	围栏 ID
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
获取指定围栏的信息
Path：/v1/fences/{id}
Method：GET
接口描述：获取指定围栏的信息
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
id	12	围栏 ID
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	是	围栏数据
├ id	uint	是	围栏 ID
├ companyId	uint	是	公司 ID
├ fenceName	String	是	围栏名称
├ startTimeStr	String	是	开始生效时间。
├ endTimeStr	String	是	结束生效时间。
├ eventType	Number	是	报警事件类型： 11 禁止离开；12 禁止进入；
├ deviceIndexIds	uint []	是	围栏关联的设备 ID（数据库自增）数组
├ fenceShape	String	是	围栏形状：值为 Polygon 或 Circle
├ circleFenceData	Object	否	圆形围栏数据。围栏形状为圆形时必须
├ radius	Number	是	圆形半径
├ center	Object	是	圆形中心点
├ longitude	String	是	经度
├ latitude	String	是	纬度
├ polygonFenceData	Object []	否	多边形围栏数据。围栏形状为多边形时必须
├ longitude	String	是	经度
├ latitude	String	是	纬度
获取围栏列表
Path：/v1/fences
Method：GET
接口描述：获取电子围栏列表
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
is_page	Boolean	否	是否分页
page_index	Number	否	当前页码
page_size	Number	否	页大小
event_type	Number	否	报警事件类型
fence_name	String	否	围栏名称
company_id	Number	否	公司 ID
fence_shape	String	否	围栏形状
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	是	围栏列表数据
├ pageIndex	Number	是	当前页码
├ pageSize	Number	是	页大小
├ pageCount	Number	是	总页数
├ total	Number	是	总记录数
├ items	Object []	否	围栏列表
├ id	uint	是	围栏 ID
├ companyId	uint	是	公司 ID
├ fenceName	String	是	围栏名称
├ startTimeStr	String	是	开始生效时间。
├ endTimeStr	String	是	结束生效时间。
├ eventType	Number	是	报警事件类型： 11 禁止离开；12 禁止进入；
├ deviceIndexIds	uint []	是	围栏关联的设备 ID（数据库自增）数组
├ fenceShape	String	是	围栏形状：值为 Polygon 或 Circle
├ circleFenceData	Object	否	圆形围栏数据。围栏形状为圆形时必须
├ radius	Number	是	圆形半径
├ center	Object	是	圆形中心点
├ longitude	String	是	经度
├ latitude	String	是	纬度
├ polygonFenceData	Object []	否	多边形围栏数据。围栏形状为多边形时必须
├ longitude	String	是	经度
├ latitude	String	是	纬度
历史轨迹
获取历史轨迹定位数据
Path：/v1/locations
Method：GET
接口描述：获取历史轨迹定位数据
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
device_id	String	是	设备 ID（业务）
levels	String	否	指定的定位精度，多个值以逗号分隔，示例："1,2,3,4"。不传或值为空时，表示所有精度类型。设备的定位级别：0 无效定位；1 单点定位；2 伪距差分定位；3 浮点解差分定位：4 固定解差分定位；5 蓝牙定位；6 LBS 定位
start_time	Number	是	开始时间的时间戳，精确到秒
end_time	Number	是	结束时间的时间戳，精确到秒
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object []	否	历史轨迹数据
├ longitude	String	是	经度
├ latitude	String	是	纬度
├ 其它字段...	-	-	见协议文档关于 GNSS_UP 消息字段的描述
报警记录
获取报警记录列表
Path：/v1/alarms
Method：GET
接口描述：获取报警记录列表
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
is_page	Boolean	否	是否分页
page_index	Number	否	当前页码
page_size	Number	否	页大小
device_id	String	否	设备 ID（业务）
device_name	String	否	设备名称
company_id	Number	否	公司 ID
event_code	String	否	事件代码
level	String	否	报警等级
start_time	Number	否	开始时间的时间戳，精确到秒
end_time	Number	否	结束时间的时间戳，精确到秒
handled	Boolean	否	是否已处理
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	否	报警记录数据
├ pageIndex	Number	是	当前页码
├ pageSize	Number	是	页大小
├ pageCount	Number	是	总页数
├ total	Number	是	总记录数
├ items	Object []	否	报警记录列表
├ id	Number	是	报警记录 ID
├ companyId	Number	是	公司 ID
├ deviceIndexId	Number	是	设备 ID（数据库自增）
├ deviceId	String	是	设备 ID（业务）
├ deviceName	String	是	设备名称
├ remark	String	否	备注
├ alarmName	String	是	报警名称
├ alarmTime	Number	是	设备报警时间（时间戳，毫秒）
├ handleBy	String	否	处理人
├ handleAt	Number	否	处理时间
├ level	String	是	报警重要程度
├ status	String	是	是否已处理
├ alarmData	String	是	报警的原始数据
├ eventCode	String	是	事件代码
├ fenceId	Number	否	围栏 ID（平台的围栏报警才有此字段）
eventCode 事件代码枚举
表格
事件代码	描述
1001	SOS 求救报警
1002	摔倒报警
1003	坠落报警
1004	近电报警
1005	脱掉帽子报警
1006	撞击帽子报警
1007	静止报警
1008	倒立报警
4000	登高预警
2001	低温报警
2002	高温报警
2003	体温过低报警
2004	体温过高报警
2005	低速报警
2006	超速报警
2007	电池低压报警
2008	设备电池被拆
2009	设备被拆卸
3001	进入区域报警
3002	离开区域报警
5000	多气体报警：具体的报警名称列表，如 “可燃气高浓度报警，氧气低浓度报警”
5001	可燃气体低浓度报警
5002	可燃气体高浓度报警
5003	氧气低浓度报警
5004	氧气高浓度报警
5005	一氧化碳低浓度报警
5006	一氧化碳高浓度报警
5007	硫化氢低浓度报警
5008	硫化氢高浓度报警
100111	离开区域报警（平台判断）
100112	进入区域报警（平台判断）
更新报警记录
Path：/v1/alarms/{id}
Method：PUT
接口描述：更新报警记录
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
id	12	报警记录 ID
Body：
表格
名称	类型	是否必须	备注
remark	String	否	备注
level	String	否	报警重要程度
handled	String	否	是否已处理
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
对讲分组
新增分组
Path：/v1/talkgroups
Method：POST
接口描述：新增分组
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
groupName	String	是	分组名称
deviceList	Number []	是	关联的设备 ID（数据库自增）数组
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	uint	是	分组 ID
删除分组
Path：/v1/talkgroups/{id}
Method：DELETE
接口描述：删除分组
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
id	12	分组 ID
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
更新分组
Path：/v1/talkgroups/{id}
Method：PUT
接口描述：更新分组
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
id	12	分组 ID
Body：
表格
名称	类型	是否必须	备注
groupName	String	是	分组名称
deviceList	Number []	是	关联的设备 ID（数据库自增）数组
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
查找分组
Path：/v1/talkgroups
Method：GET
接口描述：查找分组
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
group_name	String	是	分组名称
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object []	否	-
├ id	Number	是	分组 ID
├ groupName	String	是	分组名称
├ devices	Object []	是	设备列表
├ id	Number	是	设备 ID（数据库自增）
├ deviceId	String	是	设备 ID（业务）
├ deviceName	String	是	设备名称
├ status	String	是	设备状态
平台下发群组对讲相关指令
Path：/v1/send-talkgroup-command
Method：POST
接口描述：平台下发群组对讲相关指令，包括：开启群组对讲；结束群组对讲；邀请设备通话；让设备静音。
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
groupId	Number	是	分组 ID，示例值：54
command	String	是	值范围：8010（开启群组对讲）；8011（结束群组对讲）；8014（邀请设备通话）；8015（让设备静音）。
clientId	String	否	MQTT clientid（示例值：mqttjs_ieyrjikw）。开启群组对讲和结束群组对讲时必传。
deviceId	String	否	设备 ID（业务 ID，示例值：202307200024）。邀请设备通话或让设备静音时必传。
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
国标 (GB28181) 视频
开始直播
Path：/api/v1/stream/start
Method：GET
接口描述：开始直播
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
serial	String	是	设备编号
code	String	是	通道编号
audio	String	否	是否开启音频；允许值: true, false, config；默认 config 表示读取通道音频开关配置。
返回数据：
表格
名称	类型	是否必须	备注
StreamID	String	是	直播流 ID
SMSID	String	是	流媒体编号
DeviceID	String	是	设备编号
ChannelID	String	是	通道编号
WEBRTC	String	是	WEBRTC 播放地址
FLV	String	是	HTTP-FLV 播放地址
WS_FLV	String	是	Websocket-FLV 播放地址
RTMP	String	是	RTMP 播放地址
HLS	String	是	HLS (M3U8) 播放地址
RTSP	String	是	RTSP 播放地址
Transport	String	是	流传输模式 允许值: UDP, TCP
StartAt	String	是	开始时间
AudioEnable	Boolean	是	是否开启音频
直播流停止
Path：/api/v1/stream/stop
Method：GET
接口描述：直播流停止
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
serial	String	是	设备编号
code	String	是	通道编号
check_outputs	String	否	是否检查通道在线人数；允许值: true, false；默认 false, 表示停止前不检查通道是否有客户端正在播放
响应：200 OK
设备控制 - Websocket 语音喊话
Websocket Path: /api/v1/control/ws-talk/{serial}/{code}
描述：要求设备支持语音输出通道，websocket 客户端调用 send () 发送经过 Base64 编码的音频数据，8000 采样率，单通道
路径参数：
表格
参数名称	示例	备注
serial	31011500991323310018	设备编号
code	31011500991323310018	通道编号
查询参数：
表格
名称	类型	是否必须	备注
format	String	是	音频格式，允许值: pcm, g711a, g711u。默认值: pcm
token	String	是	登录后获得的 token
响应：200 OK
查询录像列表
Path：/api/v1/playback/recordlist
Method：GET
接口描述：查询录像列表
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
serial	String	是	设备编号
code	String	否	通道编号
starttime	String	是	开始时间，YYYY-MM-DDTHH:mm:ss
endtime	String	否	结束时间，YYYY-MM-DDTHH:mm:ss 默认值: now
返回数据：
表格
字段	类型	描述
DeviceID	String	通道编号
Name	String	通道名称
SumNum	Number	录像总数
RecordList	Object []	录像列表
├ DeviceID	String	通道编号
├ Name	String	通道名称
├ FilePath	String	文件路径名
├ Address	String	录像地址
├ StartTime	String	录像开始时间，YYYY-MM-DDTHH:mm:ss
├ EndTime	String	录像结束时间，YYYY-MM-DDTHH:mm:ss
├ Secrecy	String	保密属性，0 - 不涉密，1 - 涉密 允许值: 0, 1
├ Type	String	录像产生类型 允许值: time, alarm, manual, all
├ RecorderID	String	录像触发者 ID
开始回放
Path：/api/v1/playback/start
Method：GET
接口描述：开始回放。注意：回放流多路不复用，为避免设备过载，应及时调用 /api/v1/playback/stop 停止回放。
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
serial	String	是	设备编号
code	String	否	通道编号
starttime	String	是	开始时间，YYYY-MM-DDTHH:mm:ss
endtime	String	否	结束时间，YYYY-MM-DDTHH:mm:ss 默认值: now
download	Boolean	否	下载标识，允许值: true, false 默认值: false
audio	String	否	是否开启音频，允许值: true, false, config。默认 config 表示读取通道音频开关配置
transport	String	否	流传输模式，允许值: TCP, UDP, config。默认 config 表示读取设备流传输模式配置
transport_mode	String	否	允许值: active, passive。当 transport=TCP 时有效，指示流传输主被动模式，默认被动 passive。
timezone	String	否	时区，默认值: Asia/Shanghai
返回数据：
表格
字段	类型	描述
StreamID	String	回放流 ID
DeviceID	String	设备编号
WEBRTC	String	WEBRTC 播放地址
FLV	String	HTTP-FLV 播放地址
WS_FLV	String	Websocket-FLV 播放地址
RTMP	String	RTMP 播放地址
HLS	String	HLS (M3U8) 播放地址
RTSP	String	RTSP 播放地址
Transport	String	流传输模式，允许值: UDP, TCP
StartAt	String	开始时间
Duration	Number	持续时间 (秒)
SourceVideoCodecName	String	原始视频编码
SourceVideoWidth	Number	原始视频宽
SourceVideoHeight	Number	原始视频高
SourceVideoFrameRate	Number	原始视频帧率
SourceAudioCodecName	String	原始音频编码
SourceAudioSampleRate	Number	原始音频采样率
RTPCount	Number	收包数
RTPLostCount	Number	丢包数
RTPLostRate	Number	丢包率百分比
VideoFrameCount	Number	视频帧数
AudioEnable	Boolean	是否开启音频
Ondemand	Boolean	是否按需
InBytes	Number	收流字节大小 (Byte)
InBitRate	Number	收流平均码率 (Kbps)
OutBytes	Number	分发流字节大小 (Byte)
NumOutputs	Number	在线人数
CascadeSize	Number	级联数
PlaybackDuration	Number	回放文件总时长 (秒)
TimestampSec	Number	当前回放时长 (秒)
PlaybackProgress	Number	回放进度 ([0-1]), 按时间截计算 (TimestampSec/PlaybackDuration)
DownloadProgress	Number	下载进度 ([0-1]), 按文件大小计算 (InBytes/PlaybackFileSize)
PlaybackFileSize	Number	下载文件总大小
PlaybackFileURL	String	下载文件链接，playback stop 之后方可用
回放流停止
Path：/api/v1/playback/stop
Method：GET
接口描述：回放流停止
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
streamid	String	是	回放流 ID, 由开始回放接口 (PlaybackStart) 返回
响应：200 OK返回字段：PlaybackFileURL（可选）String 下载文件链接
回放控制
Path：/api/v1/playback/control
Method：GET
接口描述：回放控制
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
streamid	String	是	回放流 ID, 由开始回放接口 (PlaybackStart) 返回
command	String	是	回放控制类型，允许值: play, pause, teardown, scale
range	String	否	command=play 时有效，表示从当前位置以当前播放速度跳转到指定 range (单位 s) 的时间点播放；range=now 表示从当前位置开始播放，比如：暂停后恢复播放，则指定 range=now。默认值: now
scale	Number	否	command=scale 时有效，倍数播放倍率，1 = 正常播放，大于 0 小于 1 为慢放，如 0.5 = 以 0.5 倍的速度慢放；大于 1 为快放，如 2 = 以 2 倍的速度快放；负数为倒放，参数意义相同。默认值: 2
响应：200 OK
单条回放流信息
Path：/api/v1/playback/streaminfo
Method：GET
接口描述：单条回放流信息，可用于查询回放 / 下载进度。
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
查询参数：
表格
名称	类型	是否必须	备注
streamid	String	是	回放流 ID, 由开始回放接口 (PlaybackStart) 返回
返回数据：同开始回放接口返回字段
私有 RTC 视频
获取设备信息
Path：/bvcsp/v1/pu/info/{puid}
Method：GET
接口描述：获取设备信息
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
puid	PU_31011500991323310018	puid = PU_{设备 ID 后 6 位}
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	否	设备信息
├ channels	Object []	是	通道列表
├ index	Number	是	通道号
├ name	String	是	通道名称
打开设备音视频流 webrtc
Path：/bvcsp/v1/dialog/device/webrtc
Method：POST
接口描述：用于打开设备实时传输通道，获取传输流的 webrtc sdp 和该路流的操作句柄（用于关闭）。
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
id	String	是	id = PU_{设备 ID 后 6 位}
index	Number	是	通道号
sdp	String	是	webrtc SDP
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码。枚举备注: 0：成功 1：通道不存在 2：通道不支持音频 3：设备不在线 4：不支持的媒体流传输协议 5：服务器内部处理错误 6：未知错误
msg	String	是	结果描述
data	Object	否	-
├ dialogid	String	是	句柄。用于标记该路打开的流。关闭流时需要该句柄。
├ sdp	String	是	webrtc SDP
打开设备音视频流 bvrtc
Path：/bvcsp/v1/dialog/device/bvrtc
Method：POST
接口描述：用于打开设备实时传输通道，获取传输流的 bvrtc sdp 和该路流的操作句柄（用于关闭）。
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
id	String	是	id = PU_{设备 ID 后 6 位}
index	Number	是	通道号
sdp	String	是	bvrtc SDP
返回数据：同打开设备音视频流 webrtc
关闭会话
Path：/bvcsp/v1/dialog/close/{dialogid}
Method：POST
接口描述：dialogid 是打开 音视频 通道时返回的 dialogid。
请求参数：
表格
参数名称	参数值	是否必须
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
dialogid	123456	会话 ID
返回数据：同打开设备音视频流 webrtc
平台文件检索
Path：/bvcsp/v1/recordfile/filter
Method：POST
接口描述：平台文件检索
文件类型：
表格
可选值	描述
"video"	录像文件
"audio"	音频文件
"image"	图片文件
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
page	Number	是	分页，从零开始
pageSize	Number	是	分页大小
filter	Object	是	过滤条件
├ beginTime	Number	否	开始时间，Unix 时间戳，精确到秒
├ endTime	Number	否	结束时间，Unix 时间戳，精确到秒
├ puID	String	否	puID = PU_{设备 ID 后 6 位}
├ fileType	String []	否	文件类型
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码。
msg	String	是	结果描述
pageInfo	Object	否	分页结果信息
├ page	Number	否	分页，从零开始
├ pageSize	Number	否	分页大小
├ totalCount	Number	否	条目总数
data	Object []	否	数据列表
├ id	Number	是	-
├ fileID	String	是	文件 ID
├ puID	String	是	录像来源设备
├ channelIndex	Number	否	录像来源通道号
├ filePath	String	是	存储全路径
├ fileType	String	是	文件类型
├ fileSize	Number	是	文件大小 (单位 byte)
├ beginTime	Number	是	录像文件开始时间，Unix 时间戳，精确到秒
├ endTime	Number	否	录像文件结束时间，Unix 时间戳，精确到秒
├ fileName	String	是	文件名
设备文件检索
Path：/bvcsp/v1/pu/recordfile/filter/{puid}
Method：POST
接口描述：设备文件检索
文件类型：同平台文件检索
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
路径参数：
表格
参数名称	示例	备注
puid	PU_31011500991323310018	puid = PU_{设备 ID 后 6 位}
Body：同平台文件检索，新增 channelIndex 参数
返回数据：同平台文件检索
下载文件
Path：/bvnru/v1/download/{fileid}
Method：GET
接口描述：视频文件缩略显示 + 回放
路径参数：
表格
参数名称	示例	备注
fileid	rec4f1Q1hC0GvXb330	文件 ID
下载设备文件
Path：/bvnru/v1/pu/download/{puid}/{fileid}
Method：GET
接口描述：音视频文件缩略显示 + 回放
路径参数：
表格
参数名称	示例	备注
puid	PU_801235	id = PU_{设备 ID 后 6 位}
fileid	rec4f1Q1hC0GvXb330	文件 ID
LiveKit WebRTC 接口
LiveKit Server URL: wss://webrtc.znhaas.net
生成房间 token
Path：/webrtc/token
Method：POST
接口描述：生成房间 token 及通知设备加入房间
请求参数：
表格
参数名称	参数值	是否必须
Content-Type	application/json	是
Authorization	Bearer Token	是
Body：
表格
名称	类型	是否必须	备注
isMeeting	Boolean	否	是否是会议类型。当未传值时，如果设备数大于 1，默认值为 true，否则为 false
roomName	String	否	房间名。当未传值时，会随机生成房间名。
devices	String []	否	设备 ID（业务）数组。当 isMeeting 为 false 时，设备数不能大于 1。
cameraEnabled	Boolean	否	通知设备是否开启摄像头
microphoneEnabled	Boolean	否	通知设备是否开启麦克风
返回数据：
表格
名称	类型	是否必须	备注
code	Number	是	结果码
msg	String	是	结果描述
data	Object	是	-
├ roomName	String	是	房间名
├ token	String	是	加入房间时用到的 token
客户端 SDKs
表格
Language	Repo	Declarative UI	Links
JavaScript (TypeScript)	client-sdk-js	React	docs | JS example | React example
Swift (iOS / MacOS)	client-sdk-swift	Swift UI	docs | example
Kotlin (Android)	client-sdk-android	Compose	docs | example | Compose example
Flutter (all platforms)	client-sdk-flutter	native	docs | example
Unity WebGL	client-sdk-unity-web	-	docs
React Native (beta)	client-sdk-react-native	native	-
Rust	client-sdk-rust	-	-