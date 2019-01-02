<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 27/12/18
 * Time: 19.30
 */

require_once 'communication.php';
require_once 'helper.php';
header('Access-Control-Allow-Origin: http://localhost:3000');


class insert_patient extends communication {
    private $patient, $result;

    protected function input_elaboration(){
        $this->patient = $this->validate_string('patient');
        if ($this->patient == false)
            $this->json_error('Nessun paziente ricevuto');
    }

    protected function retrieve_data(){
        $connection = $this->get_connection();
        $this->result = $connection->insert_patient(json_decode($this->patient, true));

        if (is_error($this->result)) {
            $this->json_error("C'e stato un errore in fase di login", $this->result->getErrorName());
        }
    }

    protected function return_data(){
        return array('result' => $this->result);
    }
}

$insert_patient = new insert_patient();
$insert_patient->execute();