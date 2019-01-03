<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 27/12/18
 * Time: 19.30
 */

require_once 'is_not_logged.php';
require_once 'helper.php';

header('Access-Control-Allow-Origin: http://localhost:3000');

class login extends is_not_logged {
    private $email, $password, $result;

    protected function input_elaboration(){
        $this->email = $this->validate_string('email');
        if ($this->email == false)
            $this->json_error('Nessuna email inserita');

        $this->password = $this->validate_string('password');
        if ($this->password == false)
            $this->json_error('Nessuna password inserita');
    }

    protected function retrieve_data(){
        $connection = $this->get_connection();
        $this->result = $connection->login($this->email, $this->password);

        if (is_error($this->result)) {
            $this->json_error("C'e stato un errore in fase di login", $this->result->getErrorName());
        }

        set_session_variables($this->result, 'dani', true );
    }

    protected function return_data(){
        return array('result' => $this->result);
    }
}

$login = new login();
$login->execute();