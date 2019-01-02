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


class remove_patient extends communication {
    private $id, $result;

    protected function input_elaboration(){
        $this->id = $this->validate_string('id');
        if ($this->id == false)
            $this->json_error('Nessun id ricevuto');
    }

    protected function retrieve_data(){
        $connection = $this->get_connection();
        $this->result = $connection->remove_patient($this->id);

        if (is_error($this->result)) {
            $this->json_error("C'e stato un errore nel eliminare il paziente", $this->result->getErrorName());
        }
    }

    protected function return_data(){
        return array('result' => $this->result);
    }
}

$remove_patient = new remove_patient();
$remove_patient->execute();