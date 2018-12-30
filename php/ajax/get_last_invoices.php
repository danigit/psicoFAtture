<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 27/12/18
 * Time: 19.30
 */

require_once 'communication.php';
require_once 'helper.php';

class get_last_invoices extends communication {
    private $result;

    protected function input_elaboration(){}

    protected function retrieve_data(){
        $connection = $this->get_connection();
        $this->result = $connection->get_last_invoices();

        if (is_error($this->result)) {
            $this->json_error("Impossibile recuperare le fatture", $this->result->getErrorName());
        }
    }

    protected function return_data(){
        return array('result' => $this->result);
    }
}

$get_last_invoices = new get_last_invoices();
$get_last_invoices->execute();