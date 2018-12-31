<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 27/12/18
 * Time: 19.30
 */

require_once 'communication.php';
require_once 'helper.php';

class get_patients extends communication {
    private $result;

    protected function input_elaboration(){}

    protected function retrieve_data(){
        $connection = $this->get_connection();
        $this->result = $connection->get_patients();

        if (is_error($this->result)) {
            $this->json_error("Impossibile recuperare i pazienti", $this->result->getErrorName());
        }
    }

    protected function return_data(){
        return array('result' => $this->result);
    }
}

$get_patients = new get_patients();
$get_patients->execute();