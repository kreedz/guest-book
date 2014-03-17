<?php
include('db_connect.php');
$page = $_POST['page'];

if ($page < 0) {
	$page *= -1;
}

$page -= 1;
$page *= 10;

if ($stmt = $mysqli->prepare("select u.name, m.message, m.date as mdate, (select count(*) from messages) as mcount,"
		."m.id as message_id from users u, messages m where m.id_user = u.id order by m.id desc limit ?, 10")) {
	$stmt->bind_param("d", $page);
	$stmt->execute();
	$stmt->bind_result($author, $message, $date, $message_count, $message_id);

	$rows = array();
	while ($stmt->fetch()) {
		$rows[] = array('author' => $author, 'message' => $message, 'date' => $date, 'message_id' => $message_id);
	}
	echo json_encode(array('rows' => $rows, 'message_count' => $message_count));
	$stmt->close();
}
$mysqli->close();