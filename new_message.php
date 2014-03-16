<?php
include('db_connect.php');

$author = $_POST['pauthor'];
$password = $_POST['ppassword'];
$message = $_POST['pmessage'];

// создаем подготавливаемый запрос
if ($stmt = $mysqli->prepare("select id, name, password from users where name=?")) {

    // связываем параметры с метками
    $stmt->bind_param("s", $author);

    // запускаем запрос
    $stmt->execute();
	$stmt->store_result();
	
    // связываем переменные с результатами запроса
    $stmt->bind_result($id, $name, $passw);

    // получаем значения
    $stmt->fetch();	
	
	$result_rows = $stmt->num_rows;
	$stmt->close();
	
	$flag_add_message = 0;
	// такого пользователя нет, создадим нового
	if (0 == $result_rows) {
		if ($stmt = $mysqli->prepare("insert into users(name, password) values (?, ?)")) {
			$stmt->bind_param("ss", $author, $password);
			$stmt->execute();
			$stmt->close();
			$flag_add_message = true;
			// получим id from users
			if ($stmt = $mysqli->prepare("select id from users where name = ?")) {
				$stmt->bind_param("s", $author);
				$stmt->execute();
				$stmt->bind_result($id);
				$stmt->fetch();
				$stmt->close();
			}
		}
	// пользователь есть, проверим введённый пароль с паролем из БД
	} else {
		if ($passw == $password) {
			$flag_add_message = true;
		}
	}
	// сохраним сообщение
	if ($flag_add_message) {
		if ($stmt = $mysqli->prepare("insert into messages(id_user, message, date) values(?, ?, ?)")) {
			$date = date('Y-m-d');
			$stmt->bind_param("dss", $id, $message, $date);
			if ($stmt->execute()) {
				$stmt->close();
				if ($stmt = $mysqli->prepare("select id from messages order by id desc limit 1")) {
					$stmt->execute();
					$stmt->bind_result($message_id);
					$stmt->fetch();
					$stmt->close();
				}
				echo json_encode(array('message_id' => $message_id, 'date' => $date));
			} else {
				echo false;
			}
		}
	}
}

$mysqli->close();