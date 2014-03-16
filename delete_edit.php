<?php
include('db_connect.php');

$action = $_POST['paction'];
$author = $_POST['pauthor'];
$message_id = $_POST['pmessage_id'];
$password = $_POST['ppassword'];

$password_is_valid = false;
// проверка на верность пароля
if ($stmt = $mysqli->prepare("select password from users where name = ?")) {
	$stmt->bind_param("s", $author);
	$stmt->execute();
	$stmt->bind_result($password_db);
	$stmt->fetch();
	$stmt->close();
	if ($password_db == $password) {
		$password_is_valid = true;
	}
}	

$action_is_done = false;
if ($password_is_valid) {
	// действия для редактирования
	if ($action == 'edit') {
		if ($stmt = $mysqli->prepare("update messages set message = ? where id = ?")) {
			$message = $_POST['pmessage'];
			$stmt->bind_param("sd", $message, $message_id);
			if ($stmt->execute()) {
				$action_is_done = true;
			}
			$stmt->close();
		}			
	// действия для удаления
	} else if ($action == 'delete') {	
		if ($stmt = $mysqli->prepare("delete from messages where id = ?")) {
			$stmt->bind_param("d", $message_id);
			if ($stmt->execute()) {
				$action_is_done = true;
			}
			$stmt->close();
		}	
	}
}

echo $action_is_done;

$mysqli->close();