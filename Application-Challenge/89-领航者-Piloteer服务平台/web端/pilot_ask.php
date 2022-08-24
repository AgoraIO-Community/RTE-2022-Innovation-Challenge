<?php
require("db_config.php");
header('Content-Type: application/json');
  if(file_get_contents("php://input")) {
    $content = file_get_contents("php://input");
	$jsonData=json_decode($content,true);
		$name=$jsonData['p_num'];
$conn=mysql_connect($mysql_server_name,$mysql_username,$mysql_password) or die("error connecting");//连接数据库

mysql_select_db($mysql_database); //打开数据库


$sql ="select * from pilot_someone where status=1";

$result=mysql_query($sql);

 //$rows=mysql_fetch_array($result);
$jarr = array();
while ($rows=mysql_fetch_array($result)){
    $count=count($rows);//不能在循环语句中，由于每次删除 row数组长度都减小  
    for($i=0;$i<$count;$i++){  
    unset($rows[$i]);//删除冗余数据  
    }
    array_push($jarr,$rows);
}
echo $str=json_encode($jarr);//将数组进行json编码*/
mysql_close($conn);
}
else{

echo '0';

}
?>