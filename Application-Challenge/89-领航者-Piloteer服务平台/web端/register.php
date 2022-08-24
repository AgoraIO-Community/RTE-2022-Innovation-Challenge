<?php

require("db_config.php");

if(file_get_contents("php://input")){

	$myData=file_get_contents("php://input");
	$jsonData=json_decode($myData,true);
	$name=$jsonData['eye_num'];
$phone=$jsonData['eye_phone'];
	$chat_room=$jsonData['chart_room'];
	$lnt=$jsonData['lnt'];
	$lat=$jsonData['lat'];
$conn=mysql_connect($mysql_server_name,$mysql_username,$mysql_password) or die("error connecting");//连接数据库
mysql_select_db($mysql_database); //打开数据库
$sql ="insert into pilot_someone(eye_num, eye_phone,chart_room,lnt,lat) values ('$name','$phone','$chat_room','$lnt','$lat');";
$result=mysql_query($sql);
if($result==1){

echo '{"result":"1"}';
}else{
echo '{"result":"0"}';
}
mysql_close($conn);
}
else{
echo '{"result":"0"}';
}
?>