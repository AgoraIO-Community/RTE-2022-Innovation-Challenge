<?php

require("db_config.php");

if($_POST['data']){

	$myData=$_POST['data'];

	$jsonData=json_decode($myData,true);

$conn=mysql_connect($mysql_server_name,$mysql_username,$mysql_password) or die("error connecting");//连接数据库
mysql_select_db($mysql_database); //打开数据库

if(is_array( $jsonData) && ! empty( $jsonData))
{
	foreach($jsonData as $v)
		{
$wl_num=$v['wl_num'];
$eye_index=$v['eye_index'];
	$sql ="update pilot_someone set  wl_num='$wl_num' where  eye_index='$eye_index'";
	$result=mysql_query($sql);
	}
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